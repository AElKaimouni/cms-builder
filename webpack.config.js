const path = require("path");
var nodeExternals = require("webpack-node-externals");

module.exports = {
    mode:"production",
    entry: {
        index: "./index.ts",
    },
    target: "node",
    externals: [nodeExternals()],
    output: {
        filename: "[name].js",
        path: __dirname
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/, }]
    }
}