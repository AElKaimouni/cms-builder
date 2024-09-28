import { BuilderStorage, CompFieldArgs, Device, ExpandedChildLayer, FieldTypes, LayersTypes, ListFieldArgs, ListFieldObject, ModelFieldArgs, PageDataCondObject, PageNSymbolSectionObject, PageSectionDataObject, PageSectionObject, ParsedComp } from "../types";
import { Layer, ListItemLayer, ListLayer, SectionLayer } from "./Layer";
import { CompField, Field, ListField, Props } from "./Props";
import lodash, { isArray } from "lodash";
import { PageSection } from "./Section";
import { TargetsActions } from "../states";
import { loadModel, readRef, readSection } from "../utils/references";
import { Dispatch } from "react";
import { reloadFrame, updateUiData } from "../utils";
import ModelField from "../comps/Fields/Model";

let DataID = 0;
let SymbolActionID = 0;

interface ParsedSectionDataObject {
    cond: PageSectionDataObject["cond"];
    data: Data;
}

export class SectionData {
    public data: ParsedSectionDataObject[];
    private comp: ParsedComp;
    public section: PageSection;
    public _data: PageNSymbolSectionObject["data"];
    constructor(section: PageSectionObject, parent: PageSection) {
        const rSection = readSection(section);
        const context = window.__builder_context;
        const comp = context.wapi.sections[rSection[0].comp];
        this.section = parent;
        this.comp = comp;
        this._data = rSection[0].data;
        this.data = rSection[0].data.map(data => {
            return {
                ...data,
                data: Data.create(data.data, comp.props, this, data.cond, parent.id.toString(), this)
            };
        });
    }

    public get activeData() : ParsedSectionDataObject {
        const context = window.__builder_context;
        const data = this.data.find(data => data.cond.media.includes(context.targets.device.name));

        return data || {
            cond: { media: [] },
            data: Data.create({}, this.comp.props, this, { media: [] }, "", this)
        };
    }

    public export() : PageNSymbolSectionObject["data"] {
        return this.data.map(data => ({
            ...data,
            cond: data.cond,
            data: data.data.__data
        }))
    }
}

