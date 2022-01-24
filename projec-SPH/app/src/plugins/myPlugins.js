// vue插件一定暴露一个对象
let myPlugins = {}
myPlugins.install = function (Vue, options) {
    //Vue.prototype.$bus
    //Vue.directive()全局指令
    //Vue.component全局组件
    //Vue.filter...
    Vue.directive(options.name, (element, params) => {
        element.innerHTML = params.value.toUpperCase()
    })
}
export default myPlugins