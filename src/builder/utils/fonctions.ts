import config from "../../config";
import { getModelID } from "../../utils";
import { Data, Field, Layer, ListData, ListField, ListItemData, ListLayer, PageSection, Props, SectionData, SectionLayer } from "../classes";
import { BuilderContextMenuProps } from "../comps/ContextMenu";
import { LayoutActions, TargetsActions } from "../states";
import { BuilderGroupedComps, BuilderComps, BuilderStorage, PageSectionObject, LayersTypes, ExpandedLayer, CompStyleProps, CompGroupedStyles, CompPropsObject, FieldObject, FieldTypes, ParsedComp, BuilderSymbol, InitInfo, ParsedInitInfo } from "../types";
import { BuilderModals } from "./modals";
import { loadDataModels, readSection } from "./references";

export const changeLink = (link: string, locale?: string) => {
    const { page, layout } = window.__builder_context;
    locale = locale || page.module.locale.locale;

    return new Promise<void>(success => {
        const main = () => {
            layout.set({ type: LayoutActions.TogglePageLoading });
            page.module.load({ link, domain: page.module.document.domain._id }, locale).then(res => {
                if(res.status === 404) {
                    layout.set({ type: LayoutActions.Modal,
                        modal: BuilderModals.ConfirmModal, info: {
                        cancel: "Cancel",
                        confirm: "Create",
                        color: "primary",
                        message: `Page With Link "${link}" is not exist, do you wants to create it ?`,
                        title: "Creating New Page"
                    }, callBack: async result => {
                        if(result) await page.module.createPage(link, locale).then(() => changeURLPageParam());
    
                        layout.set({ type: LayoutActions.TogglePageLoading });
                        success();
                    }})
                } else {
                    changeURLPageParam();
                    layout.set({ type: LayoutActions.TogglePageLoading });
                    success();
                }
            })
        }
        
        if(page.state.canSave) {
            layout.set({ type: LayoutActions.Modal,
                modal: BuilderModals.ConfirmModal, info: {
                cancel: "Cancel",
                confirm: "Change",
                color: "primary",
                message: `Your about to leave this page before saving, are you sure you wanna discrad this changes ?`,
                title: "Changing Page"
            }, callBack: async result => {
                if(result) main();
            }})
        } else main();
    })

    
};

export const extLocale = (ext: string) : string => {
    const { wapi } = window.__builder_context;

    for(const locale in wapi.info.locales) {
        if(wapi.info.locales[locale] === ext) return locale;
    }

    throw new Error(`locale ext : ${ext} is not exist.`)
}

export const medelToRef = (model: (any & { _id: string }) | (any & { id: string })[], type: string, query?: string) => {
    if(Array.isArray(model)) return model.map(model => medelToRef(model, type));
    else return { __ref: `Model_${type}_${query || ""}_${getModelID(model)}` };
}

export const parseLocales = (locales: InitInfo["locales"]) : ParsedInitInfo["locales"] => {
    const parsedLocales : ParsedInitInfo["locales"] = {};

    locales.forEach(locale => parsedLocales[locale.name] = locale.ext);

    return parsedLocales;
}

export const appendSection = (comp: ParsedComp & { symbol?: BuilderSymbol }, index, target?: string) => {
    const { wapi, page } = window.__builder_context;
    const compName = comp?.symbol?.comp || comp.name;
    const sectionComp = wapi.sections[compName];
    const section = PageSection.create(
        compName, undefined,
        comp?.symbol ?
        { __ref: `Symbol_${comp?.symbol?._id}`, name: comp?.symbol?.__name } : {}, index
    );

    page.module.locale.sections.appendSection(section, sectionComp.fixed, index, target);
}

