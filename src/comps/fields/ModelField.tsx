import { Dispatch, useEffect, useState } from "react";
import { ModelFieldObject } from "../../types";
import { FieldBaseProps, FieldMethods, FieldSkeleton } from ".";
import ModelPreview from "../ModelPreview";
import { useMainContext } from "../../states";
import { normalizePropName, useFieldValidator } from "../../utils";
import { validateField } from "../../utils/validators";

interface Props extends FieldBaseProps {
    controller: [any, any, Dispatch<any>];
    field: ModelFieldObject
}

export default ({ field, controller, label, methods, context, loading } : Props) => {
    const [initVlaue, value, setValue] = controller;
    const { controller: { models, modals } } = useMainContext();
    const model = models.getModel(field.__args.model);
    const [error, uniqueLoading] = useFieldValidator(initVlaue, value, field.__args, loading, context);

    return (
        <div className={`model-input model ${error || uniqueLoading ? "errored-model-input" : ""}`}>
            <div className="model-input-label">
                <label>
                    {normalizePropName(label)}
                </label>
                {error && (
                    <span className="model-input-error">{error}</span>
                )}
                <FieldMethods methods={methods} />
            </div>
            <FieldSkeleton height={7} loading={loading}>
                <ModelPreview multi={field.__args.multi} model={model} data={controller[1]} editable={model => controller[2](field.__args.multi && field.__args.multi > 1 ? model : model[0])} />
            </FieldSkeleton>
        </div>
    );
}