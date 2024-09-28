import { FieldObject, ModelPropsObject, FieldTypes, StringFieldObject, NumberFieldObject, BooleanFieldObject, ListFieldObject, ModelFieldObject } from "../../types";
import { default as StringField } from "./StringField";
import { default as NumberField } from "./NumberField";
import { default as BooleanField } from "./BooleanField";
import { default as ModelField } from "./ModelField";
import { default as ListField } from "./ListField";
import React, { Dispatch, ReactNode, useEffect } from "react";
import { CloseIcon, DoneIcon, ListIcon, designModelFields, normalizePropName } from "../../utils";
import ModelPreview from "../ModelPreview";
import { useMainContext } from "../../states";
import Skeleton from "../Skeleton";

export interface FieldBaseProps {
    label: string;
    methods: {
        icon: ReactNode;
        events: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, any>;
    }[];
    context?: string;
    prop?: string;
    loading?: boolean;
}

interface FieldMethodsProps {
    methods: FieldBaseProps["methods"];
}

export const FieldMethods = ({ methods } : FieldMethodsProps) => {
    return (
        <div className="model-field-methods">
            {methods.map((method, index) => (
                <button key={index} className="model-field-method app-button" {...method.events}>
                    {method.icon}
                </button>
            ))}
        </div>
    )
}

interface Props extends FieldBaseProps {
    controller: [any, any, Dispatch<any>];
    props: FieldObject | ModelPropsObject;
    container?: boolean;
}

interface FieldsProps extends FieldBaseProps {
    controller: [any, any, Dispatch<any>];
    props: ModelPropsObject;
}

interface FieldSkeletonProps extends React.ComponentProps<typeof Skeleton> {
    loading?: boolean;
    children: ReactNode;
}

export const FieldSkeleton = ({ loading, children, ...props } : FieldSkeletonProps) => {
    if(loading) return <Skeleton {...props} />;
    else return <>{children}</>;
}

const PropsFields = ({ props, controller, label, context, prop, loading } : FieldsProps) => {
    return (
        <>
            {Object.keys(props).map((name) => (
                <Field key={name}
                    methods={[]}
                    controller={[controller[0][name], controller[1][name], data => controller[2]({ ...controller[1], [name]: data })]}
                    props={props[name]}
                    label={name}
                    prop={name}
                    context={(context ? context + "." : "") + name}
                    loading={loading}
                />
            ))}
        </>
    );
}

const Field =  ({ props, controller, label, methods, container, context, prop, loading } : Props) => {
    const isField = typeof props.__type === "string";
    const baseProps = { methods, label, container, controller, context, prop, loading}

    if(isField) switch(props.__type as FieldObject["__type"]) {
        case FieldTypes.String: return <StringField {...baseProps} field={props as StringFieldObject} />;
        case FieldTypes.Number: return <NumberField {...baseProps} field={props as NumberFieldObject} />;
        case FieldTypes.Boolean: return <BooleanField {...baseProps} field={props as BooleanFieldObject} />;
        case FieldTypes.List: return <ListField {...baseProps} container={container} field={props as ListFieldObject} />;
        case FieldTypes.Model: return <ModelField {...baseProps} field={props as ModelFieldObject} />;
    } else return (<>
        {label && !container && <div className="model-fields-group">
            <div style={{ marginBottom: "0em", marginLeft: 0 }} className="page-panel-header">
                <ListIcon /> <span>{normalizePropName(label)}</span>
            </div>
            <div className="model-fields-group-list">
                {designModelFields(props).filter(prop => Object.keys(prop).length).map(props => (
                    <PropsFields methods={methods} label={""} context={context} loading={loading} prop={prop} controller={controller} props={props} />
                ))}
            </div>
        </div>}
        {label && container && <>
            <div className="page-panel-header">
                <ListIcon /> <span>{normalizePropName(label)}</span>
            </div>
            <div className="page-panel fields-panel">
                {designModelFields(props).filter(prop => Object.keys(prop).length).map(props => (
                    <PropsFields methods={methods} label={""} loading={loading} context={context} prop={prop} controller={controller} props={props} />
                ))}
            </div>
        </>}
        {!label && designModelFields(props).filter(prop => Object.keys(prop).length).map((props, index) => (
            <PropsFields key={index} methods={methods} label={""} loading={loading} context={context} prop={prop} controller={controller} props={props} />
        ))}
        <FieldMethods methods={methods} />
    </>);
};

interface PreviewFieldProps {
    data: any;
    field: FieldObject;
}

export const PreviewField = ({ data, field } : PreviewFieldProps) => {
    const { controller: { models: { getModel } } } = useMainContext();

    return (
        <div className={`field-preveiw ${field.__type}`}>
            {(() => {switch(field.__type) {
                case FieldTypes.Boolean: return (
                    <>{data ? <DoneIcon /> : <CloseIcon />}</>
                );
                case FieldTypes.Model: return (
                    <ModelPreview table data={data} model={getModel(field.__args.model)} />
                );
                case FieldTypes.String: {
                    switch(field.__args.type) {
                        case "color": return (
                            <div className="Custom-Color-Picker-Sample" style={{ background: data }}></div>
                        );
                        case "date": return (new Date(data)).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        case "styled": return <div dangerouslySetInnerHTML={{ __html: data }}></div>;
                        default: return data
                    }
                }; break;
                default: return data;
            }})()}
        </div>
    )
};

export default Field;