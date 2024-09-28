import { Document, Types } from "mongoose";
import { PageSection } from "../classes";
import { DomainObject } from "./domain";
import { BuilderSymbol } from "./symbol";
import { ModelDataObject, ModelObject } from "../../types";

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
    data: PageSectionDataObject[];
    cond: PageDataCondObject;
}

export type PageSectionObject = PageSymbolSectionObject | PageNSymbolSectionObject;

export interface ActiveParsedSectionObject {
    comp: string;
    data: any;
    id: PageSection["id"];
}
export interface ParsedSectionObject {
    comp: string;
    data: PageSectionDataObject[];
    id: PageSection["id"];
}

export interface PageLocaleObject {
    locale: string;
    info: PageSectionDataObject[];
    meta: PageMetaObject;
    sections: PageSectionObject[];
    _id: string;
}

export interface PageVersionObject {
    name: string;
    locales: PageDocument["locales"];
    _id: string;
};

export interface PageDocument {
    name: string;
    link: string;
    url: string;
    published: boolean;
    domain: DomainObject;
    slug: string;
    targets: PageTargetsObject;
    locales: PageLocaleObject[];
    versions: PageVersionObject[];
    symbols: {
        [key: string] : BuilderSymbol;
    };
    models: {
        [key: string]: any;
    }
    pageModels: {
        [locale: string] : ModelDataObject;
    };
    model?: ModelObject;
    _id: string;
}


export interface PageCreateInput {
    name?: string;
    domain: string;
    link: string;
    slug?: PageDocument["slug"];
    targets?: PageDocument["targets"];
    model?: string;
    published?: boolean;
}

export interface PageEditInput {
    page: PageGetInput;
    domain: {
        theme?: DomainObject["theme"];
        symbols: PageDocument["symbols"]
    }
    data: {
        name?: PageDocument["name"];
        link?: PageDocument["link"];
        targets?: PageDocument["targets"];
        slug?: PageDocument["slug"];
        domain?: string;
        published: PageDocument["published"];
        locales?: PageDocument["locales"];
        versions?: PageDocument["versions"];
    },
}

export type PageFindInput = ({ slug: string } | { domain: string; link: string } | { _id: string }) & {
    locale?: string;
};


export type PagePublishLocaleInput = PageFindInput & { locale: string };
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

export type PageGetInput = { slug: string } | { domain: string; link: string } | { _id: string };