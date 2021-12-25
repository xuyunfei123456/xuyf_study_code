import {
    reqGoodsInfo
} from "@/api"
const state = {
    goodInfo: {}
}
const mutations = {
    GETGOODINFO(state, goodInfo) {
        state.goodInfo = goodInfo
    }
}
const actions = {
    //获取产品信息的action
    async getGoodInfo({
        commit
    }, skuId) {
        let result = await reqGoodsInfo(skuId)
        if (result.code == 200) {
            commit('GETGOODINFO', result.data)
        }
    }
}
//简化数据
const getters = {
    categoryView(state) {
        //比如state.goodInfo初始状态空对象，空对象的categoryView属性值undefiend,
        //当前计算出的categoryView属性值至少是一个空对象，假的报错不会有了
        return state.goodInfo.categoryView || {}
    },
    //简化产品信息数据
    skuInfo(state) {
        return state.goodInfo.skuInfo || {}
    },
    //产品售卖属性的简化
    spuSaleAttrList(state) {
        return state.goodInfo.spuSaleAttrList || []
    }
}
export default {
    state,
    mutations,
    actions,
    getters,
}