export class Data {
    public __props: Props | Field;
    public __data: any;
    public __layer: null | Layer | SectionLayer;
    public __section: SectionData;
    public __cond: PageDataCondObject;
    public __id: number;
    public __context: string;
    public __relativeContext: () => string;
    public __parent: Data | SectionData;
    public __dispatch?: Dispatch<any>;
    public __dispatchEditor?: Dispatch<any>;
    public __parsed: any;
    public __propsList: string[];
    public __dynamicList: boolean;
    public __dynamicComp: string;
    public __adjDatas: (Data | PageSection)[] | null;
    public __isInfo: boolean;
    constructor(
        data: Data["__data"], props: Data["__props"],
        section: Data["__section"],
        cond: Data["__cond"],
        __context: string,
        parent: Data["__parent"],
        dynamic: string = "",
        index?: number
    ) {
        const context = window.__builder_context;

        this.__isInfo = ["__PageInfo", "__DomainTheme"].includes(section.section.comp);
        this.__props = props;
        this.__dynamicComp = dynamic;
        this.__dynamicList = (this.__props instanceof ListField) &&  (this.__props.__field as ListFieldObject).__dynamic;
        this.__layer = null;
        this.__section = section;
        this.__cond = cond;
        this.__id = DataID++;
        this.__context = __context;
        this.__parent = parent;
        this.__adjDatas = null;
        this.__relativeContext = () => {
            const parentContext = this.__parent instanceof SectionData ? "": this.__parent.__relativeContext();
            const childContext = this instanceof ListItemData ? this.__index : this.__propName;
            
            return parentContext ? `${parentContext}.${childContext}` : childContext.toString();
        }
        this.__propsList = [];
        
        const valid = this.isValid(data);

        if(!valid && parent instanceof Data) {
            const propName = this instanceof ListItemData ? index : this.__propName;
            const defaultData = this.__default(!this.__isInfo);


            if(this instanceof ListItemData) {
                parent._data[propName] = defaultData;
                this.__data = parent._data[propName];
            } else {
                parent.__data[propName] = defaultData;
                this.__data = parent.__data[propName];
            }

        } else this.__data = data;

        if(!this.__isInfo && !this.__style) this.__data[this.__styleKey] = {};

        if(dynamic) this.__data[this.__compKey] = dynamic;

        // setup childrens
        if(props instanceof Props) {
            props.__each((prop, name) => {
                this.__propsList.push(name);

                if(this.__data[name] === undefined) this.__data[name] = prop.__default(!this.__isInfo);

                this[name] = Data.create(this.__data[name], prop, this.__section, this.__cond, `${this.__context}.${name}`, this);
            });
        } else {
            switch(props.__type) {
                case FieldTypes.Comp : {
                    const args = props.__args as CompFieldArgs;
                    const comp = context.wapi.comps[args.comp] || context.wapi.elements[args.comp];

                    if(comp.props instanceof Props) comp.props.__each((prop, name) => {
                        if(this.__data[name] === undefined) this.__data[name] = prop.__default(!this.__isInfo);

                        this.__propsList.push(name);
                        this[name] = Data.create(this.__data[name], prop, this.__section, this.__cond, `${this.__context}.${name}`, this);
                    });
                }; break;
                case FieldTypes.List : {
                    const args = props.__args as ListFieldArgs;
                    const _data = this.__data as any[];
                    
                    for(let i = 0; i < (this.__isInfo ? _data : _data[0]).length; i++) {
                        const compName = this.__dynamicList ? (Array.isArray(_data[0][i]) ? _data[0][i][2] : _data[0][i].__comp) : undefined;
                        const _props = compName ? args.props[compName] : args.props;
                        
                        if(_props === undefined && compName) throw new Error(`dynamic comp : "${compName}" does not exist on dynamic zone in section "${section.section.comp}".`);

                        let props = Props.create(_props);

                        if(props instanceof CompField) props = props.__props;

                        this.__propsList.push(i.toString());
                        if(_data[0][i] === undefined) _data[0][i] = props.__default(!this.__isInfo);
                        this[i] = new ListItemData(_data[0][i], props, this.__section, this.__cond, this as any, i, compName); // this is ListLayer
                    }

                }; break;
            }
        }

        // setup parsed object
        if(!this.__isInfo) {
            const dataContext = (this.__parent instanceof SectionData ? "S" : "") + (() => {
                if(this.__props instanceof Field) return `${this.__props.__type}_${this.__context}`;
                else return `${FieldTypes.Comp}_${this.__context}`;
            })();
            
            if(this.__propsList.length) {
                const list = this instanceof ListData;
    
                this.__parsed = list ?
                    [[], this.__data[1], ...(dynamic ? [dynamic] : [null]), dataContext] :
                    { __context: dataContext, __style: this.__rdata.__style, ...(dynamic ? { __comp: dynamic } : {}) };
    
                this.__propsList.forEach(key => {
                    if(list) this._parsed[key] = (this[key] as Data).__parsed;
                    else this.__parsed[key] = (this[key] as Data).__parsed;
                })
            } else {
                if(this.__props instanceof Field && this.__props.__type === FieldTypes.Model) 
                    this.__parsed = {
                        ...lodash.cloneDeep(this.__rdata),
                        __context: dataContext,
                        __style: this.__data.__style,
                        ...(dynamic ? { __comp: dynamic } : {})
                    };
                else this.__parsed = [lodash.cloneDeep(this.__rdata[0]), this.__rdata[1], ...(dynamic ? [dynamic] : [null]), dataContext];
            }
        } else this.__parsed = lodash.cloneDeep(this.__rdata);
    }

    get _data() {
        return this.__isInfo ? this.__data : this.__data[0]
    }

    set _data(val) {
        if(this.__isInfo) this.__data = val;
        else this.__data[0] = val
    }

    get _parsed() {
        return this.__isInfo ? this.__parsed : this.__parsed[0];
    }

    set _parsed(val) {
        if(this.__isInfo) this.__parsed = val;
        else this.__parsed[0] = val
    }

    get __styleKey() {
        return !isArray(this.__data) ? "__style" : 1;
    }

    get __compKey() {
        return !isArray(this.__data) ? "__comp" : 2;
    }
 
    get __style() {
        return this.__data[this.__styleKey];
    }

    get __propName() {
        if(this instanceof ListItemData) {
            return this.__index;
        } else {
            const match = this.__context.match(/^.*\.([^\.]*)$/)
            if(match) return match[1];
            else return this.__context;
        }
    }
    
