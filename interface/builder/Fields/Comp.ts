import { BuilderComp, BuilderOptionalFieldFunction, CompFieldArgs, CompFieldObject, FieldTypes } from "../types";

const CompField : BuilderOptionalFieldFunction<CompFieldObject, CompFieldArgs> = (args) => ({
    __type: FieldTypes.Comp,
    __args: args as any,
    __style: args.style
});

export default CompField;