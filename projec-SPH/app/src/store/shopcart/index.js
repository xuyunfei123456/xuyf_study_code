import {
    reqCartList,
    reqDeleteCart,
    reqUpdateCheckedById
} from "@/api"
const state = {
    cartList: []
}
const mutations = {
    GETCARTLIST(state, cartList) {
        state.cartList = cartList
    }
}
const actions = {
    //获取购物车列表数据
    async getCartList({
        commit
    }) {
        let result = await reqCartList()
        if (result.code == 200) {
            commit("GETCARTLIST", result.data)
        }
    },
    //删除购物车某个产品
    async deleteCartListBySkuId({
        commit
    }, skuId) {
        let result = await reqDeleteCart(skuId)
        if (result.code == 200) {
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    },
    //修改购物车某一个产品的选中状态
    async updateCheckedById({
        commit
    }, {
        skuId,
        isChecked
    }) {
        let result = await reqUpdateCheckedById(skuId, isChecked)
        if (result.code == 200) {
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    },
    //删除全部商品
    deleteAllCheckedCart({
        dispatch,
        getters
    }) {
        //小仓库 context commit【提交mutations】 getters【计算属性】 dispatch【派发action】 state【当前仓库数据】
        //获取购物车中全部产品【是一个数组】
        let promiseAll = []
        getters.cartList.cartInfoList.forEach(item => {
            let promise = item.isChecked == 1 ? dispatch('deleteCartListBySkuId', item.skuId) : ''
            //将每一次返回的Promise添加到数组中
            promiseAll.push(promise)
        })
        //只有全部都成功，才返回true
        return Promise.all(promiseAll)
    },
    //修改全部产品的状态
    updateAllCartIsChecked({
        dispatch,
        state
    }, isChecked) {
        let promiseAll = []
        state.cartList[0].cartInfoList.forEach(item => {
            let promise = dispatch('updateCheckedById', {
                skuId: item.skuId,
                isChecked
            })
            promiseAll.push(promise)
        })
        //最终结果返回
        return Promise.all(promiseAll)
    }
}
const getters = {
    cartList(state) {
        return state.cartList[0] || {}
    }
}
export default {
    state,
    mutations,
    actions,
    getters,
}