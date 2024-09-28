import mongoose, { Model as MongoModel } from "mongoose";
import { Model, ServerErrors, ServerError, Symbol } from "../classes";
import { MediaModel, SymbolModel, UserModel } from "../database";
import { getModelPopulatePaths, parseModelID, parseQuery } from ".";
import configData from "../config/data";

export const parseModelRef = (ref: string) : { modelName, query, id } => {
    const locales = configData.locales.data.locales.map(l => l.id).join("|");
    const res = ref.match(new RegExp(`^([^_]+)_ *(?:({ *.* *}) *)? *_((?:(?:${locales})_)?.+)$`));

    if(res) {
        const [_ref, modelName, query, id] = res;

        return { modelName, query, id }
    } else return null;
}

export const readModelRef = async <Target>(ref: string) : Promise<Target> => {
    return (await readRef<Target>(`Model_${ref}`))[1];
}

export const readRef = async <Target>(ref: string) : Promise<[string, Target | null]> => {
    const [_ref, target, _id] = ref.replace(/(\r\n|\n|\r)/gm, "").match(/([^_]+)_(.*)$/) as [string, string, string];

    switch(target) {
        case "Symbol": {
            if(mongoose.isValidObjectId(_id)) {
                const symbol = await Symbol.find(_id);

                return [_id, symbol as Target];
            } else return [_id, null];
        };
        case "Model": {
            const res = parseModelRef(_id);
            if(res) {
                const { modelName, query, id } =  res;
                switch(modelName) {
                    case "media": {
                        const [projector] = query ? await parseQuery(query) : [undefined, undefined];
                        const model = await MediaModel.findById(id, projector);
            
                        return [id, model ? model.toJSON() as Target : null];
                    };
                    default: {
                        const { locale } = parseModelID(id);
                        const [model, modelObject] = await Model.getModelDB(modelName, locale);
                        const [projector, populate] = query ? await parseQuery(query, modelObject.props) : [undefined, await getModelPopulatePaths(modelObject)];
                        const document = await model.findById(id, projector).populate(populate);
            
                        return [id, document ? document.toJSON() as Target : null];
                    };
                }
            } else throw new ServerError(`Unvalid ref : ${ _id }`, ServerErrors.UNVALID_REF);
        };
        default : throw new ServerError(`Unkown ref target : ${target}`, ServerErrors.UNKNWON_REF_TARGET);
    }
}