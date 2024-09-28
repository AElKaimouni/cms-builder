import { Dispatch, useEffect, useReducer, useState } from "react";
import { ConfirmModalInfo, ContextObject, ModelFieldArgs, WapiRequests } from "../types";
import { BuilderModalAction, BuilderModals, ConfirmModal, CompsModal, CreateSymboldModal, UploadModal, MediaModal, BuilderMediaModalAction } from "../utils/modals";
import ColorPicker from 'react-best-gradient-color-picker';
import { useContextMenu, useContextMenuProps } from "../utils";
import BuilderContextMenu from "../comps/ContextMenu";
import { ToastContainer, toast } from 'react-toastify';
import { sendWapiRequest } from "../wapi";

export type LayoutState = Omit<ContextObject["layout"], "toast" | "contextMenu" | "set">;

export enum LayoutActions {
    ChangeColumns,
    ChangePanel,
    ToggleTheme,
    ToggleFullScreenMode,
    Modal,
    ChangeScale,
    ToggleBrowseMode,
    ToggleLoading,
    SetActivePanel,
    ColorPicker,
    TogglePageLoading
}

export type LayoutAction = 
    { type: LayoutActions.ChangeColumns } |
    { type: LayoutActions.ChangePanel, panel:  LayoutState["panel"]} |
    { type: LayoutActions.ToggleTheme } |
    { type: LayoutActions.ToggleFullScreenMode } |
    BuilderModalAction |
    { type: LayoutActions.ChangeScale, scale: number } |
    { type: LayoutActions.ToggleBrowseMode } |
    { type: LayoutActions.ToggleLoading } | 
    { type: LayoutActions.SetActivePanel, panel: LayoutState["activePanel"] } | 
    { type: LayoutActions.ColorPicker, controller: [string, Dispatch<string>] | null, position?: [number, number], transform?: string } |
    { type: LayoutActions.TogglePageLoading }
;

const defaultLayout : LayoutState = {
    columns: "Two",
    panel: "Layers",
    activePanel: null,
    theme: "Light",
    fullScreen: false,
    scale: 1,
    browseMode: false,
    loading: true,
    pageLoading: true
}

const layoutReducer = (state: LayoutState, action : LayoutAction) : LayoutState => {
    switch(action.type) {
        case LayoutActions.ChangeColumns : {
            if(state.columns === "Three") return {
                ...state,
                columns: "Two",
                panel: "Edit"
            }; else return {
                ...state,
                columns: "Three",
                panel: defaultLayout.panel
            };
        };
        case LayoutActions.ChangePanel : {
            if(action.panel === state.panel && action.panel === "Config") return {
                ...state,
                panel: defaultLayout.panel
            }; else return {
                ...state,
                panel: action.panel
            };
        };
        case LayoutActions.ToggleTheme : return {
            ...state,
            theme: state.theme === "Light" ? "Dark" : "Light"
        };
        case LayoutActions.ToggleFullScreenMode : return {
            ...state,
            fullScreen: !state.fullScreen
        };
        case LayoutActions.ChangeScale : return {
            ...state,
            scale: action.scale
        };
        case LayoutActions.ToggleBrowseMode: return {
            ...state,
            browseMode: !state.browseMode
        };
        case LayoutActions.ToggleLoading: return {
            ...state,
            loading: !state.loading,
            pageLoading: !state.loading
        };
        case LayoutActions.SetActivePanel: return {
            ...state,
            activePanel: action.panel
        };
        case LayoutActions.TogglePageLoading: return {
            ...state,
            pageLoading: !state.pageLoading
        };
        default: return state;
    }
}

export const useLayout = (ref: React.MutableRefObject<HTMLElement | undefined>, context?: ContextObject) : [ContextObject["layout"], JSX.Element] => {
    // Create Symbol Modal States
    const [opened, setOpen] = useState<boolean>(false);

    // Confirm Modal States
    const [info, setInfo] = useState<ConfirmModalInfo | null>(null);

    // Comp Modal States
    const [comps, setComps] = useState<string[] | null>(null);

    // Upload Modal states
    const [umOpened, setUMOpen] = useState<boolean>(false);
    const [umCallBack, setUmCallBack] = useState<() => void>(() => {});

    // Media Modal States
    const [mmCount, setMMCount] = useState<number>(0);
    const [mmArgs, setMMArgs] = useState<ModelFieldArgs>({ model: "media" });
    const [mmCallBack, setMMCallBack] = useState<BuilderMediaModalAction["callBack"]>(() => {});

    // Color Picker States
    const [cpCOntroller, setCPController] = useState<[string, Dispatch<string>] | null>(null);
    const [cpPosition, setCPPosition] = useState<[number, number] | undefined>(undefined);
    const [cpTransform, setCPTransform] = useState<string | undefined>(undefined);

    // Frame Context Menu
    const contextMenu = useContextMenu(ref);
    const contextMenuProps = useContextMenuProps();

    const [ layout, setLayout ] = useReducer(layoutReducer, context?.layout || defaultLayout);

    useEffect(() => {
        const root = document.getElementById("__Builder-Root");

        root?.classList.toggle("__Builder_Three_Columns", layout.columns === "Three");
    }, [layout.columns]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if(e.target instanceof HTMLElement && !e.target.closest(".__Builder-Custom-Color-Picker, #__Builder-Custom-Color-Picker-Cnt")) {
                setCPController(null);
            }
        };

        window.addEventListener("click", handler);

        return () => window.removeEventListener("click", handler);
    }, []);

    return [
        {
            ...layout,
            set: (action: LayoutAction) => {
                if(action.type === LayoutActions.Modal) {
                    switch(action.modal) {
                        // return modal setter for each case
                        case BuilderModals.ConfirmModal: return ConfirmModal.setter(action, setInfo);
                        case BuilderModals.CompsModal: return CompsModal.setter(action, setComps);
                        case BuilderModals.CreateSymbol: return CreateSymboldModal.setter(action, setOpen);
                        case BuilderModals.UploadModal: return UploadModal.setter(action, setUMOpen, setUmCallBack);
                        case BuilderModals.MediaModal: return MediaModal.setter(action, setMMArgs, setMMCount, setMMCallBack)
                    }
                } else if (action.type === LayoutActions.ColorPicker) {
                    setCPController(action.controller);
                    setCPPosition(action.position);
                    setCPTransform(action.transform);
                } else return setLayout(action);
            },
            contextMenu : { ...contextMenu, ...contextMenuProps },
            toast
        },
        <>
            {cpCOntroller && <div 
                id={`__Builder-Custom-Color-Picker-Cnt`}
                style={{ left: cpPosition?.[0] || 0, top: cpPosition?.[1] || 0, transform: cpTransform || "none" }}
            >
                <ColorPicker width={250} height={150} hidePresets={true} hideAdvancedSliders={true} value={cpCOntroller[0]} onChange={value => {
                    cpCOntroller[1](value);
                    setCPController([value, cpCOntroller[1]])
                }} />
            </div>}
            {/* return Modal Comp for each modal */}
            <ConfirmModal.Modal info={info} />
            <CompsModal.Modal comps={comps} />
            <CreateSymboldModal.Modal opened={opened} />
            <MediaModal.Modal args={mmArgs} count={mmCount} callBack={mmCallBack} />
            <UploadModal.Modal opened={umOpened} callBack={umCallBack} />
            <BuilderContextMenu {...contextMenu.props} name={contextMenuProps.contextMenuName} props={contextMenuProps.menuActions} />
        </>
    ];
}