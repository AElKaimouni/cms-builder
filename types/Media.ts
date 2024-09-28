export interface MediaBase {
    name: string;
    url: string;
    width?: number;
    height?: number;
    size: number;
    format: string;
    public_id: string;
}

export interface Image extends MediaBase {
    type: "image";
    width: number;
    height: number;
}

export interface Video extends MediaBase {
    type: "video";
    width: number;
    height: number;
}

export type Media = Video | Image | MediaBase;

export interface MediaDocument extends MediaBase {
    type : "image" | "video";
    created_at: Date;
}