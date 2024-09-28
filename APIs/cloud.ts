import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import { Image, Media, Video } from "../types";
import cloudinary from "../config/cloudinary.config";

type UrlFile = { url: string, name: string };
type MulterFile = Express.Multer.File;

export const uploadFile = (file: MulterFile, options: UploadApiOptions = {}) : Promise<Image | Video> => {
    return new Promise((success, failed) => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        cloudinary.uploader.upload(dataURI, options, (err, res) => {
            if(err) failed(err);
            else success({
                type: res.resource_type as "video",
                url: res.secure_url,
                width: res.width,
                height: res.height,
                size: res.bytes,
                format: res.format,
                name: file.filename || file.originalname,
                public_id: res.public_id
            });
        });
    })
}

export const uploadUrl = (url: string, name: string, options: UploadApiOptions = {}) : Promise<Image> => {
    return new Promise((success, failed) => {
        cloudinary.uploader.upload(url, options, (err, res) => {
            if(err) failed(err);
            else success({
                type: res.resource_type as "image",
                url: res.secure_url,
                width: res.width,
                height: res.height,
                size: res.bytes,
                format: res.format,
                name: name,
                public_id:  res.public_id
            });
        });
    })
}

export const uploadMedia = async (files: (MulterFile | UrlFile)[]) : Promise<Media[]> => {
    const result : Media[] = [];
    
    try {
        for(let file of files) {
            const isFile = Boolean((file as MulterFile).mimetype);
            const mimeType = (file as MulterFile).mimetype;
            const type = isFile ? mimeType.split("/")[0] : "image";
            const format = mimeType.split("/")?.[1];
            if(type === "image") {
                const options = { transformation: {quality: "auto:best"} };

                const originalImageRes = isFile ? await uploadFile((file as MulterFile), options) as Image : await uploadUrl((file as UrlFile).url, (file as UrlFile).name, options);
                result.push(originalImageRes);
            } else if (type === "video") {
                const videoRes = await uploadFile((file as MulterFile), { format: "mp4", resource_type: "video" }) as Video;
                result.push(videoRes);
            } else  {
                const jsonRes = await uploadFile(file as MulterFile, { resource_type: "auto" });
                result.push(jsonRes);
            }
        }
    } catch(error) { throw error };

    return result;
}
