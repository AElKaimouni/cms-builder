import config from "../config";
import {  PageSectionObject } from "../types";
import path from "path";

const dynamicImport = new Function('specifier', 'return import("file:///" + specifier)');

export type TemplateFunction = (locale?: string, model?: any) => PageSectionObject[];

export default class Template {
    static templates : { [key: string] : TemplateFunction };
    public render : TemplateFunction;

    constructor(template: TemplateFunction) {
        this.render = template;
    }

    static async get(template: string) : Promise<Template | null> {
        if(Template.templates[template]) return new Template(Template.templates[template]);
        // try {
            const templateFunction = (await dynamicImport(path.join(__dirname, (config.dev ? "../" : "") + "templates", `${template}.template.js`))).default;

            if(typeof templateFunction !== "function") return null;
    
            Template.templates[template] = templateFunction;
    
            return new Template(templateFunction);
        // } catch { return null }
    }

    static async default() : Promise<Template | null> {
        return await this.get("index");
    }
}

Template.templates = {};