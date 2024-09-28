import { Dispatch, useEffect, useState } from "react";
import { BooleanFieldObject } from "../../types";
import { FieldBaseProps, FieldMethods, FieldSkeleton } from ".";
import { validateField } from "../../utils/validators";
import { useFieldValidator } from "../../utils";

interface Props extends FieldBaseProps {
    controller: [boolean, boolean, Dispatch<boolean>];
    field: BooleanFieldObject;
}

let BooleanIDCounter = 0;

export default ({ field, controller, label, methods, context, loading } : Props) => {
    const id = `Model-Boolean-Field-${BooleanIDCounter++}`;
    const [initVlaue, value, setValue] = controller;
    const [error, uniqueLoading] = useFieldValidator(initVlaue, value, field.__args, loading, context);

    return (
        <div className={`model-input model-Boolean-input ${error || uniqueLoading ? "errored-model-input" : ""}`}>
            <div className="model-input-label">
                <label>
                    {label}
                </label>
                {error && (
                    <span className="model-input-error">{error}</span>
                )}
                <FieldMethods methods={methods} />
            </div>
            <FieldSkeleton loading={loading}>
                <div style={{ display: "flex" }}>
                    <input id={id} type="checkbox" checked={controller[1]} onChange={e => controller[2](!controller[1])} />
                    <label htmlFor={id} className="model-Boolean-input-Label"></label>
                </div>
            </FieldSkeleton>
            
        </div>
    )
}