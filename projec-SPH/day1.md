1:vue-cli 脚手架初始化项目。 (1)安装 vue-cli：npm install -g @vue/cli or yarn global add @vue/cli 安装完成后查看版本 vue -version (2)初始化项目 vue create app[项目名称]
node+webpack+淘宝镜像

node_module 文件夹：项目依赖文件夹

public 文件夹:一般放置一些静态资源（图片），需要注意，放在 public 文件夹中的静态资源，webpack 进行打包的时候，会原封不动打包到 dist 文件夹中。

src 文件夹（程序员源代码文件夹）:
assets 文件夹：一般也是放置静态资源（一般放置多个组件共用的静态资源），需要注意，放置在 assets 文件夹里面静态资源，在 webpack 打包的时候，webpack 会把静态资源当做一个模块，打包 js 文件里面。

    components文件夹：一般放置的是非路由组件（全局组件）

    app.vue：唯一的根组件。Vue当中的组件（.vue）
    main.js：程序入口文件，也是整个程序当中最先执行的文件

babel.config.js：配置文件（babel 相关）

package.json 文件：认为项目‘身份证’，记录项目叫什么，项目当中有什么依赖，项目怎么运行

package-lock.json：缓存性文件

README.md：说明性的文件

2：项目的其他配置

2.1 项目运行起来的时候，让浏览器自动打开
---package.json

"scripts": {
"serve": "vue-cli-service serve --open",
"build": "vue-cli-service build",
"lint": "vue-cli-service lint"
}, serve 后跟 --open

2.2eslint 校验功能关闭。
---在根目录下，创建一个 vue.config.js 文件
比如：声明变量但是没有使用，eslint 校验工具就报错。

2.3src 文件夹简写方法，配置别名。 @

在根目录下创建 jsconfig.json 文件
jsconfig.json 配置别名@提示【@代表的是 src 文件夹，这样将来文件过多，找的时候方便很多】
{
"compilerOptions":{
"baseUrl":"./",
"paths":{
"@/_":["src/_"]
}
},
"exclude":["node_modules","dist"]
}

3：项目路由分析
vue-router
前端所谓路由：kv 键值对。
key：URL（地址栏中的路径）
value：相应的路由组件
注意：项目上中下结构

路由组件：
Home 首页路由组件、Search 路由组件、login 登录路由、Refister 注册路由
非路由组件：
Header【首页、搜索页】
Footer【在首页、搜索页】，但是在登录|注册页面是没有

4.完成非路由组件 Header 与 Footer 业务
在咱们项目当中，不在以 HTML+CSS 为主，主要搞业务、逻辑
在开发新项目的时候：
1：书写静态页面（HTML+CSS）
2：拆分组件
3：获取服务器的数据动态展示
4：完成相应的动态业务逻辑

注意 1：创建组件的时候，组件结构+组件的样式+图片资源

注意 2：咱们项目采用的是 less 样式，浏览器不识别 less 样式，需要通过 less、less-loader 进行处理 less，把 less 样式变为 css 样式，浏览器才可以识别。
安装 less：npm install --save less less-loader@5【安装 5 版本的】

注意 3：如果想让组件识别 less 样式，需要在 style 标签的身上加上 lang=less

4.1 使用组件的步骤（非路由组件） -创建或定义 -引入 -注册 -使用
