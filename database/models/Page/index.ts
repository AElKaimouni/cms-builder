import mongoose from "mongoose";
import database from "../../db";
import { PageObject } from "../../../types";
import localeType, { defaultLocale } from "./Locale";
import TargetsType from "./Targets";
import VersionType, { defaultVersion } from "./Version";
import { slugify } from "../../../utils";


const PageSchema = new mongoose.Schema<PageObject>({
    name: { type: String, default: "Untitled Page" },
    link: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    published: { type: Boolean, default: false },
    domain: { type: String, required: true, ref: "domain" },
    slug: { type: String, unique: true },
    targets: TargetsType,
    locales: { type: [localeType], default: [defaultLocale] } as any,
    versions: { type: [VersionType], default: [defaultVersion] } as any,
    models: { type: Map, of: {type: [String], ref: "symbol" , default: []}, default: {},  },
    symbols: { type: Map, of: {type: [String] , default: []}, default: {} },
    model: { type: String, ref: "model" },
    created_at: { type: Date, default: () => new Date() },
    created_by: { type: String, ref: "user", default: null },
    updated_at: { type: Date, default: null },
    updated_by: { type: String, ref: "user", default: null },
}, { minimize: false });

PageSchema.pre("save", async function (next) {

  this["slug"] ||= await slugify(this["name"]);

  next();

});

const PageModel = database.connection.mongoose.model<PageObject>("page", PageSchema);

export default PageModel;