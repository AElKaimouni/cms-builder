import database, { ModelModel, PageModel } from "../database";
import { ModelCreateInput, UserDocument } from "../types";
import mongoose, { SchemaDefinition, SchemaDefinitionType } from "mongoose";
import { FieldObject, ModelObject, ModelPropsObject, FieldTypes, ListFieldObject, ModelFieldObject } from "../types";
import { Model, Page, ServerError, ServerErrors } from "../classes";
import configData from "../config/data";
import customModels from "../config/models.custom.config";
import { ObjectId } from "mongodb";
import { slugify } from "../utils";

export const modelBaseProps  = (model: ModelObject, locale: string) => ({
    _id: { type: String, default: () => `${locale}_` + new ObjectId().toHexString() },
    created_at: { type: Date, default: () => new Date() },
    created_by: { type: String, ref: "user" },
    updated_at: { type: Date, default: null },
    updated_by: { type: String, ref: "user", default: null },
    published: { type: Boolean, default: false },
    uiPublished: { type: Boolean, default: true },
    ...(model.pages ? {
        page: { type: String, ref: "page", required: true }
    } : {})
}) as SchemaDefinition;


export const propsToDefinition = <Type = any>(props: ModelPropsObject["key"], locale: string, baseProps : ReturnType<typeof modelBaseProps> = {}) : SchemaDefinition<SchemaDefinitionType<any>> | Type => {

    if(typeof props.__type === "string") {
        const field = props as FieldObject;

        switch(field.__type) {
            case FieldTypes.String: return {
                type: field.__args.type === "date" ? Date : String,
                ...(field.__args.default ? {
                    default: field.__args.type === "date" ? new Date(field.__args.default) : field.__args.default
                } : {})
            };
            case FieldTypes.Number: return {
                type: Number,
                ...(typeof field.__args.default === "number" ? {
                    default: field.__args.default.toString()
                } : {})
            };
            case FieldTypes.Boolean: return {
                type: Boolean,
                default: Boolean(field.__args.default).toString()
            };
            case FieldTypes.Model: return {
                type: field.__args.multi ? [String] : String,
                ref: Object.keys(customModels()).includes(field.__args.model) ? field.__args.model : `${locale}_${field.__args.model}`,
                ...(field.__args.multi ? {
                    default: []
                } : {})
            };
            case FieldTypes.List: return {
                type: [propsToDefinition(field.__args.props, locale)],
                default: field.__args.default || []
            };
            default: throw new Error(`undefined data type: ${(field as FieldObject).__type}`);
        }
    }

    const difention : SchemaDefinition<SchemaDefinitionType<any>> | Type = {};

    for(const prop in props) difention[prop] = propsToDefinition(props[prop], locale);

    return {...difention, ...baseProps};
}

export const modelToDB = <Type = any>(model: ModelObject) =>  {
    const res : { [locale: string] : mongoose.Model<Type, {}, {}, {}, any> } = {};

    for(const { id } of configData.locales.data.locales) {
        const name = `${id}_${model.name}`;
        const schema = new mongoose.Schema(propsToDefinition(model.props, id, modelBaseProps(model, id)), { collection: name });

        if(database.connection.mongoose.models[name]) database.connection.mongoose.deleteModel(name);
        res[id] = database.connection.mongoose.model<Type>(name, schema);
    }
    
    return res;
}

export const getPropsDefault = (props: ModelPropsObject["key"]) => {
    if(typeof props.__type === "string") {
        return (props as FieldObject).__args.default || (() => {
            switch(props.__type) {
                case FieldTypes.Boolean: return false;
                case FieldTypes.List: return [];
                case FieldTypes.Model: return null;
                case FieldTypes.Number: return 0;
                case FieldTypes.String: return "";

                default: return null;
            }
        })();
    } else {
        const result = {};

        for(const propName in props) {
            result[propName] = getPropsDefault(props[propName]);
        }

        return result;
    }
}

export const validateSchemas = (newProps: ModelPropsObject["key"], oldProps: ModelPropsObject["key"]) => {
    const newIsField = typeof newProps.__type === "string";
    const oldIsField = typeof oldProps.__type === "string";

    if(newIsField === oldIsField) {
        if(newIsField) {
            const newField = newProps as FieldObject;
            const oldField = oldProps as FieldObject;

            if(newField.__type === oldField.__type) {
                switch(newField.__type) {
                    case FieldTypes.List: {
                        const field = oldField as typeof newField;
                        const res = validateSchemas(newField.__args.props, field.__args.props);

                        if(res !== undefined) return [];
                    }; break;
                    case FieldTypes.Model: {
                        const field = oldField as typeof newField;

                        if(
                            newField.__args.model !== field.__args.model ||
                            newField.__args.multi !== field.__args.multi 
                        ) return newField.__args.multi ? [] : newField.__args.default || null;
                    }; break;
                    case FieldTypes.String: {
                        const field = oldField as typeof newField;
                        const critcalTypes = ["date"];
                        
                        if(
                            newField.__args.type !== field.__args.type &&
                            (critcalTypes.includes(newField.__args.type) || critcalTypes.includes(field.__args.type))
                        ) return newField.__args.default || null;
                    }; break;
                }
            } else return newField.__args.default || null; 
        } else {
            const result = {};

            for(const propName in oldProps) {
                const newProp = newProps[propName];

                if(newProp === undefined) result[propName] = undefined;
            }

            for(const propName in newProps) {
                const oldProp = oldProps[propName];
                const newProp = newProps[propName];


                if(oldProp === undefined) {
                    result[propName] = getPropsDefault(newProp);
                }
                else {

                    const res = validateSchemas(newProp, oldProp);
                    
                    if(res !== undefined) {
                        const fieldToProps = typeof oldProp.__type === "string" && typeof newProp.__type !== "string";

                        result[propName] = !fieldToProps ? res :  { __$unset: true, ...res};
                    }
                }
            }

            return result;
        }
    } else return getPropsDefault(newProps);
}

