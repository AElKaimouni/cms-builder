import { property } from "lodash";
import { BooleanFieldObject, BuilderComps, CompFieldObject, CompPropsObject, FieldObject, FieldTypes, ListFieldObject, ModelFieldObject, NumberFieldObject, ParsedPageDocument, StringFieldObject } from "../types"
import { readApiRef, readRef } from "./compressor";
import { AxiosInstance } from "axios";

export const validateData = async (
    data: any,
    props: FieldObject | CompPropsObject,
    comps: BuilderComps,
    elements: BuilderComps,
    models: ParsedPageDocument["models"],
    symbols: ParsedPageDocument["symbols"],
    api: AxiosInstance
) : Promise<any> => {
    const isField = typeof props.__type === "number";    

    if(isField) switch((props as FieldObject).__type) {
        case FieldTypes.Boolean: {
            const isValid = Array.isArray(data) && typeof data[0] === "boolean";
            return isValid ? data : [(props as BooleanFieldObject).__args.default || false, {}, null, ""];
        };
        case FieldTypes.Comp: {
            const compName = (props as CompFieldObject).__args.comp
            const comp = comps[compName] || elements[compName];

            if(comp) return await validateData(data, comp.props, comps, elements, models, symbols, api);

            return data;
        };
        case FieldTypes.List: {
            const isValid = Array.isArray(data) && typeof Array.isArray(data[0]);
            const validatedData = [];

            if(isValid) for(const dataItem of data[0] as any[]) {
                if((props as ListFieldObject).__args.dynamic) {
                    const compName = dataItem ? Array.isArray(dataItem) ? dataItem[2] : dataItem.__comp : null;

                    if(compName) {
                        const compProps = (props as ListFieldObject).__args.props[compName];

                        if(compProps) {
                            validatedData.push(await validateData(dataItem, compProps, comps, elements, models, symbols, api));
                            continue;
                        }

                        validatedData.push(null);

                        continue;
                    }
                    
                    validatedData.push(null);

                    continue;
                }

                validatedData.push(await validateData(dataItem, (props as ListFieldObject).__args.props, comps, elements, models, symbols, api));
            }

            return isValid ? [
                validatedData.filter(data => Boolean(data)),
                ...data.slice(1)
            ] : [(props as ListFieldObject).__args.default || [], {}, null, ""]
        };
        case FieldTypes.Model: {
            const args = (props as ModelFieldObject).__args;
            const isValid = data && !Array.isArray(data) && typeof data === "object";
            const ref = isValid ? data.__ref : undefined;
            const match = ref ? ref.replace(/(\r\n|\n|\r)/gm, "").match(/^Model_[^_]+_ *(?:{ *.* *} *)? *_(.+)$/)?.[1] : undefined;
            const expectedRef = `Model_${args.model}_${args.query}_${match}`;

            return isValid ? (ref ? { ...data,  ...(
                expectedRef === ref ? readRef(ref, models, symbols) || args.default || {} : await readApiRef(`${args.model}_${args.query}_${match}`, api)
                )} : data) : args.default || {};
        };
        case FieldTypes.Number: {
            const isValid = Array.isArray(data) && typeof data[0] === "number";
            return isValid ? data : [(props as NumberFieldObject).__args.default || 0, {}, null, ""];
        };
        case FieldTypes.String: {
            const isValid = Array.isArray(data) && typeof data[0] === "string";
            return isValid ? data : [(props as StringFieldObject).__args.default || "", {}, null, ""];
        };
        default: {
            throw new Error(`undefined data type : ${data.__type}`);
        };
    } 

    if(!data) data = {};
    for(const [name, prop] of Object.entries(props)) {
        

        if(name.indexOf("__") !== 0) {
            if(prop.__type === undefined && Array.isArray(data[name])) data[name] = {};
            data[name] = await validateData(data[name], prop, comps, elements, models, symbols, api);
        }
    }

    return data
}