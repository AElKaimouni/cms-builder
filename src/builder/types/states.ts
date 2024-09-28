import React from "react";
import { TargetsAction } from "../states/targets";
import { LayoutAction } from "../states/layout";
import { Device, InitInfo, ParsedInitInfo } from "./wapi";
import { PageAction } from "../states/page";
import { WapiAction } from "../states/wapi";
import { BuilderComps, ParsedComp } from "./comps";
import { Data, Field, ListItemData, Page, PageSection, Props } from "../classes";
import { ExpandedSectionLayer } from "./layers";
import { useContextMenu, useContextMenuProps } from "../utils";
import { toast } from 'react-toastify';
import { BuilderSymbol } from "./symbol";

export interface ActionInput {
    target?: string;
    stack?: boolean;
    undo: Function;
    redo: (firstTime: boolean) => void;
}

export interface ConfirmModalInfo {
    title?: string;
    message?: string;
    confirm?: string;
    cancel?: string;
    color?: string;
}

export interface Action extends ActionInput {
    index: number;
}

export interface ContextObject {
    wapi: {
        set: React.Dispatch<WapiAction>;
        info: ParsedInitInfo;
        sections: BuilderComps;
        comps: BuilderComps;
        elements: BuilderComps;
    };
    layout: {
        set: React.Dispatch<LayoutAction>;
        columns: "Three" | "Two";
        panel: "Edit" | "Config" | "Layers" | "Comps";
        activePanel: ContextObject["layout"]["panel"] | null;
        theme: "Dark" | "Light";
        fullScreen: boolean;
        scale: number;
        browseMode: boolean;
        loading: boolean;
        pageLoading: boolean;
        contextMenu: ReturnType<typeof useContextMenu> & ReturnType<typeof useContextMenuProps>;
        toast: typeof toast;
    };
    targets: {
        set: React.Dispatch<TargetsAction>;
        device: Device;
        devices: Device[];
        sections: PageSection[];
        section: [PageSection, DOMRect | null] | null;
        comps: Data[];
        comp: [Data, DOMRect | null] | null;
        hcomp: [Data | PageSection, DOMRect & { position: ["top" | "bottom", "left" | "right"] }] | null;
        gcomp: ListItemData | ParsedComp | null;
    },
    actions: {
        add: (action: ActionInput) => void;
        undo: (() => void) | null;
        redo: (() => void) | null;
        clear: () => void;
        state: {
            actions: Action[];
            activeAction: number;
        };
    },
    page: {
        set: (action: PageAction) => void;
        module: Page;
        state: {
            avaibleTargets: string[];
            host: string;
            link: string;
            url: string;
            title: string;
            locale: string;
            version: string;
            canSave: boolean;
            canPublish: boolean;
            layers: { fixed: ExpandedSectionLayer[], indexed: ExpandedSectionLayer[] };
            symbols: BuilderSymbol[];
        };
    }
}