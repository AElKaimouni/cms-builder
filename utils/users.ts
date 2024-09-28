import { User } from "../types";

export const projectUser = (user: User) => {
    const clone : any = {...user};

    delete clone["password"];

    return clone;
}