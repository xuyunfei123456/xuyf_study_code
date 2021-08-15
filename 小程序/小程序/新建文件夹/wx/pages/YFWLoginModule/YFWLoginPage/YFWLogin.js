import {
  pushNavigation
} from '../../../apis/YFWRouting.js'

import {
  BaseApi
} from '../../../apis/base.js'
const baseApi = new BaseApi()
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataText: "您暂未授权药房网商城小程序获取你的信息,将无法正常使用小程序的功能。如需要正常使用,请点击\"授权\"按钮,打开头像,昵称等信息的授权。",
    loading:true,
    canIUseGetUserProfile:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      loading:false
    })
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  onShow:function(){

  },
  getUserProfile:function(e){
    wx.getUserProfile({
      desc: '用于显示用户昵称和头像', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        pushNavigation('get_author_login',{from:'login'})
      }
    })
  },
  //获取UserInfo
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //提前登录 防止 退出登录后 重新登陆  第一个code未过期  导致后面解密手机号失败
      app.globalData.hasUserInfo = true;
      wx.login({
        success: function(){
          pushNavigation('get_author_login',{from:'login'})
        },
      })
      
    } else {
      app.globalData.hasUserInfo = false;
      pushNavigation('get_author_login',{from:'login'})
    }
  },

  getLogin() {
    // baseApi.userLogin('13813291619', 'miao123').then(res => {
    //   wx.navigateBack({
    //     delta: 1
    //   })
    // })
    // return
    var that = this;
    wx.login({
      success(res) {
        var _code = res.code;
        if (res.code) {
          //获取code换取openid进行登录   
          baseApi.getOpenid(res.code).then(openid => {
            if (openid != undefined && openid != '') {
              baseApi.openidLogin(openid).then(res => { 
                that.hideloading()         
                //判断登录成功
                if (res != null && res.mobile) {
                  //已绑定过手机号 直接登陆成功 无需再授权手机号
                  wx.navigateBack({
                    delta: 1
                  })
                } else {
                  wx.getSetting({
                    success: function(res) {
                      if (res.authSetting['scope.userInfo']) {
                       pushNavigation('get_author_login',{login:true,code:_code})
                      }
                    }
                  })
                }
              })
            }else{
              that.hideloading()
            }
          },(err)=>{that.hideloading()})
        } else {
          that.hideloading()
          console.log('登录失败！' + res.errMsg)
        }
      },
      fail(err){that.hideloading()}
    })
  },
  hideloading:function(){
    this.setData({
      loading:false
    })
  },
  onUnload:function(){
    let pages = getCurrentPages();
    if(pages.length&&pages[0].is == 'pages/YFWUserCenterModule/YFWUserCenterPage/YFWUserCenter'){
      app.globalData.loginBackFlag = true;
    }
  }
})