    get __selectedTarget() {
        const targets = window.__builder_context.targets;

        return targets.comp && targets.comp?.[0].__id === this.__id; 
    }

    get __selected() {
        const targets = window.__builder_context.targets;

        return Boolean(targets.comps.find(comp => comp.__id === this.__id));
    }

    get __symbolSiblings() : (typeof this)[] {
        const page = window.__builder_page;

        return page.locale.sections.filter(section => {
            return section.symbol !== null && section.id !== this.__section.section.id && section.symbol.__ref === this.__section.section.symbol?.__ref;
        }).map(section => {
            return (section.data.activeData.data.__readContext(this.__relativeContext(), true) as (typeof this));
        });
    }

    get __rdata() {
        if(typeof this.__data.__ref === "string") {
            return readRef(this.__data.__ref);
        } else return this.__data;
    }

    public isValid(data: any, props: Props | Field = this.__props) {
        const page = window.__builder_page;
        if(!data) return false;

        if(props instanceof Props) {
            return typeof data === "object" && !Array.isArray(data);
        } else {
            if(props.__type === FieldTypes.Model) {
                const args = props.__args as ModelFieldArgs;
                const regExp = new RegExp(`^${args.model}_${args.query}.*$`);

                if(typeof data === "object" && !Array.isArray(data)) {
                    // load model if its query changed
                    if(data.__ref && !regExp.test(data.__ref.replace(/(\r\n|\n|\r)/gm, ""))) {
                        const match = data.__ref.replace(/(\r\n|\n|\r)/gm, "").match(/^Model_[^_]+_ *(?:{ *.* *} *)? *_(.+)$/)?.[1];
                        const ref = `Model_${args.model}_${args.query}_${match}`;

                        if(page.document.models[ref] === undefined) {
                            page.document.models[ref] = this.__default();

                            loadModel(`${args.model}_${args.query}_${match}`).then(res => {
                                page.locale.sections.refrech();
                                reloadFrame();
                            });
    
                        };

                        data.__ref = ref;
                    }

                    // set default if ref is not
                    if(data.__ref && !readRef(data.__ref)) return false;

                    return true;
                }

                return false;

            } else if (props instanceof CompField) {
                return this.isValid(data, props.__props);
            } else if(Array.isArray(data) || this.__isInfo) {
                switch(props.__type) {
                    case FieldTypes.String: return (this.__isInfo && typeof data === "string") || typeof data[0] === "string";
                    case FieldTypes.Boolean: return (this.__isInfo && typeof data === "boolean") ||  typeof data[0] === "boolean";
                    case FieldTypes.Number: return (this.__isInfo && typeof data === "number") ||  typeof data[0] === "number";
                    case FieldTypes.List: return (this.__isInfo && Array.isArray(data)) ||  Array.isArray(data[0]);
                    default : return false;
                }
            } else return false;
        }
    }

