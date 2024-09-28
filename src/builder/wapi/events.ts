import { WapiNativeEventClick, WapiNativeEventKeyDown, WapiNativeEventKeyUp, WapiNativeEventMouseMove, WapiNativeEventMouseUp, WapiRequests, WapiResponse } from "../types";

export const wapiOnClick = (callBack: (e: WapiNativeEventClick["data"]) => void) : () => void => {
    const handler = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const req = JSON.parse(e.data) as WapiResponse;

                if(req.type === WapiRequests.NativeEvent && req.event === "click") {
                    callBack(req.data);
                }
            }
        } catch(error) { throw error };
    };

    window.addEventListener("message", handler);
    
    return () => window.removeEventListener("message", handler);
}

export const wapiKeyDown = (callBack: (e: WapiNativeEventKeyDown["data"]) => void) : () => void => {
    const handler = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const req = JSON.parse(e.data) as WapiResponse;

                if(req.type === WapiRequests.NativeEvent && req.event === "keydown") {
                    callBack(req.data);
                }
            }
        } catch(error) { throw error };
    };

    window.addEventListener("message", handler);
    
    return () => window.removeEventListener("message", handler);
}

export const wapiKeyUp = (callBack: (e: WapiNativeEventKeyUp["data"]) => void) : () => void => {
    const handler = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const req = JSON.parse(e.data) as WapiResponse;

                if(req.type === WapiRequests.NativeEvent && req.event === "keyup") {
                    callBack(req.data);
                }
            }
        } catch(error) { throw error };
    };

    window.addEventListener("message", handler);
    
    return () => window.removeEventListener("message", handler);
}

export const wapiMouseOver = (callBack: () => void) : () => void => {
    const handler = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const req = JSON.parse(e.data) as WapiResponse;

                if(req.type === WapiRequests.NativeEvent && req.event === "mouseover") {
                    callBack();
                }
            }
        } catch(error) { throw error };
    };

    window.addEventListener("message", handler);
    
    return () => window.removeEventListener("message", handler);
}

export const wapiOnMouseMove = (callBack: (e: WapiNativeEventMouseMove["data"]) => void) : () => void => {
    const handler = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const { layout } = window.__builder_context;
                const req = JSON.parse(e.data) as WapiResponse;
                const frame = document.getElementById("__Builder-Preview");
                const box = frame?.getBoundingClientRect();

                if(req.type === WapiRequests.NativeEvent && req.event === "mousemove") {
                    callBack({
                        clientY: req.data.clientY * layout.scale + (box?.top || 0),
                        clientX: req.data.clientX * layout.scale + (box?.left || 0)
                    });
                }
            }
        } catch(error) { throw error };
    };

    window.addEventListener("message", handler);
    
    return () => window.removeEventListener("message", handler);
}

export const wapiOnMouseUp = (callBack: (e: WapiNativeEventMouseUp["data"]) => void) : () => void => {
    const handler = (e: MessageEvent) => {
        try {
            if(typeof e.data === "string") {
                const req = JSON.parse(e.data) as WapiResponse;

                if(req.type === WapiRequests.NativeEvent && req.event === "mouseup") {
                    callBack(req.data);
                }
            }
        } catch(error) { throw error };
    };

    window.addEventListener("message", handler);
    
    return () => window.removeEventListener("message", handler);
}