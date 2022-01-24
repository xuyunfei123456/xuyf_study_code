import Vue from 'vue'
import App from './App.vue'
//三级联动组件---全局组件
import TypeNav from '@/components/TypeNav'
import {
  MessageBox
} from 'element-ui'
//注册组件  第一个参数：全局组件的名字；第二个参数：哪一个组件
Vue.component(TypeNav.name, TypeNav)
import Carsousel from '@/components/Carousel'
Vue.component(Carsousel.name, Carsousel)
import Pagination from '@/components/Pagination'
Vue.component(Pagination.name, Pagination)
//ElementUI组件注册，还有一种写法，挂在原型上
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
//引入路由
import router from '@/router'
//引入仓库
import store from '@/store'
// console.log(this)  this是undefined 在vue中vue组件都以.vue为后缀名

//引入MockServer.js ---mock数据
import '@/mock/mockServe'
//引入swiper样式
import 'swiper/css/swiper.css'
// 统一接口api文件夹里面全部请求函数
import * as API from '@/api'
//引入插件
import VueLazyload from 'vue-lazyload'
import loadingGIF from '@/assets/loading.gif'
//注册插件
Vue.use(VueLazyload, {
  //懒加载默认图片
  loading: loadingGIF,
})

//引入自定义插件
import myPlugins from '@/plugins/myPlugins'
Vue.use(myPlugins, {
  name: 'upper'
})
//引入表单校验插件
import '@/plugins/validate'
new Vue({
  render: h => h(App),
  beforeCreate() {
    Vue.prototype.$bus = this;
    Vue.prototype.$API = API
  },
  //注册路由：底下的写法kv一致省略
  //注册路由信息：当这里书写router的时候，组件身上都拥有$route，$router属性
  router,
  //注册仓库：组件实例身上会多一个属性$store属性
  store
}).$mount('#app')