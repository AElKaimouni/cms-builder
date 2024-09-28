import { AxiosError } from "axios";
import { CmsAPi, UiAPi } from "../../APIs";
import { PageDocument, PageEditInput, PageGetInput, PageLocaleObject, PageNSymbolSectionObject, PagePublishInput, PageSymbolSectionObject, PageVersionObject } from "../types/page";
import lodash from "lodash";
import { PageLocale } from "./Locale";
import { ContextObject } from "../types";
import { LayoutActions, PageActions } from "../states";
import { changeURLPageParam, defaultDocumentObject, defaultLocaleObject, defaultVersionObject, loopObject, reloadFrame } from "../utils";
import { loadDataModels } from "../utils/references";
import { Data, SectionData } from "./Data";
import { PageSection } from "./Section";
import { BuilderModals } from "../utils/modals";

const clone = object => lodash.cloneDeep(object);

export class Page {
    public document: PageDocument;
    private initDocument: PageDocument ;
    public locale: PageLocale;
    public version: PageVersionObject;
    public context: ContextObject;
    public info?: SectionData;
    public theme?: SectionData;
    constructor() {
        this.document = defaultDocumentObject;
        this.initDocument = this.document;
        this.locale = new PageLocale(defaultLocaleObject);
        this.context = window.__builder_context;
        this.version = defaultVersionObject;
    };

    public changeLocale = (locale: string) => {
        const localeIndex = this.version.locales.findIndex(l => l.locale === locale);
        
        // we cannot create locale for a model page, we must add it from model page
        if(localeIndex === -1 && this.document.model && !this.document.pageModels[locale]) return null;

        this.reset();

        if(localeIndex === -1) {
            this.document.versions[0].locales.push({...defaultLocaleObject, locale, _id: undefined as any});
            this.version = this.document.versions[0];
        }

        const localeObject = this.document.versions[0].locales[localeIndex !== -1 ? localeIndex : this.document.versions[0].locales.length - 1];
        this.locale = new PageLocale(localeObject, this.document.pageModels?.[localeObject.locale]);
        this.context.page.set({ type: PageActions.ChangeLocale, locale });
        this.context.page.set({ type: PageActions.Setlayers, layers: this.locale.sections.layers.expanded as any });
        changeURLPageParam();
        this.compare();

        return true;
    }

    public changeLink(link: string) {
        this.document.link = link;
        this.context.page.set({ type: PageActions.ChangeLink, link });
    };
  
    public async addTarget(target: string) {
        const context = window.__builder_context;

        this.document = {
            ...this.document,
            targets: { ...this.document.targets, [target] : true },
            versions: this.document.versions.map(version => {
                if(version.name === this.version.name) {
                    return {
                        ...version,
                        locales: Object.keys(context.wapi.info.locales).map(locale => ({
                            ...version.locales[0],
                            locale: locale,
                            default: locale === context.wapi.info.defaultLocale
                        }))
                    }
                } else return version;
            })
        }

        await this.save();

        this.context.page.set({ type: PageActions.RemoveAvaibleTarget, target });

        return;            
    }

    public compare() : [boolean, boolean] { // hight cost method !!
        if(this.document && this.initDocument) {
            const oldVersion = this.initDocument.versions.find(version => version.name === this.version.name);
            const newVersion = this.document.versions.find(version => version.name === this.version.name);

            if(oldVersion && newVersion) {
                const publishedLocal = this.document.locales.find(locale => locale.locale === this.locale.locale);
                const oldLocale = oldVersion.locales.find(locale => locale.locale === this.locale.locale);
                const newLocale = newVersion.locales.find(locale => locale.locale === this.locale.locale);
                const canPublish = !lodash.isEqual(publishedLocal, oldLocale);
                const canSave = !lodash.isEqual(
                    [newLocale, this.document.domain.theme, this.document.link, this.document.symbols],
                    [oldLocale, this.initDocument.domain.theme, this.initDocument.link, this.initDocument.symbols]
                );

                if(this.context) {
                    this.context.page.set({ type: PageActions.ToggleSave, val: canSave });
                    this.context.page.set({ type: PageActions.TogglePublish, val: canPublish });
                }

                return [canSave, canPublish]
            }
            
            return [true, true]
            
        }
        
        return [false, false];
    }

