import mongoose from "mongoose";
import { PageSectionDataObject } from "../../../types";
import DataCondType from "./DataCond";

const SectionDataType : mongoose.SchemaDefinitionProperty<PageSectionDataObject> = {
    cond: DataCondType,
    data: Object
}

export default SectionDataType;