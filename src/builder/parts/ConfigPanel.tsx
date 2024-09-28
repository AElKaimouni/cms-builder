import { useRef, useState } from "react";
import { BuilderFields } from "../comps/Fields";
import MenuHeader from "../comps/MenuHeader";
import { InfoIcon, ThemeIcon } from "../icons";
import { useBuilderContext } from "../states";
import { useActivePanelHandler } from "../utils";

const ConfigPanel = ({ spaced } : { spaced?: boolean }) => {
    const { page, targets } = useBuilderContext();
    const ref = useRef<HTMLElement>();
    const [panel, setPanel] = useState<"info" | "theme">("info");
    useActivePanelHandler(ref, "Config");
    return (
        <div ref={ref as any} id="__Builder-Config">
            <MenuHeader spaced={spaced} items={[
                {
                    name: "Page Info",
                    controller: [
                        panel === "info",
                        () => setPanel("info")
                    ],
                    icon: <InfoIcon />
                },
                {
                    name: "Theme",
                    controller: [
                        panel === "theme",
                        () => setPanel("theme")
                    ],
                    icon: <ThemeIcon />
                }
            ]} />
            {panel === "info" && page.module.info && <BuilderFields data={page.module.info.activeData.data} />}
            {panel === "theme" && page.module.theme && <BuilderFields data={page.module.theme.activeData.data} />}
        </div>
    )
}

export default ConfigPanel;