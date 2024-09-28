import { ActiveParsedSectionObject, BuilderComp, BuilderStorage, LayersTypes, PageNSymbolSectionObject, PageSectionObject, PageSymbolSectionObject, ParsedComp, ParsedSectionObject, WapiDataRequest, WapiRequests } from "../types";
import { sendWapiRequest } from "../wapi";
import { Data, SectionData } from "./Data";
import { Layer, LayerClass, Layers, SectionLayer } from "./Layer";
import { Props } from "./Props";
import lodash, { cloneDeep } from "lodash";
import { PageActions, TargetsActions } from "../states";
import { CmsAPi } from "../../APIs";
import { SymbolCreateInput, BuilderSymbol } from "../types";
import { checkSectionSymbol, readRef, readSection } from "../utils/references";

let sectionsCounters = 0;
let CreateSymbolID = 0;
export class PageSections {
    public sections: PageSectionObject[];
    public layers: Layers;
    public length: number;
    public parsed: ParsedSectionObject[];
    public fixed: PageSection[];
    [key: number] : PageSection;
    constructor(sections: PageSections["sections"]) {
        this.length = 0;

        this.sections = sections;
        this.fixed = [];
        this.layers = new Layers([]);

        this.parsed = [];

        this.refrech();
    }

    public readContext(context: string) {
        const match = context.match(/^(\d+)\.?(.*)$/);

        if(match) {
            const id = parseInt(match[1]);
            const section = this.find(section => section.id === id);

            if(section) return section.data.activeData.data.__readContext(context);
            else throw new Error(`Unvalid Context : ${context}, the section is no exits`);
        } else throw new Error(`Unvalid Context : ${context}`)
    }

    public copy() {
        const data = this.filter(section => section.selected).map(section => section._section);

        window.localStorage.setItem(BuilderStorage.Copied_Sections, JSON.stringify(data));
    }

    public get visibles() {
        return this.filter(section => section.isVisible)
    }

    public find(callBack: (section: PageSection) => boolean) : PageSection | null {
        for(let i = 0; i < this.length; i++) {
            if(callBack(this[i])) return this[i];
        }

        for(let i = 0; i < this.fixed.length; i++) {
            if(callBack(this.fixed[i])) return this.fixed[i];
        }

        return null;
    }

    public each(callBack: (section: PageSection, fixed: boolean, index: number) => void) {
        for(let i = 0; i < this.fixed.length; i++) {
            callBack(this.fixed[i], true, this.length + i - 1);
        }

        for(let i = 0; i < this.length; i++) {
            callBack(this[i], false, i);
        }
    }

    public map(callBack: (section: PageSection) => {}) {
        const map : any[] = [];

        this.each((section, fixed, index) => {
            if(fixed) map[index] = callBack(section);
            else map[index] = callBack(section);
        })

        return map;
    }

    public filter(callBack: (section: PageSection) => boolean) : PageSection[] {
        const filter : any[] = [];

        this.each(section => {
            if(callBack(section)) filter.push(section);
        })

        return filter;
    }

    private _appendSection(section: PageSection, fixed: boolean = false, index: number = 0) {
        if(fixed) {
            const dataindex = index === 0 ? 0 : this.fixed[index - 1].dataindex + 1;

            this.fixed.splice(index, 0, section);
            for(let i = 0; i < this.fixed.length; i++) this.fixed[i].index = i;
            this.sections.splice(dataindex, 0, section.symbol || section._section);
        } else {
            const dataindex = index === 0 ? 0 : this[index - 1].dataindex + 1;

            for(let i = this.length; i > index; i--) {
                this[i - 1].index = i;
                this[i] = this[i - 1];
            }
    
            this[index] = section;
            section.index = index;
            this.length++;
    
            this.sections.splice(dataindex, 0, section.symbol || section._section);
        }

        section.select();
    }

    private _deleteSection(index: number, fixed: boolean = false) {
        const target = fixed ? this.fixed : this;
        const dataindex = target[index].dataindex;
        
        target[index].deselect();

        if(fixed) {
            this.fixed.splice(index, 1);
            for(let i = 0; i < this.fixed.length; i++) this.fixed[i].index = i;
        } else {
            this.length--;
            for(let i = index ; i < this.length; i++) {
                this[i + 1].index = i;
                this[i] = this[i + 1];
            }
    
            delete this[this.length];
        }


        this.sections.splice(dataindex, 1);
    }

