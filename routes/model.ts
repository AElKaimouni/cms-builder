import express from "express";
import { CModel, Model, Page, ServerError, ServerErrors } from "../classes";;
import { createModels, parseModelRef, readModelRef, validateLocaleSiblingInput, validateModelCreateInput, validateModelDeleteInput, validateModelGetInput, validateModelNewInput, validateModelUnqiueInput, validateModelUpdateInput, validatePublishInput, validateTableInput } from "../utils";
import { ModelDeleteInput, ModelGetInput, ModelLocaleSiblingInput, ModelModelUnqiueInput, ModelNewInput, ModelPublishInput, ModelTableInput, ModelUpdateInput, User, UserDocument } from "../types";
import { auth, authUser } from "../middlewares";

const modelRoute = express.Router();

modelRoute.post("/", auth(2, (perms, req) => {
    const input = req.input = validateModelGetInput(req.body);

    if(!input) return true;

    const { modelName } = parseModelRef(input.ref);

    return perms.models?.[modelName]?.[1];
}), async (req: express.Request & { input?: ModelGetInput }, res: express.Response) => {
    const input = req.input || validateModelGetInput(req.body);

    if(!input) return res.sendStatus(400);

    try {
        const result = await readModelRef(input.ref);

        if(result) return res.status(200).json(result);
        else return res.sendStatus(404);
    } catch(error) {
        switch(error.type) {
            case ServerErrors.MODEL_IS_NOT_EXIST: return res.status(400).send(error.message);
            case ServerErrors.UNVALID_QUERY_OBJECT: return res.status(400).send(error.message);
            default: {
                console.error(error);
                return res.sendStatus(500);
            }
        }                
    }

});

modelRoute.post("/create", auth(0), async (req: express.Request, res: express.Response) => {
    const inputs = validateModelCreateInput(req.body);

    if(!inputs) return res.sendStatus(400);

    try {
        const result = await createModels(inputs);

        return res.status(200).json(result);

    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }

});

modelRoute.post("/new", auth(2, (perms, req) => {
    const input = req.input = validateModelNewInput(req.body);

    if(!input) return true;

    return perms.models?.[input.name]?.[0];
}), async (req: express.Request & { user: UserDocument, input?: ModelNewInput }, res: express.Response) => {
    const input = req.input || validateModelNewInput(req.body);
    const user = req.user;

    if(!input) return res.sendStatus(400);

    try {
        const model = await CModel.create(input.name, input.data, user, input.locale);

        try {
            return res.status(200).json((await model.populate()).json);

        } catch(error) {
            console.error(error);

            return res.sendStatus(500);
        }
    } catch(error) {
        if(error.code === 11000) return res.status(409).send(error.message); else {
            console.error(error);

            return res.status(400).send(new Error(error).message);
        }
    }
})

modelRoute.post("/update", auth(2, (perms, req) => {
    const input = req.input = validateModelUpdateInput(req.body);

    if(!input) return true;

    return perms.models?.[input.name]?.[2];
}), async (req: express.Request & { user: UserDocument, input?: ModelUpdateInput }, res: express.Response) => {
    const input = req.input || validateModelUpdateInput(req.body);
    const user = req.user;

    if(!input) return res.sendStatus(400);

    try {
        const model = await CModel.find(input.name, input.id, undefined);

        await model.update({...input.data, uiPublished: false}, user);

        return res.status(200).json((await model.populate()).json);
    } catch(error) {
        if(error.code === 11000) return res.sendStatus(409); else {
            console.error(error);

            return res.status(500).send(new Error(error).message);
        }
    }
});

modelRoute.post("/delete", auth(2, (perms, req) => {
    const input = req.input = validateModelDeleteInput(req.body);

    if(!input) return true;

    return perms.models?.[input.name]?.[3];
}), async (req: express.Request & { input?: ModelDeleteInput }, res: express.Response) => {
    const input = req.input || validateModelDeleteInput(req.body);;

    if(!input) return res.sendStatus(400);

    try {
        const model = await CModel.find(input.name, input.id);

        await model.delete();

        return res.sendStatus(200);
    } catch(error) {
        if(error instanceof ServerError) switch(error.type) {
            case ServerErrors.UNDEFINED_LOCALE: return res.status(400).send(error.message);
        }

        console.error(error);

        return res.sendStatus(500);
    } 
})

