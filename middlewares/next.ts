import Express from "express";
import config from "../config";
import uiAPI from "../APIs/UiAPi";
import configData from "../config/data";


export const checkPage = (pathname: string, locale: string) => {
    const data = configData.revalidates.data;

    return Boolean(data[locale]) && data[locale].includes(pathname);
}

const locales = (configData.locales.data.locales.map(l => l.ext)).join("|");
const regexp1 = new RegExp(`^(?:\/(${locales}))?((?!\/(?:api|dev|${locales})).*\/[^.]*)?$`);
const regexp2 = new RegExp(`\/_next\/data\/[^\/]+\/(${locales})?(.*).json`);
const defaultLocale : string = configData.locales.data.defaultLocale || "";

export const nextMiddleware = async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    // ((async () => {})()).then(() => {
        const match = req.url.match(regexp1) || req.url.match(regexp2);

        if(match) {
            const [locale, url] = [match[1] || defaultLocale, match[2] || "/"];
            const res = checkPage(url, locale);

            console.log(locale, url);
    
            if(res) {
                await uiAPI.post("revalidate", { url: `/${locale}${url === "/" ? "" : url}` });

                configData.revalidates.delete(locale, url);
            }
        }
    // })
    
    return next();
}