    public appendSection(section: PageSection, fixed : boolean = false, index: number = 0, target?: string) {
        const context = window.__builder_context;

        section.index = index;

        context.actions.add({
            stack: true, target,
            redo: () => {
                // append the section
                this._appendSection(section, fixed, index);

                // append its layer
                this.layers.appendLayer(section.layer, index);

                // update
                this.updateView(() => ({ add: [[section.activeParsed, section.parsedIndex]] }));
                context.page.module.compare();
            },
            undo: () => {
                const parsedIndex = section.parsedIndex;

                // delete the section
                this._deleteSection(index, fixed);

                // delete layer
                this.layers.deleteLayer(index, fixed);

                // update
                this.updateView(() => ({ delete: [parsedIndex] }));
                context.page.module.compare();
            }
        })
    }

    public deleteSection(index: number, fixed: boolean = false, target?: string) {
        const targetSection = (fixed ? this.fixed[index] : this[index]) as PageSection;
        const context = window.__builder_context;
        let r_media : string[] = [];
        const targetsDevices = context.targets.devices.map(device => device.name);
        const parsedIndex = targetSection.parsedIndex;

        if(targetSection) context.actions.add({
            stack: true,
            target: target,
            redo: () => {
                r_media = [];

                // remove target media from section
                targetsDevices.forEach(device => {
                    const index = targetSection.cond.media.indexOf(device);
        
                    if(index !== -1) {
                        targetSection.cond.media.splice(index, 1);
                        r_media.push(device)
                    }
                })

        
                // remove the section if media = 0
                if(targetSection.cond.media.length === 0) {
                    this._deleteSection(index, fixed);
                    this.layers.deleteLayer(index, fixed);
                }
                
                // update
                if(targetSection.cond.media.length === 0) 
                    this.updateView(() => ({ delete: [parsedIndex] }));
                context.page.module.compare();
            },
            undo: () => {
                // check if section was deleted
                const append = targetSection.cond.media.length === 0;

                // add the removed media
                r_media.forEach(media => {
                    targetSection.cond.media.push(media);
                })

                // append section if its deleted
                if(append) {
                    this._appendSection(targetSection, fixed, index);
                    this.layers.appendLayer(targetSection.layer, index);
                }

                // update
                if(append) this.updateView(() => ({ add: [[targetSection.activeParsed, parsedIndex]] }));
                context.page.module.compare();
            }
        }); else throw new Error("Trying to remove a non exist Section.")
    }

    // this method work with absolute index
    public moveSection(sindex: number, fixed: boolean = false, dindex: number) {
        const context = window.__builder_context;
        const d_section = (fixed ? this.fixed[dindex] : this[dindex]) as PageSection;
        let s_section = (fixed ? this.fixed[sindex] : this[sindex]) as PageSection;
        const initDIndex = dindex;
        const targetsDevices = context.targets.devices.map(device => device.name);
        let r_media : string[] = [], s_clone : PageSection;

        if(s_section && sindex !== dindex) context.actions.add({
            redo: () => { 
                s_section = (fixed ? this.fixed[sindex] : this[sindex]) as PageSection;;
                dindex = initDIndex;
                r_media = [];

                // remove target media from section
                targetsDevices.forEach(device => {
                    const index = s_section.cond.media.indexOf(device);
        
                    if(index !== -1) {
                        s_section.cond.media.splice(index, 1);
                        r_media.push(device)
                    }
                })
        
                // remove the section if media = 0
                let parsedIndex : number | null = null; 
                if(s_section.cond.media.length === 0) {
                    parsedIndex = s_section.parsedIndex;
                    this._deleteSection(sindex, fixed);
                    this.layers.deleteLayer(sindex, fixed);

                    if(sindex < dindex) dindex -= 1;
                }
            

                // create a clone with targeted media
                s_clone = s_clone || s_section.clone(section => ({
                    ...section,
                    cond: { ...section.cond, media: r_media }
                }));

                // append the section
                this._appendSection(s_clone, fixed, dindex);

                // append its layer
                this.layers.appendLayer(s_clone.layer, dindex);
                
                // update
                this.updateView(() => ({
                    add: [[s_clone.activeParsed, d_section ? d_section.parsedIndex  + (sindex < dindex ? 0 : -1) : null]], 
                    ...(parsedIndex !== null ? {
                        delete: [parsedIndex + (sindex < dindex ? 0 : 1)]
                    } : {})
                }));
                context.page.module.compare();
            },
            undo: () => {
                const parsedIndex = this[dindex].parsedIndex;
                // delete the section
                this._deleteSection(dindex, fixed);

                // delete layer
                this.layers.deleteLayer(dindex, fixed);

                // check if section was deleted
                const append = s_section.cond.media.length === 0;

                // add the removed media
                r_media.forEach(media => {
                    s_section.cond.media.push(media);
                })

                // append section if its deleted
                if(append) {
                    this._appendSection(s_section, fixed, sindex);
                    this.layers.appendLayer(s_section.layer, sindex);
                }

                // update
                this.updateView(() => ({ delete: [parsedIndex + (sindex < dindex ? 1 : 0)], ...(append ? {
                    add: [[s_section.activeParsed, s_section.parsedIndex + (sindex < dindex ? 0 : 1)]]
                } : {}) }));
                context.page.module.compare();
            }
        }); else if(!s_section) throw new Error("Trying to move a non exist Section.")
    }

