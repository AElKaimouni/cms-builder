import { CompPropsObject, BuilderGroupedComps } from "./Comps";
import { PageLocaleObject, PageSectionObject, ParsedSectionObject } from "./Page";

export interface BuilderDevice {
    name: string;
    range: [number, number];
    icon: "mobile" | "tablet" | "tablet2" | "laptop" | "screen"; 
}

export interface InitInfo {
    pageProps: CompPropsObject;
    themeProps: CompPropsObject;
    locales: {name: string, ext: string}[];
    defaultLocale: string;
    devices: BuilderDevice[];
    sections : BuilderGroupedComps;
    comps : BuilderGroupedComps;
    elements : BuilderGroupedComps;
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
export interface WapiStartRequest extends WapiBaseRequest {
    type: WapiRequests.Start,
    initInfo: InitInfo
};

export interface WapiTargetRequest extends WapiBaseRequest {
    type: WapiRequests.Target,
    hover: [string, DOMRect & { position: ["top" | "bottom", "left" | "right"] }] | null;
}

export interface WapiScrollRequest extends WapiBaseRequest {
    type: WapiRequests.Scroll;
    offset: number
}

export interface WapiBodySizeRequest extends WapiBaseRequest {
    type: WapiRequests.BodySize;
    size: number;
}

export interface WapiDOMRectRequest extends WapiBaseRequest {
    type: WapiRequests.DOMRect,
    rect: DOMRect | null;
}

export interface WapiSelectRequest extends WapiBaseRequest {
    type: WapiRequests.Select;
    context: string;
    rect: DOMRect;
    menu?: { clientX: number, clientY: number };
}

export interface WapiEditRequest extends WapiBaseRequest {
    type: WapiRequests.Edit;
    context: string;
    data: string;
}

export interface WapiUpdateRectsRequest extends WapiBaseRequest {
    type: WapiRequests.UpdateRects;
    section?: DOMRect;
    comp?: DOMRect;
    target?: DOMRect;
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

export type WapiNativeEventRequest = WapiBaseRequest & WapiNativeEvent & {
    type: WapiRequests.NativeEvent; 
}

export interface WapiChangeLinkRequest extends WapiBaseRequest {
    type: WapiRequests.ChangeLink;
    link: string;
}

export interface WapiWindowSelectionRequest extends WapiBaseRequest {
    type: WapiRequests.WindowSelection,
    anchorOffset: number;
    focusOffset: number;
    anchorKey: number;
}

export type WapiRequest = 
    WapiStartRequest |
    WapiTargetRequest |
    WapiScrollRequest |
    WapiBodySizeRequest |
    WapiDOMRectRequest |
    WapiSelectRequest |
    WapiEditRequest |
    WapiUpdateRectsRequest |
    WapiNativeEventRequest |
    WapiChangeLinkRequest |
    WapiWindowSelectionRequest
;

export interface WapiDataResponse extends WapiBaseRequest {
    type: WapiRequests.Data;
    set?: ParsedSectionObject[];
    add?: [ParsedSectionObject, number | null][];
    delete?: number[];
    edit?: [ParsedSectionObject, number][];
    info?: any;
    theme?: any;
    model?: any;
}

export interface WapiDOMRectResponse extends WapiBaseRequest {
    type: WapiRequests.DOMRect;
    context: string;
}


export interface WapiSelectResponse extends WapiBaseRequest {
    type: WapiRequests.Select;
    section: string | null;
    comp: string | null;
}

export interface WapiSwitchFocusResponse extends WapiBaseRequest {
    type: WapiRequests.SwitchFocus;
    focus: "sections" | "comps" | "both";
    childsOfContext?: string;
}

export interface WapiActionContextResponse extends WapiBaseRequest {
    type: WapiRequests.ActionContext;
    action: "show" | "hide";
    context: string;
}

export interface WapiFocusContextResponse extends WapiBaseRequest {
    type: WapiRequests.FocusContext;
    context: string;
}

export interface WapiSwitchBrowseModeResponse extends WapiBaseRequest {
    type: WapiRequests.SwitchBrowseMode;
    mode: boolean;
}

export interface WapiWindowSelectionResponse extends WapiBaseRequest {
    type: WapiRequests.WindowSelection;
}

export type WapiResponse = 
    WapiDataResponse |
    WapiDOMRectResponse |
    WapiSelectResponse |
    WapiSwitchFocusResponse |
    WapiActionContextResponse |
    WapiFocusContextResponse |
    WapiSwitchBrowseModeResponse |
    WapiWindowSelectionResponse
;