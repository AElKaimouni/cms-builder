import { PageDocument } from "./page";

export interface BuilderSymbol {
    __name: string;
    comp: string;
    data: any;
    type: "Section" | "Comp";
    domain: string;
    _id: string;
    models: string[];
    locale: string;
}

export interface SymbolCreateInput {
    __name?: BuilderSymbol["__name"];
    comp: BuilderSymbol["comp"];
    data: BuilderSymbol["data"];
    type: BuilderSymbol["type"];
    domain: BuilderSymbol["domain"];
}