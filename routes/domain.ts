import Express from "express";

import { Domain } from "../classes";
import { validateDmainInput, validateDomainFindInput, validateDomainPublishInput, validateDomainUpdateInput } from "../utils";
import { authUser } from "../middlewares";
import { UserDocument } from "../types";

const DomainRoute = Express.Router();

DomainRoute.post("/", async (req: Express.Request, res: Express.Response) => {
    try {
        const input = validateDomainFindInput(req.body);

        if(!input) return res.sendStatus(400);

        const domain = await Domain.id(input.id);

        await domain.populate();

        return res.status(200).json(domain.json);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
});

DomainRoute.post("/create", authUser(0, false), async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validateDmainInput(req.body);
        const user = req.user;
        
        if(!input) return res.sendStatus(400);

        const domain = await Domain.create(input, user);

        if(domain) return res.status(200).json(domain.json);
        else return res.sendStatus(400);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

DomainRoute.post("/update", authUser(0, false), async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validateDomainUpdateInput(req.body);
        const user = req.user;
        
        if(!input) return res.sendStatus(400);

        const domain = await Domain.id(input.id);

        if(!domain) return res.sendStatus(404);

        if(domain) return res.status(200).json((await (await domain.update(input.domain, user)).populate()).json);
        else return res.sendStatus(400);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

DomainRoute.post("/publish", authUser(0, false), async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validateDomainPublishInput(req.body);
        const user = req.user;

        if(!input) return res.sendStatus(400);

        const domain = await Domain.id(input.id);

        await domain.publish(user);

        return res.sendStatus(200);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
})

DomainRoute.get("/all", async (req: Express.Request, res: Express.Response) => {
    try {
        const result = await Domain.all();

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.sendStatus(500);
    }
})

export default DomainRoute;