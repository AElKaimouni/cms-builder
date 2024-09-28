import express from "express";
import { SymbolModel } from "../database";
import { authUser, auth } from "../middlewares";
import { validateCreateSymbolInput, validateDeleteSymbolInput } from "../utils";

const symbolRoute = express.Router();

symbolRoute.post("/create", auth(2, perms => perms.models?.pages?.[2]), async (req: express.Request, res: express.Response) => {
    const input = validateCreateSymbolInput(req.body);

    if(!input) return res.sendStatus(400);

    const symbol = new SymbolModel(input);

    try {

        return res.status(200).json(symbol.toJSON());
    } catch { return res.sendStatus(500); }
});

symbolRoute.post("/delete", auth(2, perms => perms.models?.pages?.[2]), async (req: express.Request, res: express.Response) => {
    const input = validateDeleteSymbolInput(req.body);

    if(!input) return res.sendStatus(400);

    try {
        await SymbolModel.deleteMany({ _id: { $in: input.ids } });

        return res.sendStatus(200);
    } catch { return res.sendStatus(500) }
})

export default symbolRoute;