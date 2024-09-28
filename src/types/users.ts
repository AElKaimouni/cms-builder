import { Media } from "./media";

export enum UserRole {
    Developer,
    Super_Admin,
    Admin,
    User,
}

export interface UserPerms {
    models: {
        [model: string] : [boolean, boolean, boolean, boolean]
    }
}
export interface User {
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    perms: UserPerms;
    created_at: string;
    avatar?: Media;
    verified_at: string;
    _id: string;
}

export interface UserLoginInfo {
    name: string;
    password: string;
}

export interface UserRegisterInfo {
    name: string;
    email: string;
    password: string;
}

export type UserFindInput = ({ name: string } | { email: string } | { _id: string }) & { query?: string } & { name?: string, _id?: string, email?: string };
export interface UserUpdateInput {
    user: Omit<UserFindInput, "query">;
    data: Partial<Omit<User, "created_at" | "verified_at" | "avatar">> & { avatar?: string };
}

export interface UserTableInput {
    max?: number;
    skip?: number;
    query?: string;
    sort?: { [key: string] : "1"| "-1" };
    search?: string;
}

export interface UserDeleteInput {
    users: Omit<UserFindInput, "query">[];
}

export interface UserCreateInput {
    name: User["name"];
    email: User["email"];
    password: User["password"];
    role?: User["role"];
    perms?: User["perms"];
    avatar?: string;
    first_name?: User["first_name"];
    last_name?: User["last_name"];
}