import mongoose from "mongoose";
import { UserCreateInput, UserFindInput, UserDeleteInput, UserUpdateInput, UserTableInput, UserLoginInput } from "../../types";

const nameRegExp = /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/;
const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export const validateUserCreateInput = (input: UserCreateInput) : UserCreateInput | null => {
    if(!input.name || !nameRegExp.test(input.name)) return null;
    if(!input.email || !emailRegExp.test(input.email)) return null;
    if(!input.password || !passRegExp.test(input.password)) return null;

    return {
        email: input.email,
        name: input.name,
        password: input.email,
        avatar: input.avatar,
        perms: input.perms,
        role: input.role,
    };
}

export const validateUserFindInput = (input: UserFindInput) : UserFindInput | null => {
    if(typeof input.name !== "string" && typeof input.email !== "string" && typeof input._id !== "string") return null;
    if(typeof input._id === "string" && !mongoose.Types.ObjectId.isValid(input._id)) return null;
    if(input.query && typeof input.query !== "string") return null;

    return input;
}

export const validateUserUpdateInput = (input: UserUpdateInput) : UserUpdateInput | null => {
    if(!input.user) return null;
    
    const user = validateUserFindInput(input.user as UserFindInput);

    if(!user) return null;

    if(input.data.name && !nameRegExp.test(input.data.name)) return null;
    if(input.data.email && !emailRegExp.test(input.data.email)) return null;
    if(input.data.password && !passRegExp.test(input.data.password)) return null;

    return { data: {
        avatar: input.data.avatar,
        email: input.data.email,
        name: input.data.name,
        password: input.data.password,
        perms: input.data.perms,
        role: input.data.role,
        first_name: input.data.first_name,
        last_name: input.data.last_name
    }, user };
};

export const validateUserDeleteInput = (input: UserDeleteInput) : UserDeleteInput | null => {
    if(!Array.isArray(input.users)) return null;

    return { users: input.users.map(user => validateUserFindInput(user as UserFindInput)).filter(user => user) };
}

export const validateUserTableInput = (input: UserTableInput) : UserTableInput | null => {
    if(input.max && typeof input.max !== "number") return null;
    if(input.skip && typeof input.skip !== "number") return null;
    if(input.query && typeof input.query !== "string") return null;
    if(input.search && typeof input.search !== "string") return null;

    return input;
}

export const validateUserLoginInput = (input: UserLoginInput) : UserLoginInput | null => {
    if(typeof input.name !== "string") return null;
    if(typeof input.password !== "string") return null;

    return input;
}