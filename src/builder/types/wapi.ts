import { Props } from "../classes";
import { BuilderGroupedComps, CompPropsObject } from "./comps";
import { PageLocaleObject, ParsedSectionObject } from "./page";

export interface Device {
    name: string;
    range: [number, number];
    icon: "mobile" | "tablet" | "tablet2" | "laptop" | "screen"; 
}

export interface InitInfo {
    devices: Device[];
    locales: {name: string, ext: string}[];
    defaultLocale: string;
    sections : BuilderGroupedComps;
    comps : BuilderGroupedComps;
    elements : BuilderGroupedComps;
    pageProps: CompPropsObject;
    themeProps: CompPropsObject;
};

export interface ParsedInitInfo extends Omit<InitInfo, "pageProps" | "themeProps" | "locales">  {
    pageProps: Props;
    themeProps: Props;
    locales: {[name: string]: string};
}

export enum WapiRequests {
    Start,
    Data,
    Target,
    Scroll,
    BodySize,
    DOMRect,
    UpdateRects,
    Select,
    Edit,
    NativeEvent,
    SwitchFocus,
    ActionContext,
    FocusContext,
    SwitchBrowseMode,
    ChangeLink,
    WindowSelection
}

export interface WapiBaseRequest {
    id?: number;
}

export interface WapiWindowSelectionRequest extends WapiBaseRequest {
    type: WapiRequests.WindowSelection;
}
export interface WapiStartResponse extends WapiBaseRequest {
    type: WapiRequests.Start;
    initInfo: InitInfo;
};

export interface WapiTargetResponse extends WapiBaseRequest {
    type: WapiRequests.Target;
    hover: [string, DOMRect & { position: ["top" | "bottom", "left" | "right"] }] | null;
};

export interface WapiScrollResponse extends WapiBaseRequest {
    type: WapiRequests.Scroll;
    offset: number;
};

export interface WapiBodySizeResponse extends WapiBaseRequest {
    type: WapiRequests.BodySize;
    size: number;
}

export interface WapiDOMRectResponse extends WapiBaseRequest {
    type: WapiRequests.DOMRect,
    rect: DOMRect | null;
}

export interface WapiSelectResponse extends WapiBaseRequest {
    type: WapiRequests.Select;
    context: string;
    rect: DOMRect;
    menu?: { clientX: number, clientY: number };
}

export interface WapiEditResponse extends WapiBaseRequest {
    type: WapiRequests.Edit;
    context: string;
    data: string;
}

export interface WapiUpdateRectsResponse extends WapiBaseRequest {
    type: WapiRequests.UpdateRects;
    section?: DOMRect;
    comp?: DOMRect;
    target?: DOMRect & { position: ["top" | "bottom", "left" | "right"] };
}

export interface WapiNativeEventClick {
    event: "click";
    data: {};
}

export interface WapiNativeEventMouseMove {
    event: "mousemove";
    data: {
        clientX: number;
        clientY: number;
    };
}

export interface WapiNativeEventMouseUp {
    event: "mouseup";
    data: {
        clientX: number;
        clientY: number;
    };
}

export interface WapiNativeEventMouseOver {
    event: "mouseover"
}

export interface WapiNativeEventKeyDown {
    event: "keydown";
    data: {
        code: string;
    }
}

export interface WapiNativeEventKeyUp {
    event: "keyup";
    data: {
        code: string;
    }
}

export type WapiNativeEvent =
    WapiNativeEventClick |
    WapiNativeEventMouseMove |
    WapiNativeEventMouseUp |
    WapiNativeEventMouseOver |
    WapiNativeEventKeyDown |
    WapiNativeEventKeyUp
;

export type WapiNativeEventResponse = WapiBaseRequest & WapiNativeEvent & {
    type: WapiRequests.NativeEvent; 
}

export interface WapiChangeLinkResponse extends WapiBaseRequest {
    type: WapiRequests.ChangeLink;
    link: string;
}

export interface WapiWindowSelectionResponse extends WapiBaseRequest {
    type: WapiRequests.WindowSelection,
    anchorOffset: number;
    focusOffset: number;
    anchorKey: number;
}

export type WapiResponse = 
    WapiStartResponse | 
    WapiTargetResponse | 
    WapiScrollResponse |
    WapiBodySizeResponse |
    WapiDOMRectResponse | 
    WapiSelectResponse |
    WapiEditResponse |
    WapiUpdateRectsResponse |
    WapiNativeEventResponse |
    WapiChangeLinkResponse |
    WapiWindowSelectionResponse
;

export interface WapiDataRequest extends WapiBaseRequest {
    type: WapiRequests.Data;
    set?: ParsedSectionObject[];
    add?: [ParsedSectionObject, number | null][];
    delete?: number[];
    edit?: [ParsedSectionObject, number][];
    info?: any;
    theme?: any;
    model?: any;
};

export interface WapiDOMRectRequest extends WapiBaseRequest {
    type: WapiRequests.DOMRect;
    context: string;
};

export interface WapiSelectRequest extends WapiBaseRequest {
    type: WapiRequests.Select;
    section: string | null;
    comp: string | null;
};

export interface WapiSwitchFocusRequest extends WapiBaseRequest {
    type: WapiRequests.SwitchFocus;
    focus: "sections" | "comps" | "both";
    childsOfContext?: string;
}

export interface WapiActionContextRequest extends WapiBaseRequest {
    type: WapiRequests.ActionContext;
    action: "show" | "hide";
    context: string;
}

export interface WapiFocusContextRequest extends WapiBaseRequest {
    type: WapiRequests.FocusContext;
    context: string;
}

export interface WapiSwitchBrowseModeRequest extends WapiBaseRequest {
    type: WapiRequests.SwitchBrowseMode;
    mode: boolean;
}

export type WapiRequest = 
    WapiDataRequest |
    WapiDOMRectRequest |
    WapiSelectRequest |
    WapiSwitchFocusRequest |
    WapiActionContextRequest |
    WapiFocusContextRequest |
    WapiSwitchBrowseModeRequest |
    WapiWindowSelectionRequest
;