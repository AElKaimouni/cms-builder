import { AxiosInstance } from "axios";
import { BuilderProps } from "../builder";
import { ParsedPageDocument } from "../types";

export const readRef = (ref: string, models: ParsedPageDocument["models"], symbols: ParsedPageDocument["symbols"]) => {
    const [target, id] = ref.split("_") as [string, string];

    switch(target) {
        case "Symbol" : return symbols[id];
        case "Model" : return models[ref];
        default: throw new Error(`Unknown ref target : ${target}`);
    };
}

export const readApiRef = async (ref: string, api: AxiosInstance) => {
    const res = await api.post("/model", { ref });


    return res.data;
}

export const decompressData = (data : any, models: ParsedPageDocument["models"], symbols: ParsedPageDocument["symbols"]) : any => {
    const ref = data["__ref"];
    

    if(typeof ref === "string") {
        data = { ...data,  ...readRef(ref, models, symbols)};
    } else for(const key in data) {
        if(data[key] && typeof data[key] === "object") {
            data[key] = decompressData(data[key], models, symbols);
        }
    }

    return data;
}