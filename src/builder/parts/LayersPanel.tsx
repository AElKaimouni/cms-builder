import React, { useEffect, useRef, useState } from "react";
import { Data, Layer as LayerClass, SectionData } from "../classes";
import BuilderContextMenu, { BuilderContextMenuProps } from "../comps/ContextMenu";
import { Add2Icon, ArrowDownIcon, ArrowRightIcon, ChevDownIcon, ChevRightIcon, CloseIcon, DublicateIcon, HtmlIcon, MoveIcon } from "../icons";
import { TargetsActions, useBuilderContext } from "../states";
import { ExpandedLayer, ExpandedSectionLayer, LayersTypes } from "../types";
import { useActivePanelHandler, useContextMenu, useContextMenuProps, useLayer } from "../utils";

export interface LayersContextObject {
    eventHandler: ReturnType<typeof useContextMenu>["eventHandler"];
    setContextMenuName: React.Dispatch<React.SetStateAction<string>>;
    setMenuActions: React.Dispatch<React.SetStateAction<BuilderContextMenuProps["props"]>>;
}

const LayersContext = React.createContext<LayersContextObject>({} as any);

interface RootLayersProps {
    layers: ExpandedSectionLayer[];
    name: string;
}

const RootLayer = ({ layers, name } : RootLayersProps) => {
    const [open, setOpen] = useState<boolean>(true);
    
    return (
        <>
            {layers.length > 0 && <div className={"__Builder-Layer"} >
                <div className="__Builder-Layer-Card">
                    <div className="__Builder-Layer-Toggler" onClick={() => setOpen(!open)}>
                        {!open && <ArrowRightIcon />}
                        {open && <ArrowDownIcon />}
                    </div>
                    <div className="__Builder-Layer-Name">
                        <HtmlIcon />
                        <span>{name}</span>
                    </div>
                </div>
                <div className={`__Builder-Layer-Childs ${open ? "__Builder-Active" : ""}`}>
                    <LayersList layers={layers} />
                </div>
            </div>}
        </>
    )
}

interface LayerProps {
    layer: ExpandedLayer;
    controller: [boolean, () => void];
}

const Layer = ({ layer, controller } : LayerProps) => {
    const { targets } = useBuilderContext();
    const layersContext = React.useContext(LayersContext);
    const { ref, classes, icon, methods, renameProps, selectProps, symbol, id } = useLayer(layer, controller, layersContext);

    return (
        <div id={id} className={classes} ref={ref as any}>
            <div className="__Builder-Layer-Card">
                <div className="__Builder-Layer-Toggler" onClick={controller[1]}>
                    {layer.childs.length > 0 && <>
                        {!controller[0] && <ArrowRightIcon />}
                        {controller[0] && <ArrowDownIcon />}
                    </>}
                </div>
                <div className="__Builder-Layer-Name" {...selectProps as any}>
                    {symbol && <span className="__Builder-Layer-Symbol">S</span>}
                    {icon}
                    <span {...renameProps as any} >{layer.name}</span>
                </div>
                <div className="__Builder-Layer-Methods">
                    {methods.map((method, index) => (
                        <button {...method.events as any} key={index} onClick={method.handler}>
                            {method.icon}
                        </button>
                    ))}
                </div>
            </div>
            {(layer.childs.length > 0 && controller[0]) && <div className={`__Builder-Layer-Childs ${controller[0] ? "__Builder-Active" : ""}`}>
                {layer.type == LayersTypes.Section && <LayersList layers={layer.childs.find(child => {
                    return child.cond.media.includes(targets.device.name)
                })?.layers || []} />}
                {layer.type != LayersTypes.Section && <LayersList layers={layer.childs} />}
            </div>}
        </div>
    )
}

const LayersList = ({ layers }: { layers: ExpandedLayer[] }) => {
    const initMap = {};

    for(let layer of layers) {
        initMap[layer.id] = layer.data instanceof SectionData ? layer.data.section.layer.isOpen : layer.data.__layer?.isOpen;

        layer.layer.toggle = val => {
            setLayersMap(map => ({...map, [layer.id] : val}));
            layer.layer.isOpen = val;
        }

    }

    const [layersMap, setLayersMap] = useState<{[key: number]: boolean}>(initMap);

    return (
        <div className="__Builder-Layers-List">
            {layers.map((layer, index) => (
                <Layer
                    key={index} 
                    layer={layer}
                    controller={[
                        layersMap[layer.id],
                        () => {
                            setLayersMap(map =>{
                                layer.layer.isOpen = !map[layer.id];
                                return ({...map, [layer.id] : !map[layer.id]})
                            });
                        }
                    ]}
                />
            ))}
        </div>
    )
};

const LayersPanel = () => {
    const ref = useRef<HTMLElement>();
    const { page, targets, layout } = useBuilderContext();
    const { eventHandler, setContextMenuName, setMenuActions } = layout.contextMenu;
    useActivePanelHandler(ref, "Layers");

    return (
        <LayersContext.Provider value={{ eventHandler, setContextMenuName, setMenuActions }}>
            <div ref={ref as any} id="__Builder-Layers" onClick={e => {
                if(e.target instanceof HTMLElement && !e.target.closest(".__Builder-Layer")) {
                    targets.set({ type: TargetsActions.ResetSelection })
                }
            }} onContextMenu={e => {
                if(e.target instanceof HTMLElement && !e.target.closest(".__Builder-Layer")) {
                    targets.set({ type: TargetsActions.ResetSelection });
                    eventHandler(e as any);
                    setContextMenuName("Layers");
                    setMenuActions([
                        [
                            {
                                name: "paste before",
                                callBack: () => window.__builder_functions.paste(-window.__builder_page.locale.sections.length)
                            },
                            {
                                name: "paste after",
                                callBack: () => window.__builder_functions.paste()
                            }
                        ]
                    ])
                }
            }}>
                <RootLayer name="Fixed" layers={page.state.layers.fixed.filter(layer => {
                    return layer.cond.media.includes(targets.device.name)
                })} />

                <RootLayer name="Body" layers={page.state.layers.indexed.filter(layer => {
                    return layer.cond.media.includes(targets.device.name)
                })} />
            </div>
        </LayersContext.Provider>

    )
}

export default LayersPanel;