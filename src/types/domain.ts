import { User } from "./users";

export interface Domain {
    name: string;
    host: string;
    theme: Object;
    published: boolean;
    _id: string;
    created_at: Date;
    created_by: User;
    updated_at?: Date;
    updated_by?: User;
}

export interface DomainInput {
    name: string;
    host: string;
}