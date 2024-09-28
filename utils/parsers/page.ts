import { PageObject, ParsedPageObject } from "../../types";
import { readRef } from "../references";

export const loopObject = (obj, callback: (key: string, value: any) => void) => {
    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === "object") {
            loopObject(value, callback);
        } else {
            callback(key, value);
        }
    }    
}
