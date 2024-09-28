import { } from "../builder/types";
import { PageObject, PageTableInput, PageCreateInput, PageEditInput, PageFindInput, PagePublishLocaleInput, PageSlugGenerator } from "../types/pages";
import CmsAPi from "./CmsApi";

export default {
    table: async (input: PageTableInput) => {
        try {
            const res = await CmsAPi.post("/page/table", input);

            return res.data as {
                count: number,
                pages: PageObject[];
            };
        } catch (error) { throw error }
    },
    get: async (input: PageFindInput) => {
        try {
            const res = await CmsAPi.post("/page/unparsed", input);

            return res.data as PageObject;
        } catch (error) { throw error }
    },
    publish: async (input: PageFindInput) => {
        try {
            const res = await CmsAPi.post("/page/unparsed/publish", input);

            return;
        } catch (error) { throw error }
    },
    update: async (input: PageEditInput) => {
        try {
            const res = await CmsAPi.post("/page/unparsed/update", input);

            return res.data as PageObject;
        } catch (error) { throw error }
    },
    create: async (input: PageCreateInput) => {
        try {
            const res = await CmsAPi.post("/page/create", input);

            return res.data as PageObject;
        } catch (error) { throw error }
    },
    publishChanges: async (input: PageFindInput) => {
        try {
            const res = await CmsAPi.post("/page/unparsed/publishChanges", input);

            return res.data as PageObject;
        } catch (error) { throw error }
    },
    publishLocale: async (input: PagePublishLocaleInput) => {
        try {
            await CmsAPi.post("/page/publishLocale", input);

            return;
        } catch (error) { throw error }
    },
    delete: async (input: PageFindInput) => {
        try {
            await CmsAPi.post("/page/delete", input);

            return;
        } catch (error) { throw error }
    },
    generateSlug: async (input: PageSlugGenerator) : Promise<string> => {
        try {
            const res = await CmsAPi.post("/page/slug", input);

            return res.data;
        } catch (error) { throw error }
    } 
}