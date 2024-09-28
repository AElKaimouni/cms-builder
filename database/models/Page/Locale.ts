import mongoose from "mongoose";
import { PageLocaleObject } from "../../../types";
import MetaType from "./Meta";
import SectionType from "./Section";
import SectionDataType from "./SectionData";
import configData from "../../../config/data/index";

const localeType : mongoose.SchemaDefinitionProperty<PageLocaleObject> = {
    locale: { type: String, default: configData.locales.data.defaultLocale },
    info: [SectionDataType],
    meta: MetaType,
    sections: { type: [SectionType], default: [] }
}

export const defaultLocale = {
    default: true
};

export default localeType;