    public __edit(
        value: any,
        target?: string,
        checkSymbol : boolean = true,
        fromUI: boolean = false,
        style?: string
        ) {
        if(
            (this.__parent instanceof Data || style) &&
            (// this condition check if value has changed
                (
                    this.__props instanceof Field && this.__props.__type === FieldTypes.Model && !style &&
                    !lodash.isEqual(value.__ref,  this.__data.__ref)
                )
                ||
                (
                    !(this.__props instanceof Field && this.__props.__type === FieldTypes.Model && !style) && 
                    !lodash.isEqual(value, this.__isInfo ? this.__data : this._data)
                )
            )
            ) {
            const context = window.__builder_context;
            const symbol = this.__section.section.symbol;
            const initValue = lodash.cloneDeep(this.__data);
            const initRValue = this.__rdata;
            const propName = this.__propName;
            const devices = context.targets.devices;
            const symbolTarget = this.__context + JSON.stringify(devices.map(d => d.name)) + (style + "");
            const styleKey = this.__styleKey;

            let siblingsLength = 0;

            if(symbol && checkSymbol) {
                const siblings = this.__symbolSiblings;

                siblingsLength = siblings.length;
                siblings.forEach(data => {
                    data.__edit(value, target || symbolTarget, false);
                })
            }

            let rValue, merge, slayer : Layer | undefined = undefined, sdata : Data | undefined = undefined;
    
            context.actions.add({
                stack: siblingsLength > 0 || !checkSymbol, target : target || symbolTarget,
                redo: (firstTime) => {
                    merge = this.__explode(devices, slayer, sdata, !symbol || checkSymbol);
                    
                    if(style) {
                        if(value !== undefined) {
                            this.__data[styleKey][style] = value;

                        } else {
                            delete this.__data[styleKey][style]
                        }
                    } else {
                        if(this.__props instanceof Field && this.__props.__type === FieldTypes.Model){
                            this.__data = {...value, __style: this.__data.__style};
                            
                            const rdata = {
                                ...this.__rdata,
                                __context: `${FieldTypes.Model}_${this.__context}`,
                                __style: this.__data.__style
                            };

                            if(this instanceof ListItemData) {
                                (this.__parent as Data)._data[propName] = {...value, __style: this.__data.__style};
                                (this.__parent as Data)._parsed[propName] = rdata;
                            } else {
                                (this.__parent as Data).__data[propName] = {...value, __style: this.__data.__style};
                                (this.__parent as Data).__parsed[propName] = rdata;
                            }
                            
                        } else if (this.__isInfo) {
                            this.__data = value;
                            (this.__parent as Data).__data[propName] = value;
    
                            (this.__parent as Data).__parsed[propName] = this.__rdata;
                        } else {
                            this._data = value;
    
                            this._parsed = this.__rdata[0];
                        }
                    }

                    rValue = this.__rdata;

                    if(fromUI || !firstTime) {
                        if(this.__props instanceof Field && this.__props.__type === FieldTypes.Model){
                            this.__dispatch?.(rValue);
    
                        } else {
                            this.__dispatch?.(this.__isInfo ? rValue : rValue[0]);
    
                        }
                    }


                    // update ui
                    if(!fromUI || !firstTime) updateUiData(this);
                    else context.page.module.compare();
                },
                undo: () => {
                    // we updated the ui to make diff between data wehn using contentEditable
                    updateUiData(this);

                    if(style) {
                        if(initValue[styleKey][style] !== undefined) {
                            this.__data[styleKey][style] = initValue[styleKey][style];
                        } else {
                            delete this.__data[styleKey][style];
                        }
                    } else {
                        if(this.__props instanceof Field && this.__props.__type === FieldTypes.Model){
                            this.__data = initValue;
                            (this.__parent as Data).__data[propName] = initValue;
                            
                            (this.__parent as Data).__parsed[propName] = {
                                ...this.__rdata,
                                __context: `${FieldTypes.Model}_${this.__context}`
                            };
                        } else if (this.__isInfo) {
                            this.__data = initValue;
                            (this.__parent as Data).__data[propName] = initValue;
    
                            (this.__parent as Data).__parsed[propName] = this.__rdata;
                        } else {
                            this._data = initValue[0];
    
                            this._parsed = this.__rdata[0];
                        }
                    }

                    if(this.__props instanceof Field && this.__props.__type === FieldTypes.Model){
                        this.__dispatch?.(initRValue);
                    } else {
                        this.__dispatch?.(this.__isInfo ? initRValue : initRValue[0]);
                    }
    
                    [slayer, sdata] = merge();

                    // update ui, we delayed the callback so the interface wont cash the update with the previeus one
                    setTimeout(( ) => updateUiData(this), 0)
                    
                }
            })
        } else if(!(this.__parent instanceof Data)) throw new Error("Cannot edit data beacuse its parent is a SectionData")
    }

    public __select(controlMode: boolean = false) {
        const context = window.__builder_context;

        context.targets.set({ type: TargetsActions.SelectComp, comp: this, controlMode });
    }

    public __deselect() {
        const context = window.__builder_context;

        if(this.__selectedTarget) this.__select(true);
        else if(this.__selected) context.targets.set({ type: TargetsActions.ToggleComp, comp: this });
    }

    public __clone(cond: Data["__cond"] = this.__cond) {
        return new Data(lodash.cloneDeep(this.__data), this.__props, this.__section, cond, this.__context, this.__parent);
    }

