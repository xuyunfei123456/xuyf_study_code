const { request, response, json } = require("express");
const express = require("express");
const app = new express();
app.get("/server", (request, response) => {
  //设置响应头,设置允许跨域
  response.setHeader("Access-Control-Allow-Origin", "*");
  // 设置响应体
  response.send("HELLO AJAX");
});
//可以获取任意类型的请求
app.all("/server", (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  //响应头
  response.setHeader("Access-Control-Allow-Headers", "*");
  response.send("HELLO POST");
});
//针对json响应
app.all("/json-server", (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  //响应头
  response.setHeader("Access-Control-Allow-Headers", "*");
  const data = {
    name: "xuyf",
  };
  let str = JSON.stringify(data);
  response.send(str);
});
//针对ie缓存
app.get("/ie", (request, response) => {
  //设置响应头,设置允许跨域
  response.setHeader("Access-Control-Allow-Origin", "*");
  //响应头
  response.setHeader("Access-Control-Allow-Headers", "*");
  response.send("ie浏览器");
});
//超时与网络异常
app.get("/delay", (request, response) => {
  //设置响应头,设置允许跨域
  response.setHeader("Access-Control-Allow-Origin", "*");
  //响应头
  response.setHeader("Access-Control-Allow-Headers", "*");
  setTimeout(() => {
    response.send("超时与网络异常");
  }, 3000);
});
//jQuery 服务
app.all("/jquery-server", (request, response) => {
  //设置响应头  设置允许跨域
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "*");
  // response.send('Hello jQuery AJAX');
  const data = { name: "xuyf" };
    response.send(JSON.stringify(data));
});
//axios 服务
app.all('/axios-server', (request, response) => {
  //设置响应头  设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', '*');
  // response.send('Hello jQuery AJAX');
  const data = {name:'xuyf'};
  response.send(JSON.stringify(data));
});
//fetch 服务
app.all('/fetch-server', (request, response) => {
  //设置响应头  设置允许跨域
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', '*');
  // response.send('Hello jQuery AJAX');
  const data = {name:'xuyf'};
  response.send(JSON.stringify(data));
});
app.listen("8000", () => {
  console.log("服务已经启动，8000，端口监听中");
});
