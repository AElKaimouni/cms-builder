import { PageSectionDataObject } from "./page";

export interface DomainObject {
    name: string;
    host: string;
    theme: PageSectionDataObject[];
    _id: string;
}

export interface DomainInput {
    name: string;
    host: string;
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