import {  Dispatch, useEffect, useRef, useState } from "react";
import { StringFieldArgs } from "../../types";
import BuilderEditor from "../Editor";
import { ResetIcon } from "../../icons";
import { Data, Field } from "../../classes";
import { LayoutActions, useBuilderContext } from "../../states";
import { BuilderFieldMethods, BuilderFieldMethodsProps } from ".";
import { TextEditor } from "../../../comps";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState   } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";


const validateColor = (color: string) => {
    if(color && color.length === 4) return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    else return color;
}
interface StringInputProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    args: StringFieldArgs;
    value: string;
    setValue: Dispatch<string>;
    label: string;
    reset?: boolean;
    defaultValue?: string;
    methods?: BuilderFieldMethodsProps["methods"];
    errors?: {
        controller: [string, Dispatch<string>];
        validator?: (value: string) => string | void;
    }
    controller?: [any, Dispatch<any>];
}

export const StringInput = ({ args, value, setValue, label, defaultValue, reset, methods, errors, controller, ...props } : StringInputProps) => {
    const { layout } = useBuilderContext();
    const changeHandler = e => setValue((e.target as HTMLInputElement).value);
    const ref = useRef<HTMLElement>();

    useEffect(() => {
        if(ref.current instanceof HTMLElement && (layout.columns === "Three" || layout.panel === "Edit" || layout.panel === "Config") ) {
            ref.current.style.height = "0px";
            const scrollHeight = ref.current.scrollHeight;
            ref.current.style.height = scrollHeight + "px";
        }
    }, [value, layout.panel, layout.columns]);

    useEffect(() => {
        if(errors && errors.validator)
            errors.controller[1](errors.validator(value) || "")
    },  [value]);

    return (
        <div className={`__Builder-Field __Builder-String-Field __Builder-${args.type || "short"}`}>
            <div className="__Builder-Fields-Group-Label __Builder-Reverse">
                {reset && <button className="__Builder-Small" onClick={() => {
                    setValue(defaultValue || args.default || "");
                }}><ResetIcon /></button>}
                <label>
                    {!(errors && errors.controller[0]) && label}
                    {errors && errors.controller[0] && <>
                        <div className="__Builder-Field-Message __Builder-Error">
                            {errors.controller[0]}
                        </div>
                    </>}
                </label>
                {methods && <BuilderFieldMethods methods={methods} />}
            </div>
            {(() => { switch(args.type) {
                case "styled" : return (
                    // <BuilderEditor  />
                    <TextEditor controller={controller} value={value} onChange={value => setValue(value)} />
                );
                case "enum" : return (
                    <select {...props as any} value={value} onChange={changeHandler}>
                        <option value={undefined} disabled selected={!Boolean(value)}>Select Value</option>
                        {args.enums.map(enume => (
                            <option key={enume} value={enume}>{enume}</option>
                        ))}
                    </select>
                );
                case "date" : return (
                    <input {...props}
                        type="date"
                        value={value}
                        onChange={changeHandler}
                    />
                );
                case "color" : return (
                    <>
                        {!args.gradient && <input {...props}
                            type="color"
                            value={validateColor(value)} 
                            onChange={changeHandler}
                        />}
                        {args.gradient && <div className="__Builder-Custom-Color-Picker">
                            <div onClick={e => {
                                const rect = (e.target as  HTMLElement).getBoundingClientRect();
                                const position = (() => {
                                    const y = rect.top + rect.height;
                                    if(y <= window.innerHeight / 2) return {
                                        position: [rect.left, rect.top + rect.height] as [number, number]
                                    }; else return {
                                        position : [rect.left + rect.width, rect.top] as [number, number],
                                        transform: "translateY(-50%)"
                                    }
                                })();
                                layout.set({
                                    type: LayoutActions.ColorPicker,
                                    controller: [value, val => setValue(val)],
                                    ...position
                                })
                            }} className="__Builder-Custom-Color-Picker-Sample" style={{ background: value }}></div>
                        </div>}
                    </>
                    
                );
                case "long" : return (
                    <textarea ref={ref as any} {...props as any} 
                        value={value} 
                        onChange={changeHandler}
                    ></textarea>
                );
                default: return (
                    <input {...props}
                        type="text"
                        value={value} 
                        onChange={changeHandler}
                    />
                );
            } })()}

        </div>
    )
}

interface StringFieldProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    data: Data;
    reset?: boolean;
    label: string;
    methods?: BuilderFieldMethodsProps["methods"];
}

export const StringField = ({ data, label, reset, methods, ...props } : StringFieldProps) => {
    const isInfo = ["__PageInfo", "__DomainTheme"].includes(data.__section.section.comp);
    const [value, setValue] = useState<string>(isInfo ? data?.__data : data?.__data[0]);
    const field = data.__props as Field;
    const blocksFromHtml = htmlToDraft(value);
	const { contentBlocks, entityMap } = blocksFromHtml;
	const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
	const editorState = EditorState.createWithContent(contentState);
	const [state, setState] = useState(editorState);


    useEffect(() => { data.__dispatchEditor = setState; }, []);
    useEffect(() => { data.__dispatch = setValue; }, []);
    useEffect(() => { data.__edit(value) }, [value]);

    return (
        <StringInput {...props}
            args={field.__args as StringFieldArgs}
            label={label}
            setValue={setValue}
            value={value}
            defaultValue={field.__default()}
            reset={reset}
            methods={methods}
            controller={[state, setState]}
        />
    )
}