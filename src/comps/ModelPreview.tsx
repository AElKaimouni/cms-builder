import { Dispatch, ReactNode } from "react";
import { ModelObject } from "../types"
import { getModelPreview } from "../utils";
import { ModalPickerCallBack } from "../states/modals/ModelPicker";
import { useMainContext } from "../states";
import Media from "./Media";

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    model: ModelObject;
    data: any | any[];
    table?: boolean;
    selectable?: [() => boolean, Function];
    editable?: ModalPickerCallBack;
    label?: string;
    multi?: number;
    children?: ReactNode;
    methods?: {
        icon: ReactNode;
        callBack: () => void;
        color?: string;
    }[];
}

export default ({ model, data, selectable, editable, label, table, multi, children, methods, ...props } : Props) => {
    const { controller: { modals, router } } = useMainContext();
    const multiImages = Array.isArray(data);
    const images = (Array.isArray(data) ? data : [data]).map(data => getModelPreview(model, data));
    const image = images[0].image;
    const name = images[0].name;

    return (
        <div {...props} {...(editable ? {
            onClick: () => modals.modelPicker.open(model, editable, multi || 1),
            style: { ...props.style, cursor: "pointer" }
        } : {})} {...(selectable ? {
            onClick : e => selectable[1]()
        } : {})}  className={`model-preview ${table ? "table" : ""} ${image && image.type === "video" ? "video" : ""}` + (props.className || "")} >
            {label && <label className="model-preview-label">{label}</label>}
            {image && !(table && model.name !== "media") && !multiImages && <Media media={image} width={150} className={`model-preview-image `} src={image.url} />}
            {image && !(table && model.name !== "media") && multiImages && (
                <div className={`model-preview-multi multi-${Math.min(4, images.length)}`}>
                    {images.map(image => (
                        <Media media={image.image} width={150} />
                    ))}
                </div>
            )}
            {!table && <>
                {!image && <p className="model-preview-message">Click to select a model of type {model.name}</p>}
                {images.length === 1 && <span className="model-preview-name">{name && name.substring(0, 15)}</span>}
                {selectable && <>
                    <input readOnly type="checkbox" className="model-preview-checkbox"
                        checked={selectable[0]()}
                    />
                </>}
            </>}
            {table && model.name !== "media" && <>
                <a onClick={() => router.navigate(`/models/new/${model.name}/${data._id}`)} className="model-preview-table-name unclickable">{name && name.substring(0, 15)}</a>
            </>}
            {methods && <div className="model-preview-methods">
                {methods.map((method, index) => (
                    <button onClick={method.callBack} key={index} className={`model-preview-method-item app-button icon ${method.color || ""}`}>
                        {method.icon}
                    </button>
                ))}
            </div>}
            {children}
        </div>
    )
}