    public async load(pageInput: PageGetInput, locale?: string) : Promise<{ status: 200 | 404 | 0 }> {
        try {
            const res = await CmsAPi.post("/page", pageInput);
            const document = res.data as PageDocument;


            return await new Promise(async success => {
                const main = async (createLocale: boolean) => {
                    this.initDocument = clone(res.data);
                    this.document = res.data;
                    this.context.actions.clear();

                    reloadFrame();
                    await this.parse(locale, Boolean(createLocale && locale));
                    success({ status: 200 });
                };

                if(locale && !document.versions[0].locales.find(l => l.locale === locale)) this.context.layout.set({ type: LayoutActions.Modal,
                    modal: BuilderModals.ConfirmModal, info: {
                    cancel: "Cancel",
                    confirm: "Create",
                    color: "primary",
                    message: `This page does not have locale "${locale}", do you wants to create it ?`,
                    title: "Creating New Locale"
                }, callBack: async result => {

                    if(!result) return success({ status: 0 });

                    await main(true);
                } });
                else await main(false);
            })
        } catch(error) {
            if(error instanceof AxiosError && error.response?.status === 404) {
                return { status: 404 };
            } else throw error;
        }
    };

    public models() {
        const res : PagePublishInput["models"] = {};

        this.version.locales.map(locale => {
            locale.sections.forEach(section => {
                const data = (section as PageNSymbolSectionObject).data
                if(data) data.map(data => loopObject(data.data, async (key, value) => {
                    if(key === "__ref" && typeof value === "string" && value.indexOf("Model") === 0) {
                        res[locale._id] ||=  [];
                        if(!res[locale._id].includes(value) ) res[locale._id].push(value);
                    }
                }))
                
            })
        })

        return res;
    }

    public symbols() {
        const res : PagePublishInput["models"] = {};

        this.version.locales.map(locale => {
            locale.sections.forEach(section => {
                const ref = (section as PageSymbolSectionObject).__ref
                
                res[locale._id] ||= [];
                if(ref) res[locale._id].push(ref.split("_")[1]);
            })
        })

        return res;
    }

    public changedSymbols() {
        const oldSymbols = this.initDocument.symbols;
        const newSymbols = this.document.symbols;
        const symbols = {};

        for(const symbolKey in newSymbols) {
            const symbol = newSymbols[symbolKey];

            if(!oldSymbols[symbolKey] || !lodash.isEqual(symbol, oldSymbols[symbolKey])) {
                symbols[symbolKey] = symbol;

                symbol.models = []; 

                symbol.data.map(data => loopObject(data.data, async (key, value) => {
                    if(key === "__ref" && typeof value === "string" && value.indexOf("Model") === 0) {
                        if(!symbol.models.includes(value) ) symbol.models.push(value);
                    }
                }))
            }
        }
        
        return symbols;
    }

    public async save() : Promise<void> {
        try {
            const changedTheme = !lodash.isEqual(this.document.domain.theme, this.initDocument.domain.theme)
            const pageInput : PageEditInput = {
                page: { slug: this.document.slug },
                domain: {
                    symbols: this.changedSymbols(),
                    ...(changedTheme ? {
                        theme: this.document.domain.theme,
                    } : {})
                },
                data: {
                    link: this.document.link,
                    locales: this.document.locales,
                    name: this.document.name,
                    published: this.document.published,
                    targets: this.document.targets,
                    versions: this.document.versions
                }
            }

            const res = (await CmsAPi.post("/page/edit", pageInput)).data as PageDocument;

            this.version.locales.forEach((locale, index) => locale._id ||= res.versions[0].locales[index]._id);

            this.initDocument = clone(this.document);
            this.compare();

            return;
        } catch(error) { throw error }
    };

    public async publish() : Promise<void> {
        try {
            if(this.document) {
                await CmsAPi.post("/page/publish", {
                    page: { slug: this.document.slug },
                    version: this.version.name,
                    models: this.models(),
                    locale: this.locale.locale,
                    symbols: this.symbols()
                } as PagePublishInput);

                this.initDocument.locales = clone(this.version.locales);
                this.document.locales = clone(this.version.locales);
                this.context.page.set({ type: PageActions.TogglePublish });

                return;
            } else throw new Error("Cannot Work With Null Page Document");
        } catch(error) { throw error };
    }

