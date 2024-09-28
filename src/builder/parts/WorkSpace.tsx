import { useEffect, useLayoutEffect } from "react";
import MenuHeader from "../comps/MenuHeader";
import PanelCnt from "../comps/PanelCnt"
import { AddIcon, EditIcon, LayersIcon } from "../icons";
import { LayoutActions, useBuilderContext } from "../states";
import CompsPanel from "./CompsPanel";
import ConfigPanel from "./ConfigPanel";
import EditPanel from "./EditPanel";
import Frame from "./Frame";
import FullScreenToolsPanel from "./FullScreenTools";
import LayersPanel from "./LayersPanel";
import Map from "./Map";

const WorkSpace = () => {
    const { layout, page } = useBuilderContext();

    useLayoutEffect(() => {
        const header = document.getElementById("__Builder-Header");
        const space = document.getElementById("__Builder-Work-Space");

        if(header instanceof HTMLElement && space instanceof HTMLElement) {
            space.style.maxHeight = (window.innerHeight - header.clientHeight) + "px";
        }
    });

    return (
        <div id="__Builder-Work-Space">
            <div id="__Builder-Left-Area">
                <PanelCnt active={layout.panel === "Config"}>
                    <ConfigPanel spaced />
                </PanelCnt>
                <PanelCnt id="__Builder-Left-Area-Panels" active={layout.panel !== "Config"}>
                    <MenuHeader items={[

                        {
                            name: "",
                            controller: [
                                layout.panel === "Layers",
                                () => layout.set({ type: LayoutActions.ChangePanel, panel: "Layers" })
                            ],
                            icon: <LayersIcon />
                        },
                        {
                            name: "",
                            controller: [
                                layout.panel === "Comps",
                                () => layout.set({ type: LayoutActions.ChangePanel, panel: "Comps" })
                            ],
                            icon: <AddIcon />
                        },
                        ...(layout.columns === "Two" ? [
                            {
                                name: "",
                                controller: [
                                    layout.panel === "Edit",
                                    () => layout.set({ type: LayoutActions.ChangePanel, panel: "Edit" })
                                ],
                                icon: <EditIcon />
                            } as any,
                        ] : [])
                    ]} />
                    <PanelCnt active={layout.panel === "Comps"}>
                        <CompsPanel />
                    </PanelCnt>
                    <PanelCnt id="__Builder-Layers-Container" active={layout.panel === "Layers"}>
                        <LayersPanel />
                    </PanelCnt>
                    <PanelCnt active={layout.panel === "Edit"}>
                        <EditPanel />
                    </PanelCnt>
                </PanelCnt>
            </div>
            <div id="__Builder-Middle-Area">
                <Frame />
                <Map />
            </div>
            {layout.columns === "Three" && <div id="__Builder-Right-Area">
                <PanelCnt active={true}>
                    <EditPanel />
                </PanelCnt>
            </div>}
            {layout.fullScreen && <FullScreenToolsPanel />}
        </div>
    )
};

export default WorkSpace;