    public __explode(devices: Device[], layer? : Layer, sdata?: Data, affectData: boolean = true) : () => [Layer | undefined, Data | undefined] {
        const explodedMedia : string[] = [];
        
        this.__cond.media.forEach(media => {
            if(!Boolean(devices.find(d  => d.name === media))) {
                explodedMedia.push(media);
            }
        });

        if(explodedMedia.length) {
            const data = this.__section.data.find(data => lodash.isEqual(data.cond, this.__cond));

            if(!data) throw new Error("A data has'nt a correct cond for section data");

            if(affectData) for(const media of explodedMedia) {
                const index = data.cond.media.indexOf(media);

                if(index !== -1) data.cond.media.splice(index, 1);
            }

            const cond = { media: explodedMedia }
            const clone = { cond, data: sdata || data.data.__clone(cond) }

            this.__section.data.push(clone);
            this.__section._data.push({ cond, data: clone.data.__data })
            this.__section.section.parsed.data.push({
                ...clone,
                data: clone.data.__parsed
            });

            layer = layer ? layer : Layer.create({
                type: LayersTypes.SectionData,
                data: clone.data,
                name: clone.data.__layer?.name as string,
                props: clone.data.__props,
                parent: data.data.__layer?.parent || null
            }) as Layer;

            this.__section.section.layer.childs.push({
                cond: clone.cond,
                layers: layer.activeChilds
            });

            this.__section.section.layer.expanded.childs.push({
                cond: clone.cond,
                layers: layer.activeChilds.expanded.indexed as ExpandedChildLayer[]
            });

            return () => {
                this.__section.section.layer.expanded.childs.pop();
                this.__section.section.layer.childs.pop();
                this.__section.data.pop();
                this.__section._data.pop();
                this.__section.section.parsed.data.pop();
                
                if(affectData) for(const media of explodedMedia) data.cond.media.push(media);

                return [layer as Layer, clone.data];
            }
        }

        return () => [undefined, undefined];
    }

    public __read(context: string, relative: boolean = false) : Data {
        const props = context.split(".");
        let data : Data = this;
        
        props.forEach(prop => {
            if(data instanceof ListData && !relative) {
                const res = data.find(data => data.__id.toString() == prop);

                if(res) data = res;
                else throw new Error(`Cannot find item in list with id : ${prop}`)

            } else data = data[prop];
        });

        return data;
    };

    public __readContext(context: string, relative: boolean = false) {
        const noRootContext1 = context.split(".").slice(1).join(".");
        const noRootCOntext2 = this.__context.split(".").slice(1).join(".");
        const relativeContext = noRootCOntext2 ? noRootContext1.replace(noRootCOntext2 + ".", "") : noRootContext1;
        if(relativeContext) return this.__read(relativeContext, relative);
        else return this.__section.section;
    }

    public __default(parseDefault : boolean = true) {
        return this.__props.__default(parseDefault);
    }

    static create(
        data: Data["__data"],
        props: Data["__props"],
        section: Data["__section"],
        cond: Data["__cond"],
        __context: Data["__context"],
        parent: Data["__parent"]
    ) {
        if(props instanceof Field && parent) {
            const context = window.__builder_context;
            const props2 = (() => {
                if(props instanceof Field) {
                    switch(props.__type) {
                        case FieldTypes.Comp: {
                            const args = props.__args as CompFieldArgs;
                            const comp = context.wapi.comps[args.comp] || context.wapi.elements[args.comp];

                            if(!comp) throw new Error(`Component : "${args.comp}", but required in section : "${section.section.comp}".`)

                            if(props.__args.default !== undefined) comp.props.__default = () => props.__args.default || comp.props.__default();
                            return comp.props;
                        };
                        default : return props;
                    }
                } else return props;
            })();
            switch(props.__type) {
                case FieldTypes.List : return new ListData(data, props2 as ListField, section, cond, __context, parent as Data);
                case FieldTypes.Comp: return new CompData(data, props2 as CompField, section, cond, __context, parent as Data)
                default : return new Data(data, props2, section, cond, __context, parent);
            }
        } else return new Data(data, props, section, cond, __context, parent);
    }
}

export class ListData extends Data {
    public __layer: ListLayer | null;
    public length : number;
    [key: number] : ListItemData;
    constructor(
        data: Data["__data"],
        props: ListField,
        section: Data["__data"],
        cond: Data["__cond"],
        __context: Data["__context"],
        parent: Data
    ) {
        super(data, props, section, cond, __context, parent);

        this.__layer = null;
        this.length = (this.__isInfo ? this.__data : this._data).length as number;
    }

