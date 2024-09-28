import { useEffect, useReducer } from "react";
import { PageActions } from "./page";
import { BuilderStorage, ContextObject, Device, PageSectionObject, ParsedComp, WapiRequests } from "../types";
import { CompData, Data, ListItemData, PageSection } from "../classes";
import { splitCompsGroupes, splitSetionsGroupes } from "../utils";
import { sendWapiRequest, sendWapiRequestAsPromise } from "../wapi";



interface TargetsState {
    device: ContextObject["targets"]["device"];
    devices: ContextObject["targets"]["devices"];
    sections: ContextObject["targets"]["sections"];
    section: ContextObject["targets"]["section"];
    comps: ContextObject["targets"]["comps"];
    comp: ContextObject["targets"]["comp"];
    hcomp: ContextObject["targets"]["hcomp"];
    gcomp: ContextObject["targets"]["gcomp"];
}

export enum TargetsActions {
    Changedevice,
    ToggleDevice,
    SetDevices,
    ToggleSection,
    SelectSection,
    ToggleComp,
    SelectComp,
    ResetSelection,
    HoverComp,
    SetupRects,
    GrapComp
}

export type TargetsAction =
    { type: TargetsActions.ToggleDevice, device: Device } |
    { type: TargetsActions.Changedevice, device: Device } |
    { type: TargetsActions.SetDevices, devices: Device[] } |
    { type: TargetsActions.ToggleSection, section: PageSection } |
    { type: TargetsActions.SelectSection, section: PageSection, rect?: DOMRect, controlMode?: boolean } |
    { type: TargetsActions.ToggleComp, comp: Data } |
    { type: TargetsActions.SelectComp, comp: Data, rect?: DOMRect, controlMode?: boolean } |
    { type: TargetsActions.ResetSelection } |
    { type: TargetsActions.HoverComp, comp: ContextObject["targets"]["hcomp"] | null } |
    { type: TargetsActions.SetupRects, comp?: DOMRect, section?: DOMRect, target?: DOMRect & { position: ["top" | "bottom", "left" | "right"] }; } |
    { type: TargetsActions.GrapComp, comp: ContextObject["targets"]["gcomp"] }

;

const defaultTargets : TargetsState = {
    devices: [],
    sections: [],
    section: null,
    comps: [],
    comp: null,
    hcomp: null,
    gcomp: null,
    device: {
        icon: "laptop",
        name: "",
        range: [0,0]
    }
}

