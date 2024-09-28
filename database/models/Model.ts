import mongoose from "mongoose";
import { ModelObject } from "../../types";
import database from "../db";

export const ModelSchema = new mongoose.Schema<ModelObject>({
    name: { type: String, unique: true, required: true },
    primary: { type: String, required: true },
    props: { type: Object, default: {} },
    i18n: { type: Boolean, default: false },
    draft: { type: Boolean, default: false },
    preview: {
        input: { type: Object, default: {} },
        table: { type: String },
        query: { type: String },
    },
    pages: { required: false, type: {
        link: { type: String, required: true },
        domain: { type: String, ref: "domain", required: true },
        template: String
    } }
}, { minimize: false });

const ModelModel = database.connection.mongoose.model<ModelObject>("model", ModelSchema);

export default ModelModel;