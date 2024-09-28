import { Dispatch, useEffect, useState } from "react";
import { NumberFieldObject } from "../../types";
import { FieldBaseProps, FieldMethods, FieldSkeleton } from ".";
import { validateField } from "../../utils/validators";
import { useFieldValidator } from "../../utils";

interface Props extends FieldBaseProps {
    controller: [any, any, Dispatch<any>];
    field: NumberFieldObject
}

export default ({ field, controller, label, methods, context, loading } : Props) => {
    const [initVlaue, value, setValue] = controller;
    const args = field.__args;
    const [error, uniqueLoading] = useFieldValidator(initVlaue, value, args, loading, context);

    return (
        <div className={`model-input number ${error || uniqueLoading ? "errored-model-input" : ""}`}>
            <div className="model-input-label">
                <label>
                    {label}
                </label>
                {error && (
                    <span className="model-input-error">{error}</span>
                )}
                <FieldMethods methods={methods} />
            </div>
            {args.type === "slider" && <div style={{ display: "flex", alignItems: "center" }}>
                <span>{value}</span>
                <FieldSkeleton loading={loading}>
                    <input
                        type={"range"} 
                        min={args.min}
                        max={args.max}
                        value={typeof value === "number" ? value : args.default}
                        onChange={e => {
                            const newValue = parseFloat(e.target.value);
                            setValue(newValue);
                        }}
                    />
                </FieldSkeleton>
                
            </div>}
            {(args.type === "float" || args.type === "int") && 
                <FieldSkeleton loading={loading}>
                    <input
                        type={"number"} 
                        value={typeof value === "number" ? value : args.default} 
                        onChange={e => {
                            const newValue = (args.type === "int" ? parseInt : parseFloat)(e.target.value);
                            setValue(newValue);
                        }}
                    />
                </FieldSkeleton>
            }
            {args.type === "enum" && 
                <FieldSkeleton loading={loading}>
                    <select value={typeof value === "number" ? value : args.default} onChange={e => {
                        const newValue = parseFloat(e.target.value);
                        setValue(newValue);
                    }}>
                        <option value={undefined} disabled selected={!Boolean(value)}>Select Value</option>
                        {args.enums.map(enume => (
                            <option key={enume} value={enume}>{enume}</option>
                        ))}
                    </select>
                </FieldSkeleton>
            }
        </div>
    );
}