import { Document, Types } from "mongoose";
import { ModelPropsObject } from "./Field";
import { DomainDocument, DomainObject } from "./Domain";
import { PageSectionObject } from "./Page";

export interface ModelInstanceBaseObject {
    published: boolean;
    locales: {[locale: string] : string};
    page?: string
}
export interface ModelObject {
    name: string;
    primary: string;
    props: ModelPropsObject;
    i18n?: boolean;
    draft: boolean;
    preview: {
        input: {
            name: string;
            image?: string;
        },
        table: string;
        query?: string;
    };
    pages?: {
        link: string;
        domain: string;
        template?: string;
    }
}

export type ModelDocument = Document<Types.ObjectId, any, ModelObject> & ModelObject & {
    _id: Types.ObjectId;
}

export interface ModelGetInput {
    ref: string;
}

export interface ModelCreateInput extends ModelObject {
    edit?: boolean;
}

export interface ModelNewInput {
    name: ModelObject["name"];
    data: Object;
    locale?: string;
    id: string;
}

export interface ModelUpdateInput {
    name: ModelObject["name"];
    data: Object;
    locale?: string;
    id: string;
}
export interface ModelDeleteInput {
    name: ModelObject["name"];
    locale?: string;
    id: string;
}

export interface ModelTableInput {
    model: ModelObject["name"];
    skip: number;
    max: number;
    sort: "NEWEST" | "OLDEST";
    query: string;
    search?: string;
    locale?: string;
    filters?: any;
}

export interface ModelPublishInput {
    model: ModelObject["name"];
    locale?: string;
    id: string;
}

export interface ModelLocaleSiblingInput {
    model: ModelObject["name"];
    locale: string;
    id: string;
}

export interface ModelModelUnqiueInput {
    model: string;
    locale?: string;
    value: string;
    field: string;
    id?: string;
}