export const expandDiffObject = (diff: Object, object: any = { $unset: {}, $set: {} }, context: string = "") => {
    for(const propName in diff) {
        const prop = diff[propName];
        const propContext = (context ? context + "." : "") + propName;

        if(typeof prop === "object" && prop !== null) {
            if(prop["__$unset"]) {
                delete prop["__$unset"];
                object["$set"][propContext] = prop;
                continue;
            }
            expandDiffObject(prop, object, propContext);
        } else if(prop === undefined) object["$unset"][propContext] = "";
        else object["$set"][propContext] = prop;
    }

    return object;
};

export const validateCollection = async (
    newProps: ModelPropsObject,
    oldProps: ModelPropsObject,
    Models: ReturnType<typeof modelToDB>
) => {
    const diff = validateSchemas(newProps, oldProps);
    const expandedDiff = expandDiffObject(diff);

    for(const Model of Object.values(Models)) 
        await Model.updateMany({}, expandedDiff);

    return;
}

export const validateModelPages = async (
    newProps: ModelObject["pages"],
    oldProps: ModelObject["pages"],
    Models: ReturnType<typeof modelToDB<any>>,
    model: Model
) => {
    if(newProps && !oldProps) {
        const pages: { [key: string] : Page } = {};
        
        for(const Model of Object.values(Models)) {
            const cmodels = await  Model.find({}, { [model.document.primary] : 1, created_by: 1 });
            
            for(const cmodel of cmodels) {
                const { locale, id } = parseModelID(cmodel._id.toString());
                const name = cmodel[model.document.primary];
                const slug = await slugify(name);

                const page = pages[id] || await Page.create({
                    slug, name,
                    domain: newProps.domain,
                    link: `${newProps.link}/${slug}`,
                    targets: {
                        locales: model.document.i18n
                    },
                    model: model.document._id.toString(),
                }, { _id: cmodel.created_by } as UserDocument, [{locale}], () => ({ meta: { title: name } }));

                if(pages[id]) await page.addLocale(locale, { meta: { title: name } });
                else pages[id] = page;

                await cmodel.updateOne({ page: page.document._id.toString() })
            }
        }


    } else if (!newProps && oldProps) {

        await PageModel.deleteMany({ model: model.document._id.toString() });
        
        if(model.document.i18n) for(const Model of Object.values(Models)) {

            await Model.updateMany({}, { $unset: { page: "" } });
        } else {
            const Model = await model.dbModel();

            await Model.updateMany({}, { $unset: { page: "" } });
        }
        
    } else if(newProps && oldProps && (newProps.domain !== oldProps.domain || newProps.link !== oldProps.link)) {
        const pages = await PageModel.find({ model: model.document._id.toString() });

        for(const page of pages) {
            await page.updateOne({
                ...(newProps.link !== oldProps.link ? {
                    link: `${newProps.link}/${page.slug}`,
                    url: `${page.domain}:${newProps.link}/${page.slug}`
                } : {}),
                ...(newProps.domain !== oldProps.domain ? {
                    domain: newProps.domain,
                    url: `${newProps.domain}:${page.link}`
                } : {}),
                ...(newProps.link !== oldProps.link && newProps.domain !== oldProps.domain ? {
                    url: `${newProps.domain}:${newProps.link}/${page.slug}`
                } : {})
            });
        }
    }
}

export const loopModelProps = async (
    props: ModelPropsObject,
    callBack: (prop: FieldObject, name: string, path: string) => Promise<void>,
    context?: string
) => {

    for(const [key, prop] of Object.entries(props)) {
        const isField = typeof prop.__type === "string";
        const newContext = context ? `${context}.${key}` : key

        if(isField) {
            await callBack(prop as FieldObject, key, newContext);
            if(prop.__type === FieldTypes.List) {
                const field = prop.__args.props;
                const isField = typeof field.__type === "string";

                if(isField) await callBack(field as FieldObject, key, newContext);
                else await loopModelProps(field as ModelPropsObject, callBack, newContext);
            }
        } else await loopModelProps(prop as ModelPropsObject, callBack, newContext);
    }
};

