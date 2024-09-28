import { useEffect, useMemo, useRef, useState } from "react";
import { Data, Layer, LayerClass, PageSection, SectionDataLayer, SectionLayer } from "../classes";
import BuilderContextMenu, { BuilderContextMenuProps } from "../comps/ContextMenu";
import { ChevRightIcon } from "../icons";
import { TargetsActions, useBuilderContext } from "../states";
import { layerContextMethods, useContextMenu } from "../utils";

export const Map = () => {
    const { targets, page,layout } = useBuilderContext();
    const ref = useRef<HTMLElement>();
    const { eventHandler, setContextMenuName, setMenuActions } = layout.contextMenu;
    const map = useMemo<(Layer | SectionLayer)[]>(() => {
        const target = targets.comp || targets.section;

        if (target && target[0] instanceof Data && target[0].__layer) {
            if(target[0].__layer instanceof Layer) {
                return target[0].__layer.map.reverse();
            } else {
                return [target[0].__layer];
            }
        } else if (target && target[0] instanceof PageSection) {
            return [target[0].layer];
        } else return [];
    }, [targets.comp, targets.section]);

    const clickHandler = (layer: Layer | SectionLayer) => {
        if(layer instanceof SectionLayer && targets.comp) targets.comp?.[0].__deselect();
        else if(layer instanceof Layer) layer.data.__select();
    }

    return (
        <div ref={ref as any} id="__Builder-Map" onContextMenu={e => e.preventDefault()}>
            <div className="__Builder-Map-Item">
                <span   className="__Builder-Map-Item-Name"
                        onClick={() => targets.set({ type: TargetsActions.ResetSelection })}
                >
                        {page.state.title}
                </span>
                {map.length > 0 && <div className="__Builder-Map-Chev"></div>}
            </div>
            {map.map((layer, index) => (
                <div key={layer.id} className="__Builder-Map-Item" onClick={() => clickHandler(layer)} onContextMenu={e => {
                    clickHandler(layer);
                    setContextMenuName(layer.name);
                    setMenuActions(layerContextMethods((layer as LayerClass).expanded, true))
                    eventHandler(e as any);
                }} >
                    <span className="__Builder-Map-Item-Name">{layer.name}</span>
                    <div className="__Builder-Map-Chev"></div>
                </div>
            ))}
        </div>
    )
}

export default Map;