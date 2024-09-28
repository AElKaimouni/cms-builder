import { BuilderSymbol, PageNSymbolSectionObject, PageSectionObject, PageSymbolSectionObject } from "../types";
import lodash from "lodash";
import { CmsAPi } from "../../APIs";
import { AxiosError } from "axios";
import { loopObjectWithPromise } from "./fonctions";

export const loadDataModels = async (data: any) => {
    return await loopObjectWithPromise(data, async (key, value) => {
        if(key === "__ref" && typeof value === "string" && value.indexOf("Model") === 0) {
            if(!readRef(value)) await loadModel(value.replace("Model_", ""));
        }
    })
}

export const loadModel = async <Target>(ref: string) : Promise<Target | null> => {
    const page = window.__builder_page;

    try {
        const res = await CmsAPi.post(`/model`, { ref });

        page.document.models[`Model_${ref}`] = res.data;
        return res.data as Target;
    } catch(error) {
        if(error instanceof AxiosError) {
            if(error.response?.status === 404) return null;
            else throw error;
        } else throw error;
    }
}

export const readRef = <Target>(ref: string) : Target => {
    const page = window.__builder_page;
    const [target, id] = ref.split("_") as [string, string];

    switch(target) {
        case "Symbol" : return page.document.symbols[id] as Target;
        case "Model" : return page.document.models[ref] as Target;
        default: throw new Error(`Unknown ref target : ${target}`);
    };
}

export const checkSectionSymbol = (section: PageSectionObject) : Boolean => {
    if((section as PageSymbolSectionObject).__ref) {
        const symbol = readRef<BuilderSymbol>((section as PageSymbolSectionObject).__ref);
        
        return Boolean(symbol);
    }  else return true;
}

export const readSection = (section: PageSectionObject) : [PageNSymbolSectionObject, PageSymbolSectionObject | null] => {
    if((section as PageSymbolSectionObject).__ref) {
        const symbol = readRef<BuilderSymbol>((section as PageSymbolSectionObject).__ref);

        return [{...symbol, cond: section.cond}, section as PageSymbolSectionObject];
    }  else return [section as PageNSymbolSectionObject, null];
}