export const getModelPopulatePaths = async (model: ModelObject, projector?: any) : Promise<any[]> => {
    const paths : any[] = [
        {
            path: "created_by",
            select: "name"
        },
        {
            path: "updated_by",
            select: "name"
        },
        ...(model.pages ? [{
            path: "page"
        }] : [])
    ];

    await loopModelProps(model.props, async (prop, name, path) => {
        if(prop.__type === FieldTypes.Model) {
            const model = await Model.find({ name: prop.__args.model });
            
            if(projector) {
                if(projector[path]) {
                    paths.push({path, ...(typeof projector[path] !== "boolean" ? { select: projector[path] } : {}) });
                    delete projector[path];
                }
            } else {
                paths.push(path);
                if(model && model.document.preview.input.image) paths.push({
                    path: path,
                    populate: {
                        path: model.document.preview.input.image
                    }
                });
            }
        }
    });

    return paths;
}

export const matchQuery = (query: string) => {
    let items = [];
    let item = "";
    let sub = false;
    let count = 0;

    for(let i = 0; i < query.length; i++) {
        const lettre = query[i];
        if (lettre === " ") {
            if(item && !sub) {
                items.push([item]);
                item = "";
            } else if(sub) item += lettre;
        } else if(lettre === "{") {
            if(item !== "" && !sub) {
                items.push([item]);
                item = "";
            }
            if(items.length) {
                if(sub) {
                    item += lettre;
                } else {
                    sub = true;
                }
                
                count++;
            }
        } else  if (lettre === "}") {
            if(sub) {
                count--;
                if(count === 0) {
                    sub = false;
                    items[items.length - 1].push(item);
                    item = "";
                } else {
                    item += lettre;
                }
            }
        } else {
            item += lettre;
        }

        if(i === query.length - 1 && item) items.push([item]);
    }

    return items;
}

export const parseQuery = async (query: string, props?: ModelPropsObject, context?: string, res = {}, populate: any = []) => {
    try {
        const matchAll = matchQuery(query);
    
        for(const match of matchAll) {
            const [prop, sub] = match;
            const key = context ? `${context}.${prop}` : prop;

            if(props && props[prop] && props[prop].__type === FieldTypes.Model) {
                const modelName = (props[prop] as ModelFieldObject).__args.model;
                const ModelObject = await Model.modelByName(modelName);

                if(!ModelObject) throw new ServerError(`query contain undefined Model : ${modelName}`, ServerErrors.MODEL_IS_NOT_EXIST);

                const [select, populate2] = sub ? await parseQuery(sub, ModelObject.props) :
                    [undefined, ModelObject.props ? await getModelPopulatePaths(ModelObject) : undefined];

                populate.push({
                    path: key,
                    select,
                    populate: populate2
                })
            } else if(sub) {
                if(props && props[prop]) {
                    if(typeof props[prop].__type !== "string") {
                        await parseQuery(sub, props[prop] as ModelPropsObject, key, res, populate); 

                    } else if (props[prop].__type === FieldTypes.List) {
                        const listProps = (props[prop] as ListFieldObject).__args.props;
                        if(listProps && listProps.__type !== "string") {
                            await parseQuery(sub, listProps as ModelPropsObject, key, res, populate);
                        }
                    }
                } else if(["page"].includes(prop)) { // custom props in models
                    populate.push({
                        path: prop,
                        select: sub
                    })
                }
            } else res[key] = 1;
    
        }
    
        return [res, populate];
    } catch(err) {
        console.error(err);
        throw new ServerError(`Unvalid query : ${query} on object.`, ServerErrors.UNVALID_QUERY_OBJECT)
    }
}

export const clearModels = async () => {
    const models = await Model.all();
    
    for(const model of models) {
        try {
            await model.dbModel().collection.drop()

        } catch (err) {
            if (err.message !== 'ns not found') {
                throw err;
            }
        }
    }

    await ModelModel.collection.drop();

    return;
}

export const createModels = async (inputs: ModelCreateInput[]) => {
    const result : { res: any[], errors: any[] } = { res: [], errors: [] };

    for(const input of inputs) {
        try {
            const model = await Model.create(input);

            await model.edit(input);
    
            result.res.push(model.json)
        } catch(error) {
            if(error.code === 11000) {
                if(input.edit) {
                    const model = await Model.find({ name: input.name });
    
                    if(!model) throw new Error(`undefined model that must be defined`);
                    
                    try {

                        result.res.push((await model.edit(input)).json)                        
                    } catch(error) {
                        if(error.code === 11000) result.errors.push({ code: 409, model: input.name }); else {
                            throw error;
                        }
                    }
                } else result.errors.push({ code: 409, model: input.name });
            } else {
                throw error;
            }
    
        }
    }

    return result;
}

export const parseModelID = (ID: string) => {
    const [locale, id] = ID.split("_");

    return { locale, id }
}

export const localeeModelID = (ID: string, locale: string) => {
    return ID.replace(/^[^_]*/, locale);
}