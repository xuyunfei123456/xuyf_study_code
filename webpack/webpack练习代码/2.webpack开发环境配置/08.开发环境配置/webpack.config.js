/*
  开发环境配置：能让代码运行
    运行项目指令：
      webpack 会将打包结果输出出去
      npx webpack-dev-server 只会在内存中编译打包，没有输出
*/
// join是webpack5新增的配置
const { resolve, join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: "./src/js/index.js",
  output: {
    filename: "js/built.js",
    path: resolve(__dirname, "build"),
  },
  module: {
    rules: [
      // loader的配置
      {
        // 处理less资源
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        // 处理css资源
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        // 处理图片资源
        test: /\.(jpg|png|gif)$/,
        loader: "url-loader",
        options: {
          limit: 8 * 1024,
          name: "[hash:10].[ext]",
          // 关闭es6模块化
          esModule: false,
          outputPath: "imgs",
        },
        type: "javascript/auto", //解決webpack5用url-loader打包后出现图片打不开、资源重复
      },
      {
        // 处理html中img资源
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        // 处理其他资源
        exclude: /\.(html|js|css|less|jpg|png|gif)/,
        loader: "file-loader",
        options: {
          name: "[hash:10].[ext]",
          outputPath: "media",
        },
        type: "javascript/auto", //解決webpack5用file-loader打包后出现资源重复
      },
    ],
  },
  plugins: [
    // plugins的配置
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
  mode: "development",
  // 开发服务器 devServer：用来自动化（自动编译，自动打开浏览器，自动刷新浏览器~~）
  // 特点：只会在内存中编译打包，不会有任何输出
  // 启动devServer指令为：npx webpack-serve (webpack5之后的启动命令)
  devServer: {
    // 项目构建后路径，webpack5之后 webpack-dev-server4已删除contentBase，改用static配置路径
    static: {
      directory: join(__dirname, "build"),
    },
    // 启动gzip压缩
    compress: true,
    port: 3000,
    // 自动打开浏览器
    open: true,
  },
};
