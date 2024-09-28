import mongoose from "mongoose";
import { PageMetaObject } from "../../../types";

const MetaType : mongoose.SchemaDefinitionProperty<PageMetaObject> = {
    title: { type: String, default: "Untitled Page" },
    description: { type: String, default: "" }
}

export default MetaType;