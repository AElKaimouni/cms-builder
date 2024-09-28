import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { StringFieldObject } from "../../types";
import { FieldBaseProps, FieldMethods, FieldSkeleton } from ".";
import { Loader, Skeleton, TextEditor } from "..";
import { CloseIcon, DoneIcon, EyeBlindIcon, EyeIcon, RefreshIcon, normalizePropName, useDelayState, useFieldValidator, useLoader, validateColor } from "../../utils";
import { useMainContext } from "../../states";
import { validateField, validateUniqueField } from "../../utils/validators";

interface Props extends FieldBaseProps {
    controller: [any, any, Dispatch<any>];
    field: StringFieldObject
}

export default ({ field, controller, label, methods, context, loading, } : Props) => {
    const { controller: { modals } } = useMainContext();
    const [initValue, value, setValue] = controller;
    const [generatorLoading, generatorLoader] = useLoader();
    const args = field.__args;
    const changeHandler = e => setValue((e.target as HTMLInputElement).value);
    const ref = useRef<HTMLElement>();
    const [error, UniqueLoading] = useFieldValidator(initValue, value, args, loading, context);
    const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);

    useEffect(() => {
        if(ref.current instanceof HTMLElement) {
            ref.current.style.height = "0px";
            const scrollHeight = ref.current.scrollHeight;
            ref.current.style.height = Math.max(scrollHeight, 100) + "px";
        }
    }, [value]);
    
    return (
        <div style={{ ...(args.width ? {
            minWidth: args.width,
            maxWidth: args.width
        } : {}) }} className={`model-input string ${field.__args.type} ${error || UniqueLoading ? "errored-model-input" : ""}`}>
            
            <div className="model-input-label">
                {label && <label>
                    {normalizePropName(label)}
                </label>}
                {error && (
                    <span className="model-input-error">{error}</span>
                )}
                <FieldMethods methods={methods} />
            </div>
            <div className="field-input-container">
                
                {(() => { switch(args.type) {
                    case "styled" : return (
                        <FieldSkeleton height={5} loading={loading}>
                            <TextEditor value={value} onChange={value => setValue(value)} />
                        </FieldSkeleton>
                    );
                    case "enum" : return (
                        <FieldSkeleton loading={loading}>
                            <select value={value} onChange={changeHandler}>
                                <option value={undefined} disabled selected={!Boolean(value)}>Select Value</option>
                                {args.enums.map(enume => (
                                    <option key={enume} value={enume}>{enume}</option>
                                ))}
                            </select>
                        </FieldSkeleton>
                    );
                    case "date" : return (
                        <FieldSkeleton loading={loading}>
                            <input
                                type="date"
                                value={value}
                                onChange={changeHandler}
                            />
                        </FieldSkeleton>
                    );
                    case "color" : return (
                        <FieldSkeleton loading={loading}>
                            {!args.gradient && <input
                                type="color"
                                value={validateColor(value)} 
                                onChange={changeHandler}
                            />}
                            {args.gradient && <div className="Custom-Color-Picker">
                                <div className="Custom-Color-Picker-Sample" style={{ background: value }} onClick={e => {
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

                                    modals.colorPicker.open({
                                        ...position,
                                        controller: [value, setValue]
                                    })
                                }}></div>
                            </div>}
                        </FieldSkeleton>
                    );
                    case "long" : return (
                        <FieldSkeleton loading={loading} height={5}>
                            <textarea rows={15} ref={ref as any}
                                value={value} 
                                onChange={changeHandler}
                            ></textarea>
                        </FieldSkeleton>
                    );
                    case "password": return (<>
                        <FieldSkeleton loading={loading}>
                            <input
                                type={passwordVisibility ? "text" : "password"}
                                value={value} 
                                onChange={changeHandler}
                            />
                        </FieldSkeleton>
                        <span onClick={() => setPasswordVisibility(v => !v)} className="field-input-password-switch">
                            {passwordVisibility ? <EyeBlindIcon /> : <EyeIcon />}
                        </span>
                    </>);
                    default: return (<>
                        {args.prefix && <span className="field-input-prefix">{args.prefix}</span>}
                        <FieldSkeleton loading={loading}>
                            <input
                                type="text"
                                value={value} 
                                onChange={changeHandler}
                            />
                        </FieldSkeleton>
                    </>);
                } })()}
                {field.__args.validate?.unique && (
                    <div className={`field-input-loader ${error ? "danger" : ""}`}>
                        <span>
                            {UniqueLoading ? <Loader size="small" /> : (error ? <CloseIcon /> : <DoneIcon />)}
                        </span>
                    </div>
                )}
                {field.__args.generator && (
                    <button disabled={generatorLoading} onClick={() => generatorLoader.process(async () => {
                        setValue(await field.__args.generator?.());
                    })} className="app-button icon model-method-button">
                        {generatorLoading ? <Loader size="small" /> : <RefreshIcon />}
                    </button>
                )}
            </div>
            
        </div>
    );
}