import mongoose from "mongoose";
import { PageDataCondObject } from "../../../types";

const DataCondType : mongoose.SchemaDefinitionProperty<PageDataCondObject> = {
    media: { type: [String], default: [] }
}

export default DataCondType;