export interface BuilderMedia {
    name: string;
    url: string;
    width: number;
    height: number;
    size: number;
    format: string;
    type : "image" | "video";
    date: Date;
    id: string;
}

export interface BuilderLocale {
    name: string;
    ext: string;
    primary: boolean;
    id: string;
}