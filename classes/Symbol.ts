import mongoose, { mongo } from "mongoose";
import { SymbolModel } from "../database";
import { SymbolDocument, SymbolObject } from "../types";

export default class Symbol {
    private document: SymbolDocument;
    constructor(document: SymbolDocument) {
        this.document = document;
    }

    public async edit(symbol: SymbolObject) : Promise<Symbol> {
        try {
            await SymbolModel.updateOne({ _id: this.document.id }, symbol);
            this.document = await SymbolModel.findById(this.document.id);
            
            return this;
        } catch(error) { throw error };
    }

    public json() {
        return this.document.toJSON();
    }

    static async findByDomain(domainID: string) {
        const res = await SymbolModel.find({ domain: domainID });
        
        return res;
    }

    static async find(symbolID : string) : Promise<Symbol | null> {
        if(mongoose.isValidObjectId(symbolID)) {
            const symbol = await SymbolModel.findById(symbolID);

            if(symbol) return new Symbol(symbol);
            else return null;
        } else return null;
    }

    static async create(sybolObject: SymbolObject) : Promise<Symbol>  {
        const document = new SymbolModel(sybolObject);

        try {
            const symbol = new Symbol(await document.save());

            return symbol;
        } catch(error) { throw error };
    }

    static async save(symbolDocument: SymbolObject | SymbolDocument) : Promise<Symbol> {
        const id = (symbolDocument as SymbolDocument)._id;
        if(mongoose.isValidObjectId(id)) {
            const res = await Symbol.find(id.toString());

            if(res) return await res.edit(symbolDocument);
            else return await Symbol.create(symbolDocument);
        } else return await Symbol.create(symbolDocument);
    }
}