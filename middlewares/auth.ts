import Express from "express";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "../database";
import { UserDocument, UserPayload, UserPerms } from "../types";
import config from "../config";

export const authServer = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    const token = req.headers.authorization;

    if(token && token === config.env.SERVER_SECRET) return next();
    else return res.sendStatus(401);
}

export const authToken = async (token: string) : Promise<UserDocument | null> => {
    try {
        const payload = jwt.verify(token, config.env.AUTH_SECERT) as UserPayload;
        if(payload && payload.id && mongoose.Types.ObjectId.isValid(payload.id)) {
            const user = await UserModel.findById(payload.id, { password: 0 }).populate("avatar");
            return user as (UserDocument | null);
        } else return null;
    } catch { return null; }
}

export const authUser = (role: number | null = null, token: boolean = true) => {
    return async (req: (express.Request & { user?: UserDocument | null, apitoken?: boolean }), res: express.Response, next: express.NextFunction) => {
        const apitoken = req.headers.authorization;

        if(token && apitoken && apitoken === config.env.SERVER_SECRET) {
            req.apitoken = true;
            return next();
        }
        
        if(typeof apitoken  === "string") req.user = await authToken(apitoken);
        else req.user = null;

        if(typeof role === "number" && !req.user) return res.sendStatus(401);
        if(typeof role === "number" && req.user && req.user.role > role) return res.sendStatus(403);
        

        return next();
    }
}

export const auth = (role: number, perms?: (perms: UserPerms, req?: express.Request & { user?: UserDocument | null, apitoken?: boolean } & any) => boolean) => {
    return async (req: (express.Request & { user?: UserDocument | null, apitoken?: boolean }), res: express.Response, next: express.NextFunction) => {
        try {
            const apitoken = req.headers.authorization;

            if(apitoken && apitoken === config.env.SERVER_SECRET) {
                req.apitoken = true;
                return next();
            }
    
            if(typeof apitoken  === "string") req.user = await authToken(apitoken);
            else req.user = null;
    
            if(typeof role === "number" && !req.user) return res.sendStatus(401);
            if(typeof role === "number" && req.user && req.user.role > role) return res.sendStatus(403);
            if(role === 2 && req.user.role === 2 && perms && !perms(req.user.perms, req)) return res.sendStatus(403);
            
    
            return next();
        } catch(error) {
            console.error(error);
            return res.sendStatus(500);
        }
    } 
}