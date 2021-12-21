import Vue from 'vue'
import App from './App.vue'
//三级联动组件---全局组件
import TypeNav from '@/components/TypeNav'
//注册组件  第一个参数：全局组件的名字；第二个参数：哪一个组件
Vue.component(TypeNav.name, TypeNav)
import Carsousel from '@/components/Carousel'
Vue.component(Carsousel.name, Carsousel)
import Pagination from '@/components/Pagination'
Vue.component(Pagination.name, Pagination)
//引入路由
import router from '@/router'
//引入仓库
import store from '@/store'
// console.log(this)  this是undefined 在vue中vue组件都以.vue为后缀名

//引入MockServer.js ---mock数据
import '@/mock/mockServe'
//引入swiper样式
import 'swiper/css/swiper.css'
new Vue({
  render: h => h(App),
  beforeCreate() {
    Vue.prototype.$bus = this;
  },
  //注册路由：底下的写法kv一致省略
  //注册路由信息：当这里书写router的时候，组件身上都拥有$route，$router属性
  router,
  //注册仓库：组件实例身上会多一个属性$store属性
  store
}).$mount('#app')