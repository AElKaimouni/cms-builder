import { BuilderOptionalFieldFunction, FieldTypes, NumberFieldArgs, NumberFieldObject } from "../types";

const NumberField : BuilderOptionalFieldFunction<NumberFieldObject, NumberFieldArgs> = (args = { type: "int" }) => ({
    __type: FieldTypes.Number,
    __args: args,
    __style: args.style
});

export default NumberField;