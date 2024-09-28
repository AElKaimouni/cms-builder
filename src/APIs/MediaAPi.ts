import { AxiosError } from "axios";
import { UrlFile } from "../builder/types";
import CmsAPi from "./CmsApi";

export default {
    get: async (page = 0, fields = "url", count = 20, sort = 0, filters = "") => {
        try {
            const res = await CmsAPi.post("/graphql", { query: `
                query {
                    medias(
                        order: ${sort === 0 ? "NEWEST" : "OLDEST"}                     
                        max: ${count}
                        skip: ${page * count}
                        ${filters}
                    ) { ${fields} }
                    mediaLength${Boolean(filters) ? `(${filters})` : ""}
                }
            ` });
    
            return {
                media: res.data.data.medias,
                count: res.data.data.mediaLength
            };
        } catch (error) { throw error }
    },
    upload: async (files: File[], urlFiles: UrlFile[]) : Promise<{status: boolean, error?: string}> => {
        const fromData = new FormData();
    
        for(let file of files) { fromData.append("media", file) };
    
        fromData.append("urls", JSON.stringify(urlFiles));
    
        try {
            await CmsAPi.post(`/media/upload`, fromData);
    
            return { status: true };
        } catch (error) {
            if(error instanceof AxiosError) {
                if (error.response && error.response.status === 400) {
                    return { status: false, error: "There is no images to upload" }
                } else return { status: false };
            } else throw error;
        }
    },
    delete: async (ids: string[]) : Promise<{status: boolean, error?: string}> => {
        try {
            await CmsAPi.post(`/media/delete`, { ids });
    
            return { status: true };
        } catch(error) {
            if(error instanceof AxiosError) {
                return { status: false };
            } else throw error;
        }
    }
}