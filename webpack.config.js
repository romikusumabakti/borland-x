const path = require("path");

module.exports = {
  entry: "./codemirror.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "codemirror.bundle.js",
    libraryTarget: "umd",
  },
  mode: "production",
};
