import { ModelAPi } from "../../APIs";
import { ModelObject } from "../../types";
import { getModelByName } from "../../utils";
import { Data, Field, LayerClass, ListItemData, PageSection, Props, SectionData } from "../classes";
import { NumberField, StringField } from "../comps/Fields";
import { LayoutActions, TargetsActions, WapiActions } from "../states";
import { ContextObject, FieldTypes, ModelFieldObject, ParsedComp, WapiRequest, WapiRequests, WapiResponse } from "../types";
import { changeLink, layerContextMethods, medelToRef, parseLocales, storeModel, ungroupComps, validLink } from "../utils";
import { BuilderModals } from "../utils/modals";

let done = false, started = false;

const wapi = async (wapi: ContextObject["wapi"]) => {
    const wapiHander = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const req = JSON.parse(e.data) as WapiResponse;

                switch(req.type) {
                    case WapiRequests.Start: {
                        const page = window.__builder_page;
                        if(!started) {
                            const isLoading = window.__builder_context.layout.loading;
                            const context = window.__builder_context;
                            const params = (new URL(window.location.href))
                            const locale = params.searchParams.get("locale");
        
                            req.initInfo.sections["__Builder_Group"] = [
                                {
                                    name: "__PageInfo",
                                    props: req.initInfo.pageProps,
                                },
                                {
                                    name: "__DomainTheme",
                                    props: req.initInfo.themeProps,
                                }
                            ]
        
                            context.wapi = {
                                ...context.wapi,
                                info:  {
                                    ...req.initInfo,
                                    locales: parseLocales(req.initInfo.locales),
                                    pageProps: new Props(req.initInfo.pageProps),
                                    themeProps: new Props(req.initInfo.themeProps),
                                },
                                sections: ungroupComps(req.initInfo.sections, "section"),
                                comps: ungroupComps(req.initInfo.comps, "comp"),
                                elements: ungroupComps(req.initInfo.elements, "element")
                            };
                            context.layout.loading = false;
                            context.targets = {
                                ...context.targets,
                                device: req.initInfo.devices[0],
                                devices: req.initInfo.devices
                            };
        
                            page.parse(locale || undefined).then(() => {
        
                                page.locale.sections.refrech();
        
                                const infoSection = new PageSection({
                                    __name: "Info",
                                    comp: "__PageInfo",
                                    cond: { media: context.wapi.info.devices.map(dev => dev.name) },
                                    data: page.locale.info
                                });
                        
                                page.info = infoSection.data;
                        
                                const themeSection = new PageSection({
                                    __name: "Theme",
                                    comp: "__DomainTheme",
                                    cond: { media: context.wapi.info.devices.map(dev => dev.name) },
                                    data: page.document.domain.theme
                                });
                        
                                page.theme = themeSection.data;
            
                                wapi.set({ type: WapiActions.SetInitInfo, info: req.initInfo });
                                if(isLoading) context.layout.set({ type: LayoutActions.ToggleLoading });
                            });
    
                            started = true;
                        } else {
                            page.locale.sections.updateView(sections => ({
                                set: sections.parsed,
                                info: page.info?.section.activeParsed.data,
                                theme: page.theme?.section.activeParsed.data,
                                model: page.document.pageModels?.[page.locale.locale]
                            }))
                        }
                    }; break;
                    case WapiRequests.Target: {
                        const page = window.__builder_page;
                        const context = window.__builder_context;
                        if(req.hover) {
                            const { targets } = window.__builder_context;
                            const data = page.locale.sections.readContext(req.hover[0].split(",")[0]);
                            const canSelect = (
                                !targets.gcomp || 
                                (
                                    (((targets.gcomp as ParsedComp).type && (targets.gcomp as ParsedComp).type !== "section") || targets.gcomp instanceof Data) &&
                                    data instanceof ListItemData &&
                                    (
                                        (!(targets.gcomp instanceof Data) && data.__isSibling(targets.gcomp)) ||
                                        (targets.gcomp instanceof Data && data.__parent.__id === targets.gcomp.__parent.__id)
                                    )
                                ) ||
                                ((targets.gcomp as ParsedComp).type && (targets.gcomp as ParsedComp).type === "section" && data instanceof PageSection)
                            );
    
                            if(canSelect) context.targets.set({ type: TargetsActions.HoverComp, comp: [data, req.hover[1]] });
                        } else {
                            context.targets.set({ type: TargetsActions.HoverComp, comp: null });
                        }
                    }; break;
                    case WapiRequests.Scroll: {
                        const container = document.getElementById("__Builder-Preview-Tols");
    
                        if(container instanceof HTMLElement) {
                            container.style.top = -req.offset + "px";
                        }
                    }; break;
                    case WapiRequests.BodySize: {
                        const container = document.getElementById("__Builder-Preview-Tols");
    
                        if(container instanceof HTMLElement) {
                            container.style.height = req.size + "px";
                        }
                    }; break;
                    case WapiRequests.Select: {
                        const page = window.__builder_page;
                        const context = window.__builder_context;
                        const contexts = req.context.split(",");
                        const data = page.locale.sections.readContext(contexts[0]);

                        if(data instanceof PageSection && !data.selected)
                            context.targets.set({ type: TargetsActions.SelectSection, section: data, rect: req.rect })
                        else if(data instanceof PageSection && context.targets.comp) {
                            context.targets.set({ type: TargetsActions.SelectComp, comp: context.targets.comp[0], rect: req.rect })
                        } else if(data instanceof Data && !data.__selected) {
                            if(contexts.length > 1 && !data.__adjDatas) data.__adjDatas = contexts.slice(1).map(context => {
                                return page.locale.sections.readContext(context);
                            });
                            context.targets.set({ type: TargetsActions.SelectComp, comp: data, rect: req.rect });
                        }


                        if(req.menu) {
                            const contextMenu = context.layout.contextMenu;
                            const layer = (() => {
                                if(data instanceof PageSection) {
                                    return data.data.section.layer;
                                } else return data.__layer;
                            })();
                            if(layer) {
                                const frame = document.getElementById("__Builder-Preview");
                                const box = frame?.getBoundingClientRect();
                                const ratio = context.layout.scale;
                                contextMenu.setContextMenuName(layer.name);
                                contextMenu.setMenuActions(layerContextMethods((layer as LayerClass).expanded, true))
                                contextMenu.eventHandler({
                                    clientX: req.menu.clientX * ratio + (box?.left || 0),
                                    clientY: req.menu.clientY * ratio + (box?.top || 0),
                                    preventDefault: () => {}
                                } as any);
                            };
                        }
                    }; break;
                    case WapiRequests.Edit: {
                        const context = window.__builder_context;
                        const page = window.__builder_page;
                        const data = page.locale.sections.readContext(req.context);
    
                        if(data instanceof Data && data.__props instanceof Field) {
                            if([FieldTypes.String, FieldTypes.Number].includes(data.__props.__type)) {
                                data.__edit(req.data, undefined, true, true);
                            } else if (data.__props.__type === FieldTypes.Model) {
                                const field = data.__props.__field as ModelFieldObject;
                                window.__main_context.controller.modals.modelPicker.open(getModelByName(field.__args.model), async models => {
                                    const model = models[0];
                                    const modelObject = await ModelAPi.ref(field.__args.model, model._id, field.__args.query);

                                    storeModel(modelObject, medelToRef(model, field.__args.model, field.__args.query).__ref);

                                    data.__edit(medelToRef(modelObject, field.__args.model, field.__args.query))
                                }, field.__args.multi || 1);
                            }
                        }
                    }; break;
                    case WapiRequests.UpdateRects: {
                        const context = window.__builder_context;
    
                        context.targets.set({ type: TargetsActions.SetupRects, comp: req.comp, section: req.section, target: req.target });
                    }; break;
                    case WapiRequests.ChangeLink: {
                        const { page } = window.__builder_context;
                        const [locale, link] = validLink(req.link) || [];
                        if(link && (link !== page.module.document.link || locale !== page.module.locale.locale)) {
                            changeLink(link, locale);
                        }
                    }; break;
                }
            }
        } catch(error) { throw error };
    };

    if(!done) {
        window.addEventListener("message", wapiHander);
    }

    done = true;
}


export const sendWapiRequest = (req: WapiRequest) => {
    const frame = document.getElementById("__Builder-Preview-Frame") as HTMLIFrameElement;

    if(frame) frame.contentWindow?.postMessage(JSON.stringify(req), "*");
};

export const sendWapiRequestAsPromise = (request : WapiRequest) : Promise<WapiResponse> => {
    return new Promise(success => {
        const handler = (e: MessageEvent) => {
            try {
                const response = JSON.parse(e.data) as WapiResponse;
    
                if(response.type === request.type && response.id === request.id) {
                    window.removeEventListener("message", handler);

                    success(response);
                }
            } catch {};
        }
        window.addEventListener("message", handler);

        sendWapiRequest(request);
    })
};

export default wapi;
export * from "./events";