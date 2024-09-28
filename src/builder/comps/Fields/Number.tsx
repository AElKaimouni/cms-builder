import { Dispatch, useEffect, useState } from "react";
import { BuilderFieldMethods, BuilderFieldMethodsProps } from ".";
import { Data, Field } from "../../classes";
import { ResetIcon } from "../../icons";
import { useBuilderContext } from "../../states";
import { NumberFieldArgs } from "../../types";
import { useFieldMiddleValue } from "../../utils";

interface NumberInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    args: NumberFieldArgs;
    value: number | undefined;
    setValue: Dispatch<number>;
    label: string;
    reset?: boolean;
    defaultValue?: number;
    methods?: BuilderFieldMethodsProps["methods"];
}

export const NumberInput = ({ args, value, setValue, label, reset, defaultValue, methods, ...props } : NumberInputProps) => {
    return (
        <div className={`__Builder-Field __Builder-Number-Field __Builder-${args.type}`}>
            <div className="__Builder-Fields-Group-Label __Builder-Reverse">
                {reset && <button className="__Builder-Small" onClick={() => {
                    setValue(defaultValue || args.default || 0);
                }}><ResetIcon /></button>}
                <label>{label}</label>
                {methods && <BuilderFieldMethods methods={methods} />}
            </div>
            {args.type === "slider" && <div style={{ display: "flex", alignItems: "center" }}>
                <span>{value}</span>
                <input {...props}
                    type={"range"} 
                    min={args.min}
                    max={args.max}
                    value={typeof value === "number" ? value : args.default}
                    onChange={e => {
                        const newValue = parseFloat(e.target.value);
                        setValue(newValue);
                    }}
                />
            </div>}
            {(args.type === "float" || args.type === "int") && 
                <input {...props}
                    type={"number"} 
                    value={typeof value === "number" ? value : args.default} 
                    onChange={e => {
                        const newValue = (args.type === "int" ? parseInt : parseFloat)(e.target.value);
                        setValue(newValue);
                    }}
                />
            }
            {args.type === "enum" && 
                <select {...props as any} value={typeof value === "number" ? value : args.default} onChange={e => {
                    const newValue = parseFloat(e.target.value);
                    setValue(newValue);
                }}>
                    <option value={undefined} disabled selected={!Boolean(value)}>Select Value</option>
                    {args.enums.map(enume => (
                        <option key={enume} value={enume}>{enume}</option>
                    ))}
                </select>
            }
        </div>
    )
};

interface NumberFieldProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    data: Data;
    reset?: boolean;
    label: string;
    methods?: BuilderFieldMethodsProps["methods"];
}

export const NumberField = ({ data, label, reset, methods, ...props } : NumberFieldProps) => {
    const isInfo = ["__PageInfo", "__DomainTheme"].includes(data.__section.section.comp);
    const [value, setValue] = useState<number>(isInfo ? data?.__data : data?.__data[0]);
    const field = data.__props as Field;

    data.__dispatch = setValue;
    useEffect(() => { data.__edit(value) }, [value]);

    return (
        <NumberInput {...props}
            args={field.__args as NumberFieldArgs}
            label={label}
            setValue={setValue}
            value={value}
            defaultValue={field.__default()}
            reset={reset}
            methods={methods}
        />
    )
}