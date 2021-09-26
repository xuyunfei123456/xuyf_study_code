const { resolve } = require('path');// node 内置核心模块，用来处理路径问题。
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'js/built.js',
    path: resolve(__dirname, 'build')// __dirname nodejs 的变量，代表当前文件的目录绝对路径
  },
  module: {
    rules: [
      //  webpack 4配置
      //   语法检查： eslint-loader  eslint
      //     注意：只检查自己写的源代码，第三方的库是不用检查的
      //     设置检查规则：
      //       package.json中eslintConfig中设置~
      //         "eslintConfig": {
      //           "extends": "airbnb-base"
      //         }
      //       airbnb --> eslint-config-airbnb-base  eslint-plugin-import eslint
      
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   loader: 'eslint-loader',
      //   options: {
      //     // 自动修复eslint的错误
      //     fix: true
      //   }
      // }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new ESLintPlugin({
      fix: true
    }) //webpack5 配置eslint   npm install eslint-webpack-plugin  npm install eslint
  ],
  mode: 'development'
};
