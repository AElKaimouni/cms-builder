
const StringField = (args = { type: "short" }) => ({
    __type: "string",
    __args: args
});

module.exports = StringField;