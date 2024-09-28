import { Document, Types } from "mongoose";
import { ModelPropsObject } from "./fields";
import { User } from "./users";
import { PageObject } from "./pages";


export interface ModelDataObject {
    [prop: string] : any;
    _id: string;
    created_at: Date;
    created_by: User;
    updated_at?: Date;
    updated_by?: User;
    published: boolean;
    uiPublished: boolean;
    page: PageObject;
}
export interface ModelObject {
    name: string;
    primary: string;
    props: ModelPropsObject;
    i18n?: boolean;
    preview: {
        input: {
            name: string;
            image?: string;
        },
        table: {name: string, prop: string}[];
    };
    pages?: {
        link: string;
        domain: string;
    };
    _id: string;
}

export type ModelDocument = Document<Types.ObjectId, any, ModelObject> & ModelObject & {
    _id: Types.ObjectId;
}

export interface ModelGetInput {
    ref: string;
}

export interface ModelCreateInput {
    name: ModelObject["name"];
    props: ModelObject["props"];
    edit?: boolean;
}

export interface ModelNewInput {
    name: ModelObject["name"];
    data: Object;
    locale?: string;
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