import { FieldFunction, FieldTypes, ListFieldArgs, ListFieldObject } from "../types";

const ListField : FieldFunction<ListFieldObject, ListFieldArgs> = (args) => ({
    __type: FieldTypes.List,
    __args: args,
    __style: args.style,
    __dynamic: args.dynamic || false
});

export default ListField;