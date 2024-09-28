import { Document, Model, Types } from "mongoose";
import { Page } from "../classes";
import { DomainObject } from "./Domain";
import { SymbolObject } from "./Symbol";
import { User } from "./User";
import { ModelObject } from "./Model";

export interface PageTargetsObject {
    locales: boolean;
}

export interface PageMetaObject {
    title: string;
    description: string;
    [name: string] : string;
}

export interface PageDataCondObject {
    media: string[];
}

export interface PageSectionDataObject {
    cond: PageDataCondObject
    data: any;
}

export interface PageSymbolSectionObject {
    cond: PageDataCondObject;
    __ref: string;
}

export interface PageNSymbolSectionObject {
    __name: string;
    comp: string;
    cond: PageDataCondObject;
    data: PageSectionDataObject[];
}

export type PageSectionObject = PageSymbolSectionObject | PageNSymbolSectionObject;

export interface PageLocaleObject {
    locale: string;
    info: PageSectionDataObject;
    meta: PageMetaObject;
    sections: PageSectionObject[];
}

export interface PageVersionObject {
    name: string;
    locales: PageObject["locales"];
}[];

export interface PageObject {
    name: string;
    link: string;
    url: string;
    published: boolean;
    domain: DomainObject;
    slug: string;
    targets: PageTargetsObject;
    locales: PageLocaleObject[];
    versions: PageVersionObject[];
    models: {
        [locale: string] : string[];
    }
    symbols: {
        [locale: string] : string[];
    },
    model?: ModelObject;
    created_at: Date;
    created_by?: User;
    updated_at?: Date;
    updated_by?: User;
}

export interface ParsedPageObject extends Omit<PageObject, "models" | "symbols"> {
    symbols: {
        [locale: string] : {[key: string] : SymbolObject;}
    };
    models: {
        [locale: string] : {[key: string] : any;}
    }
}

export type PageDocument = Document<unknown, any, PageObject> & PageObject & {
    _id: Types.ObjectId;
    domain: string | DomainObject;
}

export interface PageCreateInput {
    name: string;
    domain: string;
    link: string;
    targets?: PageObject["targets"];
    slug?: PageObject["slug"];
    model?: string;
    published?: boolean;
    locales?: {
        meta?: PageLocaleObject["meta"];
        locale?: string;
        modelData?: any;
    }[];
};

export interface PageEditInput {
    page: PageFindInput;
    domain: {
        theme?: DomainObject["theme"];
        symbols: ParsedPageObject["symbols"]["key"];
    };
    data: {
        name?: PageObject["name"];
        link?: PageObject["link"];
        published?: PageObject["published"];
        targets?: PageObject["targets"];
        locales?: PageObject["locales"];
        versions?: PageObject["versions"];
    };
}

export interface PageUpdateInput {
    page: PageFindInput;
    data: {
        name?: PageObject["name"];
        link?: PageObject["link"];
        targets?: PageObject["targets"];
        slug?: PageObject["slug"];
        domain?: string;
        locales?: {
            index?: number;
            meta: PageLocaleObject["meta"];
            locale?: string;
            modelData?: any;
        }[];
    };
}

export type PageFindInput = ({ slug: string } | { domain: string; link: string } | { _id: string }) & {
    locale?: string;
    published?: boolean;
};

export interface PagePublishInput {
    page: PageFindInput;
    version: string;
    locale: string;
    models: {
        [locale: string] : string[];
    };
    symbols: {
        [locale: string]: string[];
    };
}

export interface PageTableInput {
    skip: number;
    max: number;
    sort?: "NEWEST" | "OLDEST";
    search?: string;
    locale?: string;
    noModel?: boolean;
}

export type PagePublishLocaleInput = PageFindInput & { locale: string };

export interface PageSlugGenerator {
    title: string;
}