export * from "./states";
export * from "./fields";
export * from "./models";
export * from "./system";
export * from "./users";
export * from "./domain";
export * from "./pages";

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