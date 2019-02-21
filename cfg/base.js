const path = require("path");
const dfPath = require("./path");
const webpack = require("webpack");
const Html = require("html-webpack-plugin");
const CleanFolder = require("clean-webpack-plugin");

module.exports = {
  entry: {
    app: path.resolve(dfPath.root, "src/index.js")
  },
  output: {
    path: dfPath.dist,
    filename: "[name].bundle.js",
    publicPath: "/",
    chunkFilename: "[name].sepChunk.js"
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: "html-loader",
          options: {
            attrs: ["link:href"]
          }
        }
      },
      {
        test: /\.js$/,
        loader: "source-map-loader"
      }
    ]
  },

  plugins: [
    new Html({
      name: "index.html",
      template: "./public/index.html"
    }),
    new CleanFolder(['dist'],{
      root: dfPath.root
    }),
    new webpack.ProvidePlugin({
      _: "lodash",

    })
  ]
};