export const capitalize = (word: string) : string => {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export const parseMediaLocalUrl = (url: string) => {
    if(url && url.indexOf("http") !== 0) return ( new URL(url, config.UI_HOST).href);

    return url;
};

export const parseDefaultData = (data: any, props: Props | Field) => {
    if(data) {
        if(Array.isArray(data) && props instanceof ListField) {
            for(const key in data) {
                if(typeof data[key] === "object") {
                    if(Array.isArray(data[key]) && props.__args.dynamic) {
                        if(typeof data[key][1] === "string") data[key] = [data[key][0], {}, data[key][1]];
                        
                        parseDefaultData(data[key][0], Props.create(props.__args.props[data[key][2]]));
                    } else if(props.__args.dynamic) parseDefaultData(data[key], Props.create(props.__args.props[data[key].__comp]));
                    else parseDefaultData(data[key], Props.create(props.__args.props));
                } else data[key] = parseDefaultData(data[key], Props.create(props.__args.props));
            }
        } else if(typeof data === "object" && !(props instanceof Field && props.__type === FieldTypes.Model)) {
            for (const [key, value] of Object.entries(data)) {
                if(key.indexOf("__") !== 0) {
                    if(Array.isArray(value)) {
                        const lprops = props.__read(key, data)
                        if(lprops instanceof ListField) {
                            if(lprops.__args.dynamic) parseDefaultData(value, lprops);
                            else value.forEach(value => parseDefaultData(value, props.__read(`${key}`, data)));

                            data[key] = [value, {}];
                        }
                    } else if (typeof value === "object") {
                        parseDefaultData(value, props.__read(key, data));
                    } else {
                        data[key] = [value, {}];
                    }
                }
            }
            data.__style = data.__style || {};
        } else if(!(props instanceof Field && props.__type === FieldTypes.Model)) return [data, {}];
    }
}

export const updateUiData = (data: Data) => {
    const context = window.__builder_context;
    
    context.page.module.compare();
    if (data.__section.section.comp === "__PageInfo") {
        context.page.module.locale.sections.updateView(() => ({ 
            info: data.__section.section.activeParsed.data
        }));
    } else if (data.__section.section.comp === "__DomainTheme") {
        context.page.module.locale.sections.updateView(() => ({ 
            theme: data.__section.section.activeParsed.data
        }));
    } else {
        context.page.module.locale.sections.updateView(() => ({ 
            edit: [[data.__section.section.activeParsed, data.__section.section.parsedIndex]]
        }));
    }
}

export const reloadFrame = () => {
    const frame = document.getElementById("__Builder-Preview-Frame") as HTMLIFrameElement;
    const params = (new URL(window.location.href));
    const locale = params.searchParams.get("locale");

    frame.src = config.UI_HOST + (locale ? "/" +  locale : "") + "/dev/";
}

export const loopObject = (obj, callback: (key: string, value: any) => void) => {
    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === "object") {
            loopObject(value, callback);
        } else {
            callback(key, value);
        }
    }

    return;
}

export const loopObjectWithPromise = async (obj, callback: (key: string, value: any) => Promise<void>) => {
    for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === "object") {
            await loopObjectWithPromise(value, callback);
        } else {
            await callback(key, value);
        }
    }

    return;
}

export const changeURLPageParam = () => {
    const url = new URL(window.location.href);

    url.searchParams.set("page", window.__builder_page.document.slug);
    url.searchParams.set("locale", window.__builder_page.locale.locale);

    window.history.pushState("", "", url.href);
}

export const storeModel = (model: any, id: string) => {
    const page = window.__builder_page;

    if(!page.document.models) page.document.models = {};
    page.document.models[id] = model;
}

export const formatBytes = (bytes : number, decimals = 2) : string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const setTransformStyle = (
    transform: ReturnType<typeof getTransformStyle>,
    {scaleX, scaleY, rotate} : { scaleX?: number, scaleY?: number, rotate?: number }
) : string => {
    return `scale(${typeof scaleX === "number" ? scaleX : transform.scale[0]}, ${typeof scaleY === "number" ? scaleY : transform.scale[1]}) rotate(${typeof rotate === "number" ? rotate : transform.rotate}deg)`;
}

export const getTransformStyle = (style: string | undefined) : { scale: [number, number], rotate: number } => {
    if(!style) return { scale: [1, 1], rotate: 0 };

    const scale = style.match(/.*scale\(([^\,)]+)(?: *, *([^\)]+))?\).*/);
    const rotate = style.match(/.*rotate\(([^\)]+)deg\).*/)?.[1];

    return { scale: [parseFloat(scale?.[1] || "1"), parseFloat(scale?.[2] || scale?.[1] || "1")], rotate: parseFloat(rotate || "0") }
}

