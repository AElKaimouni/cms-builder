export * from "./states";
export * from "./wapi";
export * from "./fields";
export * from "./comps";
export * from "./domain";
export * from "./page";
export * from "./layers";
export * from "./symbol";
export * from "./models"

export interface BuilderKeys {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
}

export interface BuilderFunctions {
    copy: () => void;
    paste: (offset?: number) => void;
    delete: () => void;
    dublicate: () => void;
}

export enum BuilderStorage {
    Copied_Sections = "__Builder_Copied_Sections",
    Copied_List_Items = "__Builder_Copied_List_Items"
}

export interface FileType extends File {
    preview: string;
    formattedSize: string;
    name: string;
    type: string;
    id: number;
}

export interface FormFileType {
    preview: string;
    formattedSize: string;
    name: string;
    type: string;
    id: number;
    urlMedia?: boolean;
}

export interface UrlFile {
    name: string;
    url: string;
    id: number;
}

export interface MediaPreview {
    id: string;
    preview: string;
}