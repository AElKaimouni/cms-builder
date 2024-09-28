import mongoose from "mongoose";
import { User } from "../../types/User";
import database from "../db";

export const UserSchema = new mongoose.Schema<User>({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    first_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    perms: {
        models: { type: Object, default: {} }
    },
    avatar: { type: String, ref: "media" },
    role: { type: Number, enum: [0, 1, 2, 3], default: 3 },
    created_at: { type: Date, default: () => new Date() },
    verified_at: { type: Date }
}, { minimize: false })

const UserModel = database.connection.mongoose.model<User>("user", UserSchema);

export default UserModel;