import { Dispatch, MutableRefObject } from "react";
import { CompField, Data, ListItemData, PageSection, SectionLayer } from "../classes";
import { TargetsActions } from "../states";
import { ExpandedLayer, LayersTypes, ParsedComp, WapiRequests } from "../types";
import { sendWapiRequest, wapiOnMouseMove, wapiOnMouseUp } from "../wapi";
import { appendSection, updateUiData } from "./fonctions";

let CompDragMoveCounter = 0;

export const compDragHandler = (comp: ParsedComp | PageSection | ListItemData) => ({
    onMouseDown: (e: MouseEvent) => {
        const compElement = document.getElementById("__Builder-Drag-Comp");
        if(compElement instanceof HTMLElement) {
            let closeWapiMouseMove, closeWapiMouseUp;
            const movehandler = (e: MouseEvent) => {
                compElement.style.top = e.clientY + "px";
                compElement.style.left = e.clientX + "px";
            };
            const upHandler = () => {
                const { targets, wapi } = window.__builder_context;

                if((comp instanceof PageSection || (!(comp instanceof Data) && comp.type === "section")) && targets.hcomp && targets.hcomp[0] instanceof PageSection) {
                    const position = targets.hcomp[1].position[wapi.sections[targets.hcomp[0]._section.comp].display === "block" ? 0 : 1];
                    const offset = ["top", "left"].includes(position) ? 0 : 1;
                    const index = (targets.hcomp[0].index || 0) + offset;

                    if(comp instanceof PageSection) {
                        if(comp.index !== index && index - (comp.index || 0) !== 1) comp.move(index);
                        else sendWapiRequest({ type: WapiRequests.ActionContext, action: "show", context: comp.data.activeData.data.__context });
                    } else {
                        appendSection(comp, index);
                    }
                } else if ((comp instanceof Data || (!(comp instanceof PageSection) && comp.type !== "section")) && targets.hcomp && targets.hcomp[0] instanceof ListItemData) {
                    const compName = comp instanceof Data ? comp.__dynamicComp : comp.name;
                    const position = targets.hcomp[1].position[(wapi.elements[compName] || wapi.comps[compName] || { display: "inline" }).display === "block" ? 0 : 1];
                    const offset = ["top", "left"].includes(position) ? 0 : 1;
                    const index = (targets.hcomp[0].__index || 0) + offset;
                    const data = targets.hcomp[0];

                    if(comp instanceof ListItemData) {
                        if(comp.__parent.__id === targets.hcomp[0].__parent.__id) {
                            comp.__move(index);
                        } else {
                            const action = `Comp_Grap_Move_${CompDragMoveCounter++}`;
                            comp.__delete(action);
                            targets.hcomp[0].__parent.add(comp.__data, index, action, true, comp.__dynamicComp);
                        }
                        sendWapiRequest({ type: WapiRequests.ActionContext, action: "show", context: comp.__context });
                    } else {
                        data.__parent.add(undefined, index, undefined, true, compName);
                        updateUiData(data);
                    }
                } else if (comp instanceof PageSection) {
                    sendWapiRequest({ type: WapiRequests.ActionContext, action: "show", context: comp.data.activeData.data.__context });
                } else if (comp instanceof ListItemData) {
                    sendWapiRequest({ type: WapiRequests.ActionContext, action: "show", context: comp.__context });
                }

                targets.set({ type: TargetsActions.GrapComp, comp: null });
                window.removeEventListener("mousemove", movehandler);
                window.removeEventListener("mouseup", upHandler);
                closeWapiMouseMove(); closeWapiMouseUp();
            };

            if(comp instanceof PageSection)
                sendWapiRequest({ type: WapiRequests.ActionContext, action: "hide", context: comp.data.activeData.data.__context });
            else if (comp instanceof Data)
                sendWapiRequest({ type: WapiRequests.ActionContext, action: "hide", context: comp.__context });

            window.__builder_context.targets.set({ type: TargetsActions.GrapComp, comp: (() => {
                const wapi = window.__builder_context.wapi;
                if(comp instanceof PageSection) return wapi.sections[comp.section.name];
                else if (comp instanceof Data) 
                    return wapi.comps[comp.__dynamicComp] || wapi.elements[comp.__dynamicComp] || comp;
                else return comp;
            })() });

            compElement.style.left = e.clientX + "px";
            compElement.style.top = e.clientY + "px";
    
            closeWapiMouseMove = wapiOnMouseMove(movehandler as any);
            closeWapiMouseUp = wapiOnMouseUp(upHandler as any);
            window.addEventListener("mousemove", movehandler);
            window.addEventListener("mouseup", upHandler);
        }
    }
});

