import React, { useEffect, useMemo, useState } from "react";
import { BuilderComps, BuilderDevice, InitInfo, ParsedPageDocument, ParsedSectionObject } from "../../types";
import BuilderContext from "../../states/context";
import Head from "next/head";
import { FloatingWhatsApp } from 'react-floating-whatsapp';
import { resizeMedia } from "../../../helpers";
import { useMainContext } from "../../../states";

export interface BuilderRootProps {
    page: ParsedPageDocument;
    initInfo: InitInfo;
    sections: BuilderComps;
    comps: BuilderComps;
    elements: BuilderComps;
    devices: { [key: string] : BuilderDevice };
    callBack?: (info: any, theme: any) => void;
}

const c = (...contexts: any[]) /*: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>*/ => {
    const props = {
        "data-__builder-contexts": "",
        style: { cursor: "default" }
    };
    for(const context of contexts) {
        if(context) {
            const isArray = Array.isArray(context)
            const style = isArray ? context[1] : context.__style;
    
    
            if(style) props["style"] = { ...props[style], ...style };
        }
    }

    return props;
};

const style = (props, style) => ({ ...props, style: { ...(props.style || {}), ...(style || {}) } });


const BuilderRoot =  React.memo(({ page, initInfo, sections, comps, elements, devices, callBack } : BuilderRootProps) => {
    const { pageLoading } = useMainContext();
    const [device, setDevice] = useState<string | null | undefined>();
    const info = useMemo(() => page.locale.info.find(data => data.cond.media.includes(device))?.data || {}, [device, page.locale.info]);
    const theme = useMemo(() => page.theme.find(data => data.cond.media.includes(device))?.data || {}, [device, page.theme]);
    const setupDevice = () => {
        const width = window.innerWidth;

            for(const device of initInfo.devices) {
                if(device.range[0] < width && (device.range[1] === undefined || device.range[1] > width)) {
                    setDevice(device.name);
                    break;
                }
            }
    }
    const media = {
        gte: (deviceName: string) => {
            const targetDevice = devices[deviceName];
            const currentDevice = devices[device];

            if(targetDevice && currentDevice) {
                return currentDevice.range[0] >= targetDevice.range[0];
            } else return false;
        },
        lte: (deviceName: string) => {
            const targetDevice = devices[deviceName];
            const currentDevice = devices[device];

            if(targetDevice && currentDevice) {
                return currentDevice.range[0] <= targetDevice.range[0];
            } else return false;
        }
    }

    useEffect(() => {
        setupDevice();
        window.addEventListener("resize", setupDevice);

        return () => window.addEventListener("resize", setupDevice);
    }, []);

    useEffect(() => {
        callBack?.(info, theme);
    }, [info, theme]);

    return (
        <BuilderContext.Provider value={{ info, device, media, theme, comps, elements, model: page.pageModel, dev: false, c, style }}>
            <Head>
                <title>{page.locale.meta.title}</title>
                <meta name="description" content={page.locale.meta.description} />
            </Head>
            {page.locale.sections.map((section, index) => {
                const comp = sections[section.comp];
                const data = section.data.find(data => data.cond.media.includes(device));

                if(comp && data && section.cond.media.includes(device)) return <comp.comp key={index} {...(typeof data.data === "object" && !Array.isArray(data.data) ? data.data : { props: data.data })} />
            })}
        </BuilderContext.Provider>
    )
})

export default BuilderRoot;