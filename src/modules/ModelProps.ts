import React from "react";
import { FieldObject, FieldTypes, ListFieldObject, ModelPropsObject } from "../types";

export class ModelField {
    public __state: FieldObject;
    private __dispatch: React.Dispatch<React.SetStateAction<FieldObject>>;
    public __listProps: ModelProps | ModelField | null;
    public __remove: () => void;
    constructor(init: FieldObject, dispatch: ModelField["__dispatch"], remove: ModelField["__remove"]) {
        this.__state = init;
        this.__dispatch = dispatch;
        this.__remove = remove;

        this.__listProps = ModelField.getListProps(this.__state,  this.__dispatch, this.__remove);
    }

    get __type() {
        return this.__state.__type;
    }

    get __args() {
        return this.__state.__args
    }

    static getListProps(field: FieldObject, dispatch: ModelField["__dispatch"], remove: ModelField["__remove"]) : ModelField["__listProps"] {
        if(field.__type === FieldTypes.List) {
            const props = field.__args.props
            const ndispatch = value => dispatch(val => ({
                ...(field as ListFieldObject),
                __args: {
                    ...field.__args,
                    props: typeof value === "function" ? value((val as ListFieldObject).__args.props) : value
                }
            } as ListFieldObject));

            if(typeof props.__type === "string") 
                return new ModelField(props as FieldObject, ndispatch, remove);
            else 
                return new ModelProps(props as ModelPropsObject, ndispatch, remove);
        } else return null;
    }
}

export class ModelProps {    
    public __state: ModelPropsObject;
    private __dispatch: React.Dispatch<React.SetStateAction<ModelPropsObject>>;
    public __remove: () => void;
    constructor(init: ModelPropsObject, dispatch: ModelProps["__dispatch"], remove: () => void) {
        this.__state = init;
        this.__dispatch = dispatch;
        this.__remove = remove;

        this.__props.forEach(({ prop, type, value }) => {
            this[prop] = type === "field" ?
                new ModelField(
                    value as FieldObject,
                    value => dispatch(val => ({
                        ...this.__state,
                        [prop] : typeof value === "function" ? value(val[prop] as FieldObject) : value
                    })),
                    () => dispatch(val => {
                        delete val[prop];

                        return val;
                    })
                ) :
                new ModelProps(
                    value as ModelPropsObject,
                    value => dispatch(val => ({
                        ...this.__state, [prop] : typeof value === "function" ? value(val[prop] as ModelPropsObject) : value
                    })),
                    () => dispatch(val => {
                        delete val[prop];

                        return val;
                    })
                );
        })
    }

    public get __props() {
        return Object.keys(this.__state).map(key => ({
            prop: key,
            type: typeof this.__state[key].__type === "string" ? "field" : "props",
            value: this.__state[key]
        }));
    }

    public __each(callBack: (props: ModelField | ModelProps, name: string) => void) {
        return Object.keys(this.__state).forEach(prop => {
            callBack(this[prop], prop);
        });
    }

    public __map(callBack: (props: ModelField | ModelProps, name: string) => any) : (ReturnType<typeof callBack>)[] {
        const res : (ReturnType<typeof callBack>)[] = [];

        this.__each((props, name) => res.push(callBack(props, name)));

        return res;
    }
}
