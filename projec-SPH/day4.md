复习：
1）完成商品分类的三级列表路由跳转一级路由传参（合并参数）
2）完成 search 模块中对于 typeNav 使用（过渡动画的）
3）对于 typeNav 请求次数进行优化
4）swiper 插件 经常绘制轮播图
使用步骤
第一步：引入相应的依赖包（swiper.js|swiper.css）
第二步：页面中的结构务必要有
第三步：初始化 swiper 实例，给轮播图添加动态效果
5）mock 数据，通过 mockjs 模块实现的

1）最完美的解决方案解决轮播图问题
watch+nextTick：数据监听：监听已有数据变化
nextTick:在下次 DOM 更新 循环结束之后 执行延迟函数。 在 修改数据之后 立即使用这个方法 获取更新后的 DOM

2)开发 floor 组件
2.1:getFloorList 这个 action 在哪里出发，是需要在 home 路由组件当中发的，不能在 floor 组件内部发 action，因为我们需要 v-for 遍历 floor 组件
2.2:v-for 也可以在自定义标签当中使用
2.3:组件通信的方式有哪些？
props:父子组件通信
自定义事件：@on @emit 可以实现子给父通信
全局事件总线 $bus
pubsub-js：vue 几乎不用
插槽
vuex
