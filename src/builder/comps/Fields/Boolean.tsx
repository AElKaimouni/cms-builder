import { Dispatch, useEffect, useState } from "react";
import { BuilderFieldMethods, BuilderFieldMethodsProps } from ".";
import { Data, Field } from "../../classes";
import { ResetIcon } from "../../icons";
import { BooleanFieldArgs } from "../../types";

interface BooleanInputProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    args: {
        default?: boolean
    };
    value: boolean | undefined;
    setValue: Dispatch<boolean>;
    label?: string;
    reset?: boolean;
    defaultVal?: boolean;
    methods?: BuilderFieldMethodsProps["methods"];
}

let BooleanIDCounter = 0;

export const BooleanInput = ({ args, value, setValue, label, reset, defaultVal, methods } : BooleanInputProps) => {
    const id = `__Builder-Boolean-Field-${BooleanIDCounter++}`;

    return (
        <div className="__Builder-Field __Builder-Boolean-Field">
            <div className="__Builder-Fields-Group-Label __Builder-Reverse">
                {reset && <button className="__Builder-Small" onClick={() => {
                    setValue(defaultVal !== undefined ? defaultVal : args.default || false);
                }}><ResetIcon /></button>}
                <label>{label}</label>
                {methods && <BuilderFieldMethods methods={methods} />}
            </div>
            <div style={{ display: "flex" }}>
                <input id={id} type="checkbox" checked={value} onChange={e => setValue(!value)} />
                <label htmlFor={id} className="__Builder-Boolean-Field-Label"></label>
            </div>
        </div>
    )
}

interface BooleanFieldProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    data: Data;
    reset?: boolean;
    label: string;
    methods?: BuilderFieldMethodsProps["methods"];
}

export const BooleanField = ({ data, label, reset, methods, ...props } : BooleanFieldProps) => {
    const isInfo = ["__PageInfo", "__DomainTheme"].includes(data.__section.section.comp);
    const [value, setValue] = useState<boolean>(isInfo ? data?.__data : data?.__data[0]);
    const field = data.__props as Field;

    data.__dispatch = setValue;

    useEffect(() => { data.__edit(value) }, [value]);

    return (
        <BooleanInput {...props}
            args={field.__args as BooleanFieldArgs}
            label={label}
            setValue={setValue}
            value={value}
            defaultVal={field.__default()}
            reset={reset}
            methods={methods}
        />
    )
}