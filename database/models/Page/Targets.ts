import mongoose from "mongoose";
import { PageTargetsObject } from "../../../types";

const TargetsType : mongoose.SchemaDefinitionProperty<PageTargetsObject> = {
    locales: { type: Boolean, default: false }
}

export default TargetsType;