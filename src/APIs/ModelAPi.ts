import { AxiosError } from "axios";
import { ModelDataObject, ModelDeleteInput, ModelLocaleSiblingInput, ModelModelUnqiueInput, ModelNewInput, ModelObject, ModelPublishInput, ModelUpdateInput } from "../types/models";
import { parseModelPreveiwQuery } from "../utils";
import CmsAPi from "./CmsApi";

let models : ModelObject[] | null = null;

export default {
    fetchModels: async () : Promise<ModelObject[]> => {
        if(models) return models;
        try {
            const res = await CmsAPi.get("/model/all");

            return models = res.data.map(model => ({
                ...model,
                preview: { ...model.preview, table: model.preview.table ? parseModelPreveiwQuery(model.preview.table) : [] }
            }));
        } catch (error) {
            throw error;
        }
    },
    table: async (info : {
        model: string,
        skip: number,
        max: number,
        sort?: string,
        query?: string,
        search?: string,
        locale?: string
    }) : Promise<{ models: ModelDataObject[], count: number }> => {
        try {
            const res = await CmsAPi.post("/model/table", info);

            return res.data;
        } catch (error) {
            throw error;
        }
    },
    new: async (info: ModelNewInput) : Promise<Object & any> => {
        try {
            const res = await CmsAPi.post("/model/new", info);

            return res.data as ModelDataObject;
        } catch(error) { throw error }
    },
    update: async (info: ModelUpdateInput) : Promise<ModelDataObject> => {
        try {
            const res = await CmsAPi.post("/model/update", info);

            return res.data as ModelDataObject;
        } catch(error) { throw error }
    },
    ref: async (model: string, id: string, query?: string) : Promise<any | null> => {
        try {
            const res = await CmsAPi.post("/model", { ref: `${model}_${query || ""}_${id}` });

            return res.data as ModelDataObject;
        } catch(error) { throw error }
    },
    delete: async (info: ModelDeleteInput) => {
        try {
            await CmsAPi.post("/model/delete", info);

            return;
        } catch(error) { throw error }
    },
    publish: async (info: ModelPublishInput) => {
        try {
            await CmsAPi.post("/model/publish", info);

            return;
        } catch(error) { throw error }
    },
    publishChanges: async (info: ModelPublishInput) => {
        try {
            await CmsAPi.post("/model/publishChanges", info);

            return;
        } catch(error) { throw error }
    },
    sibling: async (info: ModelLocaleSiblingInput) => {
        try {
            const res = await CmsAPi.post("/model/sibling", info);

            return res.data as ModelDataObject;
        } catch(error) {
            if(error instanceof AxiosError && error.response?.status === 404)
                return null;

            throw error;
        }
    },
    unique: async (info: ModelModelUnqiueInput, signal?: AbortController) => {
        try {
            const res = await CmsAPi.post("/model/unique", info, {
                signal: signal?.signal
            });

            return res.data as boolean;
        } catch(error) { throw error }
    }
}