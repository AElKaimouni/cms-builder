// Start String Field Types

import { BuilderComp, CompPropsObject } from "./comps";


export interface CompStyleProps {
    typography?: {
        font?: {
            fontsList: string[];
            default: ElementCSSInlineStyle["style"]["font"];
        },
        color?: {
            default?: ElementCSSInlineStyle["style"]["color"];
        },
        weight?: {
            default?: ElementCSSInlineStyle["style"]["fontWeight"];
        },
        size?: {
            default?: ElementCSSInlineStyle["style"]["fontSize"];
        },
        height?: {
            default?: ElementCSSInlineStyle["style"]["lineHeight"];
        },
        spacing?: {
            default?: ElementCSSInlineStyle["style"]["letterSpacing"];
        },
        align?: {
            default?: ElementCSSInlineStyle["style"]["textAlign"];
        }
        style?: {
            italicize?: {
                default?: ElementCSSInlineStyle["style"]["fontStyle"];
            };
            decoration?: {
                default?: ElementCSSInlineStyle["style"]["textDecoration"];
            };
            capitalize?: {
                default?: ElementCSSInlineStyle["style"]["textTransform"];
            };
        }
    };
    background?: {
        image?: boolean;
        gradient?: boolean;
        solid?: boolean;
        default?: ElementCSSInlineStyle["style"]["background"];
    };
    border?: {
        default?: ElementCSSInlineStyle["style"]["border"];
    };
    display?: {
        default?: ElementCSSInlineStyle["style"]["display"];
    }
    spacing?: {
        margin?: {
            sides?: ("top" | "right" | "bottom" | "left")[];
            default?: ElementCSSInlineStyle["style"]["margin"];
        },
        padding?: {
            sides?: ("top" | "right" | "bottom" | "left")[];
            default?: ElementCSSInlineStyle["style"]["padding"];
        },
    };
    transform?: {
        position?: {
            axis?: ("X" | "Y")[];
            default?: [number, number]
        },
        size?: {
            axis?: ("X" | "Y")[];
            default?: [number, number]
        }
        scale?: {
            axis?: ("X" | "Y")[];
            default?: [number, number];
            scale?: boolean;
        },
        rotate?: {
            default?: number;
        },
    }
}

export interface CompGroupedStyles {
    style?: {
        typography?: CompStyleProps["typography"];
        background?: CompStyleProps["background"];
        border?: CompStyleProps["border"];
        display?: CompStyleProps["display"];
    };
    spacing?: {
        spacing?: CompStyleProps["spacing"];
        transform?: CompStyleProps["transform"];
    };
}

// Start String Field Types

interface StringFieldBaseArgs {
    default?: string;
    style?: CompStyleProps;
}

interface ShortStringField extends StringFieldBaseArgs{
    type?: "short";
}

interface LongStringField extends StringFieldBaseArgs{
    type: "long";
}

interface StyledStringField extends StringFieldBaseArgs{
    type: "styled";
}

interface ColorStringField extends StringFieldBaseArgs{
    type: "color";
    gradient?: boolean;
    enums?: string[];
}

interface DateStringField extends StringFieldBaseArgs{
    type: "date";
}

interface EnumStringField extends StringFieldBaseArgs{
    type: "enum";
    enums: string[];
}

export type StringFieldArgs = 
    ShortStringField |
    LongStringField |
    StyledStringField |
    ColorStringField |
    DateStringField |
    EnumStringField
;

export type StringFieldObject = {
    __type: FieldTypes.String;
    __args: StringFieldArgs;
    __style: CompStyleProps;
};

// Start Number Field Types

interface NumberFieldBaseArgs {
    default?: number;
    style?: CompStyleProps;
}

interface IntNumberField extends NumberFieldBaseArgs{
    type: "int";
}

interface FloatNumberField extends NumberFieldBaseArgs{
    type: "float";
}

interface EnumNumberField extends NumberFieldBaseArgs{
    type: "enum";
    enums: number[]
}

interface SliderNumberField extends NumberFieldBaseArgs{
    type: "slider";
    min: number;
    max: number;
}

export type NumberFieldArgs = 
    IntNumberField |
    FloatNumberField |
    EnumNumberField |
    SliderNumberField
;

export interface NumberFieldObject {
    __type: FieldTypes.Number;
    __args: NumberFieldBaseArgs;
    __style: CompStyleProps;
}

// Start Boolean Types

export interface BooleanFieldArgs {
    default?: boolean;
    style?: CompStyleProps;
}

export interface BooleanFieldObject {
    __type: FieldTypes.Boolean;
    __args: BooleanFieldArgs;
    __style: CompStyleProps;
}

// Start Model Types

export interface ModelFieldArgs {
    default?: any;
    model: string;
    multi?: number;
    query?: string;
    style?: CompStyleProps;
}

export interface ModelFieldObject {
    __type: FieldTypes.Model;
    __args: ModelFieldArgs;
    __style: CompStyleProps;
}

// Start List Types

export interface ListFieldArgs {
    dynamic: boolean;
    props: CompPropsObject | CompPropsObject["key"];
    default?: any[];
    style?: CompStyleProps;
    display?: "block" | "inline"
}

export interface ListFieldObject {
    __type: FieldTypes.List;
    __args: ListFieldArgs;
    __style: CompStyleProps;
    __dynamic: boolean;
}

// Start Comp Types

export interface CompFieldArgs {
    default?: any;
    comp: string;
    style?: CompStyleProps;
}

export interface CompFieldObject {
    __type: FieldTypes.Comp;
    __args: CompFieldArgs;
    __style: CompStyleProps;
}


// Start Global Types

export enum FieldTypes { String, Number, Boolean, Model, List, Comp }

export type FieldObject =
    StringFieldObject |
    NumberFieldObject |
    BooleanFieldObject |
    ModelFieldObject |
    ListFieldObject |
    CompFieldObject 
;