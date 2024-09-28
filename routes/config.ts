import express from "express";
import { UserModel } from "../database";
import { authUser } from "../middlewares";
import { User } from "../types";
import configData from "../config/data";
import { Domain } from "../classes";

const configRoute = express.Router();

configRoute.get("/status", authUser(), async (req: express.Request & { user: User }, res: express.Response) => {
    const usersCount = await UserModel.count();
    const domains = await Domain.all();

    return res.status(200).json({
        firstUser: usersCount === 0,
        maintenance : false,
        ...configData.locales.data,
        domains
    })
})

export default configRoute;