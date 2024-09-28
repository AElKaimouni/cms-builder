import mongoose, { FilterQuery } from "mongoose";
import { DomainModel, ModelModel } from "../database";
import { ModelCreateInput, ModelDocument, ModelObject, ModelPropsObject } from "../types";
import { modelToDB, validateCollection, validateModelPages } from "../utils";
import { ServerError, ServerErrors } from "./Errors";
import customModels from "../config/models.custom.config";
import configData from "../config/data";
import Domain from "./Domain";

const dbModels : { [key: string] : ReturnType<typeof modelToDB> } = {};

export default class Model {
    document: ModelDocument;

    constructor(document: ModelDocument) {
        this.document = document;
    };

    public get json() {
        return this.document.toJSON();
    };

    public dbModel(locale: string = configData.locales.data.defaultLocale) {
        const model = (dbModels[this.document.name] ||= modelToDB(this.document))[locale];

        if(!model) throw new ServerError(`Locale : ${locale} is not defined.`, ServerErrors.UNDEFINED_LOCALE);
        
        return model as mongoose.Model<any, {}, {}, {}, any>;
    };

    public get dbModles() {
        const models = (dbModels[this.document.name] ||= modelToDB(this.document));

        return models;
    }

    public async edit(data: ModelObject) :Promise<Model> {
        const Models = dbModels[this.document.name] = modelToDB(data);

        if(data.pages) {
            const domain = (await DomainModel.findOne({ name: data.pages.domain }));

            if(!domain) throw new Error(`There in no domain with name : ${data.pages.domain}`);

            data.pages.domain = domain._id.toString()
        }

        await this.document.updateOne({ ...data , ...(data.pages ? {} : { $unset: { pages: 1 } })});
        await validateCollection(data.props, this.document.props, Models);
        await validateModelPages(data.pages, this.document.pages, Models, this);

        return this;
    };

    static async all() : Promise<Model[]> {
        const documents = await ModelModel.find({});

        return documents.map(doc => new Model(doc));
    };

    static async find(filter: FilterQuery<ModelObject>) : Promise<Model | null> {
        const document = await ModelModel.findOne(filter);

        if(!document) return null;
        
        return new Model(document);
    };

    static async modelByName(name: string) : Promise<ModelObject> {
        const CModels = customModels();
        if(CModels[name]) return CModels[name];
        const document = await ModelModel.findOne({ name });
        
        if(document) return document.toJSON() as ModelObject;
        
        return null;
    }

    static async create(input: ModelCreateInput) : Promise<Model> {
        const document = await (new ModelModel({
            name: input.name,
            props: input.props,
            preview: input.preview,
            primary: input.primary
        })).save();

        return new Model(document);
    };

    static async getModelDB(modelName: string, locale?: string) : Promise<[mongoose.Model<unknown, {}, {}, {}, any>, ModelObject]> {
        const CModels = customModels();
        if(CModels[modelName]) return [CModels[modelName].model, CModels[modelName]];
        
        const document = await ModelModel.findOne({ name: modelName });
        const model = (new Model(document));

        if(document) return [model.dbModel(locale), document];
        else throw new ServerError(
            `cannot get model db cuz there is no model with name : ${modelName}`,
            ServerErrors.MODEL_IS_NOT_EXIST
        );
    };

    static async registerSchemas() {
        console.log("Start registering models schemas...");
        
        const models = await this.all();

        for(const model of models) await model.dbModel();

        console.log("registering models schemas done successfuly.");

        return;
    }

    static async reregisterSchemas() {
        const models = await this.all();

        for(const model of models) dbModels[model.document.name] = modelToDB(model.document);

        return;
    }
}