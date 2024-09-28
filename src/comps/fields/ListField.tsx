import { Dispatch } from "react";
import { ListFieldObject } from "../../types";
import { AddIcon, DeleteIcon, ListIcon, getPropsDefaultData, normalizePropName } from "../../utils";
import { default as Field, FieldBaseProps } from ".";

interface Props extends FieldBaseProps {
    controller: [any[], any[], Dispatch<any[]>];
    field: ListFieldObject;
    label: string;
    container?: boolean;
}

export default ({ field, controller, label, container, loading, context } : Props) => {
    const args = field.__args;
    const FieldElement = (ldata, index, label?) => (
        <Field loading={loading} context={context + "." + index} prop={index} methods={[]} key={index} props={args.props}  label={label}
            controller={[controller[0][index], ldata, data => controller[2](controller[1].map((d, i) => {
                if(i === index) return data;
                else return d;
            }))]}
        />
    )

    return (
        <>
            <div style={!container ? { marginBottom:0, marginLeft: 0 } : { marginBottom: "1em" }} className="page-panel-header">
                <ListIcon /> <span>{label}</span>
            </div>
            {controller[1].map((ldata, index) => (<>
                <div style={!container ? { marginBottom:0, marginLeft: 0 } : { }} className="page-panel-header list-header">
                    <ListIcon /> <span>{`item ${index + 1}`}</span>
                    <button className="app-button icon primary" onClick={() => controller[2](controller[1].filter((k,i) => i !== index))}>
                        Delete
                    </button>
                </div>
                <div className={!container ? "model-fields-group-list" : "page-panel fields-panel"}>
                    {FieldElement(ldata, index)}
                </div>
            </>))}
            <div className="list-field-footer page-panel no-background">
                <button className="app-button icon primary" onClick={() => controller[2](controller[1].concat([ getPropsDefaultData(args.props) ]))}>
                    <AddIcon /> 
                </button>
                <span>Add Item</span>
            </div>
        </>
    )
}