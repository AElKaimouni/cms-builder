import ConfigData from "../ConfigData.class";

export default class LocalesData extends ConfigData<{
    locales: {name: string, ext: string, id: string}[];
    defaultLocale: string;
}> {
    constructor(file: string) {
        super(file, {
            "locales": [
                {
                    "name": "English",
                    "ext": "en",
                    "id": "en"
                }
            ],
            "defaultLocale": "en"
        });
    }
}