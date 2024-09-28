import fs from "fs";
import path from "path";

export default class ConfigData<Type = any> {
    protected defaultData: any;
    protected file: string;
    protected _data: Type;

    constructor(file: string, defaultData: any) {
        this.file = path.resolve(file);
        this.defaultData = defaultData;

        this.data;
    }

    get data() : Type {
        try {
            if(!fs.existsSync(this.file)) fs.writeFileSync(this.file, JSON.stringify(this.defaultData))

            return this._data ||= JSON.parse(fs.readFileSync(this.file).toString());
        } catch {
            throw new Error(`Config Data file : '${this.file}' is not exist or has unvalid content.`)
        }
    }

    set data(data: Type) {
        this._data = data;
        this.update();
    }

    protected update(data = this._data) {
        fs.writeFileSync(this.file, JSON.stringify(data));
    }
}