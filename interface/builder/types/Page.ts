export interface PageSection {
    comp: string;
    cond: {
        media: string[]
    };
    data: { cond: PageSection["cond"], data: any }[];
    index: number;
};


export interface ParsedSectionObject {
    comp: string;
    data: PageSectionDataObject[];
    id: number;
}

export interface Domain {
    name: string;
    url: string;
    theme: any;
}

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

export interface PageSectionObject {
    __name: string;
    comp: string;
    cond: PageDataCondObject;
    data: PageSectionDataObject[];
    __ref?: string;
}

export interface PageLocaleObject {
    locale: string;
    default: boolean;
    info: {cond: PageDataCondObject , data: any}[];
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
    slug: string;
    targets: PageTargetsObject;
    locales: PageLocaleObject[];
    versions: PageVersionObject[];
    _id: string;
}

export interface ParsedPageDocument {
    locale: PageLocaleObject;
    models: { [key: string]: any };
    symbols: { [key: string]: any };
    theme: {cond: PageDataCondObject , data: any}[];
    pageModel?: any;
}