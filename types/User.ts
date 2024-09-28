import mongoose from "mongoose";
import { Media } from "./Media";

export enum UserRole {
    Developer,
    Super_Admin,
    Admin,
    User
}


export interface UserInput {
    name: User["name"];
    email: User["email"];
    password: User["password"];
    role?: User["role"];
}

export interface UserEditData {
    role?: User["role"];
}

export interface UserPayload {
    id: string;
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
    created_at: Date;
    avatar: Media;
    verified_at: Date;
}

export type UserDocument = mongoose.Document<unknown, any, User> & User & {
    _id: mongoose.Types.ObjectId;
}

export interface UserCreateInput {
    name: User["name"];
    email: User["email"];
    password: User["password"];
    role?: User["role"];
    perms?: User["perms"];
    avatar?: User["avatar"];
    first_name?: User["first_name"];
    last_name?: User["last_name"];
}

export type UserFindInput = ({ name: string } | { email: string } | { _id: string }) & { query?: string } & { name?: string, _id?: string, email?: string };

export interface UserUpdateInput {
    user: Omit<UserFindInput, "query">;
    data: Partial<Omit<User, "created_at" | "verified_at" | "avatar">> & { avatar?: string };
}

export interface UserDeleteInput {
    users: Omit<UserFindInput, "query">[];
}

export interface UserTableInput {
    max?: number;
    skip?: number;
    query?: string;
    sort?: { [key: string] : mongoose.SortOrder };
    search?: string;
}


export interface UserLoginInput {
    name: User["name"];
    password: User["password"];
    remeber?: boolean;
}