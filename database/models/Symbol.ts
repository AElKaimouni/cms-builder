import mongoose from "mongoose";
import { SymbolObject, SymbolDocument } from "../../types";
import database from "../db";

export const SymbolSchema = new mongoose.Schema<SymbolObject>({
    __name: { type: String, default: "Untitled Symbol" },
    comp: { type: String, required: true },
    data: Object,
    type: { type: String, enum: ["Section", "Comp"], required: true },
    domain: { type: String, ref: "domain", required: true },
    models: { type: [String], default:[] },
    locale: { type: String, required: true }
}, { minimize: false })

const SymbolModel = database.connection.mongoose.model<SymbolDocument>("symbol", SymbolSchema);

export default SymbolModel;