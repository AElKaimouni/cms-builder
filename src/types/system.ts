import { Domain } from "./domain";

export interface LocaleObject {
    name: string;
    ext: string;
    id: string;
}

export interface RawSystemStatus {
    firstUser: boolean;
    maintenance: boolean;
    locales: LocaleObject[];
    defaultLocale: string;
    domains: Domain[];
}

export interface SystemStatus {
    firstUser: boolean;
    maintenance: boolean;
    locales: LocaleObject[];
    defaultLocale: string;
    domains: {
        [key: string] : Domain;
    };
}