    public async createPage(link: string, locale?: string) : Promise<void> {
        try {
            const res = await CmsAPi.post("/page/create", {
                domain: this.document?.domain._id,
                link,
                name: "Untitled Page",
                locales: [{ locale: locale || this.context.wapi.info.defaultLocale }],
                published: true
            });
            const document = {...res.data, symbols: this.document.symbols};

            this.initDocument = clone(document);
            this.document = document;
            
            await this.parse();
        } catch (error) { throw error }
    };


    public reset() {
        this.document = clone(this.initDocument);
        this.version = this.document.versions[0];
    };

    public async parse(locale?: string, createLocale?: boolean) {
        // check if still loading so we can parse page with InitBuilderInfo
        if(!this.context.layout.loading) {
            // parse page document
            const parsedDocument = await Page.parse(this.document);

            // setup module
            this.document = parsedDocument;
            this.initDocument = clone(parsedDocument);

            if(createLocale && locale) this.document.versions[0].locales.push({...defaultLocaleObject, locale, _id: undefined as any});

            this.version = this.document.versions[0];

            const localeObject = 
                (locale && this.version.locales.find(l => l.locale === locale)) ||
                this.version.locales.find(locale => locale.locale === this.context.wapi.info.defaultLocale) as PageLocaleObject;

            const symbols = Object.keys(this.document.symbols);

            for(let index = 0; index < localeObject.sections.length; index++) {
                const section = localeObject.sections[index];
                const ref = (section as any).__ref as string;

                if(ref && ref.startsWith("Symbol_")) {
                    const id = ref.split("_")[1];

                    if(id && !symbols.includes(id)) {

                        localeObject.sections.splice(index, 1);
                    }
                }
            }

            console.log(symbols, localeObject)


            this.locale = new PageLocale(localeObject, this.document.pageModels?.[localeObject.locale]);



            // setup ui states
            this.compare(); // for set save and publish states
            this.context.page.set({ type: PageActions.ChangeHost, host: this.document.domain.host });
            this.context.page.set({ type: PageActions.ChangeLink, link: this.document.link });
            this.context.page.set({ type: PageActions.ChangeTitle, title: this.locale.meta.title });
            this.context.page.set({ type: PageActions.ChangeLocale, locale: locale || this.locale.locale || this.context.wapi.info.defaultLocale });
            this.context.page.set({ type: PageActions.ChangeVersion, version: this.version.name });
            this.context.page.set({ type: PageActions.Setlayers, layers: this.locale.sections.layers.expanded as any });
            this.context.page.set({ type: PageActions.SetSymbols, symbols: Object.values(this.document.symbols) });

        }
    }

    static async parse(document: PageDocument) : Promise<PageDocument> {
        const { wapi } = window.__builder_context;
        
        for(const key in document.symbols) {
            await loadDataModels(document.symbols[key].data);
        }

        return {
            ...document,
            domain: {
                ...document.domain,
                theme: document.domain.theme.length ? document.domain.theme: [
                    {
                        cond: { media: wapi.info.devices.map(d => d.name) },
                        data: {}
                    }
                ],
            },
            locales: document.locales.map(locale => ({
                ...locale,
                info: locale.info.length ? locale.info: [
                    {
                        cond: { media: wapi.info.devices.map(d => d.name) },
                        data: {}
                    }
                ],
                sections: locale.sections.map(section => {
                    if(typeof (section as PageSymbolSectionObject).__ref === "string") {
                        return section;
                    } else return {
                        ...section,
                        data: (section as PageNSymbolSectionObject).data.map(data => ({
                            ...data,
                            data: data.data || {}
                        }))
                    };
                })
            })),
            versions: document.versions.map(version => ({
                ...version,
                locales: version.locales.map(locale => ({
                    ...locale,
                    info: locale.info.length ? locale.info: [
                        {
                            cond: { media: wapi.info.devices.map(d => d.name) },
                            data: {}
                        }
                    ],
                    sections: locale.sections.map(section => {
                        if(typeof (section as PageSymbolSectionObject).__ref === "string") {
                            return section;
                        } else return {
                            ...section,
                            data: (section as PageNSymbolSectionObject).data.map(data => ({
                                ...data,
                                data: data.data || {}
                            }))
                        };
                    })
                })),
            }))
        }
    }
}