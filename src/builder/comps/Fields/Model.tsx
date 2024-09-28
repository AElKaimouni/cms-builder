import { Dispatch, useEffect, useState } from "react";
import { BuilderFieldMethods, BuilderFieldMethodsProps } from ".";
import { Data, Field } from "../../classes";
import { LayoutActions, useBuilderContext } from "../../states";
import { BuilderMedia, ModelFieldArgs } from "../../types";
import { medelToRef, parseMediaLocalUrl, storeModel } from "../../utils";
import { BuilderModals } from "../../utils/modals";
import { ModelPreview } from "../../../comps";
import { useMainContext } from "../../../states";
import { getModelID } from "../../../utils";
import { ModelAPi } from "../../../APIs";

interface ModelInputProps {
    args: ModelFieldArgs;
    value: any;
    setValue: Dispatch<any>;
    label: string;
    reset?: boolean;
    defaultValue?: string;
    methods?: BuilderFieldMethodsProps["methods"];
}



export const ModelInput = ({ args, label, setValue, value, defaultValue, methods, reset } : ModelInputProps) => {
    const { controller: { models, modals } } = useMainContext();
    const model = models.getModel(args.model);

    return (
        <div className="__Builder-Field __Builder-Model-Field __Builder-Media-Model-Field">
            {(() => { switch(args.model) {
                default: return (
                    <ModelPreview label={label} model={model} data={value} editable={async models => {
                        const model = models[0];
                        const modelObject = await ModelAPi.ref(args.model, model._id, args.query);

                        storeModel(modelObject, medelToRef(model, args.model, args.query).__ref);
                        
                        setValue(modelObject);
                    }} />
                )
            } })()}
        </div>
    )
}

interface ModelFieldProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    data: Data;
    reset?: boolean;
    label: string;
    methods?: BuilderFieldMethodsProps["methods"];
}


export const ModelField = ({ data, label, reset, methods, ...props } : ModelFieldProps) => {
    const [value, setValue] = useState(data?.__rdata);
    const field = data.__props as Field;
    const args = field.__args as ModelFieldArgs;


    data.__dispatch = setValue;
    useEffect(() => {
        if(value && getModelID(value)) data.__edit(medelToRef(value, args.model, args.query));
    }, [value]);

    return (
        <ModelInput {...props}
            args={field.__args as ModelFieldArgs}
            label={label}
            setValue={setValue}
            value={value}
            defaultValue={field.__default()}
            reset={reset}
            methods={methods}
        />
    )
}

export default ModelField;