import express from "express";
import multer from "multer";
import path from "path";
import { uploadMedia } from "../APIs";
import { MediaModel } from "../database";
import { auth, authUser } from "../middlewares";
import { UserDocument } from "../types";
import  { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from "../config/cloudinary.config";
  
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     public_id: (req, file) => file.originalname || file.filename,
//   },
// });

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const mediaRoute = express.Router();

mediaRoute.post("/upload", auth(2, perms => perms.models?.media?.[0]), upload.fields([
    { name: "media" }
]), async (req: (express.Request & { user: UserDocument }), res: express.Response) => {
    const { media } = req.files as { [key: string] : Express.Multer.File[] };
    let urls : {name: string; url: string}[] = [];

    try {
        urls = JSON.parse(req.body.urls);
    } catch {}

    try {
        const result = await uploadMedia([...(media ? media : []), ...urls]);
        const documents = [];
    
        for(let media of result) {
            const mediaDocument = new MediaModel(media);
    
            documents.push(await mediaDocument.save());
        };
    
        return res.sendStatus(200);
    } catch(error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

mediaRoute.post("/delete", auth(2, perms => perms.models?.media?.[3]), async (req: (express.Request & { user: UserDocument }), res: express.Response) => {
    const { ids } = req.body;

    if(!ids || !Array.isArray(ids)) return res.sendStatus(400);

    try {
        await MediaModel.deleteMany({ _id: { $in: ids } });

        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

mediaRoute.post("/edit", auth(2, perms => perms.models?.media?.[2]), async (req: (express.Request & { user: UserDocument }), res: express.Response) => {
    const { media } = req.body;
    if(!media || !media.id) return res.sendStatus(400);

    try {
        const result = await MediaModel.findById(media.id);

        if(!result) return res.sendStatus(400);
    
        if(media.name) result.name = media.name;
    
        await result.save();
    
        res.sendStatus(200);
    } catch(error) {
        console.log(error);
        return res.sendStatus(500);
    }
})

export default mediaRoute;