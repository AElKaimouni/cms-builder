import { useEffect, useMemo, useRef, useState } from "react";
import { Data, Field, Props } from "../classes";
import { BuilderField, StyleField } from "../comps/Fields";
import MenuHeader from "../comps/MenuHeader";
import { TextIcon } from "../icons";
import { LayoutActions, useBuilderContext } from "../states";
import { CompStyleProps } from "../types";
import { useActivePanelHandler } from "../utils";
import ConfigPanel from "./ConfigPanel";

const EditPanel = () => {
    const { targets, layout } = useBuilderContext();
    const ref = useRef<HTMLElement>();
    const [activePanel, setActivePanel] = useState<number>(0);
    const data = useMemo<Data | null>(
        () => {
            if(window.__builder_context) window.__builder_context.targets.device = targets.device;
            return targets.comp?.[0] || targets.section?.[0].data.activeData.data || null;
        },
        [targets.comp, targets.section, targets.device]
    );

    useEffect(() => {
        setActivePanel(0);
    }, [data])

    useActivePanelHandler(ref, "Edit");

    return (
        <>
            {data && 
                <div ref={ref as any} id="__Builder-Edit">
                    <MenuHeader spaced items={[
                        {
                            name: "Data",
                            controller: [
                                activePanel === 0,
                                () => setActivePanel(0)
                            ],
                            icon: <TextIcon />
                        },
                        ...(data.__props.__style.style ? [
                            {
                                name: "Style",
                                controller: [
                                    activePanel === 1,
                                    () => setActivePanel(1)
                                ],
                                icon: <TextIcon />
                            } as any
                        ] : []),
                        ...(data.__props.__style.spacing ? [
                            {
                                name: "Spacing",
                                controller: [
                                    activePanel === 2,
                                    () => setActivePanel(2)
                                ],
                                icon: <TextIcon />
                            } as any
                        ] : [])
                    ]} />
                    {activePanel === 0 && <BuilderField data={data.__props instanceof Props ? data : (data.__parent instanceof Data ? data.__parent : data)} label="" />}
                    {activePanel === 1 && data.__props.__style.style && <StyleField data={data} styles={data.__props.__style.style} />}
                    {activePanel === 2 && data.__props.__style.spacing && <StyleField data={data} styles={data.__props.__style.spacing} />}
                </div>
            }
            {!data && <ConfigPanel spaced />}
        </>
    )
}

export default EditPanel;