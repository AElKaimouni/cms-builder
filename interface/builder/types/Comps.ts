import { CompStyleProps, FieldObject } from "./Fields";

export interface CompPropsObject {
    [key: string] : FieldObject | CompPropsObject;
}

export interface BuilderComp {
    comp: (...args: any[]) => JSX.Element;
    props: CompPropsObject | FieldObject | any;
    name: string;
    display?: "inline" | "block";
    style?: CompStyleProps;
    fixed?: boolean;
}

export interface BuilderGroupedComps {
    [key: string] : BuilderComp[]
}

export interface BuilderComps {
    [key: string] : BuilderComp;
}