    public parse() {
        const sections = this.visibles;

        this.parsed = [];
        for(let i = 0; i < sections.length; i++) {
            const parsedData = sections[i].activeParsed;
            if(parsedData) this.parsed[i] = parsedData;
        }
    }

    public refrech() {
        console.log("Create Layers & Sections");
        let index = 0, fixedIndex = 0;
        this.fixed = [];

        for(let i = 0; i < this.sections.length; i++) {
            if(checkSectionSymbol(this.sections[i])) {
                const section = new PageSection(this.sections[i], section => section.fixed ? fixedIndex : index);
                if(section.fixed) {
                    this.fixed[fixedIndex] = section;
                    fixedIndex++;
                } else {
                    this[index] = section;
                    index++;
                }
            }
        }
    
        this.length = index;

        this.layers = new Layers(this);
        Layers.updateState();

        this.parse();
        this.updateView(sections => ({set: sections.parsed}));
    }

    public export() : PageSectionObject[] {
        return this.map(section => section._section)
    }


    public updateView(callBack: (sections: PageSections) => Omit<WapiDataRequest, "type">) {
        this.parse();
        sendWapiRequest({ type: WapiRequests.Data, ...callBack(this) });
    }

}

export class PageSection {
    public comp: PageNSymbolSectionObject["comp"];
    public cond: PageNSymbolSectionObject["cond"];
    public data: SectionData;
    public index: number | null;
    public section: ParsedComp;
    public layer: SectionLayer;
    public parsed: ParsedSectionObject;
    public _section: PageNSymbolSectionObject;
    public fixed: boolean;
    public id: number;
    public symbol: PageSymbolSectionObject | null;
    constructor(section: PageSectionObject, index?: number | ((section: PageSection) => number)) {
        const context = window.__builder_context;
        [this._section, this.symbol] = readSection(section);
        this.comp = this._section.comp;
        this.cond = this._section.cond;
        this.section = context.wapi.sections[this.comp];
        this.fixed = this.section.fixed;
        this.index = (() => {
            if(typeof index === "number") return index;
            else {
                const callBackIndex = index?.(this);

                return typeof callBackIndex === "number" ? callBackIndex : null
            }
        })();
        this.id = sectionsCounters++;
        this.data = new SectionData(this._section, this);
        this.layer = new SectionLayer({
            type: LayersTypes.Section,
            data: this.data,
            name: this._section.__name,
            props: this.section.props,
            section: this
        });
        this.parsed = this.parse();
    }

    get parsedIndex() : number {
        const sections = window.__builder_page.locale.sections.parsed;

        for(let index = 0; index < sections.length; index++) {
            if(sections[index].id === this.id) return index;
        }


        throw new Error("Tying to parsed index of unvisible section");
    } 

    get activeParsed() : ActiveParsedSectionObject {
        const context = window.__builder_context;
        const activeDevice = context.targets.device;

        for(const data of this.parsed.data) {
            if(data.cond.media.includes(activeDevice.name)) return {
                ...this.parsed,
                data: data.data,
            }
        }

        return {
            ...this.parsed,
            data: this.parsed.data[0].data,
        }

        throw new Error("Cannot get active parsed of section")
    }

    get dataindex() {
        const page = window.__builder_page;
        const context = window.__builder_context;
        let index = 0, rindex = 0;
        for(const section of page.locale.sections.sections) {
            if(checkSectionSymbol(section)) {
                const sectionComp = context.wapi.sections[readSection(section)[0].comp];

                if(sectionComp.fixed === this.fixed) {
                    if(index === this.index) return rindex;
                    index++;
                }
    
                rindex++;
            }
        }

        return -1;
    }

    get selectedTarget() {
        const targets = window.__builder_context.targets;

        return targets.section && targets.section?.[0].id === this.id; 
    }

    get selected() {
        const targets = window.__builder_context.targets;

        return Boolean(targets.sections.find(section => section.id === this.id));
    }

    get name() {
        return this._section.__name;
    }

    set name(name: string) {
        this._section.__name = name;
    }

