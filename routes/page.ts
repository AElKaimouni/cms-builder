import Express from "express";
import { Page, ServerError, ServerErrors } from "../classes";
import { slugify, validatePageCreateInput, validatePageEditInput, validatePageFindInput, validatePagePublishInput, validatePagePublishLocaleInput, validatePageSlugGenerator, validatePageTableInput, validatePageUpdateInput } from "../utils";
import { Symbol } from "../classes";
import { auth, authUser } from "../middlewares";
import { UserDocument } from "../types";

const PageRoute = Express.Router();
const createAuth = auth(2, perms => perms.models?.pages?.[0]);
const readAuth = auth(2, perms => perms.models?.pages?.[1]);
const updateAuth = auth(2, perms => perms.models?.pages?.[2]);
const deleteAuth = auth(2, perms => perms.models?.pages?.[3]);

PageRoute.post("/", readAuth, async (req: Express.Request, res: Express.Response) => {
    try {
        const input = validatePageFindInput(req.body);
        if(!input) return res.sendStatus(400);

        const page = await Page.find(input);

        if (page === null) return res.sendStatus(404);
        else return res.status(200).json(await (await page.populate()).parse(Boolean(input.locale), input.locale));

    } catch (error) {
        if(error instanceof ServerError) switch (error.type) {
            case ServerErrors.UNVALID_REF: return res.status(400).send(error.message);
            default: {
                console.log(error.message);
                return res.sendStatus(500);
            }
        }

        console.error(error);
        return res.sendStatus(500);
    }
});

PageRoute.post("/unparsed", readAuth, async (req: Express.Request, res: Express.Response) => {
    try {
        const input = validatePageFindInput(req.body);
        if(!input) return res.sendStatus(400);

        const page = await Page.find(input);

        if (page === null) return res.sendStatus(404);
        else return res.status(200).json((await page.populate()).json);

    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

// this method used to publish or draft a page
PageRoute.post("/unparsed/publish", updateAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePageFindInput(req.body);
        const user = req.user;

        if(!input) return res.sendStatus(400);

        const page = await Page.find(input);

        await page.publishPage(user);

        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
})

// this method used to publish a page meta data and locales
PageRoute.post("/unparsed/publishChanges", updateAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePageFindInput(req.body);
        const user = req.user;

        if(!input) return res.sendStatus(400);

        const page = await Page.find(input);

        await page.publishPageChanges(user);

        return res.status(200).json((await page.populate()).json);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

PageRoute.post("/unparsed/update", updateAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePageUpdateInput(req.body);
        const user = req.user;

        if(!input) return res.sendStatus(400);

        const page = await Page.find(input.page);

        if(page === null) return res.sendStatus(404);

        if(input.data.locales) {
            const template = await page.template();
            input.data.locales.forEach(l => {
                if(typeof l.index === "number")
                    input.data[`versions.0.locales.${l.index}.meta`] = l.meta;
                else 
                    input.data["$push"] = {
                        "versions.0.locales": {
                            ...{...l, modelData: undefined},
                            ...(template ? {
                                sections: template.render(l.locale, l.modelData)
                            } : {})
                        }
                    };
            })

            delete input.data.locales;
        }

        const editedPage = await page._edit(input.data, user);

        return res.status(200).json((await editedPage.populate()).json);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

PageRoute.get("/pages", readAuth, async (req: Express.Request, res: Express.Response) => {
    const pages = await Page.getPublished();

    return res.status(200).json(pages.map(page => page.link));
});

PageRoute.post("/create", createAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePageCreateInput(req.body);
        const user = req.user;
        if(!input) return res.sendStatus(400);

        const page = await Page.create({...input, locales: undefined}, user, input.locales, undefined);

        return res.status(200).json((await page.populate()).json);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

PageRoute.post("/delete", deleteAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePageFindInput(req.body);
        if(!input) return res.sendStatus(400);

        const page = await Page.find(input);

        await page.delete();

        return res.sendStatus(200);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

PageRoute.post("/edit", updateAuth, async (req: Express.Request, res: Express.Response) => {
    try {
        const input = validatePageEditInput(req.body);
        if(!input) return res.sendStatus(400);

        const page = await Page.find(input.page);

        if(page === null) return res.sendStatus(404);

        const editedPage = await page.edit(input);

        for(let symbolID in input.domain.symbols) {
            const symbol = input.domain.symbols[symbolID];

            await Symbol.save(symbol);
            Page.publishSymbol(symbolID); // awaitable
        }

        if(editedPage) return res.status(200).json((await editedPage.populate()).json);
        else return res.sendStatus(400);
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
});

// this methods used by builder when publishing a version
PageRoute.post("/publish", updateAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePagePublishInput(req.body);
        const user = req.user;

        if(!input) return res.sendStatus(400);
        
        const page = await Page.find(input.page);

        if(page === null) return res.sendStatus(404);

        const savedPage = await page._edit({ models: input.models, symbols: input.symbols }, user);
        const publishedPage = await page.publish(input.version, input.locale);

        if(publishedPage) return res.status(200).json((await publishedPage.populate()).json);
        else return res.sendStatus(404);
    } catch (error) {
        console.error(error.response.data);
        return res.sendStatus(500);
    }
});

PageRoute.post("/publishLocale", updateAuth, async (req: Express.Request & { user: UserDocument }, res: Express.Response) => {
    try {
        const input = validatePagePublishLocaleInput(req.body);
        const user = req.user;

        if(!input) return res.sendStatus(400);
        
        const page = await Page.find({...input, locale : undefined});

        if(page === null) return res.sendStatus(404);

        await page.publishLocale(input.locale, user);
        
        return res.sendStatus(200);
    } catch (error) {
        console.error(error.response.data);
        return res.sendStatus(500);
    }
});

PageRoute.post("/table", readAuth, async (req: Express.Request, res: Express.Response) => {
    try {
        const input = validatePageTableInput(req.body);

        if(!input) return res.sendStatus(400);

        const table = await Page.table(input);

        return res.status(200).json(table);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
});

PageRoute.post("/slug", auth(2), async (req: Express.Request, res: Express.Response) => {
    try {
        const input = validatePageSlugGenerator(req.body);

        if(!input) return res.sendStatus(400);

        const slug = await slugify(input.title);

        return res.status(200).json(slug);
    } catch(error) {
        console.error(error);

        return res.sendStatus(500);
    }
})

export default PageRoute;