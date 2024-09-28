import { ModelAPi } from "../../APIs";
import { ModelDataObject } from "../../types";
import { PageLocaleObject, PageMetaObject, PageSectionDataObject, PageSectionObject } from "../types";
import { PageSection, PageSections } from "./Section";

export class PageLocale {
    public locale: string;
    public info: PageSectionDataObject[];
    public meta: PageMetaObject;
    public sections: PageSections;
    public model?: ModelDataObject;
    private initLocale : PageLocaleObject; 
    constructor(locale: PageLocaleObject, model?: ModelDataObject) {
        console.log("Create Locale");
        this.locale = locale.locale;
        this.info = locale.info;
        this.meta = locale.meta;
        
        this.sections = new PageSections(locale.sections);
        this.initLocale = locale;
        this.model = model;
    }

    async publishModel() {
        const model = window.__builder_page.document.model;
        if(this.model && model) ModelAPi.publish({
            locale:this.locale,
            id: this.model?._id,
            model: model.name
        }); else throw new Error(`cannot publish page model because its not exits.`);
    }
}