export const groupStyles = (styles: CompStyleProps) : CompGroupedStyles => {
    const groupedStyles : CompGroupedStyles = {};

    Object.keys(styles).forEach(key => {
        if(["spacing", "transform"].includes(key)) {
            if(!groupedStyles["spacing"]) groupedStyles.spacing = {};
            groupedStyles.spacing[key] = styles[key];
        } else {
            if(!groupedStyles["style"]) groupedStyles.style = {};
            groupedStyles.style[key] = styles[key];
        }
    });

    return groupedStyles;
}

export const ungroupComps = (groupedComps: BuilderGroupedComps, type: ParsedComp["type"]) : BuilderComps => {
    const comps: BuilderComps = {};

    for(let groupKey in groupedComps) {
        const group = groupedComps[groupKey];

        group.forEach(section => {
            comps[section.name] = {
                ...section,
                props: section.props.__type === undefined ? 
                    Props.create({...(section.props as CompPropsObject), __style: section.style as any }) :
                    Field.__create({...(section.props as FieldObject), __style: section.style as any }),
                display: section.display || "block",
                style: section.style || {},
                fixed: Boolean(section.fixed),
                type
            };
        })
    }

    return comps;
};

export const splitSetionsGroupes = (sections: PageSection[]) => {
    const res : PageSection[][] = [];

    sections.sort((s1, s2) => s1.index as number - (s2.index as number)).forEach(section => {
        if(res.length === 0) res.push([section]);
        else {
            const delta = section.index as number - (res[res.length - 1][res[res.length - 1].length - 1].index as number);

            if(delta === 1) res[res.length - 1].push(section);
            else res.push([section]);
        }
    });

    return res;
};

export const splitCompsGroupes = (comps: ListItemData[]) => {
    const res : ListItemData[][] = [];

    comps.sort((c1, c2) => c1.__index as number - (c2.__index as number)).forEach(comp => {
        if(res.length === 0) res.push([comp]);
        else {
            const delta = comp.__index as number - (res[res.length - 1][res[res.length - 1].length - 1].__index as number);

            if(delta === 1) res[res.length - 1].push(comp);
            else res.push([comp]);
        }
    });

    return res;
}


let ActionID = 0;


export const contextFunctions = () => {
    const context = window.__builder_context;
    const page = window.__builder_page;

    return {
        sections: {
            copy : () => context.page.module.locale.sections.copy(),
            paste: async (offset : number = 0) => {
                try {
                    const targetAction = `_Sections_${ActionID++}`;
                    const targets = window.__builder_context.targets;
                    const strData = window.localStorage.getItem(BuilderStorage.Copied_Sections);
                    if(strData) {
                        const data = JSON.parse(strData) as PageSectionObject[];
                        const index = targets.section ? targets.section?.[0].index as number + 1 : page.locale.sections.length;

                        targets.set({ type: TargetsActions.ResetSelection });

                        for(let index2 = 0; index2 < data.length; index2++) {
                            const data2 = data[index2];

                            await loadDataModels(data2)

                            data2.cond.media = targets.devices.map(device => device.name);
                            const section = new PageSection(data2);
                            const sectionComp = context.wapi.sections[readSection(data2)[0].comp];

                            page.locale.sections.appendSection(section, sectionComp.fixed, index + index2 + offset, "Paste" + targetAction);
                        }

    
                    }

                } catch { console.error("Unvalid Compied Sections JSON DATA.") }
            },
            delete: () => {
                const targetAction = `_Sections_${ActionID++}`;
                const sections = window.__builder_context.targets.sections;
                sections.sort((s1, s2) => s2.index as number - (s1.index as number)).forEach(section => {
                    section.delete("Delete" + targetAction);
                });
            },
            dublicate: () => {
                let index = 0;
                const targetAction = `_Sections_${ActionID++}`;
                const sections = window.__builder_context.targets.sections;
                splitSetionsGroupes(sections).forEach(sections => {
                    sections.forEach(section => {
                        section.dublciate(index + sections.length - 1,"Dublicate" + targetAction);
                    });
                    index += sections.length;
                })
            }
        },
        comps: {
            copy : () => {},
            paste : () => {},
            delete : () => {},
            dublicate : () => {},
        },
        list: {
            copy: () => (context.targets.comp?.[0] as ListItemData).__parent.copy(),
            paste: (offset: number = 0) => {
                try {
                    const targetAction = `_List_${ActionID++}`;
                    const targets = window.__builder_context.targets;
                    const strData = window.localStorage.getItem(BuilderStorage.Copied_List_Items);
                    if(strData) {
                        const data = JSON.parse(strData) as any[];
                        const item = (targets.comp?.[0] as ListItemData | ListData);
                        const index = item instanceof ListItemData ? item.__index as number + 1 : item.length;

                        targets.set({ type: TargetsActions.ResetSelection });

                        data.forEach((data, index2) => {
                            (item instanceof ListItemData ? item.__parent : item).add(data, index + index2 + offset, "Paste" + targetAction, true, Array.isArray(data) ? data[2] : data.__comp);
                        })
                    }

                } catch(error) { console.error("Unvalid Compied Comps JSON DATA : \n", error) }
            },
            delete: () => {
                const targetAction = `_List_${ActionID++}`;
                const items = window.__builder_context.targets.comps as ListItemData[];
                items.sort((c1, c2) => c2.__index as number - (c1.__index as number)).forEach(item => {
                    item.__delete("Delete" + targetAction);
                });
            },
            dublicate: () => {
                let index = 0;
                const targetAction = `_List_${ActionID++}`;
                const items = window.__builder_context.targets.comps as ListItemData[];
                splitCompsGroupes(items).forEach(items => {
                    items.forEach(item => {
                        item.__dublicate("Dublicate" + targetAction);
                    });
                    index += items.length;
                })
            }
        }
    }
}

