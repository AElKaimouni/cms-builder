export interface MediaBase {
    name: string;
    url: string;
    width: number;
    height: number;
    size: number;
    format: string;
    public_id: string;
    _id: string;
}

export interface MediaImage extends MediaBase {
    type: "image";
}

export interface MediaVideo extends MediaBase {
    type: "video";
}

export interface MediaFile extends MediaBase {
    type: "raw";
}

export type Media = MediaImage | MediaVideo | MediaFile;