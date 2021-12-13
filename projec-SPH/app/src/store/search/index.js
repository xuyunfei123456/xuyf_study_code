import {
    reqGetSearchInfo
} from '@/api'
//search模块的小仓库
const state = {
    searchList: {}
}
const mutations = {
    GETSEARCHLIST(state, searchList) {
        state.searchList = searchList
    }
}
const actions = {
    //获取search模块数据
    async getSearchList({
        commit
    }, params) {
        //params形参：当用户派发action的时候，第二个参数传递过来的，至少是一个空对象
        let result = await reqGetSearchInfo(params)
        if (result.code == 200) {
            commit('GETSEARCHLIST', result.data);
        }
    }
}
//计算属性，在项目当中，是为了简化仓库中的数据为生
const getters = {
    //当前仓库的state
    goodsList(state) {
        // state.searchList.goodsList如果服务器数据回来了，没问题是一个数组
        //假如网络不稳定state.searchList.goodsList返回的是undefined
        //计算新的属性值至少给一个[]空数组
        return state.searchList.goodsList || []
    },
    trademarkList(state) {
        return state.searchList.trademarkList || []
    },
    attrsList(state) {
        return state.searchList.attrsList || []
    }
}
export default {
    state,
    mutations,
    actions,
    getters
}