import { Domain } from "./domain";
import { User } from "./users";

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
    default: boolean;
    info: PageSectionDataObject;
    meta: PageMetaObject;
    sections: PageSectionObject[];
}

export interface PageVersionObject {
    name: string;
    locales: PageObject["locales"];
}[];

export type PagePublishLocaleInput = PageFindInput & { locale: string };
export interface PageObject {
    name: string;
    link: string;
    url: string;
    published: boolean;
    domain: Domain;
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
    created_at: Date;
    created_by: User;
    updated_at?: Date;
    updated_by?: User;
    _id: string;
}

export interface PageEditInput {
    page: PageFindInput;
    data: {
        name?: PageObject["name"];
        link?: PageObject["link"];
        targets?: PageObject["targets"];
        slug?: PageObject["slug"];
        domain?: string;
        locales?: {
            index?: number;
            meta?: PageLocaleObject["meta"];
            locale?: string;
            modelData?: any;
        }[];
    };
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


export type PageFindInput = ({ slug: string } | { domain: string; link: string } | { _id: string }) & {
    locale?: string;
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
    sort?: "NEWEST" | "OLDEST" | string;
    search?: string;
    locale?: string;
    noModel?: boolean;
}

export interface PageSlugGenerator {
    title: string;
}