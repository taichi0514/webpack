const webpack = require("webpack"),
  UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var path = require('path');

module.exports = {
  entry: "./htdocs/js/app.js", //ビルドするファイル
  output: {
    path: path.resolve(__dirname, 'htdocs/dist/js'),
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: 'htdocs',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [`@babel/preset-env`]
          }
        }
      }
    ]
  }
};