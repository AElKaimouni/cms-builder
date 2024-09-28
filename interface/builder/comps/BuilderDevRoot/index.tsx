import React, { useEffect, useState } from "react";
import { BuilderComps, BuilderDevice, FieldTypes, InitInfo, ParsedSectionObject, WapiRequests, WC } from "../../types";
import { BuilderContext } from "../../states";
import wapi, { sendWapiRequest } from "../../wapi";
import Head from "next/head";
import events from "./events";
import { updateRects } from "../../utils";
import { FloatingWhatsApp } from 'react-floating-whatsapp';
import { useMainContext } from "../../../states";

export interface BuilderDevRootProps {
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
        try {
            const isArray = Array.isArray(context);
            const __context  =  (isArray ? context[3] : context.__context);

            if(__context) {
                const [x, section, type, _context] = __context.match(/^(S?)(\d+)_(.*)$/);
                const style = isArray ? context[1] : context.__style;
        
        
                props["data-__builder-context"] ||= _context;
                props["data-__builder-type"] ||= section === "S" ? "section" : "comp";
                props["data-__builder-contexts"] += (props["data-__builder-contexts"] && ",") + _context;
                if(style) props["style"] = { ...props["style"], ...style };
        
                if(type == FieldTypes.String || type == FieldTypes.Number) {
                    props["contentEditable"] = false;
                    props["onDoubleClick"] = (e: MouseEvent) => {
                        if(e.target instanceof HTMLElement) {
                            const target = e.target.closest(`[data-__builder-context="${_context}"]`) as HTMLElement || e.target;
                            target.setAttribute("contenteditable", "true");
                            target.style.cursor = "auto";
                        } 
                    };
                    props["onBlur"] = (e: FocusEvent) => {
                        if(e.target instanceof HTMLElement) {
                            e.target.setAttribute("contenteditable", "false");
                            e.target.style.cursor = "default";
                        }
                    };
                    props["onInput"] = (e: InputEvent) => {
                        if(e.target instanceof HTMLElement) {
                            sendWapiRequest({ type: WapiRequests.Edit, context: _context, data: e.target.innerText });
                            updateRects();
                        }
                    }
                }
        
                if(type == FieldTypes.Model) {
                    props["onClick"] = (e: MouseEvent) => {
                        if(e.detail === 2) {
                            sendWapiRequest({ type: WapiRequests.Edit, context: _context, data: "" });
                        }
                    }
                }
            }
        } catch(error) {
            console.error(`got this error when trying to parse context : `, contexts, context, '\n', error);
        }
    }
    
    

    return props;
};
const style = (props, style) => ({ ...props, style: { ...(props.style || {}), ...(style || {}) } })


const BuilderDevRoot =  React.memo(({ initInfo, sections, comps, elements, devices, callBack } : BuilderDevRootProps) => {
    const { pageLoading } = useMainContext();
    const [pageSections, setSections] = useState<ParsedSectionObject[]>([]);
    const [info, setInfo] = useState<any>({});
    const [theme, setTheme] = useState<any>({});
    const [device, setDevice] = useState<string | null | undefined>();
    const [model, setModel] = useState<any>();
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
        wapi(initInfo, setSections, setInfo, setTheme,setModel);
        setupDevice();
        return events(setupDevice);
    }, []);

    useEffect(() => {
        callBack?.(info, theme);
    }, [info, theme]);

    useEffect(() => {
        updateRects();
    }, [pageSections]);


    return (
        <BuilderContext.Provider value={{ info, device, media, theme, comps, elements, model, dev: true, c, style }}>
            <Head>
                <title>{info.title}</title>
                <meta name="description" content={info.description} />
            </Head>
            {pageSections.map((section, index) => {
                const comp = sections[section.comp];

                if(comp) return <comp.comp key={index} {...(typeof section.data === "object" && !Array.isArray(section.data) ? section.data : { props: section.data })} />
            })}
        </BuilderContext.Provider>
    )
})

export default BuilderDevRoot;