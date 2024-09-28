import React from "react";
import { Props } from "../classes";
import { ContextObject, InitInfo } from "../types";
import { parseLocales, ungroupComps } from "../utils";
import wapi from "../wapi";

interface WapiState {
    info: ContextObject["wapi"]["info"];
    sections: ContextObject["wapi"]["sections"];
    comps: ContextObject["wapi"]["comps"];
    elements: ContextObject["wapi"]["elements"];
}

export enum WapiActions {
    SetInitInfo
}

export type WapiAction = 
    { type: WapiActions.SetInitInfo, info: InitInfo }
;

const defaultWapi : WapiState = {
    info: {
        devices: [],
        locales: {},
        defaultLocale: "",
        comps: {},
        elements: {},
        sections: {},
        pageProps: new Props({}),
        themeProps: new Props({})
    },
    sections: {},
    comps: {},
    elements: {}
}

const wapiReducer = (state: WapiState, action: WapiAction) : WapiState => {
    switch(action.type) {
        case WapiActions.SetInitInfo: return {
            ...state,
            info: {
                ...action.info,
                locales: parseLocales(action.info.locales),
                pageProps: new Props(action.info.pageProps),
                themeProps: new Props(action.info.themeProps)
            },
            sections: ungroupComps(action.info.sections, "section"),
            comps: ungroupComps(action.info.comps, "comp"),
            elements: ungroupComps(action.info.elements, "element")
        };
        default: return state;
    }
}

export const useWapi = (page: ContextObject["page"], context?: ContextObject) : ContextObject["wapi"] => {
    const [wapiState, set] = React.useReducer(wapiReducer, context?.wapi || defaultWapi);

    React.useEffect(() => {
        wapi({ ...wapiState, set });
    }, []);

    return { ...wapiState, set };
}