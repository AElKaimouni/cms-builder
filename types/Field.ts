
export interface ModelPropsObject {
    [key: string] : FieldObject | ModelPropsObject;
}

// Start String Field Types

interface StringFieldBaseArgs {
    default?: string;
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
};

// Start Number Field Types

interface NumberFieldBaseArgs {
    default?: number;
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
}

// Start Boolean Types

export interface BooleanFieldArgs {
    default?: boolean;
}

export interface BooleanFieldObject {
    __type: FieldTypes.Boolean;
    __args: BooleanFieldArgs;
}

// Start Model Types

export interface ModelFieldArgs {
    model: string;
    multi?: number;
    default?: string;
}

export interface ModelFieldObject {
    __type: FieldTypes.Model;
    __args: ModelFieldArgs;
}

// Start List Types

export interface ListFieldArgs {
    props: ModelPropsObject | ModelPropsObject["key"];
    default?: any[];
    display?: "block" | "inline";
}

export interface ListFieldObject {
    __type: FieldTypes.List;
    __args: ListFieldArgs;
}


// Start Global Types

export enum FieldTypes { String = "string", Number = "number", Boolean = "boolean", Model = "model", List = "list" }

export type FieldObject =
    StringFieldObject |
    NumberFieldObject |
    BooleanFieldObject |
    ModelFieldObject |
    ListFieldObject
;

export type FieldFunction<Field, Args> = (args: Args) => Field;
export type OptionalFieldFunction<Field, Args> = (args?: Args) => Field;