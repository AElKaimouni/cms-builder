import ConfigData from "../ConfigData.class";

export default class RevalidatesData extends ConfigData {
    constructor(file: string) {
        super(file, {});
    }

    public delete(locale: string, url: string) {
        this._data[locale] = this._data[locale].filter(link => link !== url);
        this.update();
    }

    protected _add(locale: string, link: string) {
        this._data[locale] ||= [];
        this._data[locale].includes(link) || this._data[locale].push(link);
    }

    public add(locale: string, link: string) {
        this._add(locale, link);
        this.update();
    }

    public addMany(inputs: { locale: string, link: string }[]) {
        inputs.forEach(input => this._add(input.locale, input.link));
        this.update();
    }
}