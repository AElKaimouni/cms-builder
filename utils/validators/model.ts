import { ModelCreateInput, ModelDeleteInput, ModelGetInput, ModelLocaleSiblingInput, ModelModelUnqiueInput, ModelNewInput, ModelPublishInput, ModelTableInput, ModelUpdateInput } from "../../types";

export const validateModelGetInput = (input: ModelGetInput) : ModelGetInput | null => {
    
    return input;
}

export const validateModelCreateInput = (input: ModelCreateInput | ModelCreateInput[]) : ModelCreateInput[] | null => {

    return Array.isArray(input) ? input : [input];
}

export const validateModelNewInput = (input: ModelNewInput) : ModelNewInput | null => {

    return input;
}

export const validateModelUpdateInput = (input: ModelUpdateInput) : ModelUpdateInput | null => {

    return input;
}

export const validateModelDeleteInput = (input: ModelDeleteInput) : ModelDeleteInput | null => {

    return input;
}

export const validateTableInput = (input: ModelTableInput) : ModelTableInput | null => {
    
    return input;
}

export const validatePublishInput = (input: ModelPublishInput) : ModelPublishInput | null => {

    return input;
}

export const validateLocaleSiblingInput = (input: ModelLocaleSiblingInput) : ModelLocaleSiblingInput | null => {
    
    return input;
}

export const validateModelUnqiueInput = (input: ModelModelUnqiueInput) : ModelModelUnqiueInput | null => {
    
    return input;
}