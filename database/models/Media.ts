import mongoose from "mongoose";
import { Media, MediaDocument } from "../../types";
import database from "../db";

export const MediaSchema = new mongoose.Schema<MediaDocument>({
    name: { type: String, default: "" },
    type: { type: String, enum: ["image", "video", "raw"], required: true },
    url: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    size: { type: Number },
    format: { type: String },
    created_at: { type: Date, default: () => new Date() },
    public_id: String
})


const MediaModel = database.connection.mongoose.model<MediaDocument>("media", MediaSchema);

export default MediaModel;