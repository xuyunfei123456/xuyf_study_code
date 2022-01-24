import {
    reqAddressInfo,
    reqOrderInfo
} from "@/api"
const state = {
    address: [],
    orderInfo: {}
}
const mutations = {
    GETUSERADDRESS(state, address) {
        state.address = address
    },
    GETORDERINFO(state, orderInfo) {
        state.orderInfo = orderInfo
    }
}
const actions = {
    //获取用户地址信息
    async getUserAddress({
        commit
    }) {
        try {
            let res = await reqAddressInfo()
            if (res.code == 200) {
                commit('GETUSERADDRESS', res.data)
            }
        } catch (error) {

        }
    },
    //获取商品清单数据
    async getOrderInfo({
        commit
    }) {
        let res = await reqOrderInfo()
        if (res.code == 200) {
            commit('GETORDERINFO', res.data)
        }
    }
}
const getters = {

}
export default {
    state,
    mutations,
    actions,
    getters,
}