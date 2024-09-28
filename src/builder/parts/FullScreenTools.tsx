import { ComputerIcon, FullScreenIcon, MobileIcon, MousePointerIcon, ScreenIcon, TabletFlipedIcon, TabletIcon, UnFullScreenIcon } from "../icons";
import { LayoutActions, TargetsActions, useBuilderContext } from "../states";

export const FullScreenToolsPanel = () => {
    const { layout, targets } = useBuilderContext();

    return (
        <>
            <div className="__Builder-FullScreen-Tools __Builder-Top-Left">
                <button className={`__Builder-Header-Icon ${layout.fullScreen ? "__Builder_FullScreenMode" : ""}`} onClick={() => layout.set({ type: LayoutActions.ToggleFullScreenMode })}>
                    {layout.fullScreen ? <UnFullScreenIcon /> : <FullScreenIcon />}
                </button>
            </div>
            <div className="__Builder-FullScreen-Tools __Builder-Bottom-Right">
                <div onClick={() => layout.set({ type: LayoutActions.ToggleBrowseMode })} className={`__Builder-Menu-Tol ${layout.browseMode ? "__Builder_Active" : ""}`}>
                    <MousePointerIcon />
                </div>
            </div>
            <div className="__Builder-FullScreen-Tools __Builder-Bottom-Left">
            {targets.devices.map(device => (
                <div key={device.name}
                    onClick={() => targets.set({ type: TargetsActions.Changedevice, device })} 
                    className={`__Builder-Menu-Device-Btn ${targets.device.name === device.name ? "__Builder_Active" : ""}`}
                >
                    {device.icon === "mobile" && <MobileIcon />}
                    {device.icon === "tablet" && <TabletIcon />}
                    {device.icon === "tablet2" && <TabletFlipedIcon/>} 
                    {device.icon === "laptop" && <ComputerIcon />}
                    {device.icon === "screen" && <ScreenIcon />}
                </div>
            ))}
            </div>
        </>
    )
}

export default FullScreenToolsPanel;