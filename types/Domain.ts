import { Document, Types } from "mongoose";
import { PageSectionDataObject } from "./Page";
import { User } from "./User";

export type DomainDocument = Document<unknown, any, DomainObject> & DomainObject & {
    _id: Types.ObjectId;
}

export interface DomainObject {
    name: string;
    host: string;
    theme: PageSectionDataObject;
    created_at: Date;
    created_by: User;
    updated_at?: Date;
    updated_by?: User;
    published: boolean;
}

export interface DomainInput {
    name: string;
    host: string;
}
export interface DomainFindInput {
    id: string;
}

export interface DomainUpdateInput {
    id: string;
    domain: {
        name?: string;
        host?: string;
        published?: boolean;
    };
}

export interface DomainPublishInput {
    id: string;
}