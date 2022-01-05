//配置路由的地方
import Vue from 'vue';
import routes from './routes'
import VueRouter from 'vue-router';
//使用插件
Vue.use(VueRouter)

//引入store
import store from '@/store'
//先把VueRouter原型对象的push，先保存一份
let originPush = VueRouter.prototype.push;
let originReplace = VueRouter.prototype.replace;

//重写push|replace
//第一个参数：告诉原来的push方法，你往哪里跳转（传递哪些参数）
VueRouter.prototype.push = function (location, resolve, reject) {
    // this 为VueRouter类的一个实例
    if (resolve && reject) {
        // call||apply区别
        // 相同点：都可以调用函数一次，都可以篡改函数的上下文一次
        // 不同点：call与apply传递参数：call传递参数用逗号隔开，apply方法传递数组
        originPush.call(this, location, resolve, reject)
    } else {
        originPush.call(this, location, () => {}, () => {})
    }
}
VueRouter.prototype.replace = function (location, resolve, reject) {
    if (resolve && reject) {
        originReplace.call(this, location, resolve, reject)
    } else {
        originReplace.call(this, location, () => {}, () => {})
    }
}
//配置路由
//暴露VueRouter的实例
let router = new VueRouter({
    // mode: "history",
    //配置路由
    routes,
    //滚动行为
    scrollBehavior(to, from, savedPosition) {
        //返回这个y:0滚动条在最上方
        return {
            y: 0
        }
    }
})
//全局守卫，前置守卫（在路由跳转之前进行判断）
router.beforeEach(async (to, from, next) => {
    //to 可以获取到你想跳的那个路由信息
    //from 可以获取到你从哪个路由而来的信息
    //next 放行函数  next()放行    next(path)放行到指定路由    next(false)
    next();
    //用户登录了，才会有token，未登录一定不会有token
    let token = store.state.user.token
    //用户信息
    let name = store.state.user.userInfo.name;
    //用户已经登录了
    if (token) {
        //用户已经登录了还想去login----不行
        if (to.path == '/login' || to.path == 'register') {
            next('/home')
        } else {
            //登录了，但是去的不是login
            //如果用户名已有
            if (name) {
                next()
            } else {
                //没有用户信息,派发action让仓库存储用户信息再跳转
                try {
                    //获取用户信息成功
                    await store.dispatch('getUserInfo')
                    next();
                } catch (error) {
                    //token失效了 获取不到用户信息 重新登录
                    store.dispatch("userLogout")
                    next('/login')
                }
            }
        }
    } else {
        //未登录暂时没有处理完毕
        next()
    }
})
export default router