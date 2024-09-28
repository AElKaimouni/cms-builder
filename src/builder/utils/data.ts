import { CompStyleProps, PageDocument, PageLocaleObject, PageVersionObject } from "../types";

export const defaultStyles : CompStyleProps = {
    spacing: {
        margin: {},
        padding: {}
    },
    transform: {
        position: {},
        rotate: {}, 
        scale: {},
        size: {}
    },
    typography: {
        align: {},
        color: {},
        font: {
            fontsList: ["arial", "sans serif"],
            default: "inherit"
        },
        weight: {},
        height: {},
        size: {},
        spacing: {},
        style: {
            capitalize: {},
            decoration: {},
            italicize: {}
        }
    },
    background: {
        gradient: true,
        image: true,
        solid: true,
    },
    border: {},
    display: {},
}

export const defaultLocaleObject : PageLocaleObject = {
    info: [],
    locale: "",
    meta: {
        description: "",
        title: "",
    },
    sections: [],
    _id: ""
};

export const defaultVersionObject : PageVersionObject = {
    locales: [defaultLocaleObject],
    name: "",
    _id: ""
};

export const defaultDocumentObject : PageDocument = {
    models: {},
    symbols: {},
    _id: "",
    domain: {
        _id: "",
        host: "",
        name: "",
        theme: []
    },
    link: "",
    locales: [defaultLocaleObject],
    name: "",
    published: false,
    slug: "",
    targets: {
        locales: false
    },
    url: "",
    versions: [defaultVersionObject],
    pageModels: {},
}