    public async convertSymbol(name: string = this.name) {
        const context = window.__builder_context;
        const page = window.__builder_page;
        const CreateSymbolActionID = `CreateSymbol_${CreateSymbolID++}`;
        let symbolID : string, symbol : BuilderSymbol;

        context.actions.add({
            stack: true, target: CreateSymbolActionID,
            redo: async (firstTime) => {
                try {
                    symbol = symbol || (await CmsAPi.post("/symbol/create", {
                        __name: name,
                        comp: this.comp,
                        data: this.data._data,
                        type: "Section",
                        domain: page.document.domain._id,
                        locale: context.page.state.locale
                    } as SymbolCreateInput)).data as BuilderSymbol;

                    const sectionObject : PageSymbolSectionObject = {
                        __ref: `Symbol_${symbol._id}`,
                        cond: lodash.cloneDeep(this.cond),
                    };
        
                    symbolID = symbol._id;
                    page.document.symbols[symbol._id] = symbol;
        
                    if(firstTime) {
                        this.delete(CreateSymbolActionID);

                        const section = new PageSection(sectionObject, this.index as number);

                        page.locale.sections.appendSection(section, section.fixed, section.index as number, CreateSymbolActionID);
                    }

                    context.page.set({ type: PageActions.AddSymbol, symbol });

                    page.compare();
                } catch(error) { throw error };
            },
            undo: () => {
                delete page.document.symbols[symbolID];
            }
        })

    }

    public expandSymbol() {
        if(this.symbol) {
            const CreateSymbolActionID = `CreateSymbol_${CreateSymbolID++}`;
            const page = window.__builder_page;
                        
            const sectionObject = lodash.cloneDeep({
                __name: this.name,
                comp: this.comp,
                cond: this.cond,
                data: readRef<BuilderSymbol>(this.symbol?.__ref as string).data
            });

            this.delete(CreateSymbolActionID);

            const section = new PageSection(sectionObject, this.index as number);

            page.locale.sections.appendSection(section, section.fixed, section.index as number, CreateSymbolActionID);

            page.compare();

        } else throw new Error("Cannot expand a non symbol section")
    }

    public select(controlMode: boolean = false) {
        const context = window.__builder_context;

        context.targets.set({ type: TargetsActions.SelectSection, section: this, controlMode });
    }

    public deselect() {
        const context = window.__builder_context;

        if(this.selectedTarget) this.select(true);
        else if(this.selected) context.targets.set({ type: TargetsActions.ToggleSection, section: this });
    }

    public delete(target?: string) {
        const page = window.__builder_page;

        if(typeof this.index === "number") page.locale.sections.deleteSection(this.index, this.fixed, target);
        else throw new Error("Trying to remove a non indexed Section.")
    }

    public clone(edit: (section: PageSectionObject) => PageSectionObject = s => s ) : PageSection {
        return new PageSection(edit(lodash.cloneDeep(this.symbol || this._section)));
    }

    public dublciate(offset: number = 0, target?: string) {
        const page = window.__builder_page;
        const clone = this.clone();

        if(typeof this.index === "number") page.locale.sections.appendSection(clone, this.fixed, this.index + offset + 1, target);
        else throw new Error("Trying to dublicate a non indexed Section.");
    }

    // this method work with relative index
    public move(index: number) {
        const page = window.__builder_page;
        const absIndex = (() => {
            if(index > 0) return page.locale.sections.visibles.filter(s => s.fixed === this.fixed)[index - 1].index as number + 1;
            else return page.locale.sections.visibles.filter(s => s.fixed === this.fixed)[index].index as number;
        })()

        if(typeof this.index === "number") page.locale.sections.moveSection(this.index, this.fixed, absIndex);
        else throw new Error("Trying to move a non indexed Section.")
    }

    public rename(name: string) {
        this.name = name || this.comp;
        this._section.__name = this.name;
        this.layer.raname(this.name);
    }

    public get isVisible() : boolean {
        const context = window.__builder_context;

        return Boolean(this.cond.media.includes(context.targets.device.name));
    }


    public parse() : ParsedSectionObject {

        return {
            id: this.id,
            comp: this.comp,
            data: this.data.data.map(data => ({
                ...data,
                data: data.data.__parsed
            }))
        };
    }

    static create(sectionName: string, data1?: any, { data, name, __ref } : { data?: any, name?: string, __ref?: string } = {}, index?: number) {
        const context = window.__builder_context;
        const cond = { media: context.targets.devices.map(d => d.name) };
        const section = context.wapi.sections[sectionName];
        const isInfo = ["__PageInfo", "__DomainTheme"].includes(sectionName);
        const sectionObject : PageSectionObject = __ref ? {
            __name: name || sectionName,
            __ref,
            cond:cond
        } as PageSymbolSectionObject : {
            __name: name || sectionName,
            comp: sectionName,
            cond,
            data: data || [
                {
                    cond : lodash.cloneDeep(cond),
                    data: data1 !== undefined ? data1 : section.props.__default(!isInfo)
                }
            ]
        };

        return new PageSection(sectionObject, index);
    }
}