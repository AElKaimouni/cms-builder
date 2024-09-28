import { KeyboardEvent } from "react";
import { WapiRequests, WapiTargetRequest } from "../../types";
import { getCompRect, updateRects } from "../../utils";
import { sendWapiRequest } from "../../wapi";

export default (wresizeHandler: () => void) => {
    let hpos: WapiTargetRequest["hover"][1]["position"] = ["bottom", "left"];
    const mouseMoveHandler = (e: MouseEvent) => {
        window.__builder_context.mx = e.clientX;
        window.__builder_context.my = e.clientY;

        sendWapiRequest({ type: WapiRequests.NativeEvent, event: "mousemove", data: {
            clientY: e.clientY,
            clientX: e.clientX
        } });
        const etarget = e.target;

        if(etarget instanceof HTMLElement && !window.__builder_context.browseMode) {
            const { focus, childsOfContext } = window.__builder_context;
            const target = (etarget.closest(`[data-__builder-context${childsOfContext ? `='${childsOfContext}'` : ""}]${childsOfContext ? " > " : ""}${focus !== "both" ? `[data-__builder-type=${focus === "comps" ? "comp" : "section"}]` : ""}`) as HTMLElement) || null;
            const rect = target ? getCompRect(target, [e.clientX, e.clientY]) : null;
            
            if((!target && window.__builder_context.hcomp !== null) || (rect && rect.position && rect.position[0] !== hpos[0]) || (rect && rect.position && rect.position[1] !== hpos[1]) || (target && !target.isSameNode(window.__builder_context.hcomp))) {
                window.__builder_context.hcomp = target;
                if(rect && rect.position) {
                    hpos[0] = rect.position[0];
                    hpos[1] = rect.position[1];
                }

                sendWapiRequest({ type: WapiRequests.Target, hover: window.__builder_context.hcomp ? [
                    window.__builder_context.hcomp.getAttribute("data-__builder-context"),
                    {
                        ...rect,
                        position: hpos
                    }
                ] : null })
            }
        }
    };
    const mouseUpHandler = (e: MouseEvent) => {
        sendWapiRequest({ type: WapiRequests.NativeEvent, event: "mouseup", data: {
            clientY: e.clientY,
            clientX: e.clientX
        } });
    };
    const mouseOutHandler = () => {
        window.__builder_context.hcomp = null;
        sendWapiRequest({ type: WapiRequests.Target, hover: null });
    }
    const scrollHandler = () => {
        //sendWapiRequest({ type: WapiRequests.Scroll, offset: window.scrollY });
        updateRects();
    };
    const resizeHandler = () => {
        wresizeHandler();
        updateRects();
    }
    const resizeObserver = new ResizeObserver(() => {
        updateRects();
        sendWapiRequest({ type: WapiRequests.BodySize, size: document.body.clientHeight })
    });
    const SelectComp = (e: MouseEvent, menu: boolean = false) => {
        if(window.__builder_context.hcomp) sendWapiRequest({
            type: WapiRequests.Select,
            context: window.__builder_context.hcomp.getAttribute("data-__builder-contexts"),
            rect: getCompRect(window.__builder_context.hcomp),
            menu: menu ? {clientX: e.clientX, clientY: e.clientY} : undefined
        });
    }
    const mouseClickHandler = (e: MouseEvent) =>  {
        e.preventDefault();
        if(window.__builder_context.browseMode) {
            const linkElement = (e.target as HTMLElement).closest("a");
    
            if(linkElement instanceof HTMLAnchorElement) {
                const link = linkElement.getAttribute("href");
    
                if(link) sendWapiRequest({ type: WapiRequests.ChangeLink, link })
            }
        } else {
            SelectComp(e);
        }
        sendWapiRequest({
            type: WapiRequests.NativeEvent,
            event: 'click',
            data: {}
        });
    };
    const contextMenuHandler = (e: MouseEvent) =>  {
        e.preventDefault();
        SelectComp(e, true);
    }
    const mouseOverHandler = (e: MouseEvent) => {
        sendWapiRequest({ type: WapiRequests.NativeEvent, event: "mouseover" });
    };
    const keyDownHanler = (e: KeyboardEvent["nativeEvent"]) => {
        sendWapiRequest({ type: WapiRequests.NativeEvent, event: "keydown", data: { code: e.code } });
    };
    const keyUpHanler = (e: KeyboardEvent["nativeEvent"]) => {
        sendWapiRequest({ type: WapiRequests.NativeEvent, event: "keyup", data: { code: e.code } });
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseup", mouseUpHandler);
    document.addEventListener("mouseleave", mouseOutHandler);
    window.addEventListener("scroll", scrollHandler);
    window.addEventListener("resize", resizeHandler);
    resizeObserver.observe(document.body);
    window.addEventListener("click", mouseClickHandler);
    window.addEventListener("contextmenu", contextMenuHandler);
    document.addEventListener("mouseover", mouseOverHandler);
    window.addEventListener("keydown", keyDownHanler);
    window.addEventListener("keyup", keyUpHanler);

    return () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
        document.removeEventListener("mouseleave", mouseOutHandler);
        window.removeEventListener("scroll", scrollHandler);
        window.removeEventListener("resize", resizeHandler);
        resizeObserver.unobserve(document.body);
        window.removeEventListener("click", mouseClickHandler);
        window.removeEventListener("contextmenu", contextMenuHandler);
        document.removeEventListener("mouseover", mouseOverHandler);
        window.removeEventListener("keydown", keyDownHanler);
        window.removeEventListener("keyup", keyUpHanler);
    }
}