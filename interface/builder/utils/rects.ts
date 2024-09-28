import { WapiRequests, WapiTargetRequest } from "../types";
import { sendWapiRequest } from "../wapi";

export const getCompRect = (element : HTMLElement, position?: [number, number]) : DOMRect & { position?: ["top" | "bottom", "left" | "right"] } => {
    if(!(element instanceof HTMLElement)) return undefined;
    const rect = element.getBoundingClientRect();

    if(position) {
        const top = rect ? position[1] < rect.top + rect.height / 2 : null;
        const left = rect ? position[0] < rect.left + rect.width / 2 : null;
        const pos : WapiTargetRequest["hover"][1]["position"] = rect ? [top ? "top" : "bottom", left ? "left" : "right"] : null;

        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            position: pos
        } as WapiTargetRequest["hover"][1];
    }

    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
    } as DOMRect

};

export const updateRects = () => {
    const context = window.__builder_context;
    const targetRect = context.hcomp instanceof HTMLElement ? getCompRect(context.hcomp, [window.__builder_context.mx, window.__builder_context.my]) : undefined;
    const sectionRect = context.ssection instanceof HTMLElement ? getCompRect(context.ssection) : undefined;
    const compRect = context.scomp instanceof HTMLElement ? getCompRect(context.scomp) : undefined;

    if(sectionRect || compRect || targetRect)
        sendWapiRequest({ type: WapiRequests.UpdateRects, comp: compRect, section: sectionRect, target: targetRect });
    
};