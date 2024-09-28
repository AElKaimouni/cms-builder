import { capitalize } from "lodash";
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import config from "../../config";
import { Data, Field, ListData, ListField, ListItemData, PageSection, Props, SectionData } from "../classes";
import { Add2Icon, BoldIcon, CloseIcon, DublicateIcon, HtmlIcon, ItalicIcon, LineThroughIcon, ListIcon, ModelIcon, MoveIcon, NumberIcon, SectionIcon, SwitchIcon, TextIcon, ThemeIcon, UnderlineIcon, ZoneIcon } from "../icons";
import { LayoutActions, useBuilderContext } from "../states";
import { FieldTypes, ParsedComp, StringFieldArgs, WapiRequests, WapiWindowSelectionResponse } from "../types";
import { compDragHandler } from "../utils";
import { Loader } from "../../comps";
import { BuilderModals } from "../utils/modals";
import { sendWapiRequest, sendWapiRequestAsPromise } from "../wapi";
import { RichUtils, SelectionState, EditorState, Modifier  } from "draft-js";
import { custom } from "@cloudinary/url-gen/qualifiers/region";

interface FrameToolProps {
    name: string;
    icon: ReactNode;
    rect: DOMRect & { position?: ["top" | "bottom", "left" | "right"] };
    tools: {
        icon: ReactNode;
        callBack: Function;
        events?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    }[]
}

const FrameTool = ({ rect, tools, icon, name } : FrameToolProps) => {
    const { targets } = useBuilderContext();
    const outline = !(rect.left < 2 || rect.top < 2 || targets.gcomp);

    return <div className={`__Builder-Frame-Tool ${outline ? "__Builder-Outline" : ""} ${targets.gcomp ? "__Builder-Grap-Mode" : ""}`} style={{
        width: rect.width,
        height: rect.height,
        position: "absolute",
        ...(!outline ? {
            [targets.gcomp ? `border${rect.position ? capitalize(rect.position[(targets.gcomp instanceof ListItemData) ? ((targets.gcomp.__parent.__props as ListField).__args.display === "block" ? 0 : 1) : (targets.gcomp.display === "block" ? 0 : 1)]) : ""}` : "border"]: `solid ${targets.gcomp ? 3 : 2}px`,
        } : {}),
        top: rect.top,
        left: rect.left
    }}>
        {!targets.gcomp && <>
            <div className={`__Builder-Frame-Tool-Name ${rect.top < 20 ? "__Builder-Bottom" : ""}`}>
                <div>{icon} {rect.width > 200 ? name : ""}</div>
            </div>
            <div className={`__Builder-Frame-Btns ${rect.top < 50 ? "__Builder-Bottom" : ""}`}>
                {tools.map((tool, index) => (
                    <button key={index} className="__Builder-Frame-Btn" onClick={(e) => tool.callBack(e)} {...(tool.events || {})}>
                        {tool.icon}
                    </button>
                ))}
            </div>
        </>}
    </div>
};

const dataName = (data: PageSection | Data) => {
    if(data instanceof ListItemData) return data.__data.__name || `${data.__parent.__propName} item ${data.__index + 1}`;
    else if(data instanceof Data) return data.__propName;
    else return data.name;
};

const dataIcon = (data: PageSection | Data) => {
    if(data instanceof Data) {
        if(data.__props instanceof Field) switch(data.__props.__type) {
            case FieldTypes.Boolean: return <SwitchIcon />;
            case FieldTypes.List: return <ListIcon />
            case FieldTypes.Model: return <ModelIcon />;
            case FieldTypes.Number: return <NumberIcon />;
            case FieldTypes.String: return <TextIcon />;
            default : return <HtmlIcon />
        } else return <HtmlIcon />
    }else return <SectionIcon />;
}