export const layerDragHandler = (layer:  ExpandedLayer, toggleLayer: () => void, ref: MutableRefObject<HTMLElement | undefined>, reopen: boolean = false) => ({
    onMouseDown: (e: MouseEvent) => {
        const layerElement = ref.current;
        if(layerElement instanceof HTMLElement) {
            const parent = layerElement.closest(".__Builder-Layers-List") as HTMLElement;
            let index : null | number = null;
            let prevTarget: HTMLElement | null = null;

            if(reopen) toggleLayer();

            const rect = layerElement.getBoundingClientRect();
            const lx = e.clientX - rect.left;
            const ly = e.clientY - rect.top;

            layerElement.style.top = e.clientY - ly + "px";
            layerElement.style.left = e.clientX - lx + "px";

            layerElement.style.width = layerElement.clientWidth + "px";

            layerElement.classList.add("__Builder-Graped");
            parent.classList.add("__Builder-Graped");

            const clearPrevTarget = (target: typeof prevTarget = null) => {
                if(!target || !target.isSameNode(prevTarget)) {
                    if(prevTarget) prevTarget.classList.remove("__Builder-Top-Target", "__Builder-Bottom-Target");
                    prevTarget = target;
                }

            }

            const parentMoveHandler = (e: MouseEvent) => {
                const target = (e.target as HTMLElement).closest(".__Builder-Graped > .__Builder-Layer");

                if(target instanceof HTMLElement) {
                    const rect = target.getBoundingClientRect();
                    const top = e.clientY - rect.top <= rect.height / 2;

                    target.classList.remove(`__Builder-${top ? "Bottom" : "Top"}-Target`);
                    target.classList.add(`__Builder-${top ? "Top" : "Bottom"}-Target`);
                    index = [...parent.children].indexOf(target) + (top ? 0 : 1);
                    clearPrevTarget(target);
                }
            }

            const moveHandler = (e: MouseEvent) => {
                layerElement.style.top = (e.clientY - ly) + "px";
                layerElement.style.left = (e.clientX - lx) + "px";
            };

            const upHandler = (e: MouseEvent) => {
                if(typeof index === "number") switch(layer.type) {
                    case LayersTypes.Section: {
                        layer.section.move(index);
                    }; break;
                    case LayersTypes.ListItem: {
                        layer.data.__move(index);
                    }; break;
                }

                if(reopen) toggleLayer();

                layerElement.classList.remove("__Builder-Graped");
                parent.classList.remove("__Builder-Graped");
                layerElement.style.width = null as any;

                clearPrevTarget();
                window.removeEventListener("mousemove", moveHandler);
                window.removeEventListener("mouseup", upHandler);
                parent.removeEventListener("mousemove", parentMoveHandler);
            };

            window.addEventListener("mousemove", moveHandler);
            window.addEventListener("mouseup", upHandler);
            parent.addEventListener("mousemove", parentMoveHandler);
        }
    }
})

export const layerRenameHandler = (layer:  ExpandedLayer) => {
    let timeout, editable = false;
    const edit = (target: HTMLElement) => {
        const name = target.innerText.replace(/\n/g, "").replace(/(^ | $)/g, "");

        target.innerHTML = name;

        switch(layer.type) {
            case LayersTypes.Section: layer.section.rename(name); break;
            case LayersTypes.ListItem: layer.data.__rename(name); break;
            default: {}; break;
        }
    }

    return {
        onClick: (e: MouseEvent) => {
            const target = e.target;
            if(target instanceof HTMLElement) {
                if(!editable) {
                    target.setAttribute("contentEditable", "true");
                    editable = true;
                }
                if(timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                } else if(!editable) {
                    timeout = window.setTimeout(() => {
                        target.setAttribute("contentEditable", "false");
                        timeout = null;
                        editable = false;
                    }, 300);
                }
            }
        },
        onBlur: (e: Event) => {
            if(e.target instanceof HTMLElement) {
                e.target.setAttribute("contentEditable", "false");
                editable = false;
                timeout = null;

                edit(e.target);
            }
        },
        onInput: e => {
            const target = e.target ;
            if(target instanceof HTMLElement && e.nativeEvent && 
                (
                    e.nativeEvent.inputType === "insertParagraph" || 
                    (e.nativeEvent.inputType === "insertText" && !e.nativeEvent.data) 
                )
            ) {
                e.preventDefault();
                target.setAttribute("contentEditable", "false");
                editable = false;
                timeout = null;
            }
        }
    }
}