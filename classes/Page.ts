import { PageDocument, PageCreateInput, PageFindInput, PageEditInput, ParsedPageObject, DomainObject, DomainDocument, SymbolObject, PageTableInput, PageObject, UserDocument, PageLocaleObject, PageSectionObject } from "../types";
import { DomainModel, MediaModel, PageModel, SymbolModel } from "../database";
import { readRef } from "../utils";
import { CModel, Domain, Model, Symbol, Template } from ".";
import { ProjectionType, UpdateQuery } from "mongoose";
import uiAPI from "../APIs/UiAPi";
import config from "../config";
import configData from "../config/data";

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export default class Page {
    public document: PageDocument;
    public _domain: Domain | null;

    constructor(pageDocument: PageDocument) {
        this.document = pageDocument;
        this._domain = null;

    }

    public async template() {
      return typeof this.document.model === "string" ? await Page.getPageModelTemplate(this.document.model) : null;
    }

    public async deleteLocale(locale: string) {
      if(this.document.versions[0].locales.length === 1) await this.delete();
      else await this._edit({
        $pull: {
          locales: { locale },
          "versions.0.locales": { locale }
        },
      });

      await this.publishUI(locale);

      return this;
    }

    public async addLocale(locale: string, info?: DeepPartial<PageLocaleObject>) {
      await this._edit({
        $push: {
          locales: {
            default: locale === configData.locales.data.defaultLocale,
            locale,
            ...info
          },
          "versions.0.locales": {
            default: locale === configData.locales.data.defaultLocale,
            locale,
            ...info
          }
        },
      })

      return this;
    }

    public async domain() : Promise<Domain> {
        if(this._domain) return this._domain;
        else {
            const domainDcoument = await DomainModel.findById(this.document.domain);

            this._domain = new Domain(domainDcoument);

            return this._domain;
        }
    }

    public async publishLocale(locale: string, user: UserDocument) : Promise<Page> {
      const index = this.document.locales.findIndex(l => l.locale === locale);

      if(index === -1) {
        const localeObject = this.document.versions[0].locales.find(l => l.locale === locale);

        if(localeObject) await this._edit({ $push: { locales: localeObject } });
      } else {
        await this._edit({ $pull: { locales: { locale } } }, user);
      }

          return this;
    }

    public async delete() {
      await this.document.delete();
      this.publishAllLocalesUI();

      return;
    }

    static async getPageModelTemplate(modelID: string) : Promise<Template | null> {
      if(!modelID) return await Template.default();

      const model = await Model.find({ _id: modelID });

      if(!model) return await Template.default();

      const templateName = model.document.pages?.template
      const template = templateName ? await Template.get(templateName) : null;

      return template || await Template.default();
    }

    static async create(pageInput : PageCreateInput, user?: UserDocument, locales?: PageCreateInput["locales"], localeInfo?: (locale: string) =>DeepPartial<PageLocaleObject>) : Promise<Page> {
      const template = await this.getPageModelTemplate(pageInput.model);

      locales = locales || [{ locale: configData.locales.data.defaultLocale }];

      const pageDocument = new PageModel({
            ...pageInput,
            name: pageInput.name,
            domain: pageInput.domain,
            link: pageInput.link,
            url: `${pageInput.domain}:${pageInput.link}`,
            ...(user ? { created_by: user._id } : {}),
            ...(locales ? {
              ...(!pageInput.model ? {
                locales: locales.map(l => ({
                  default: l.locale === configData.locales.data.defaultLocale,
                  ...{ ...l, modelData: undefined },
                  sections: template ? template.render(l.locale, l.modelData) : [],
                  ...localeInfo?.(l.locale)
                }))
              } : {}),
              versions: [{
                locales: locales.map(l => ({
                  default: l.locale === configData.locales.data.defaultLocale,
                  ...{ ...l, modelData: undefined },
                  sections: template ? template.render(l.locale, l.modelData) : [],
                  ...localeInfo?.(l.locale)
                }))
              }]
            } : {})
        });
        
        return new Page(await pageDocument.save());
    }

    static async table(input: PageTableInput) {
      	const filters = input.search ? { name: { $regex: new RegExp(`.*${input.search}.*`, "i") } } : {};

	  	if(input.locale) filters["locales"] = { $elemMatch: { locale: input.locale } };
		if(input.noModel) filters["model"] = { $exists : false }
		
		const pages = await PageModel.find(filters, {
			"locales.sections" : 0,
			"locales.info" : 0,
			"models": 0,
			"symbols": 0,
			"versions.locales.sections" : 0,
			"versions.locales.info" : 0,
		}).sort((() => { switch(input.sort) {
			case "NEWEST": return { created_at: 1 };
			case "OLDEST": return { created_at: -1 };
			default: return  { name: 1 };
		} })()).skip(input.skip).limit(input.max).populate({
			path: "created_by updated_by",
			select: "name"
		});
		const count = await PageModel.count(filters);

		return { pages, count };
    };

    static async find(pageInput : PageFindInput, projection?: ProjectionType<PageObject>) : Promise<Page | null> {
      const input = { ...pageInput };
        if(input.locale) {
            input["locales"] = { $elemMatch: { locale: pageInput.locale } };
            delete input.locale;
        }
        const page = await PageModel.findOne(input, projection);

        if(page) return new Page(page);
        else return null;
    }

    static async publishSymbol(symbol: string) {
        const links = (await PageModel.aggregate([
            {
              "$project": {
                "symbols": {
                  "$objectToArray": "$symbols"
                }, 
                "link": 1, 
                "locales": 1
              }
            }, {
              "$unwind": {
                "path": "$symbols"
              }
            }, {
              "$match": {
                "symbols.v": {
                  "$eq": symbol
                }
              }
            }, {
              "$project": {
                "link": 1, 
                "locale": {
                  "$first": {
                    "$filter": {
                      "input": "$locales", 
                      "as": "item", 
                      "cond": {
                        "$eq": [
                          {
                            "$toObjectId": "$symbols.k"
                          }, "$$item._id"
                        ]
                      }
                    }
                  }
                }
              }
            }, {
              "$project": {
                "link": 1, 
                "locale": "$locale.locale"
              }
            }
        ]));

        configData.revalidates.addMany(links);
        
        return;
    }

    static async updateModel(modelID: string) {
        const symbols : string[] = (await SymbolModel.aggregate([
            {
            "$match": {
            "models": {
                "$regex": ".*" + modelID.toString()
            }
            }
            }, {
            "$project": {
            "id": "$_id"
            }
            }
        ])).map(({ id }) => id.toString());
        const links = await PageModel.aggregate([
            {
            "$project": {
            "models": {
                "$objectToArray": "$models"
            }, 
            "symbols": {
                "$objectToArray": "$symbols"
            }, 
            "link": 1, 
            "locales": 1
            }
            }, {
            "$unwind": {
            "path": "$locales"
            }
            }, {
            "$project": {
            "link": 1, 
            "locale": "$locales.locale", 
            "models": {
                "$first": {
                "$filter": {
                "input": "$models", 
                "as": "item", 
                "cond": {
                "$eq": [
                    "$locales._id", {
                    "$toObjectId": "$$item.k"
                    }
                ]
                }
                }
                }
            }, 
            "symbols": {
                "$first": {
                "$filter": {
                "input": "$symbols", 
                "as": "item", 
                "cond": {
                "$eq": [
                    "$locales._id", {
                    "$toObjectId": "$$item.k"
                    }
                ]
                }
                }
                }
            }
            }
            }, {
            "$match": {
            "$or": [
                {
                "models.v": {
                "$regex": ".*" + modelID.toString()
                }
                }, {
                "symbols.v": {
                "$in": symbols
                }
                }
            ]
            }
            }, {
            "$project": {
            "link": 1, 
            "locale": 1
            }
            }
        ]);

        configData.revalidates.addMany(links);
    }

    static async getPublished() {
        const pages = await PageModel.find({});

        return pages;
    }

    public async populate() {
        this._domain = new Domain((await this.document.populate("domain")).domain as DomainDocument);

        await this.document.populate([
          {
            path: "created_by updated_by",
            select: "name"
          },
          {
            path: "model"
          }
        ]);

        return this;
    };

    public async edit(editInput: PageEditInput) : Promise<Page | null> {
        if(editInput.domain.theme) {
          const domain = await this.domain();
          
          await domain.edit({ theme: editInput.domain.theme });
          await domain.revalidateAllPages();
        }

        await PageModel.updateOne({ _id: this.document._id }, editInput.data);

        this.document = await PageModel.findById(this.document.id)

        return this;
    }

    public async _edit(data: UpdateQuery<PageDocument>, user?: UserDocument) {
        await PageModel.updateOne({ _id: this.document._id }, {
          ...data,
          updated_at: new Date(),
          ...(user ? { updated_by: user._id } : {})
        });

        this.document = await PageModel.findById(this.document._id);

        return this;
    }

    public async publish(name: string, locale: string) : Promise<Page | null> {
        const version = this.document.versions.find(version => version.name === name);

        if(version) {
            this.document.locales = version.locales;
            this.document = await this.document.save();
            await this.publishUI(locale);

            return this;
        } else return null;
    }

    public async publishPage(user: UserDocument) {
		await this._edit({ published: !this.document.published }, user);
		this.publishAllLocalesUI();

		return this;
    }

    public async publishPageChanges(user: UserDocument, targetLocales?: string[]) {
		const locales = {};
		
		this.json.locales.forEach((locale, index) => {
			if(!targetLocales || targetLocales.includes(locale.locale)) {
				const versionLocale = this.document.versions[0].locales.find(l => l.locale === locale.locale);

				if(versionLocale) locales[`locales.${index}.meta`] = versionLocale.meta;
			}
    	});

      await this._edit(locales, user);

	  this.publishAllLocalesUI();

      return this;
    }
    
    public async publishUI(locale?: string) {
        await uiAPI.post("revalidate", { url: `${locale ? "/" + locale : ""}${this.document.link  === "/" ? "" : this.document.link}` });

        return this;
    }

	public async publishAllLocalesUI() {
		return Promise.all(this.document.locales.map(l => this.publishUI(l.locale)));
	}

    public async parse(prodMode: boolean = false, locale?: string)  {
        const page = this.json;
        const symbols : ParsedPageObject["symbols"] = {};
        const models : ParsedPageObject["models"] = {};
        const json =  this.json;
        const localeObject = locale ? this.getLocale(locale) : null;
        const localeID = localeObject ? (localeObject as any).id : null;
        const pageModels = {};

        if(locale && !localeObject) return null;

        // populate models if its a model page
        if(this.document.model) {
            const model = await Model.find({ _id: (page.model as any)?._id || page.model });

            if(model) {
                if(locale) {
                    const Model = model.dbModles[locale];
                    const modelObject = new CModel(await Model.findOne({ page: this.document._id }));

                    if(modelObject.document) pageModels[locale] = {...(await modelObject.populate()).json, __type: model.document.name};
                } else for(const [locale, Model] of Object.entries(model.dbModles)) {
                    const modelObject = new CModel(await Model.findOne({ page: this.document._id }));

                    if(modelObject.document) pageModels[locale] = {...(await modelObject.populate()).json, __type: model.document.name};
                }
            }
        }

        if(prodMode) { // populate only used symbols
            const docSymbols = (localeID ? {[localeID]: json.symbols[localeID] || []} : json.symbols);
            for(const l in docSymbols) {
                const refs = docSymbols[l];
    
                for(const ref of refs) {
                    const [id, symbol] = await readRef<Symbol>(`Symbol_${ref}` as string);
                    if(symbol) {
                      const json = symbol.json() as SymbolObject;
                      symbols[id] = json as any;

                      for(const ref of json.models) {
                        try {
                          models[ref] ||= (await readRef(ref))[1]
                        } catch {
                          models[ref] = null;
                        }
                      }
                    }
                }
            }
        } else { // populate all domain symbols
            const id = typeof this.document.domain === "string" ? this.document.domain as string : (this.document.domain as DomainDocument)._id.toString();

			for(const symbol of (await Symbol.findByDomain(id))) {
				const json = symbol.toJSON() as SymbolObject;
                symbols[symbol._id.toString()] = json as any;

				for(const ref of json.models) {
          try {
            models[ref] ||= (await readRef(ref))[1]

          } catch {
            models[ref] = null
          }
				}
			}
        }

        // popluate models
        const docModels = (localeID ? { [localeID]: json.models[localeID] || [] } : json.models);

        for(const l in docModels) {
            const refs = docModels[l];

            for(const ref of refs) {
              try {
                models[ref] ||= (await readRef(ref))[1];
              } catch {
                models[ref] = null;
              }
            }
        }
    
        if(locale) return { 
            locale: localeObject, symbols, models, theme: page.domain.theme,
            ...(pageModels[locale] ? {
                pageModel: pageModels[locale]
            } : {})
        };
        else return { ...page, symbols, models, pageModels };
    }

    public getLocale(locale: string) : PageLocaleObject | null {
        const localeObject = this.document.locales.find(l => l.locale === locale);
    
        return localeObject || null;
    }

    public get json() {
        return this.document.toJSON();
    }
}