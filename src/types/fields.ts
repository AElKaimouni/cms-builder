
export interface ModelPropsObject {
    [key: string] : FieldObject | ModelPropsObject;
}

export interface FieldBaseArgs<Type> {
    validate?: {
        custom?: (((val: Type) => string | undefined) | RegExp | string)[] | ((val: Type) => string | undefined) | RegExp | string;
        required?: boolean;
        unique?: boolean;
    };
}

// Start String Field Types

interface StringFieldBaseArgs extends FieldBaseArgs<string> {
    default?: string;
    width?: string;
    generator?: () => Promise<string>
}

export interface ShortStringField extends StringFieldBaseArgs{
    type?: "short";
    prefix?: string;
}

export interface PasswordStringField extends StringFieldBaseArgs{
    type: "password";
}

export interface LongStringField extends StringFieldBaseArgs{
    type: "long";
}

export interface StyledStringField extends StringFieldBaseArgs{
    type: "styled";
}

export interface ColorStringField extends StringFieldBaseArgs{
    type: "color";
    gradient?: boolean;
    enums?: string[];
}

export interface DateStringField extends StringFieldBaseArgs{
    type: "date";
}

export interface EnumStringField extends StringFieldBaseArgs{
    type: "enum";
    enums: string[];
}

export type StringFieldArgs = 
    ShortStringField |
    LongStringField |
    StyledStringField |
    ColorStringField |
    DateStringField |
    EnumStringField |
    PasswordStringField
;

export type StringFieldObject = {
    __type: FieldTypes.String;
    __args: StringFieldArgs;
};

// Start Number Field Types

interface NumberFieldBaseArgs  extends FieldBaseArgs<number> {
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
    __args: NumberFieldArgs;
}

// Start Boolean Types

export interface BooleanFieldArgs extends FieldBaseArgs<boolean> {
    default?: boolean;
}

export interface BooleanFieldObject {
    __type: FieldTypes.Boolean;
    __args: BooleanFieldArgs;
}

// Start Model Types

export interface ModelFieldArgs extends FieldBaseArgs<any> {
    model: string;
    multi?: number;
    default?: string;
}

export interface ModelFieldObject {
    __type: FieldTypes.Model;
    __args: ModelFieldArgs;
}

// Start List Types

export interface ListFieldArgs extends FieldBaseArgs<any[]> {
    props: ModelPropsObject | ModelPropsObject["key"];
    default?: any[];
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