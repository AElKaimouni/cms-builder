import mongoose from "mongoose";
import { PageVersionObject } from "../../../types";
import localeType, { defaultLocale } from "./Locale";

const VersionType : mongoose.SchemaDefinitionProperty<PageVersionObject> = {
    name: { type: String, default: "Untitled Version" },
    locales: { type: [localeType], default: [defaultLocale] }
}

export const defaultVersion = {
    name: "main"
}

export default VersionType;