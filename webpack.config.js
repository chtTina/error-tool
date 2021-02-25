/*
 * @Descripttion: 
 * @version: 
 * @Author: tina.cai
 * @Date: 2021-02-22 10:28:36
 * @LastEditors: tina.cai
 * @LastEditTime: 2021-02-25 15:41:43
 */
const Path = require('path');


module.exports = { 
  devServer: {
    host: '192.168.12.141'
  },
  mode: 'production', // mode 用来指定构建模式 
  entry: {
    vfeedback : Path.resolve(__dirname, './src/index.js')
  },
  output: {
    path: Path.resolve(__dirname, './dist'),
    filename: '[name].min.js',
    library: 'VFeedback',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: '/node_modules/'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // 将 JS 字符串生成为 style 节点
          "style-loader",
          // 将 CSS 转化成 CommonJS 模块
          "css-loader",
          // 将 Sass 编译成 CSS
          "sass-loader",
        ],
      }
    ],
  }
}