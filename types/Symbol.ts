import mongoose from "mongoose";
import { Domain } from "../classes";

export interface SymbolObject {
    __name: string;
    comp: string;
    data: any;
    type: "Section" | "Comp";
    domain: Domain;
    models: string[];
    locale: string;
}

export type SymbolDocument = mongoose.Document<unknown, any, SymbolObject> & SymbolObject & Required<{
    _id: mongoose.Types.ObjectId;
}>

export interface SymbolCreateInput {
    __name?: SymbolObject["__name"];
    comp: SymbolObject["comp"];
    data: SymbolObject["data"];
    type: SymbolObject["type"];
    domain: string;
    locale: string;
};

export interface SymbolDeleteInput {
    ids: string[];
}