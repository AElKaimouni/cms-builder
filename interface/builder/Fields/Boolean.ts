import { BooleanFieldArgs, BooleanFieldObject, BuilderOptionalFieldFunction, FieldTypes } from "../types";

const BooleanField : BuilderOptionalFieldFunction<BooleanFieldObject, BooleanFieldArgs> = (args = { }) => ({
    __type: FieldTypes.Boolean,
    __args: args,
    __style: args.style
});

export default BooleanField;