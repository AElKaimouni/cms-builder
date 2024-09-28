import { DomainInput, DomainPublishInput, DomainUpdateInput } from "../builder/types";
import { Domain } from "../types/domain";
import CmsAPi from "./CmsApi"

export default {
    fetchAll : async () => {
        try {
            const res = await  CmsAPi.get("/domain/all");

            return res.data as Domain[];
        } catch(error) { throw error }
    },
    get : async (id: string) => {
        try {
            const res = await CmsAPi.post("/domain", { id });

            return res.data as Domain;
        } catch (error) { throw error }
    },
    create: async (domain: DomainInput) => {
        try {
            const res = await CmsAPi.post("/domain/create", domain);

            return res.data as Domain;
        } catch (error) { throw error }
    },
    update: async (domain: DomainUpdateInput["domain"], id: string) => {
        try {
            const res = await CmsAPi.post("/domain/update", { domain, id });

            return res.data as Domain;
        } catch (error) { throw error }
    },
    publish: async (id: string) => {
        try {
            await CmsAPi.post("/domain/publish", { id });

            return;
        } catch (error) { throw error }
    }
}