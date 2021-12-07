1：编程式路由跳转到当前路由（参数不变），多次执行会抛出 NavigationDuplicated 的警告错误？
--路由跳转有两种形式：生命式导航、编程式导航
--声明式导航没有这类问题，因为 vue-router 底层已经处理好了
1.1 为什么编程式导航进行路由跳转的时候，就有这种警告错误？
"vue-router"："^3.5.3"：最新的 vue-router 引入 promise
1.2 通过给 push 方法传递相应的成功、失败的回调函数，可以捕获到当前错误，可以解决。

1.3 通过底部的代码，可以实现解决错误
this.$router.push({name:"search",params:{keyword:''||undefiend},query:{k:this.keyword.toUpperCase()}},()=>{},()=>{})
这种写法治标不治本，将来在别的组件当中 push|replace，编程式导航还是有类似错误。

1.4
this:当前组件实例(search)
this.$router属性：当前的这个属性，属性值VueRouter类的一个实例，当在入口文件注册路由的时候，给组件添加$router|$route 属性
push：VueRouter 类的一个实例

function VueRouter(){}

VueRouter.prototype.push=function(){
//函数的上下文为 VueRouter 类的一个实例
}
let $router=new VueRouter();
$router.push(xx);
this.$router.push()

2:Home 模块组件拆分
--先把静态页面完成
--拆分出静态组件
--获取服务器的数据进行展示
--动态业务

3：三级联动组件完成
---由于三级联动，在 Home、search、Detail，把三级联动注册为全局组件。
好处：只需要注册一次，就可以在项目任意地方使用

4：完成其余静态组件
HTML+CSS+图片资源

5：POSTMAN 测试接口
--刚刚经过 postman 工具测试，接口没问题
--如果服务器返回的数据 code 字段为 200，代表服务器返回数据成功
--整个项目接口前缀都有/api 字样

6：axios 二次封装
XMLHttpRequset、fetch、JQ、axios
6.1 为什么需要进行二次封装 axios？
请求拦截器、响应拦截器
请求拦截器：可以在发请求之前可以处理一些业务
响应拦截器：当服务器数据返回以后，可以处理一些事情

6.2 在项目当中经常 API 文件夹【axios】
接口当中：路径都带有/api
baseURL: '/api'

7：接口统一管理

项目很小：完全可以在组件的生命周期函数中发请求 created

项目很大：axios.get('xxx')

7.1：跨域问题
什么是跨域：协议、域名、端口号不同请求，称之为跨域

http://localhost:8080/#/home ---前端项目的本地服务器
http://39.98.123.211 ---后台服务器

JSONP、CROS、代理

8：nprogress 进度条的使用 npm i --save nprogress
import nprogress from 'nprogress'
import "nprogress/nprogress.css"
start：进度条开始  
done：进度条结束
进度条颜色可以修改，修改人家的样式

9：vuex 状态管理库

9.1vuex 是什么？

vuex 是官方提供一个插件，状态管理库，集中式管理项目中组件共用的数据。

切记，并不是全部的项目都需要 vuex，如果项目很小，完全不用 vuex，如果项目大，组件多，数据多，数据维护费劲，vuex

state
mutations
actions
getters
modules

9.2：vuex 基本使用

9.3：vuex 实现模块化开发
如果项目过大，组件多，接口多，数据也很多，可以让 vuex 实现模块化开发
模拟 state 存储数据
{
count:1
}

10:完成 TypeNav 三级联动展示数据业务

1)完成一级分类动态添加背景颜色
第一种解决方案：采用样式完成（可以的）
第二种解决方案：通过 JS 完成

2)通过 JS 控制二三级商品分类的显示与隐藏

3)演示卡顿现象
正常：事件触发非常频繁，而且每一次的触发，回调函数都要去执行（如果时间很短，而回调函数内都有计算，那么狠可能出现浏览器卡顿）
节流：在规定的时间间隔范围内不会重复触发回调，只有大于这个时间间隔才会触发回调，把频繁触发变为少量触发
防抖：前面的所有的触发都被取消，最后一次执行在规定的时间之后才会触发，也就是说如果连续快速的触发 只会执行一次

5)三级联动实现节流操作
