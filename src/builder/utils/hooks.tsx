import { Dispatch, FormEvent, useEffect, useReducer, useRef, useState } from "react";
import { Field, Layers, ListField, PageSection, PageSections, Props } from "../classes";
import { BuilderContextMenuProps } from "../comps/ContextMenu";
import { BooleanField, NumberField, StringField } from "../comps/Fields";
import ModelField from "../comps/Fields/Model";
import { Add2Icon, CloseIcon, DublicateIcon, HtmlIcon, ListLayerIcon, ModelIcon, MoveIcon, NumberIcon, SectionIcon, SwitchIcon, TextIcon, ZoneIcon } from "../icons";
import { LayersContextObject } from "../parts/LayersPanel";
import { LayoutActions, useBuilderContext } from "../states";
import { ContextObject, ExpandedLayer, FieldTypes, LayersTypes, WapiRequests } from "../types";
import { sendWapiRequest } from "../wapi";
import { layerDragHandler, layerRenameHandler } from "./events";
import { layerContextMethods } from "./fonctions";
import { BuilderModals } from "./modals";

export function useInputValidator<Type = any>(validator: (value: Type) => string | void) {
    const [error, setError] = useState<string>("");

    return { controller: [error, setError] as [string, Dispatch<string>], validator };
}

export const useContextMenuProps = () => {
    const [contextMenuName, setContextMenuName] = useState<string>("");
    const [menuActions, setMenuActions] = useState<BuilderContextMenuProps["props"]>([]);

    return { contextMenuName, setContextMenuName, menuActions, setMenuActions }
}

export const useActivePanelHandler = (ref: React.MutableRefObject<HTMLElement | undefined>, panel: ContextObject["layout"]["panel"]) => {
    const {layout } = useBuilderContext();

    useEffect(() => {
        const element = ref.current;
        if(element) {
            const overHandler = () => layout.set({ type: LayoutActions.SetActivePanel, panel: panel });

            element.addEventListener("mouseover", overHandler);

            return () => {  
                element.addEventListener("mouseover", overHandler);
            }
        }
    }, [ref.current]);
}

export const useFieldMiddleValue = (value, defaultValue) => {
    const [middleValue, setMiddleValue] = useState<any>();
    const [selfEdit, setSelfEdit] = useState<boolean>(false);
    const focusHandler = () => setSelfEdit(true);
    const blurHabdler = () => setSelfEdit(false);
    
    useEffect(() => { if(!selfEdit) setMiddleValue(value || defaultValue); }, [value]);

    return { middleValue, setMiddleValue, events: { onFocus: focusHandler, onBlur: blurHabdler } }
}

export const useGroupes = () : [{ [key: string] : boolean }, (group: string) => void] => {
    const [groupes, setGroupes] = useState<{ [key: string] : boolean }>({});

    return [ groupes,  (group: string) => {
        setGroupes({ ...groupes, [group] : !(groupes[group] !== false) })
    } ]
}

export const useContextMenu = (ref: React.MutableRefObject<HTMLElement | undefined>) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [position, setPosition] = useState<BuilderContextMenuProps["position"]>({ x: 0, y: 0 });
    const [box, setBox] = useState<DOMRect>();
    const eventHandler = (e: MouseEvent) => {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setIsOpen(true);
        setBox(ref.current?.getBoundingClientRect())
    };

    return { props: { controller: [isOpen, setIsOpen] as BuilderContextMenuProps["controller"], position, box }, eventHandler };
}

