const {
    resolve
} = require('path');
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const cssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin') //压缩css代码
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
//定义nodejs环境变量：决定使用browserslist的哪个环境
process.env.NODE_ENV = 'production';
//复用loader
const commonCssLoader = [
    miniCssExtractPlugin.loader, //将css提取成单独文件，默认css在js文件中
    'css-loader',
    { //还需在package.json中配置browserslist,决定兼容到哪一层
        loader: 'postcss-loader', //css兼容性处理
        options: {
            ident: 'postcss', //默认配置
            plugins: () => {
                require('postcss-preset-env')()
            }
        }
    }
]
module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'js/built.js',
        path: resolve(__dirname, 'build')
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [...commonCssLoader]
        }, {
            test: /\.less$/,
            use: [...commonCssLoader, 'less-loader']
        }, {
            test: /\.js$/, //js兼容性处理
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            // 按需加载
                            useBuiltIns: 'usage',
                            // 指定core-js版本
                            corejs: {
                                version: 3
                            },
                            // 指定兼容性做到哪个版本浏览器
                            targets: {
                                chrome: '60',
                                firefox: '60',
                                ie: '9',
                                safari: '10',
                                edge: '17'
                            }
                        }
                    ]
                ]
            }
        }, {
            test: /\.(jpg|png|gif)/,
            loader: 'url-loader',
            options: {
                limit: 8 * 1024,
                name: '[hash:10].[ext]',
                outputPath: 'imgs',
                esModule: false //关闭es6检查
            }
        }, {
            test: /\.html$/,
            loader: 'html-loader',
            esModule: false //关闭es6检查
        }, {
            exclude: /\.(js|css|less|html|jpg|png|gif)/, //处理其他文件
            loader: 'file-loader',
            options: {
                outputPath: 'media'
            }
        }]
    },
    plugins: [
        new miniCssExtractPlugin({
            filename: 'css/built.css'
        }),
        new cssMinimizerWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            // 压缩html代码
            minify: {
                // 移除空格
                collapseWhitespace: true,
                // 移除注释
                removeComments: true
            }
        }),
        new ESLintPlugin({
            fix: true
        })
    ],
    mode: 'production'
}