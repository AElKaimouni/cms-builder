import { BuilderOptionalFieldFunction, FieldTypes, StringFieldArgs, StringFieldObject } from "../types";


const StringField : BuilderOptionalFieldFunction<StringFieldObject, StringFieldArgs> = (args = { type: "short" }) => ({
    __type: FieldTypes.String,
    __args: args,
    __style: args.style
});

export default StringField;