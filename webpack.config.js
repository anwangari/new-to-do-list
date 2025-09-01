// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/"
  },
  devtool: "eval-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Serve from dist
    },
    port: 3000,
    open: true,
    hot: true,
    watchFiles: ["./src/template.html"],
    historyApiFallback: {
      index: 'index.html' // Add this to serve index.html for all routes
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
      filename: 'index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      }
    ],
  },
};