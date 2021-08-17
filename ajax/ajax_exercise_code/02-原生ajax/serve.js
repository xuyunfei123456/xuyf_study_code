const { request, response } = require('express');
const express=require('express');
const app=new express();
app.get('/server',(request,response)=>{
    //设置响应头,设置允许跨域
    response.setHeader('Access-Control-Allow-Origin','*')
    // 设置响应体
    response.send('HELLO AJAX')
})
app.post('/server',(request,response)=>{
    response.setHeader('Access-Control-Allow-Origin','*')
    response.send('HELLO POST')
})
app.listen('8000',()=>{
    console.log("服务已经启动，8000，端口监听中")
})