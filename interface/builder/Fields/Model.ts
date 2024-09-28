import { BuilderOptionalFieldFunction, FieldTypes, ModelFieldArgs, ModelFieldObject } from "../types";

const ModelField : BuilderOptionalFieldFunction<ModelFieldObject, ModelFieldArgs> = (args) => ({
    __type: FieldTypes.Model,
    __args: args as any,
    __style: args.style
});

export default ModelField;