modelRoute.get("/all", auth(2), async (req: express.Request, res: express.Response) => {
    try {
        const models = await Model.all();

        return res.status(200).json(models.map(model => model.json));
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
});

modelRoute.post("/table", auth(2, (perms, req) => {
    const input = req.input = validateTableInput(req.body);

    if(!input) return true;

    return perms.models?.[input.model]?.[1];
}), async (req: express.Request & { input?: ModelTableInput }, res: express.Response) => {
    const input = req.input || validateTableInput(req.body);

    if(!input) return res.sendStatus(400);

    try {
        const result = await CModel.table(input);

        return res.status(200).json(result);
    } catch(error) {
        switch(error.type) {
            case ServerErrors.UNVALID_QUERY_OBJECT: return res.status(400).send(error.message);
            case ServerErrors.UNDEFINED_LOCALE: return res.status(400).send(error.message);
        }

        console.error(error);
        return res.sendStatus(500);
    }
});

modelRoute.post("/publish", auth(2, (perms, req) => {
    const input = req.input = validatePublishInput(req.body);

    if(!input) return true;

    return perms.models?.[input.model]?.[2];
}), async (req: express.Request & { user: UserDocument, input?: ModelPublishInput }, res: express.Response) => {
    const input = req.input || validatePublishInput(req.body);
    const user = req.user;

    if(!input) return res.sendStatus(400);

    try {
        const model = await CModel.find(input.model, input.id, undefined);

        await model.update({ published: !model.json.published }, user);

        Page.updateModel(model.document._id);

        return res.sendStatus(200);
    } catch(error) {
        switch(error.type) {
            case ServerErrors.UNDEFINED_LOCALE: return res.status(400).send(error.message);
        }

        console.error(error);
        return res.sendStatus(500);
    }
})

modelRoute.post("/publishChanges", auth(2, (perms, req) => {
    const input = req.input = validatePublishInput(req.body);

    if(!input) return true;

    return perms.models?.[input.model]?.[2];
}), async (req: express.Request & { user: UserDocument, input?: ModelPublishInput }, res: express.Response) => {
    const input = req.input || validatePublishInput(req.body);
    const user = req.user;

    if(!input) return res.sendStatus(400);

    try {
        const model = await CModel.find(input.model, input.id, undefined);
        
        await model.publishChanges(user);

        Page.updateModel(model.document._id);

        return res.sendStatus(200);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
});

modelRoute.post("/sibling", auth(2, (perms, req) => {
    const input = req.input = validateLocaleSiblingInput(req.body);

    if(!input) return true;

    return perms.models?.[input.model]?.[1];
}), async (req: express.Request & { input?: ModelLocaleSiblingInput }, res: express.Response) => {
    const input = req.input || validateLocaleSiblingInput(req.body);

    if(!input) return res.sendStatus(400);

    try {
        const model = await CModel.find(input.model, input.id, undefined);
        const sibling = await model.sibling(input.locale);

        if(!sibling) return res.sendStatus(404);

        return res.status(200).json((await sibling.populate()).json);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
});

modelRoute.post("/reregister", auth(0), async (req: express.Request, res: express.Response) => {
    try {
        await Model.reregisterSchemas();

        console.log("Models schemas are reregistred successfuly.");

        return res.sendStatus(200);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
})

modelRoute.post("/unique", auth(2), async (req: express.Request, res: express.Response) => {
    const input = validateModelUnqiueInput(req.body);

    if(!input) return res.sendStatus(400);

    try {
        const result = await CModel.unique(input);

        return res.status(200).json(result);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
})

export default modelRoute;
