import React, { useEffect, useMemo, useState } from "react";
import { ModelProps, ModelField } from "../modules";
import { useMainContext } from "../states";
import { FieldTypes, StringFieldArgs } from "../types";
import { ModelObject } from "../types/models"
import { AddIcon, DeleteIcon, fieldsTemplates, modelTypes, useForm, useList, useModal, useModelProps, FormInputs, useTags } from "../utils";
import Form from "./Form";
import Modal from "./Modal";
import Tags from "./Tags";

// Model Field Component
interface ModelFieldProps {
    field: ModelField;
    name: string;
    list?: boolean;
}

const ModelFieldComp = ({ field, name, list } : ModelFieldProps) => {
    const { editProp } = useEditorContext();
    const { controller } = useMainContext();
    const deleteHandler = () => {
        controller.modals.confirm.open({
            title: "Deleting Model Field",
            type: "danger",
            cancel: "Cancel",
            confirm: "Delete",
            message: `Are you sure you wants to delete ${name} ?`
        }).then(res => {
            if(res) field.__remove();
        })
    };
    const editHandler = () => {
        editProp(field);
    }

    return (
        <div onClick={e => {
            if(e.target instanceof HTMLElement && !e.target.closest(".model-field-tools")) {
                editHandler()
            }
        }} className="model-field">
            <div className="model-field-type">
                <div className="app-tag">
                    {list ? "List oF" : ""} {field.__type}{list ? "s" : ""}
                </div>
            </div>
            <div className="model-field-name">
                {name}
            </div>
            <div className="model-field-tools">
                <button onClick={deleteHandler} className="app-button danger icon">
                    <DeleteIcon />
                </button>
            </div>
        </div>
    )
}

// Model Props Component 

interface ModelPropsProps {
    name: string;
    props: ModelProps;
    list?: boolean;
    root?: boolean;
}

const ModelPropsComp = ({ name, props, list, root } : ModelPropsProps) => {
    const { controller } = useMainContext();
    const { addProp } = useEditorContext();
    const deleteHandler = () => {
        controller.modals.confirm.open({
            title: `Deleting ${list ? "List" : (root ? "Model" : "Object")}`,
            type: "danger",
            cancel: "Cancel",
            confirm: "Delete",
            message: `Are you sure you wants to delete ${name} ?`
        }).then(res => {
            if(res) props.__remove();
        })
    };

    return (
        <div className="model-props">
            <div className="model-props-header">
                <div className="model-field-type">
                    <div className="app-tag">
                        {list ? "List" : (root ? "Model" : "Object")}
                    </div>
                </div>
                <div style={root ? { textTransform: "capitalize" } : {}} className="model-props-name">
                    {name}
                </div>
                <div className="model-props-tools">
                    <button onClick={() => addProp(props)} className="icon primary app-button">
                        <AddIcon />
                    </button>
                    <button onClick={deleteHandler} className="danger icon app-button">
                        <DeleteIcon />
                    </button>
                </div>
            </div>
            <div className="model-props-body">
                {props.__map((prop, propName) => {
                    const isField = prop instanceof ModelField;

                    if(isField && prop.__listProps) {
                        if(prop.__listProps instanceof ModelField) return <ModelFieldComp field={prop.__listProps} name={propName} key={propName} list />;
                        else return <ModelPropsComp key={propName} props={prop.__listProps} name={propName} list />
                    }
                    else if(isField) return <ModelFieldComp field={prop} name={propName} key={propName} />
                    else return <ModelPropsComp key={propName} props={prop} name={propName} />
                })}
            </div>
        </div>
    )
}

// Editor Create Form Modal
interface EditorCreateFormProps extends Omit<React.ComponentProps<typeof Modal>, "children" | "footer" | "header"> {

}

