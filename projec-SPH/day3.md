复习： 1)：商品分类的三级列表由静态变为动态形式【获取服务器数据：解决跨域问题】 2)：函数防抖与节流 3)：路由跳转：声明式导航(router-link)、编程式导航

1）：开发 search 模块中的 TypeNav 商品分类菜单（过渡动画的效果）
过渡动画：前提组件|元素务必要有 v-if|v-show 指令菜可以进行过渡动画

2)现在咱们的商品分类的三级列表可以优化？
在 App 根组件当中发送请求【根组件 mounted】执行一次

3)合并 params 与 query 参数？

4)开发 Home 首页当中的 ListContainer 组件与 Floor 组件？
但是需要知道：服务器返回的数据只有商品分类菜单分类数据，对于 ListContainer 组件与 Floor 组件数据服务器没有提供。
https://docschina.org/
mock 数据（模拟）：如果你想 mock 数据，需要用到插件 mockjs
npm install mockjs

使用步骤： 1)在项目当中的 src 目录下创建一个 mock 文件  
2)第二步准备 JSON 数据，（mock 文件夹中准备相应的 json 数据） ----格式化一下，别留有空格（跑不起来的）  
3)把 mock 数据需要的图片放置到 public 文件夹中【public 文件夹在打包的时候，会把相应的资源原封不动打包到 dist 文件夹中】  
4)第四步开始 mock（虚拟的数据），通过 mock.js 模块实现 5)创建 mockServe.js 通过 mockjs 插件实现模拟数据
5)mockServer.js 文件在入口文件中引入（至少需要执行一次，才能模拟数据）

6)listContainer:swiper 插件
