import { request } from "express";
import { Dispatch } from "react";
import { InitInfo, ParsedSectionObject, WapiRequest, WapiRequests, WapiResponse } from "../types";
import { getCompRect } from "../utils";

let done = false;



const wapi = async (
    initInfo : InitInfo,
    setSections: Dispatch<React.SetStateAction<ParsedSectionObject[]>>,
    setInfo: React.Dispatch<any>,
    setTheme: React.Dispatch<any>,
    setModel: React.Dispatch<any>
) => {
    
    window.__builder_context = {
        hcomp: null,
        scomp: null,
        ssection: null,
        focus: "both",
        mx: 0, my: 0,
        browseMode: false
    }

    const wapiHander = (e: MessageEvent) => {
        try {
            const req = JSON.parse(e.data) as WapiResponse;

            switch(req.type) {

                case WapiRequests.Data: {
                    if(req.info) setInfo(req.info);
                    if(req.theme) setTheme(req.theme);
                    if(req.set) setSections(req.set);
                    if(req.add) setSections(sections => {
                        const newSections = [...sections];

                        req.add.forEach(([section, index]) => {
                            if(typeof index === "number") newSections.splice(index, 0, section);
                            else newSections.push(section);
                            
                        })

                        return newSections;
                    });
                    if(req.delete) setSections(sections => sections.filter((s, index) => !req.delete.includes(index)));
                    if(req.edit) setSections(sections => {
                        const newSections = [...sections];

                        req.edit.forEach(([section, index]) => {
                            newSections[index] = section;
                        })

                        return newSections;
                    });
                    if(req.model) setModel(req.model);
                }; break;
                case WapiRequests.DOMRect: {
                    const target = document.querySelector(`[data-__builder-context="${req.context}"]`);

                    if(target instanceof HTMLElement) {
                        sendWapiRequest({ type: WapiRequests.DOMRect, rect: getCompRect(target), id: req.id });
                    } else sendWapiRequest({ type: WapiRequests.DOMRect, rect: null });
                }; break;
                case WapiRequests.Select: {
                    window.__builder_context.scomp = req.comp ? document.querySelector(`[data-__builder-context="${req.comp}"]`) : undefined;
                    window.__builder_context.ssection = req.section ? document.querySelector(`[data-__builder-context="${req.section}"]`) : undefined;
                }; break;
                case WapiRequests.SwitchFocus: {
                    window.__builder_context.focus = req.focus;
                    window.__builder_context.childsOfContext = req.childsOfContext;
                }; break;
                case WapiRequests.ActionContext: {
                    const element = document.querySelector(`[data-__builder-context="${req.context}"]`);

                    if(element instanceof HTMLElement) switch(req.action) {
                        case "hide": element.style.display = "none"; break;
                        case "show": element.style.removeProperty("display"); break;
                    }
                }; break;
                case WapiRequests.FocusContext: {
                    const element = document.querySelector(`[data-__builder-context="${req.context}"]`);
                    
                    if(element instanceof HTMLElement) {
                        if(element.clientHeight > window.innerHeight) element.scrollIntoView(true);
                        else element.scrollIntoView(false);
                    }
                }; break;
                case WapiRequests.SwitchBrowseMode: {
                    window.__builder_context.browseMode = req.mode;
                }; break;
                case WapiRequests.WindowSelection: {
                    const windowSelection = window.getSelection();
                    let anchorParent = windowSelection.anchorNode.parentNode;
                    let focusParent = windowSelection.focusNode.parentNode;
                    let anchorNode = windowSelection.anchorNode;
                    let focusNode = windowSelection.focusNode;
                    let anchor = 0, focus = 0;

                    do {
                        const anchorIndex = Array.prototype.indexOf.call(anchorParent.childNodes, anchorNode);

                        for(let i = 0; i < anchorIndex; i++) {
                            const child = anchorParent.childNodes[i];
                            anchor += child.textContent.length;
                        }
                        

                        anchorNode = anchorParent;
                        anchorParent = anchorNode.parentNode;
                    } while(anchorNode.nodeName !== "P");

                    if(!anchorNode.isSameNode(focusNode)) do {
                        const focusIndex = Array.prototype.indexOf.call(focusParent.childNodes, focusNode);

                        for(let i = 0; i < focusIndex; i++) {
                            const child = focusParent.childNodes[i];
                            focus += child.textContent.length;
                        }

                        focusNode = focusParent;
                        focusParent = focusNode.parentNode;
                    } while(focusNode.nodeName !== "P"); else focus = anchor;

                    const key = Array.prototype.indexOf.call(anchorParent.children, anchorNode);

                    sendWapiRequest({
                        type: WapiRequests.WindowSelection,
                        anchorOffset: anchor + windowSelection.anchorOffset,
                        focusOffset: focus + windowSelection.focusOffset,
                        anchorKey: key
                    });
                }
            }
        } catch {};
    };

    if(!done) {
        done = true;
        sendWapiRequest({ type: WapiRequests.Start, initInfo });

        window.addEventListener("message", wapiHander);
    }
}

export const sendWapiRequest = (request : WapiRequest) => {
    window.parent.postMessage(JSON.stringify(request), "*");
};


export const sendWapiRequestAsPromise = (request : WapiRequest) => {
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