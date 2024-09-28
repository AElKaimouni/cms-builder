export interface BuilderMedia {
    url: string;
    width: number;
    height: number;
    public_id: string;
    type: "image" | "video" | "raw";
}