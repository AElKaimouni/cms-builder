import mongoose from "mongoose";
import { DomainObject } from "../../types";
import database from "../db";
import SectionDataType from "./Page/SectionData";

export const DomainShcema = new mongoose.Schema<DomainObject>({
    name: { type: String, default: "Untitled Domain"},
    host: { type: String, required: true, unqiue: true },
    theme: [SectionDataType],
    created_at: { type: Date, default: () => new Date() },
    created_by: { type: String, ref: "user", required: true },
    updated_at: { type: Date, default: null },
    updated_by: { type: String, ref: "user", default: null },
    published: { type: Boolean, default: () => false }
});

const DomainModel = database.connection.mongoose.model<DomainObject>("domain", DomainShcema);

export default DomainModel;