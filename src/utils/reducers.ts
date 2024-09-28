/* Start From Reducer */

import { FormInputs } from "./hooks"

export enum FormActions {
    SET,
    SET_ALL
}

export type FromAction = 
    { type: FormActions.SET, prop: string, value: any } |
    { type: FormActions.SET_ALL, data: FormData }

export type FormData = {[key: string] : any };

export const fromReducer = (dispatch?: React.Dispatch<FromAction>, inputs?: FormInputs) => (state: FormData, action: FromAction) => {
    switch(action.type) {
        case FormActions.SET: {
            const newState = {
                ...state,
                [action.prop] : action.value
            };

            if(dispatch && inputs) {
                const validator = inputs.find(input => input.name === action.prop)?.validator;

                if(validator)
                dispatch({ type: FormActions.SET, prop: action.prop, value: validator(action.value, newState) })
            }

            return newState
        }
        case FormActions.SET_ALL: return action.data;
    }
}