const targetsReducer = (state : TargetsState, action: TargetsAction) : TargetsState => {
    const keys = window.__builder_keys;
    const functions = window.__builder_functions;
    const context = window.__builder_context;
    const page = window.__builder_page;
    switch (action.type) {
        case TargetsActions.ToggleDevice: {
            const isDeviceExist = state.devices.find(device => device.name === action.device.name);

            if(state.devices.length > 1 || !isDeviceExist) {
                const newDevices = (isDeviceExist ? 
                    state.devices.filter(device => device.name !== action.device.name) :
                    state.devices.concat([action.device])
                ).sort((d1, d2) => d1.range[0] - d2.range[0]);
                return {
                    ...state,
                    devices: newDevices,
                    device: !Boolean(newDevices.find(d => d.name === state.device.name)) ? newDevices[newDevices.length - 1] : state.device
                };
            } else return state;
        };
        case TargetsActions.Changedevice: {
            return {
                ...state,
                device: action.device
            }
        };
        case TargetsActions.SetDevices: {

            if(action.devices.length) return {
                ...state,
                devices: action.devices,
                device: !Boolean(action.devices.find(d => d.name === state.device.name)) ? action.devices[action.devices.length - 1] : state.device 
            };   else return state;
        }
        case TargetsActions.ToggleSection: {
            const exits = Boolean(state.sections.find(section => section.id === action.section.id));

            return {
                ... state,
                sections: exits ? state.sections.filter(section => section.id !== action.section.id) : state.sections.concat([action.section]) 
            }
        };
        case TargetsActions.SelectSection: {
            const exits =  state.sections.length <= 1 && state.section && Boolean(state.sections.find(section => section.id === action.section.id));

            state = targetsReducer(state, { type: TargetsActions.ToggleSection, section: action.section });

            const sections = !(keys.ctrl || action.controlMode) ? (exits ? [] : [action.section]) : state.sections;
            const section = exits ? null : action.section;

            if(section && !action.rect) sendWapiRequestAsPromise({
                type: WapiRequests.DOMRect,
                context: section.data.activeData.data.__context
            }).then(res => {
                if(res.type === WapiRequests.DOMRect && res.rect) {
                    const context = window.__builder_context;
                    context.targets.set({ type: TargetsActions.SetupRects, section: res.rect });
                }
            });

            return  {
                ...state, sections,
                section: section ? [section, action.rect || null] : null,
                comp: null,
                comps: []
            }
        };
        case TargetsActions.ToggleComp: {
            const exits = Boolean(state.comps.find(comp => comp.__id === action.comp.__id));

            return {
                ... state,
                comps: exits ? state.comps.filter(comp => comp.__id !== action.comp.__id) : state.comps.concat([action.comp]) 
            }
        };
        case TargetsActions.SelectComp: {
            const controlMode = (keys.ctrl || action.controlMode);

            if(!controlMode || state.comps.length === 0 || (action.comp.constructor === state.comps[0].constructor && !(action.comp instanceof CompData))) {
                const exits =  state.comps.length <= 1 && state.comp && Boolean(state.comps.find(comp => comp.__id === action.comp.__id));

                state = targetsReducer(state, { type: TargetsActions.ToggleComp, comp: action.comp });
    
                const comps = !controlMode ? (exits ? [] : [action.comp]) : state.comps;
                const section = action.comp.__section.section;

                Promise.all([
                    sendWapiRequestAsPromise({
                        type: WapiRequests.DOMRect,
                        context: section.data.activeData.data.__context,
                        id: 2
                    }),
                    ...(!action.rect ? [
                        sendWapiRequestAsPromise({
                            type: WapiRequests.DOMRect,
                            context: action.comp.__context,
                            id: 1
                        })
                    ] : [])
                ]).then(res => {
                    if(res[0].type === WapiRequests.DOMRect && res[0].rect) {
                        const context = window.__builder_context;
                        context.targets.set({ type: TargetsActions.SetupRects, section: res[0].rect, ...((res[1] && res[1].type === WapiRequests.DOMRect && res[1].rect) ? {
                            comp: res[1].rect
                        } : {}) });
                    }
                });
    
                return  {
                    ...state,
                    comps : comps.filter(comp => comp.__section.section.id === section.id),
                    comp: exits ? null : [action.comp, action.rect || null],
                    section: [section, null],
                    sections: [section]
                }
            } else return state;
        };
        case TargetsActions.ResetSelection: {
            return {
                ...state,
                section: null,
                sections: [],
                comp: null,
                comps: []
            }
        };
        case TargetsActions.HoverComp: return {
            ...state,
            hcomp: action.comp
        };
        case TargetsActions.SetupRects: return {
            ...state,
            comp: state.comp ? [state.comp[0], action.comp || state.comp[1]] : null,
            section: state.section ? [state.section[0], action.section || state.section[1]] : null,
            hcomp: state.hcomp ? [state.hcomp[0], action.target || state.hcomp[1]] : null
        };
        case TargetsActions.GrapComp: {
            return {
                ...state,
                gcomp: action.comp
            };
        }
        default : return state;
    }
}

export const useTargets = (wapi: ContextObject["wapi"], page: ContextObject["page"], context?: ContextObject) : ContextObject["targets"] => {
    const [ targets, set ] = useReducer(targetsReducer, context?.targets ||defaultTargets);

    useEffect(() => {
        set({ type: TargetsActions.SetDevices, devices: wapi.info.devices });
        if(wapi.info.devices.length)
        set({ type: TargetsActions.Changedevice, device: wapi.info.devices[wapi.info.devices.length - 1] })
    }, [wapi.info]);

    useEffect(() => {
        const page = window.__builder_page;

        page.locale.sections.updateView(sections => ({
            set: sections.parsed,
            info: page.info?.section.activeParsed.data,
            theme: page.theme?.section.activeParsed.data,
            model: page.document.pageModels?.[page.locale.locale]
        }));
    }, [targets.device]);

    useEffect(() => {
        sendWapiRequest({
            type: WapiRequests.Select,
            comp: targets.comp ? targets.comp[0].__context : null,
            section: targets.section ? targets.section[0].data.activeData.data.__context : null
        });
    }, [targets.comp, targets.section]);


    useEffect(() => {
        sendWapiRequest({
            type: WapiRequests.SwitchFocus,
            focus: targets.gcomp ? ((targets.gcomp as ParsedComp).type && (targets.gcomp as ParsedComp).type === "section" ? "sections" : "comps") : "both",
            ...(targets.gcomp instanceof ListItemData ? {
                childsOfContext: targets.gcomp.__parent.__context
            } : {})
        });
    }, [targets.gcomp]);

    return { ...targets, set }
}