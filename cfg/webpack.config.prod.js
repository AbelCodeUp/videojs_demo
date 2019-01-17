const base = require("./base");
const path = require("path");
const dfPath = require("./path");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ClosureCompilerPlugin = require("webpack-closure-compiler");
const webpack = require("webpack");

const ExtractCSS = new MiniCssExtractPlugin({
  filename: "[name].css",
  chunkFilename: "assets/css/[name]_[contenthash:6].css" //把css文件单独打包
});

let strategyMerge = merge.strategy({
  entry: "replace",
  output: "replace",
  module: {
    rules: "replace"
  }
});

let config = {
  entry: {
    vender: ["video.js"],
    app: path.resolve(dfPath.root, "src/index.js")
  },
  output: {
    path: dfPath.dist,
    filename: "assets/js/[name]_[chunkhash].bundle.js",
    publicPath: "/",
    chunkFilename: "assets/js/[name].sepChunk.js",
    hashDigestLength: 6
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: [dfPath.node_modules]
      },
      {
        test: /\.scss$/,
        use: ["css-loader", "sass-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "[name]_[hash].[ext]",
              outputPath: "assets/img/"
            }
          }
        ]
      },
      {
        test: /\.(mp4|ogg|svg|ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]_[hash].[ext]",
              outputPath: "assets/media/"
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "[name]_[hash].[ext]",
              outputPath: "assets/font/",
              mimetype: "application/font-woff"
            }
          }
        ]
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "[name]_[hash].[ext]",
              outputPath: "assets/font/",
              mimetype: "application/octet-stream"
            }
          }
        ]
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]_[hash].[ext]",
              outputPath: "assets/font/"
            }
          }
        ]
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
              name: "[name]_[hash].[ext]",
              outputPath: "assets/font/",
              mimetype: "image/svg+xml"
            }
          }
        ]
      }
    ]
  },

  plugins: [
    ExtractCSS,
    new webpack.EnvironmentPlugin({ NODE_ENV: "production" }),
    // new ClosureCompilerPlugin()
  ],

  devtool: "source-map"
};

module.exports = strategyMerge(base, config);
