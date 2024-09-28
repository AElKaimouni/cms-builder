import { ReactNode } from "react";
import { CompField, Data, Field, ListData, ListField, Props } from "../../classes";
import { ResetIcon } from "../../icons";
import { FieldTypes } from "../../types";
import { BooleanField } from "./Boolean";
import { BuilderListField } from "./List";
import ModelField from "./Model";
import { NumberField } from "./Number";
import { StringField } from "./String";

export * from "./String";
export * from "./Number";
export * from "./Boolean";
export * from "./Style";

interface BuilderFieldProps {
    data: Data;
    label: string;
    reset?: boolean;
    methods?: BuilderFieldMethodsProps["methods"];
}

export interface BuilderFieldMethodsProps {
    methods: {
        icon: ReactNode;
        callBack: () => void;
    }[]
}

export const BuilderFieldMethods = ({ methods } : BuilderFieldMethodsProps) => {
    return <>
        {methods.map((method, index) => (
            <button key={index} className="__Builder-Small" onClick={method.callBack}>
                {method.icon}
            </button>
        ))}
    </>
}

export const BuilderField = ({ data, label, reset, methods } : BuilderFieldProps) => {
    if(data.__props instanceof Field) switch(data.__props.__type) {
        case FieldTypes.Boolean : return <BooleanField methods={methods} data={data} label={label} reset={reset} key={data.__id} />;
        case FieldTypes.String : return <StringField methods={methods} data={data} label={label} reset={reset} key={data.__id} />;
        case FieldTypes.Number : return <NumberField methods={methods} data={data} label={label} reset={reset} key={data.__id}/>;
        case FieldTypes.Model : return <ModelField methods={methods} data={data} label={label} reset={reset} key={data.__id} />;
        case FieldTypes.Comp: return <BuilderFields methods={methods} data={data} label={label} reset={reset} key={data.__id} />;
        case FieldTypes.List: return <BuilderListField methods={methods} data={data as ListData} label={label} reset={reset} key={data.__id} />;
        default : return <></>;
    } else return <BuilderFields methods={methods} data={data} label={label} reset={reset} key={data.__id} />;

}

interface BuilderFieldsProps {
    data: Data;
    label?: string;
    reset?: boolean;
    methods?: BuilderFieldMethodsProps["methods"];
}

export const BuilderFields = ({ data, label, reset, methods } : BuilderFieldsProps) => {

    return (
        <div className={`__Builder-Fields-Group ${label ? "__Builder-Field" : ""}`}>
            {label && <div className="__Builder-Fields-Group-Label">
                <label>{label}</label>
                {methods && <BuilderFieldMethods methods={methods} />}
                {reset && <button onClick={() => {}}><ResetIcon /></button>}
            </div>}
            <div className="__Builder-Fields-Group-List">
                {data.__props instanceof Props && data.__props.__map((prop, name) => {
                    if(prop instanceof Field) 
                            {return <BuilderField data={data[name]} label={name} reset={reset} key={data[name]?.__id || name} />;}
                    else    {return <BuilderFields data={data[name]} label={name} reset={reset} key={data[name]?.__id || name} />;}
                })}
                {/* {data.__props instanceof Field && <BuilderField data={data} label={label || data.__propName} reset={reset} />} */}
            </div>
        </div>
    )
}