import React, { useEffect, useReducer, useRef } from "react";
import { BuilderStorage, ContextObject, PageSectionObject, ParsedComp, WapiRequests } from "../types";
import { TargetsActions, useTargets } from "./targets";
import { LayoutActions, useLayout } from "./layout";
import { useActions } from "./actions";
import { usePage } from "./page";
import { useWapi } from "./wapi";
import { CompData, ListData, ListItemData, PageSection } from "../classes";
import { contextFunctions, splitCompsGroupes, splitSetionsGroupes } from "../utils";
import CompCard from "../comps/CompCard";
import { sendWapiRequest, wapiKeyDown, wapiKeyUp, wapiMouseOver } from "../wapi";

const BuilderContext = React.createContext<ContextObject>({} as any);

export const useBuilderContext = () => {
    return React.useContext(BuilderContext);
}
export const BuilderContextProvider = ({ children, context }) => {
    const ref = useRef();
    const page = usePage(context);
    const wapi = useWapi(page, context);
    const [ layout, modals ] = useLayout(ref, context);
    const targets = useTargets(wapi, page, context);
    const actions = useActions(context);

    useEffect(() => {
        window.__builder_keys = { ctrl: false, alt: false, shift: false };
        window.__builder_functions = {
            copy: () => alert("copy"),
            paste: () => alert("paste"),
            delete: () => alert("delete"),
            dublicate: () => alert("dublicate"),
        };


        const handler = (e: KeyboardEvent) => {
            let target : [string, string] | undefined;
            if(window.__builder_keys.ctrl && window.__builder_keys.shift) switch(e.code) {
                case "KeyW": {
                    e.preventDefault();
                    window.__builder_context.actions.redo?.();
                } break;
            } else if(window.__builder_keys.ctrl) switch(e.code) {
                case "KeyW": {
                    e.preventDefault();
                    window.__builder_context.actions.undo?.();
                } break;
                // case "KeyC": window.__builder_functions.copy?.(); break;
                // case "KeyV": window.__builder_functions.paste?.(); break;
                // case "KeyX": {
                //     window.__builder_functions.copy?.();
                //     window.__builder_functions.delete?.();
                // }; break;
                case "KeyD": {
                    e.preventDefault();
                    window.__builder_functions.dublicate?.();
                }
            } else switch(e.code) {
                case "Delete": window.__builder_functions.delete?.(); break;
            }
            
            switch(e.code) {
                case "ControlLeft": target = ["ctrl", "ControlLeft"]; break;
                case "ShiftLeft": target = ["shift", "ShiftLeft"]; break;
                case "AltLeft": target = ["alt", "AltLeft"]; break;
            }

            if(target !== undefined) {
                let clearKeyUpEvent;
                window.__builder_keys[target[0]] = true;

                const handler = (e2: KeyboardEvent) => {
                    if(e2.code === e.code) {
                        window.__builder_keys[(target as [string, string])[0]] = false;
                        document.removeEventListener("keyup", handler);
                        clearKeyUpEvent();
                    }
                };

                clearKeyUpEvent = wapiKeyUp(handler as any);
                document.addEventListener("keyup", handler);
            }

        };

        const clearKeyDown = wapiKeyDown(e => handler({ ...e, preventDefault: () => {} } as any));
        const clearMouseOver = wapiMouseOver(() => {
            layout.set({ type: LayoutActions.SetActivePanel, panel: "Layers" });
        });

        document.addEventListener("keydown", handler);

        return () => {
            document.removeEventListener("keydown", handler);
            clearMouseOver();
            clearKeyDown();
        };
    }, []);

    useEffect(() => {
        const functions = window.__builder_functions;
        const ctxFuncs = contextFunctions();

        if(layout.activePanel === "Layers") {
            if(targets.comp) {
                if(targets.comp[0] instanceof CompData) {
                    functions.copy = ctxFuncs.comps.copy;
                    functions.paste = ctxFuncs.comps.paste;
                    functions.delete = ctxFuncs.comps.delete;
                    functions.dublicate = ctxFuncs.comps.dublicate;
                } else if(targets.comp[0] instanceof ListItemData) {
                    functions.copy = ctxFuncs.list.copy;
                    functions.paste = ctxFuncs.list.paste;
                    functions.delete = ctxFuncs.list.delete;
                    functions.dublicate = ctxFuncs.list.dublicate;
                } else if(targets.comp[0] instanceof ListData) {
                    functions.copy = () => {};
                    functions.delete = () => {};
                    functions.dublicate = () => {};
                    functions.paste = ctxFuncs.list.paste;
                }
            } else if (targets.section) {
                functions.copy = ctxFuncs.sections.copy;
                functions.paste = ctxFuncs.sections.paste;
                functions.delete = ctxFuncs.sections.delete;
                functions.dublicate = ctxFuncs.sections.dublicate;
            } else {
                functions.copy = () => {};
                functions.delete = () => {};
                functions.dublicate = () => {};
                functions.paste = ctxFuncs.sections.paste;
            }
        } else {
            functions.copy = () => {};
            functions.delete = () => {};
            functions.dublicate = () => {};
            functions.paste = () => {};
        }

    }, [targets.comp, targets.section, layout.activePanel]);

    useEffect(() => {
        sendWapiRequest({ type: WapiRequests.SwitchBrowseMode, mode: layout.browseMode });
    }, [layout.browseMode, page]);

    return (
        <BuilderContext.Provider value={{
            layout,
            targets,
            actions,
            page,
            wapi
        }}>
            <div ref={ref as any} id="__Builder-Root">
                {children}
                {modals}
                <CompCard id="__Builder-Drag-Comp" className={`__Builder-Drag-Object ${targets.gcomp ? "__Builder-Active" : ""}`} name={targets.gcomp instanceof ListItemData ? "" : targets.gcomp?.name || ""} type={"comp"} />
            </div>
        </BuilderContext.Provider>
    )
};

export * from "./actions";
export * from "./layout";
export * from "./page";
export * from "./targets";
export * from "./wapi";