export const useLayer = (layer: ExpandedLayer, controller: [boolean, () => void], layersContext: LayersContextObject) => {
    const { eventHandler, setContextMenuName, setMenuActions } = layersContext;
    const { layout, targets } = useBuilderContext();
    const ref = useRef<HTMLElement>();
    const clickHandler = () => {
        if(layer.type === LayersTypes.Section) {
            layer.section.select();
        } else layer.data.__select();
        const context = layer.type === LayersTypes.Section ? layer.section.data.activeData.data.__context : layer.data.__context;

        sendWapiRequest({ type: WapiRequests.FocusContext, context });
    }
    const icon = (() => {
        switch(layer.type) {
            case LayersTypes.Section: return <SectionIcon />
            case LayersTypes.List: {
                if(layer.data.__dynamicList) return <ZoneIcon />;
                else return <ListLayerIcon />;
            };
            case LayersTypes.Data: {
                if(layer.data.__props instanceof Field) switch(layer.data.__props.__field.__type) {
                    case FieldTypes.String: return <TextIcon />;
                    case FieldTypes.Number: return <NumberIcon />;
                    case FieldTypes.Boolean: return <SwitchIcon />;
                    case FieldTypes.Model: return <ModelIcon />;
                }

                return <HtmlIcon />
            };
            case LayersTypes.ListItem: {
                const props = layer.data.__props;

                if(props instanceof Props) return <HtmlIcon />;
                else switch(props.__field.__type) {
                    case FieldTypes.String: return <TextIcon />;
                    case FieldTypes.Number: return <NumberIcon />;
                    case FieldTypes.Boolean: return <SwitchIcon />;
                    case FieldTypes.Model: return <ModelIcon />;
                    default : return <HtmlIcon />;
                }
            };
            default: return <HtmlIcon />
        }
    })();
    const methods = (() => {
        switch(layer.type) {
            case LayersTypes.Section: return [
                {
                    name: "dublicate",
                    icon: <DublicateIcon />,
                    handler: () => {
                        layer.section.dublciate()
                    }
                },
                {
                    name: "delete",
                    icon: <CloseIcon />,
                    handler: () => {
                        layer.section.delete();
                    }
                },
                {
                    name: "move",
                    icon: <MoveIcon />,
                    events: layerDragHandler(layer, controller[1], ref, controller[0])
                }
            ];
            case LayersTypes.List: return [
                {
                    name: "add",
                    icon: <Add2Icon />,
                    handler: () => {
                        if(!layer.data.__dynamicList) layer.data.add();
                        else {
                            const comps = Object.keys((layer.data.__props as ListField).__args.props);
                            layout.set({ type: LayoutActions.Modal, modal: BuilderModals.CompsModal, comps, callBack: comp => {
                                layer.data.add(undefined, undefined, undefined, true, comp);

                            } });
                        }
                    }
                }
            ];
            case LayersTypes.ListItem: return [
                {
                    name: "dublicate",
                    icon: <DublicateIcon />,
                    handler: () => {
                        layer.data.__dublicate();
                    }
                },
                {
                    name: "delete",
                    icon: <CloseIcon />,
                    handler: () => {
                        layer.data.__delete();
                    }
                },
                {
                    name: "move",
                    icon: <MoveIcon />,
                    events: layerDragHandler(layer, controller[1], ref, controller[0])
                }
            ];
            default: return [];
        }
    })();
    const renameProps = (() => {
        if([LayersTypes.Section, LayersTypes.ListItem].includes(layer.type)) {
            return layerRenameHandler(layer);
        } else return {};
    })();
    const selected = (() => {
        switch(layer.type) {
            case LayersTypes.Section : return Boolean(targets.sections.find(section => section.id === layer.section.id) && !targets.comp);
            default : return Boolean(targets.comps.find(comp => comp.__id === layer.data.__id));
        }
    })();
    const classes = (() => {
        const baseClasses = `__Builder-Layer ${selected ? "__Builder-Selected" : ""}`;
        const classes = (() => {
            switch(layer.type) {
                case LayersTypes.Section: return "__Builder-Section-Layer";
                case LayersTypes.Comp: return "__Builder-Comp-Layer";
                case LayersTypes.List: return "__Builder-List-Layer";
                case LayersTypes.ListItem: return "__Builder-List-Item-Layer";
            }
        })();

        return `${baseClasses} ${classes}`;
    })();
    const selectProps = (() => {
        switch(layer.type) {
            case LayersTypes.Section : return {
                onClick: clickHandler,
                onContextMenu: e => {
                    const functions = window.__builder_functions;

                    if(!layer.section.selected) layer.section.select();
                    
                    setContextMenuName(layer.name);
                    eventHandler(e as any);
                    setMenuActions(layerContextMethods(layer))
                }
            };
            case LayersTypes.Comp : return {
                onClick: clickHandler,
                onContextMenu: e => {
                    const functions = window.__builder_functions;

                    if(!layer.data.__selected) layer.data.__select();
                    
                    setContextMenuName(layer.name);
                    eventHandler(e as any);
                    setMenuActions(layerContextMethods(layer))
                }
            };
            case LayersTypes.Data : return {
                onClick: clickHandler,
                onContextMenu: e => {
                    const functions = window.__builder_functions;

                    if(!layer.data.__selected) layer.data.__select();
                    
                    setContextMenuName(layer.name);
                    eventHandler(e as any);
                    setMenuActions(layerContextMethods(layer))
                }
            };
            case LayersTypes.List : return {
                onClick: clickHandler,
                onContextMenu: e => {
                    const functions = window.__builder_functions;

                    if(!layer.data.__selected) layer.data.__select();
                    
                    setContextMenuName(layer.name);
                    eventHandler(e as any);
                    setMenuActions(layerContextMethods(layer))
                }
            };
            case LayersTypes.ListItem: return {
                onClick: clickHandler,
                onContextMenu: e => {
                    const functions = window.__builder_functions;

                    if(!layer.data.__selected) layer.data.__select();
                    
                    setContextMenuName(layer.name);
                    eventHandler(e as any);
                    setMenuActions(layerContextMethods(layer))
                }
            }
            default: return {};
        }
    })();
    const symbol = (() => {
        if(layer.type === LayersTypes.Section) {
            return layer.section.symbol !== null;
        }

        return false
    })();
    const id = `__Builder-Layer-${layer.id}`;

    return { ref, icon, classes, methods, renameProps, selected, selectProps, symbol, id }
}