    public copy() {
        const data = this.filter(data => data.__selected).map(data => data.__data);

        window.localStorage.setItem(BuilderStorage.Copied_List_Items, JSON.stringify(data));
    }

    public filter(callBack: (data: ListItemData, index: number) => boolean) {
        const res : Data[] = [];

        this.each((data, index) => {
            if(callBack(data as ListItemData, index)) res.push(data);
        });

        return res;
    }

    public each(callBack: (data: ListItemData, index: number) => void) {
        for(let i = 0; i < this.length; i++) {
            callBack(this[i], i);
        }
    }

    public find(callBack: (data: ListItemData, index: number) => boolean) : ListItemData | null {
        for(let i = 0; i < this.length; i++) {
            if(callBack(this[i], i)) return this[i];
        }

        return null;
    }

    public map<Type>(callBack: (data: ListItemData, index: number) => Type) {
        const map : Type[] = [];

        this.each((data, index) => {
            map.push(callBack(data, index))
        });

        return map;
    }

    private _add(data: ListItemData, index: number, affectData: boolean = true) {
        for(let i = this.length; i > index; i--) {
            this[i - 1].__index = i;
            this[i] = this[i - 1];
        }

        this[index] = data;
        data.__index = index;
        this.length++;

        this._parsed.splice(index, 0, data.__parsed);

        if(affectData) this._data.splice(index, 0, data.__data);
    }

    private _delete(index: number, affectData: boolean = true) {
        const { targets } = window.__builder_context;
        if(targets.comp && targets.comp[0].__context.indexOf(this.__context) === 0) {
            targets.comp[0].__deselect();
        }
        this.length--;
        for(let i = index ; i < this.length; i++) {
            this[i + 1].__index = i;
            this[i] = this[i + 1];
        }

        delete this[this.length];

        this._parsed.splice(index, 1);

        if(affectData) this._data.splice(index, 1);
    }

    private _move(sindex: number, dindex: number, affectData: boolean = true) {
        const s_data = this[sindex];
        this._delete(sindex, affectData);
        this._add(s_data, dindex, affectData);
    }

    public add(_data: any = undefined, position: number = -1, target?: string, checkSymbol : boolean = true, dyanmicComp?: string) {
        const symbol = this.__section.section.symbol;
        const context = window.__builder_context;
        const props = this.__props as ListField;
        const index = position === -1 ? this.length : position;
        const devices = context.targets.devices;
        const dprops = this.__dynamicList ? Props.create(props.__args.props[dyanmicComp as string]) : Props.create(props.__args.props);
        const data = new ListItemData(
            _data,
            dprops instanceof CompField ? dprops.__props : dprops,
            this.__section,
            this.__cond,
            this,
            index,
            this.__dynamicList ? dyanmicComp : ""
        );
        const symbolTarget = `Symbol_Action_${SymbolActionID++}`;
        let merge, slayer : Layer | undefined = undefined, sdata : Data | undefined = undefined;

        if(symbol && checkSymbol) {
            this.__symbolSiblings.forEach(listData => {
                listData.add(lodash.cloneDeep(_data), position, target || symbolTarget, false);
            })
        }
        
        context.actions.add({
            stack: true, target : target || symbolTarget,
            redo: () => {
                merge = this.__explode(devices, slayer, sdata, !symbol || checkSymbol);
                this._add(data, index, !symbol || checkSymbol);

                const layer = new ListItemLayer({
                    data,
                    name: data.__data.__name || dyanmicComp || `item ${index}`,
                    props: data.__props,
                    type: LayersTypes.ListItem,
                    parent: this.__layer
                });

                this.__layer?.activeChilds.appendLayer(layer, index);
                
                // update ui
                updateUiData(this);
            },
            undo: () => {
                this._delete(index, !symbol || checkSymbol);
                this.__layer?.activeChilds.deleteLayer(index);

                [slayer, sdata] = merge();

                // update ui
                updateUiData(this);
            },
        })
    }

