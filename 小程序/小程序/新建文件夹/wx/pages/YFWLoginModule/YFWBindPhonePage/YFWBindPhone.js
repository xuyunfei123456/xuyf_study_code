import {
  BaseApi
} from '../../../apis/base.js'
const baseApi = new BaseApi()

import {
  LoginRegisterApi
} from '../../../apis/index.js'
const indexApi = new LoginRegisterApi()
import {
  is_phone_number,
} from '../../../utils/YFWPublicFunction.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    errorFlag:false,
    phoneNum: "",
    yzmNum: "",
    disabled: false,
    getYZMCode: "获取验证码",
    errormsg:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _params = options.params;
    if(_params && typeof(_params) == 'string'){
      var from = JSON.parse(_params).from || '';
      this.data.from = from
    }
    wx.login({})
  },

  //手机号
  phone_num: function (e) {
    var num = e.currentTarget.dataset.name;
    this.setData({
      [num]: e.detail.value.replace(/\s+/g, ''), //去除空格
      phoneNum: e.detail.value
    })
  },
  //验证码
  yzm_num: function (e) {
    var num = e.currentTarget.dataset.name;
    this.setData({
      [num]: e.detail.value.replace(/\s+/g, ''),
      yzmNum: e.detail.value
    })
  },
  //发送验证码
  sendYZMCode: function (res) {

    if (this.data.phoneNum == "") {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 800
      })
      return;
    } else if (!is_phone_number(this.data.phoneNum)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 800
      })
      return;
    }
    //发请求同时 更改倒计时ui
    this._countdownTimes()

    indexApi.sendSMS(this.data.phoneNum, '1').then(res => {
      console.log(res);
    })
  },
  //点击绑定按钮事件
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      var intro_image = e.detail.userInfo.avatarUrl;
      //获取code换取openid，加手机号、验证码进行绑定/登录
      this.getLogin(intro_image);
    }
  },

  //登录
  getLogin() {
    var that = this;
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          baseApi.getOpenid(res.code).then(openid => {
            if (openid != undefined && openid != '') {
              baseApi.venderLogin(openid, '', that.data.phoneNum, that.data.yzmNum).then(res => {
                //判断登录成功
                if (res != null) {
                  wx.navigateBack({
                    delta: that.data.from ? 3 :2
                  })
                }
              }, err => {
                if (err.code == -100) {
                  that.setData({
                    errorFlag:true,
                    errormsg:err.msg
                  })
                } else {
                  wx.showToast({
                    title: err.msg,
                    icon: 'none',
                  })
                }

              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })

  },
  /*
    60秒倒计时
     *
     * */
  _countdownTimes() {
    var that = this;
    var times = 60
    var i = setInterval(function () {
      times--
      if (times <= 0) {
        that.setData({
          disabled: false,
          getYZMCode: "获取验证码",
        })
        clearInterval(i)
      } else {
        that.setData({
          getYZMCode: "重新获取" + times + "s",
          disabled: true
        })
      }
    }, 1000)
  },
  closeshadow:function(){
    this.setData({
      errorFlag:false,
    })
  }
});