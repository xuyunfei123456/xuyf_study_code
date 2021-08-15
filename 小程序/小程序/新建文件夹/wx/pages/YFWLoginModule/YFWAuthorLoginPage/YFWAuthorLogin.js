// pages/YFWLoginModule/YFWAuthorLoginPage/YFWAuthorLogin.js
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'

import {
  BaseApi
} from '../../../apis/base.js'
const baseApi = new BaseApi()
const app = getApp();
let log = require('../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginFlag: true,
    loading: false,
    from: '',
    code:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _params = options.params;
    if (_params) {
      var from = JSON.parse(_params).from || '';
      this.data.from = from
    }
    // 18361337238
    baseApi.userLogin('wulu', 'abc123').then(res => {
      wx.navigateBack({
        delta: 1
      })
    })
    return
    this.getCode()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  getCode(){
    let that = this;
    wx.login({
      success(res){
        if(res.code){
          that.wxCode = res.code;
        }
      }
    })
  },
  /**
   * 微信授权手机号
   */
  getPhoneNumber: function (e) {
    this.setData({
      loading: true
    })
    let that = this;
    //未与我们账号绑定
    if (e.detail.encryptedData && e.detail.iv) {
      console.log('同意授权')
      //同意授权
      wx.checkSession({
        success () {
          console.log('checksession success')
          that.getOpenidByPhoneNumber(that.wxCode, e.detail.encryptedData, e.detail.iv, '','checksuccess');
        },
        fail () {
          wx.login({
            success(res){
              if(res.code){
                that.getOpenidByPhoneNumber(res.code, e.detail.encryptedData, e.detail.iv, 'checkfail');
              }
            }
          })
        }
      })
      
    } else {
      //拒绝授权
      that.hideloading();
      wx.showToast({
        title: '请选择快捷登录或手机号登录',
        duration: 2000,
        icon: 'none'
      })
    }
  },
  hideloading: function () {
    this.setData({
      loading: false
    })
  },
  getOpenidByPhoneNumber(code, encryptedData, iv, avatarUrl,type) {
    let that = this;
    baseApi.getOpenidByPhoneNumber(code, encryptedData, iv, avatarUrl).then(openid => {
      baseApi.openidLogin(openid).then(res => {
        that.hideloading();
        //判断登录成功
        app.globalData.certificationFlag = true;
        wx.navigateBack({
          delta: this.data.from ? 2 : 1
        })
      }, (err) => {
        that.hideloading();
        wx.showToast({
          title: err.msg || '登录失败',
          duration: 2000,
          icon: 'none'
        })
        log.info(type+'获取手机号后登录错误信息'+JSON.stringify(err))
      })
    }, (err) => {
      log.info(type+'解密手机号错误信息'+JSON.stringify(err))
    })

  },
  /**
   * 手机号登录
   */
  bindPhoneLogin: function (e) {
    if (this.data.from) {
      pushNavigation('get_bind_phone', {
        from: 'authologin'
      })
    } else {
      pushNavigation('get_bind_phone')
    }
  },
  handleCatchTap() {
    return true;
  },
  handleCatchTap2() {
    return true;
  }
})