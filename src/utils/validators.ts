import { FormData } from ".";
import { ModelAPi } from "../APIs";
import { FieldObject } from "../types";


export const usernameValidator = (value: string) : string => {
    const nameRegExp = /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/;

    if(!nameRegExp.test(value))
        return "Username is not valid.";

    return "";
}

export const emailValidator = (value: string) : string => {
    const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if(!emailRegExp.test(value))
        return "Please enter a valid email";

    return "";
}
 
export const passwordValidator = (value: string) : string => {
    const passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

    if(!passRegExp.test(value))
        return "Password is not valid.";

    return "";
}

export const cpasswordValidator = (value: string, data: FormData) : string => {
    if(value !== data["password"])
        return "The two password are not equal";

    return "";
}

export const validateField = (value : any, args: FieldObject["__args"]) => {
    if(args.validate) {
        if(args.validate.required) {
            if(!value) return "This field is required";
        }
        if(args.validate.custom) {
            for(const validate of Array.isArray(args.validate.custom) ? args.validate.custom : [args.validate.custom]) {
                if(typeof validate === "function") {
                    const res = validate(value as never);

                    if(res) return res;
                } else {
                    const res = (typeof validate === "string" ? new RegExp(validate) : validate).test(value);

                    if(!res) return "Unvalid pattren";
                }
                
            }
        }


    }
};

export const validateUniqueField = async (value : any, args: FieldObject["__args"], info: {
    model: string;
    field: string;
    locale: string;
    id?: string;
}, signal: AbortController) => {
    if(args.validate) {
        
        if(args.validate.unique && info) {
            const res = await ModelAPi.unique({
                ...info,
                value
            }, signal);

            if(!res) return "This field must be unqiue";
        }

    }
};

export const checkFields = (root: HTMLElement) => {
    const target = root.querySelector(".errored-model-input");

    if(target) {
        const input = target.querySelector("input, textarea, select") as HTMLInputElement;
       
        if(input) input.focus();
        else target.scrollIntoView();

        return false;
    }

    return true;
}