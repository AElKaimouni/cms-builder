const { BooleanField, ListField, ModelField, NumberField, StringField } = require("../utils/fields");

module.exports =  {
    edit: true,
    name: "example",
    primary: "title",
    i18n: true,
    draft: true,
    props: {
        title: StringField({ validate: { required: true } }),
        image: ModelField({ model: "media", validate: { required: true } }),
    },
    preview: {
        input: {
            name: "title",
            image: "image"
        },
        table: "title image"
    }
}