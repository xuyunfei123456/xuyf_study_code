import {
    reqCategoryList,
    reqGetBannerList,
    reqFloorList
} from "@/api"
// home模块的小仓库
const state = {
    //state中的数据默认初始值不要瞎写，服务器返回对象，服务器返回数组。【根据接口返回值初始化】
    categoryList: [],
    //轮播图的数组
    bannerList: [],
    // floor组件的数据
    floorList: []
}
const mutations = {
    CATEGORYLIST(state, categoryList) {
        state.categoryList = categoryList
    },
    GETBANNERLIST(state, bannerList) {
        state.bannerList = bannerList
    },
    GETFLOORLIST(state, floorList) {
        state.floorList = floorList
    }
}
const actions = {
    //通过API里面的接口函数调用，向服务器发请求，获取服务器的数据
    async getCategoryList({
        commit
    }) {
        let result = await reqCategoryList()
        if (result.code == 200) {
            commit('CATEGORYLIST', result.data)
        }
    },
    //获取首页轮播图的数组
    async getBannerList({
        commit
    }) {
        let result = await reqGetBannerList();
        if (result.code == 200) {
            commit('GETBANNERLIST', result.data)
        }
    },
    //获取floor数据
    async getFloorList({
        commit
    }) {
        let result = await reqFloorList();
        if (result.code == 200) {
            commit('GETFLOORLIST', result.data)
        }
    }
}
const getters = {}
export default {
    state,
    mutations,
    actions,
    getters
}