export const layerContextMethods = (layer : ExpandedLayer, ui: boolean = false) : BuilderContextMenuProps["props"] => {
    const { layout } = window.__builder_context;
    const uiMethods : BuilderContextMenuProps["props"][0] = [
        {
            name: "Find Layer",
            callBack: () => {
                layout.set({ type: LayoutActions.ChangePanel, panel: "Layers" });
                layer.layer.foucs();
            },
            disabled: !ui
        },
        {
            name: "Edit Data",
            callBack: () => {
                layout.set({ type: LayoutActions.ChangePanel, panel: "Edit" });
            }
        }
    ]

    switch(layer.type) {
        case LayersTypes.Section : return [
            [
                {
                    name: "Create Symbol",
                    callBack: () => {
                        layout.set({
                            type: LayoutActions.Modal,
                            modal: BuilderModals.CreateSymbol,
                            opened: true,
                            callBack: async (name, close) => {
                                await layer.section.convertSymbol(name);
                                close();
                            }
                        });
                    },
                    disabled: layer.section.symbol !== null
                },
                {
                    name: "Expand",
                    callBack: () => {
                        layer.section.expandSymbol();
                    },
                    disabled: layer.section.symbol === null
                }
            ],
            uiMethods,
            [
                {
                    name: "cut",
                    callBack: () => {
                        window.__builder_functions.copy();
                        window.__builder_functions.delete();
                    }
                },
                {
                    name: "copy",
                    callBack: () => window.__builder_functions.copy()
                },
                {
                    name: "paste before",
                    callBack: () => window.__builder_functions.paste(-1)
                },
                {
                    name: "paste after",
                    callBack: () => window.__builder_functions.paste()
                },
                {
                    name: "dublicate",
                    callBack: () => window.__builder_functions.dublicate()
                },
                {
                    name: "delete",
                    callBack: () => window.__builder_functions.delete()
                }
            ]
        ];
        case LayersTypes.Comp : return [
            uiMethods
        ];
        case LayersTypes.List : return [
            uiMethods,
            [
                {
                    name: "paste before",
                    callBack: () => window.__builder_functions.paste(-layer.data.length)
                },
                {
                    name: "paste after",
                    callBack: () => window.__builder_functions.paste()
                },
            ]
        ];
        case LayersTypes.ListItem: return [
            uiMethods,
            [
                {
                    name: "cut",
                    callBack: () => {
                        window.__builder_functions.copy();
                        window.__builder_functions.delete();
                    }
                },
                {
                    name: "copy",
                    callBack: () => window.__builder_functions.copy()
                },
                {
                    name: "paste before",
                    callBack: () => window.__builder_functions.paste(-1)
                },
                {
                    name: "paste after",
                    callBack: () => window.__builder_functions.paste()
                },
                {
                    name: "dublicate",
                    callBack: () => window.__builder_functions.dublicate()
                },
                {
                    name: "delete",
                    callBack: () => window.__builder_functions.delete()
                }
            ]
        ];
        default: return [uiMethods];
    }
}