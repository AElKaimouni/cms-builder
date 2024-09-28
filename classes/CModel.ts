import { Model, Page, ServerError, ServerErrors } from ".";
import mongoose from "mongoose";
import { ModelDeleteInput, ModelInstanceBaseObject, ModelModelUnqiueInput, ModelNewInput, ModelObject, ModelTableInput, User, UserDocument } from "../types";
import { getModelPopulatePaths, localeeModelID, parseModelID, parseQuery } from "../utils";
import configData from "../config/data";
import { PageModel } from "../database";
export default class CModel {
    public document: mongoose.Document<any, any, ModelInstanceBaseObject & any> & ModelInstanceBaseObject & any;
    public _model?: Model;

    constructor(document: CModel["document"]) {
        this.document = document;
    }

    public get locale() {
        return this.document._id.split("_")[0];
    }

    public get json() {
        return this.document.toJSON();
    }

    public async model() {
        if(this._model) return this._model;

        const match = this.document.collection.name.match(/[^_]*\_(.*)/);
        return this._model = await Model.find({ name: match[1] });
    }

    public async populate(query?: string) : Promise<CModel> {
        const model = await this.model();
        const query2 = query || model.document.preview.query;
        const [prejector, populatingPaths] = query2 ? await parseQuery(query2, model.document.props) : [{}, await getModelPopulatePaths(model.json)];
        
        await this.document.populate(populatingPaths);

        return this;
    }

    public async update(data: any, user?: UserDocument) {
        await this.document.updateOne(user ? {
            ...data,
            updated_at: new Date(),
            updated_by: user._id
        } : data);

        const model = await this.model();
        const { locale } = parseModelID(this.document.id);

        this.document = await model.dbModel(locale).findById(this.document.id);

        return this;
    }

    public async sibling(locale: string) : Promise<CModel | null> {
        const modelName = (await this.model()).document.name;
        const model = await CModel.find(modelName, localeeModelID(this.document._id.toString(), locale), undefined);

        return model;
    }

    public async publishChanges(user: UserDocument) {
        await this.update({ uiPublished: true }, user);

        return this;
    }

    public async delete() {
        await this.document.delete();

        if(this.document.page) {
            const page = await Page.find({ _id: this.document.page });
            if(page) page.deleteLocale(this.locale);
        }

        Page.updateModel(this.document._id);
        
        return;
    }

    static async find(modelName: string, ID: string, query?: string) : Promise<CModel | null> {
        const { locale } = parseModelID(ID);
        const [model, modelObject] = await Model.getModelDB(modelName, locale);
        const [projector, populate] = query ? await parseQuery(query, modelObject.props) : [undefined, undefined];
        const document = await model.findById(ID, projector).populate(populate as any || []);

        if(!document) return null;

        return new CModel(document as CModel["document"]);
    }

    static async table(input: ModelTableInput) : Promise<{ count: number, models: any[] }> {
        const [model, { preview, props }] = await Model.getModelDB(input.model, input.locale);
        const [projector, populate] = preview.table ? await parseQuery(input.query || preview.table, props) : [undefined, undefined];
        const filters =  {
            ...(input.search && preview.input.name ? {[preview.input.name] : { $regex: new RegExp(`.*${input.search}.*`) }} : {}),
            ...input.filters
        };
        const count = await model.count(filters);
        const models = await model.find(filters, projector ? {...projector, published: true} : undefined).sort((() => {if(input.sort) switch(input.sort) {
            case "NEWEST": return { created_at: -1 };
            case "OLDEST": return { created_at: 1 };
            default: return  input.sort
        } else return { created_at: -1 }})()).skip(input.skip).limit(input.max).populate(populate);

        return { count, models: models };
    };

    static async create(modelName: string, input: any, user?: UserDocument, locale?: string) : Promise<CModel> {
        locale ||= input._id ? parseModelID(input._id).locale : undefined;
        const [model] = await Model.getModelDB(modelName, locale);
        const document = await (new model({
            ...input,
            created_by: user?._id,
        })).save();


        return new CModel(document as CModel["document"]);
    }

    static async delete(input: ModelDeleteInput) : Promise<void> {
        const [model] = await Model.getModelDB(input.name, input.locale);

        await model.deleteOne({ _id: input.id });

        return;
    }

    static async unique(input: ModelModelUnqiueInput) : Promise<boolean> {
        const [model] = await Model.getModelDB(input.model, input.locale);
        const res = await model.findOne({ [input.field] : input.value, _id: { $ne: input.id } });

        return !Boolean(res);
    }
}