const Frame = () => {
    const { layout, targets, wapi, page, } = useBuilderContext();
    const previewRef = useRef<HTMLElement>();
    const ref = useRef();
    const [minWidth, maxWidth] = useMemo(() => {
        const maxWidth = targets.device.range[1];
        const minWidth = targets.device.range[0];
        const delta = !maxWidth ? minWidth * .1 : (maxWidth - minWidth) * .1;
        

        return [minWidth + delta, maxWidth ? maxWidth : "unset"]
    }, [targets.device]);
    const setupPreviewSize = () => {
        const previewEle = previewRef.current;
        if(previewEle) {
            const parentEle = previewEle.parentElement as HTMLElement;
            const pw = parentEle.clientWidth;
            const w = previewEle.clientWidth;
            if(pw < w) {
                const scale = pw / w;
                previewEle.style.transform = `scale(${scale}) translateX(-50%)`;
                previewEle.style.height = `${100 / scale}%`;
                previewEle.style.fontSize = `${1/(scale * 1)}rem`;
                layout.set({ type: LayoutActions.ChangeScale, scale });
            } else {
                previewEle.style.transform = `scale(1) translateX(-50%)`;
                previewEle.style.height = `100%`;
                previewEle.style.fontSize = `1rem`;
                layout.set({ type: LayoutActions.ChangeScale, scale: 1 });
            }
        }
    };

    useEffect(() => {
        const previewEle = previewRef.current;

        if(previewEle) {
            if(layout.fullScreen) previewEle.classList.add("FullScreenMode");
            else previewEle.classList.remove("FullScreenMode");
        }
    }, [layout.fullScreen])

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            setupPreviewSize();
        })

        resizeObserver.observe(document.getElementById("__Builder-Preview-Container") as HTMLElement);
    }, []);


    useLayoutEffect(() => {
        setupPreviewSize();
    }, [targets.device]);

    return (
        <div className={`${layout.fullScreen ? "__Builder-FullScreen" : ""}`} ref={ref as any} id="__Builder-Preview-Container">
            {layout.pageLoading && <div id="frame-loader">
                {<Loader screen />}
            </div>}
            <div  ref={previewRef as any} style={{ minWidth: minWidth, maxWidth: maxWidth }} id="__Builder-Preview">
                <div  id="__Builder-Preview-Tols-Container">
                    {!layout.browseMode && <div id="__Builder-Preview-Tols">
                        {targets.comp?.[1] && !targets.gcomp && <FrameTool 
                            name={dataName(targets.comp[0])} 
                            icon={dataIcon(targets.comp[0])}
                            tools={(() => {
                                const data = targets.comp[0];
                                let tools : FrameToolProps["tools"] = [];

                                [data, ...(data.__adjDatas || [])].forEach(data => {
                                    if(data instanceof ListData) tools.push(
                                        {
                                            icon: <Add2Icon />,
                                            callBack: () => {
                                                if(!data?.__dynamicList) data?.add();
                                                else {
                                                    const comps = Object.keys((data?.__props as ListField).__args.props);
                                                    layout.set({ type: LayoutActions.Modal, modal: BuilderModals.CompsModal, comps, callBack: comp => {
                                                        data?.add(undefined, undefined, undefined, true, comp);
                                                    } });
                                                }
                                            }
                                        },
                                    );
    
                                    if(data instanceof ListItemData) tools = tools.concat([
                                        {
                                            icon: <DublicateIcon />,
                                            callBack: () => {
                                                data.__dublicate();
                                            }
                                        },
                                        {
                                            icon: <CloseIcon />,
                                            callBack: () => {
                                                data.__delete();
                                            }
                                        },
                                        {
                                            icon: <MoveIcon />,
                                            callBack: () => {
            
                                            },
                                            events: {
                                                ...compDragHandler(data) as any
                                            }
                                        }
                                    ])
                                })

                                // styled string field tools
                                if(data.__props instanceof Field && data.__props.__type === FieldTypes.String && (data.__props.__args as StringFieldArgs).type === "styled" && data.__dispatchEditor) {
                                    const styles = [
                                        {
                                            name: "BOLD",
                                            icon: <BoldIcon />
                                        },
                                        {
                                            name: "ITALIC",
                                            icon: <ItalicIcon />
                                        },
                                        {
                                            name: "UNDERLINE",
                                            icon: <UnderlineIcon />
                                        },
                                        {
                                            name: "STRIKETHROUGH",
                                            icon: <LineThroughIcon />
                                        }
                                    ];
                                    tools.push(...styles.map(style => ({
                                        icon: style.icon,
                                        callBack: async (e) => {
                                            const wapiSelection = await sendWapiRequestAsPromise({ type: WapiRequests.WindowSelection }) as WapiWindowSelectionResponse;
                                            data.__dispatchEditor?.(editorState => {
                                                const editorSelection = editorState.getSelection();
                                                const contentState = editorState.getCurrentContent();
                                                const blockMap = contentState.getBlockMap();
                                                const blockToSelect = blockMap.toArray()[wapiSelection.anchorKey];

                                                const updatedEditorState = EditorState.forceSelection(editorState, editorSelection.merge({
                                                    anchorOffset: wapiSelection.anchorOffset,
                                                    focusOffset: wapiSelection.focusOffset,
                                                    ...(blockToSelect ? {
                                                        anchorKey: blockToSelect.getKey(),
                                                        focusKey: blockToSelect.getKey(),
                                                    } : {})
                                                }));

                                            
                                                return RichUtils.toggleInlineStyle(updatedEditorState, style.name)
                                            })
                                        }
                                    })))
                                }
                                
                                return tools;
                            })()} 
                            rect={targets.comp[1]} 
                        />}
                        {targets.section?.[1] && !targets.gcomp && <FrameTool
                            name={dataName(targets.section[0])} 
                            icon={dataIcon(targets.section[0])}
                            tools={[
                                {
                                    icon: <DublicateIcon />,
                                    callBack: () => {
                                        targets.section?.[0].dublciate();
                                    }
                                },
                                {
                                    icon: <CloseIcon />,
                                    callBack: () => {
                                        targets.section?.[0].delete();
                                    }
                                },
                                {
                                    icon: <MoveIcon />,
                                    callBack: () => {

                                    },
                                    events: {
                                        ...compDragHandler(targets.section[0]) as any
                                    }
                                }
                            ]} 
                            rect={targets.section[1]} 
                        />}
                        {targets.hcomp && <FrameTool 
                            name={dataName(targets.hcomp[0])} 
                            icon={dataIcon(targets.hcomp[0])}
                            tools={[]}
                            rect={targets.hcomp[1]} 
                        />}
                    </div>}
                </div>
                <iframe sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-popups allow-modals" id="__Builder-Preview-Frame">
                </iframe>
                {!page.state.link && <Loader screen />}
            </div> 
        </div>
    )
}

export default Frame;