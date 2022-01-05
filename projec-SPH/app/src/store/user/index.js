import {
    reqGetCode,
    reqUserLogin,
    reqUserRegister,
    reqUserInfo,
    reqLogout
} from '@/api'
import {
    setToken,
    getToken,
    removeToken
} from '@/utils/token'
//登录与注册
const state = {
    code: "",
    token: getToken(),
    userInfo: {}
}
const mutations = {
    GETCODE(state, code) {
        state.code = code
    },
    USERLOGIN(state, token) {
        state.token = token
    },
    GETUSERINFO(state, userInfo) {
        state.userInfo = userInfo
    },
    //清除本地数据
    CLEAR(state) {
        state.token = '';
        state.userInfo = {};
        removeToken()
    }
}
const getters = {}
const actions = {
    //获取验证码
    async getCode({
        commit
    }, phone) {
        //获取验证码的这个接口，把验证码返回，但是正常情况下，后台把验证码发到用户手机上
        let res = await reqGetCode(phone)
        if (res.code == 200) {
            commit('GETCODE', res.data)
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    },
    //用户注册
    async userRegister({
        commit
    }, user) {
        let res = await reqUserRegister(user)
        if (res.code == 200) {
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    },
    //登录业务
    async userLogin({
        commit
    }, data) {
        let res = await reqUserLogin(data)
        //服务器下发token,用户唯一标识符
        if (res.code == 200) {
            //用户已经登录成功且获取到token
            commit("USERLOGIN", res.data.token)
            //持久化存储token
            setToken(res.data.token)
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    },
    //获取用户信息

    async getUserInfo({
        commit
    }) {
        let result = await reqUserInfo();
        if (result.code == 200) {
            //提交用户信息
            commit("GETUSERINFO", result.data);
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    },
    // 退出登录
    async userLogout({
        commit
    }) {
        //只是像服务器发起一次请求，通知服务器清除token
        let res = await reqLogout()
        //action不能操作state
        if (res.code == 200) {
            commit("CLEAR")
            return 'ok'
        } else {
            return Promise.reject(new Error('faile'))
        }
    }
}
export default {
    state,
    mutations,
    getters,
    actions,
}