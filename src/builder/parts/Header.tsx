import { useState } from "react";
import { useMainContext } from "../../states";
import BuilderLoading from "../comps/Loading";
import { ComputerIcon, DarkIcon, DeviceIcon, EyeIcon, FullScreenIcon, LeftArrowIcon, LightIcon, MobileIcon, MousePointerIcon, RedoIcon, ReloadIcon, ScreenIcon, SettingsIcon, TabletIcon, TargetIcon, ThreeColsIcon, TwoColsIcon, UndoIcon, UnFullScreenIcon } from "../icons";
import { PageActions, useBuilderContext } from "../states";
import { LayoutActions, TargetsActions } from "../states";
import { reloadFrame } from "../utils";
import TargetsPanel from "./TargetsPanel";

const Header = () => {
    const { controller } = useMainContext();
    const { layout, targets, actions, page } = useBuilderContext();
    const [targetsModal, setTargetsModal] = useState<boolean>(false);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    const [publishLoading, setPublishLoading] = useState<boolean>(false);

    const saveHandler = () => {
        setSaveLoading(true);
        page.module.save().then(() => {
            setSaveLoading(false);
        })
    };

    const publishHandler = () => {
        setPublishLoading(true);
        

        Promise.all([
            page.module.publish(),
            ...(page.module.locale.model && !page.module.locale.model.published ? [
                page.module.locale.publishModel()
            ] : [])
        ]).then(() => {
            setPublishLoading(false);
        });
    };

    return (
        <div id="__Builder-Header">
            <div id="__Builder-Header-Box-1" className="__Builder-Header-Box">
                <div onClick={() => controller.router.navigate("/")} id="__Builder-Header-Back">
                    <LeftArrowIcon />
                </div>
                <div id="__Builder-Header-Title">
                    <div>{page.state.title || "Untitled Page"}</div>
                    <a href={page.state.url} id="__Builder-Header-Link" target={"_blank"}>
                        {page.state.url}
                    </a>
                </div>
                <div id="__Builder-Header-Settings">
                    <div onClick={() => layout.set({ type: LayoutActions.ChangePanel, panel: "Config" })} className={`${layout.panel === "Config" ? "__Builder_Active" : ""}`}>
                        <SettingsIcon />
                    </div>
                </div>
            </div>
            <div className="__Builder-Header-Box">
                <button className="__Builder-Header-Icon" onClick={() => layout.set({ type: LayoutActions.ChangeColumns })}>
                    {layout.columns === "Two" ? <ThreeColsIcon /> : <TwoColsIcon />}
                </button>
                <button className="__Builder-Header-Icon" onClick={() => layout.set({ type: LayoutActions.ToggleTheme })}>
                    {layout.theme === "Dark" ? <LightIcon /> : <DarkIcon />}
                </button>
                <button id="__Builder-FullScreen-Btn" className={`__Builder-Header-Icon ${layout.fullScreen ? "__Builder_FullScreenMode" : ""}`} onClick={() => layout.set({ type: LayoutActions.ToggleFullScreenMode })}>
                    {layout.fullScreen ? <UnFullScreenIcon /> : <FullScreenIcon />}
                </button>
                <button id="__Builder-Reload-Btn" className={`__Builder-Header-Icon`} onClick={() => reloadFrame()}>
                    <ReloadIcon />
                </button>
                <div id="__Builder-Header-Menu">
                    <div id="__Builder-Menu-Tols">
                        <div onClick={() => layout.set({ type: LayoutActions.ToggleBrowseMode })} className={`__Builder-Menu-Tol ${layout.browseMode ? "__Builder_Active" : ""}`}>
                            <MousePointerIcon />
                        </div>
                    </div>
                    <div id="__Builder-Menu-Devices">
                        {targets.devices.map(device => (
                            <div key={device.name}
                                onClick={() => targets.set({ type: TargetsActions.Changedevice, device })} 
                                className={`__Builder-Menu-Device-Btn ${targets.device.name === device.name ? "__Builder_Active" : ""}`}
                            >
                                <DeviceIcon device={device} />
                            </div>
                        ))}
                    </div>
                    <div id="__Builder-Menu-Targets">
                        <div id="__Builder-Menu-Targets-Btn" onClick={() => setTargetsModal(v => !v)} className={`${targetsModal ? "__Builder_Active" : ""}`}>
                            <TargetIcon />
                        </div>
                        {targetsModal && <div id="__Builder-Menu-Targets-Menu">
                            <TargetsPanel />
                        </div>}
                    </div>
                </div>

                <div id="__Builder-Header-Undo-Redo">
                <button onClick={() => actions.undo?.()} disabled={!Boolean(actions.undo)} className="__Builder-Header-Button-Icon">
                    <UndoIcon />
                </button>
                <button onClick={() => actions.redo?.()} disabled={!Boolean(actions.redo)} className="__Builder-Header-Button-Icon">
                    <RedoIcon />
                </button>
                </div>
                <div id="__Builder-Header-Btns">

                    <a href={page.state.url} target="preview">
                        <button className="__Builder-Header-Button-Icon">
                            <EyeIcon />
                        </button>
                    </a>
                    <button onClick={publishHandler} disabled={!page.state.canPublish || publishLoading} className="__Builder-Header-Publish">
                        {publishLoading ? <BuilderLoading button /> : "Publish"}
                    </button>
                    <button onClick={saveHandler} disabled={!page.state.canSave || saveLoading} className="__Builder-Header-Save">
                        {saveLoading ? <BuilderLoading button /> : "Save"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Header;