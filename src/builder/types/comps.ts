import { Field, Props } from "../classes";
import { CompStyleProps, FieldObject } from "./fields";

export interface CompPropsObject {
    [key: string] : FieldObject | CompPropsObject;
}


export interface BuilderComp {
    props: CompPropsObject | FieldObject;
    name: string;
    display?: "inline" | "block";
    style?: CompStyleProps;
    fixed?: boolean;
}

export interface ParsedComp {
    props: Props | Field;
    name: BuilderComp["name"];
    display: BuilderComp["display"];
    style: BuilderComp["style"];
    fixed: boolean;
    type: "section" | "comp" | "element";
}

export interface BuilderGroupedComps {
    [key: string] : BuilderComp[]
}

export interface BuilderComps {
    [key: string] : ParsedComp;
}