    public delete(index: number, target?: string, checkSymbol: boolean = true) {
        const symbol = this.__section.section.symbol;
        const context = window.__builder_context;
        const data = this[index] as ListItemData;
        const layer = this.__layer?.activeChilds[index];
        const devices = context.targets.devices;
        const symbolTarget = `Symbol_Action_${SymbolActionID++}`;

        let merge, slayer: Layer | undefined = undefined, sdata: Data | undefined = undefined;

        if(symbol && checkSymbol) {
            this.__symbolSiblings.forEach(listData => {
                listData.delete(index, target || symbolTarget, false);
            })
        }

        if(data && layer) context.actions.add({
            stack: true, target : target || symbolTarget,
            redo: () => {
                merge = this.__explode(devices, slayer, sdata, !symbol || checkSymbol);
                this._delete(index, !symbol || checkSymbol);

                this.__layer?.activeChilds.deleteLayer(index);
                // update ui
                updateUiData(this);
            },
            undo: () => {
                this._add(data, index, !symbol || checkSymbol);

                this.__layer?.activeChilds.appendLayer(layer, index);
                
                [slayer, sdata] = merge();

                // update ui
                updateUiData(this);
            },
        }); else console.error("Cannot remove a non exits data item");
    }

    public move(sindex: number, dindex: number, target?: string, checkSymbol: boolean = true) {
        const symbol = this.__section.section.symbol;
        const context = window.__builder_context;
        const s_data = this[sindex];
        const devices = context.targets.devices;
        const dx = sindex <= dindex ? -1 : 0;
        const symbolTarget = `Symbol_Action_${SymbolActionID++}`;
        let merge, slayer : Layer | undefined = undefined, sdata : Data | undefined = undefined;

        if(symbol && checkSymbol) {

            this.__symbolSiblings.forEach(listData => {
                listData.move(sindex, dindex, target || symbolTarget, false);
            })
        }

        if(s_data) context.actions.add({
            stack: true, target : target || symbolTarget,
            redo: () => {
                merge = this.__explode(devices, slayer, sdata, !symbol || checkSymbol);
                this._move(sindex, dindex + dx, !symbol || checkSymbol);

                this.__layer?.activeChilds.moveLayer(sindex, dindex + dx);
                // update ui
                updateUiData(this);
            },
            undo: () => {
                this._move(dindex + dx, sindex, !symbol || checkSymbol);

                this.__layer?.activeChilds.moveLayer(dindex + dx, sindex);

                [slayer, sdata] = merge();

                // update ui
                updateUiData(this);
            }
        }); else throw new Error("Trying to move a non exist Section.")
    }

    public renameItem(index: number, name: string) {
        this._data[index][2] = name;
    }
}

export class ListItemData extends Data {
    public __parent: ListData;
    public __index: number;
    constructor(
        data: Data["__data"],
        props: Props | Field,
        section: Data["__section"],
        cond: Data["__cond"],
        parent: ListData,
        index: number,
        dynamic: string = ""
    ) {
        super(data, props, section, cond, `${parent.__context}.${DataID}`, parent, dynamic, index);

        this.__parent = parent;
        this.__index = index;
    }

    public __isSibling(comp: ParsedComp | Props | Field) : boolean {
        if(comp instanceof Props || comp instanceof Field) return false;
        const parentProps = this.__parent.__props as ListField;

        if(this.__parent.__dynamicList) {
            for(let key in parentProps.__args.props) {
                const props = parentProps.__args.props[key];

                if(props.__type === FieldTypes.Comp && props.__args.comp === comp.name)
                    return true;
            }

            return false;
        } else {
            const props = parentProps.__args.props;

            return props.__type === FieldTypes.Comp && props.__args.comp === comp.name;
        }
    }

    public __dublicate(target?: string) {
        this.__parent.add(lodash.cloneDeep(this.__data), this.__index + 1, target, true, this.__dynamicComp || "");
    }

    public __delete(target?: string) {
        this.__parent.delete(this.__index, target);
    }

    public __move(index: number) {
        this.__parent.move(this.__index, index);
    }

    public __rename(name) {
        const page = window.__builder_page;

        this.__layer?.raname?.(name);

        this.__parent.renameItem(this.__index, name);
        
        page.compare();
    }
}

export class CompData extends Data {
    constructor(
        data: Data["__data"],
        props: CompField,
        section: Data["__section"],
        cond: Data["__cond"],
        __context: Data["__context"],
        parent: Data
    ) {
        super(data, props, section, cond, __context, parent);
    }
}