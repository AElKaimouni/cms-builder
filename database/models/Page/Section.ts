import mongoose from "mongoose";
import { PageSectionObject } from "../../../types";
import DataCondType from "./DataCond";
import SectionDataType from "./SectionData";

const SectionType : mongoose.SchemaDefinitionProperty<PageSectionObject> = {
    __name: { type: String },
    comp: { type: String },
    data: [SectionDataType],
    cond: DataCondType,
    __ref: { type: String }
}

export default SectionType;