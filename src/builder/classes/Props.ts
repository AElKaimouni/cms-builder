import { CompFieldArgs, CompFieldObject, CompGroupedStyles, CompPropsObject, CompStyleProps, FieldObject, FieldTypes, ListFieldArgs, ListFieldObject, ModelFieldArgs } from "../types";
import { CompData, Data, ListData } from "./Data";
import lodash from "lodash";
import { defaultStyles, groupStyles, parseDefaultData } from "../utils";

export class Props {
    public __props: CompPropsObject;
    public __style: CompGroupedStyles;
    constructor(props: CompPropsObject) {
        this.__props = props;
        this.__expand(props);
        this.__style = groupStyles(props.__style as any || defaultStyles);
    }

    public __each(callBack: (prop: Props | Field, name: string) => void) {
        Object.keys(this).forEach(propKey => {
            if(propKey.indexOf("__") !== 0) {
                const prop = this[propKey];

                callBack(prop, propKey); 
            }
        })
    }

    public __map(callBack: (prop: Props | Field, name: string) => any) : any[] {
        const res : any[] = [];
        this.__each((prop, name) => res.push(callBack(prop, name)));
        
        return res;
    }

    private __expand(props: CompPropsObject) {
        Object.keys(props).forEach(propKey => {
            if(propKey.indexOf("__") !== 0) {
                const prop = props[propKey];

                if(typeof prop.__type === "number") {
                    const field = prop as FieldObject;
    
                    this[propKey] = Field.__create(field);
                } else {
                    this[propKey] = new Props(prop as CompPropsObject);
                }
            }
        })
    }

    public __read(context: string, data: any) : Props | Field {
        const props = context.split(".");
        let currentProp = this;
        let currentData = data;

        props.forEach(prop => {
            if(currentData === undefined) throw new Error(`Cannot read context : ${context}, in props.`);
            currentProp = Props.__read(prop, currentProp);
            currentData = currentData[data] || {};

            if(!(currentProp instanceof Field || currentProp instanceof Props))
            throw new Error(`Cannot read context : ${context}, in props.`);
        })

        return currentProp;
    }

    public __default(parseDefault: boolean = true) {
        const data = { __style: {} };

        this.__each((prop, name) => {
            data[name] = prop.__default(parseDefault);
        });

        return data;
    }

    static __read(prop: string, field: Field | Props) {
        if(field instanceof Field) {
            const context = window.__builder_context;
            switch(field.__type) {
                case FieldTypes.Comp: {
                    const compField = new CompField(field.__field as CompFieldObject);

                    return compField.__props[prop];
                };
                case FieldTypes.List: {
                    return Props.create((field.__args as ListFieldArgs).props);
                };
                default: return undefined;
            }
        } else return field[prop];
    }

    static create(props: FieldObject | CompPropsObject) : Props | Field {
        if(props.__type !== undefined) return Field.__create(props as FieldObject);
        else return new Props(props as CompPropsObject);
    }
}

export class Field {
    public __field: FieldObject;
    public __type: FieldTypes;
    public __args: FieldObject["__args"];
    public __style: CompGroupedStyles;
    constructor(field: FieldObject) {
        this.__field = field;
        this.__type = field.__type;
        this.__args = field.__args;
        this.__style = groupStyles(field.__style as any || defaultStyles);


    }

    public __default(parseDefault: boolean = true) {
        const defaultArgs = this.__args.default ? lodash.cloneDeep(this.__args.default) : null;
        if(defaultArgs && parseDefault && this.__type !== FieldTypes.Model) parseDefaultData(defaultArgs, this)
        
        switch(this.__type) {
            case FieldTypes.Boolean: {
                const value = defaultArgs !== null ? defaultArgs : false
                return parseDefault ? [value, {}] : value
            };
            case FieldTypes.Comp: {
                if(this instanceof CompField) {
                    return defaultArgs !== null ? { ...(parseDefault ? { __style: {}} : {}), ...defaultArgs } : this.__props.__default(parseDefault);
                } else {
                    const field = new CompField(this.__field as CompFieldObject);

                    return defaultArgs !== null ? { ...(parseDefault ? { __style: {}} : {}), ...defaultArgs } : field.__props.__default(parseDefault);
                }
            };
            case FieldTypes.List: {
                const value = defaultArgs !== null ? defaultArgs : []
                return parseDefault ? [value, {}] : value;
            }
            case FieldTypes.Model: {
                if(typeof (this.__args as ModelFieldArgs).multi === "number") {
                    const value = defaultArgs !== null ? defaultArgs : []
                    return parseDefault ? [value, {}] : value;
                } else  return {  ...(parseDefault ? { __style: {}} : {}), ...(defaultArgs !== null ? defaultArgs : {}) };
            }
            case FieldTypes.Number: {
                const value = defaultArgs !== null ? defaultArgs : 0;
                return parseDefault ? [value, {}] : value;
            }
            case FieldTypes.String: {
                const value = defaultArgs !== null ? defaultArgs : ""
                return parseDefault ? [value, {}] : value;
            }
        }
    }

    public __read(context: string, data: any) : Props | Field {
        const props = context.split(".");
        let currentProp = this;
        let currentData = data;

        props.forEach(prop => {
            currentProp = Props.__read(prop, currentProp);
            currentData = currentData[prop];

            if(!(currentProp instanceof Field || currentData instanceof Props))
            throw new Error(`Cannot read context : ${context}, in props.`);
        })

        return currentProp;
    }

    static __create(field: FieldObject) : Field {
        switch(field.__type) {
            case FieldTypes.Comp: return new CompField(field);
            case FieldTypes.List: return new ListField(field);
            default: return new Field(field);
        }
    }
}

export class CompField extends Field {
    public __type: FieldTypes.Comp;
    public __args: CompFieldArgs;
    public __data?: CompData;
    constructor(field: CompFieldObject) {
        super(field);

        this.__type = FieldTypes.Comp;
        this.__args = field.__args;
    }

    public get __props() : Props | Field {
        const context = window.__builder_context;
        const comp = context.wapi.comps[this.__args.comp] || context.wapi.elements[this.__args.comp];
        
        if(comp === undefined) throw new Error(`comp "${this.__args.comp}" is not exist but required in a section.`) 
        
        return comp.props;
    }
}

export class ListField extends Field {
    public __type: FieldTypes.List;
    public __args: ListFieldArgs;
    public __data?: ListData;
    constructor(field: ListFieldObject) {
        super(field);
        
        this.__type = FieldTypes.List;
        this.__args = field.__args;
    }
}