const EditorCreateForm = ({ controller } : EditorCreateFormProps) => {
    const [selectedTemplate, setSelectedTemplate] = useState<null | typeof fieldsTemplates[0]>(null);
    const { isActive, active } = useList<1 | 2>(1);

    return (
        <Modal controller={controller} header="Create New Field" footer={<>
            {isActive(2) && <>
                <button className="app-button" onClick={() => {
                    setSelectedTemplate(null);
                    isActive(1);
                    controller.close();
                }}>Cancel</button>
                <button className="primary app-button">Save</button>
            </>}
        </>}>
            {isActive(1) && (
                <div className="add-field-templates-panel">
                    <h3>Select type Of Field</h3>
                    <ul className="add-field-templates-list">
                        {fieldsTemplates.map(template => (
                            <li onClick={() => {
                                setSelectedTemplate(template);
                                active(2);
                            }} key={template.name} className="add-field-template-item">
                                {template.icon}
                                {template.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isActive(2) && <EditorEditForm />}
        </Modal>
    )
}

// Editor Edit Form Modal

interface EditorEditFormProps extends Omit<React.ComponentProps<typeof Modal>, "children" | "footer" | "header"> {

}

const EditorEditFormModal = ({ controller } : EditorCreateFormProps) => {
    return (
        <Modal controller={controller} header="Edit Field" footer={<>
                <button className="app-button" onClick={controller.close}>Cancel</button>
                <button className="primary app-button">Save</button>
        </>}>
            edit form
        </Modal>
    )
}

// Editor Edit Form Compoenet

interface EditorFormProps {

}

const EditorEditForm = ({  } : EditorFormProps) => {
    const [type, setType] = useState<FieldTypes>();
    const [args, setArgs] = useState<any>({});
    

    return (
        <div className="model-editor-form">
            <div className="model-editor-form-types">
                <label>Field Type</label>
                <ul className="model-editor-types-list">
                    {modelTypes.map(typeItem => (
                        <li key={typeItem}
                            onClick={() => setType(typeItem)}
                            className={`model-editor-type-item ${typeItem === type ? "active" : ""}`}
                        >
                            {typeItem}
                        </li>
                    ))}
                </ul>
            </div>
            {(() => {
                switch(type) {
                    case FieldTypes.String: return <EditorStringArgsForm controller={[args, setArgs]} />;
                }
            })()}
        </div>
    )
}

// Editor String Args Form

interface EditorStringArgsFormProps {
    controller: [any, React.Dispatch<React.SetStateAction<any>>]
}

const EditorStringArgsForm = ({ controller } : EditorStringArgsFormProps) => {
    const types : string[] = ["short", "color", "date", "enum", "long", "styled"];
    const [type, setType] = useState<string>("short");
    const [defaultValue, setDefaultValue] = useState<string>("");
    const [gradient, setGradient] = useState<boolean>(false);
    const enumsController = useTags();

    useEffect(() => {
        controller[1]((() => {
            return {
                type,
                default: defaultValue,
                ...(type === "color" ? {
                    gradient,
                } : {}),
                ...(type === "enum" ? {
                    enums: enumsController.tags,
                } : {})
            }
        })())
    }, [type, defaultValue, gradient, enumsController.tags])

    return (
        <div className="model-editor-string-form">
            <div className="model-editor-form-types">
                <label>String Type</label>
                <ul className="model-editor-types-list">
                    {types.map(typeItem => (
                        <li key={typeItem}
                            onClick={() => setType(typeItem)}
                            className={`model-editor-type-item ${typeItem === type ? "active" : ""}`}
                        >
                            {typeItem}
                        </li>
                    ))}
                </ul>
            </div>
            {(() => {
                switch(type) {
                    case "short": return (<>
                        <div className="form-group">
                            <label>Default Value</label>
                            <input type="text" value={defaultValue} onChange={e => setDefaultValue(e.target.value)} />
                        </div>
                    </>);
                }
            })()}
            {/* <Tags controller={enumsController} /> */}
        </div>
    )
}


// Editor Root Component
interface Props {
    model: ModelObject;
}

export default ({ model } : Props) => {
    const createModalController = useModal();
    const editModalController = useModal();
    const module = useModelProps(model.props, () => {});

    return (
        <context.Provider value={{
            addProp: model => {
                createModalController.open();
            },
            editProp: model => {
                editModalController.open();
            },
        }}>
            <div className="model-editor">
                <ModelPropsComp props={module} name={model.name} root />
            </div>
            <EditorCreateForm controller={createModalController} />
            <EditorEditFormModal controller={editModalController} />
        </context.Provider>
    )
}

// Editor Context
interface EditorContext {
    addProp: (model: ModelProps) => void;
    editProp: (model: ModelField) => void;
};

const context = React.createContext<EditorContext>({} as any);
const useEditorContext = () => React.useContext(context);