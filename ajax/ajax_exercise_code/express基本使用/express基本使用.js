// 引入express
const express=require('express');
// 2,创建应用对象
const app=new express;
// 3,创建路由规则
// request是对请求报文的封装
// response是对响应报文的封装
app.get('/',(request,response)=>{
    response.send('HELLO EXPRESS')
})
// 4,监听端口
app.listen(8000,()=>{
    console.log("服务已经启动，8000，端口监听中")
})