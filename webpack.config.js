module.exports = {
    entry: "./public/javascripts/index.js",
    output: {
        path: "./dist",
        filename: "report.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
