var app = getApp();
import {
  UserCenterApi,
  LoginRegisterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi();
const loginRegisterApi = new LoginRegisterApi();
var flag = true;
import {
  is_phone_number,
} from '../../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoModel: {},
    mobile: '',
    phone: '',
    disabled: false,
    getYZMCode: "获取验证码",
    yzm: '',
    successFlag:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {reason} = options.params;
    if (app.globalData.userInfo) {
      const {
        default_mobile
      } = app.globalData.userInfo;
      this.setData({
        mobile: default_mobile,
        phone: default_mobile,
        reason,
      })
    } else {
      userCenterApi.getUserAccountInfo().then((response) => {
        this.setData({
          mobile: response.default_mobile || '',
          phone: response.default_mobile || '',
          reason,
        })
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //输入框的值
  inputVal: function (e) {
    let _val = e.currentTarget.dataset.type;
    this.setData({
      [_val]: e.detail.value.replace(/\s+/g, ''),
    })
  },
  /**
   * 获取验证码
   */
  getCode: function (e) {
    if(this.data.disabled){
      return;
    }
    if (this.data.phone == "") {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 800
      })
      return;
    } else if (!is_phone_number(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 800
      })
      return;
    }
    //发请求同时 更改倒计时ui
    this.setData({
      disabled: true,
    })
    loginRegisterApi.sendSMS(this.data.phone, 1).then(res => {
      this._countdownTimes()
    }, (err => {
      wx.showToast({
        title: err.msg,
        icon: 'none',
        duration: 500
      })
      this.setData({
        disabled: false,
      })
    }))
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

  /**
   * 提交更改手机号
   */
  commit: function () {
    if (this.data.yzm == '') {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    userCenterApi.accountCancel({
      smsCode: this.data.yzm,
      cancel_reason: this.data.reason,
      mobile: this.data.phone
    }).then(res => {
      if (res) {
        this.setData({
          successFlag: true,
        })
        setTimeout(()=>{
          if(flag){
            wx.setStorageSync('cookieKey','')
            wx.reLaunch({
              url: '/pages/YFWHomeFindModule/YFWHomePage/YFWHome'
            })
          }
        },5000)
      }
    }, error => {
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 1500
      })
    })

  },
  hideShadow:function(){
    flag = false;
    let that = this;
    this.setData({
      successFlag:false,
    })
    wx.setStorage({
      key: 'cookieKey',
      data: '',
    })
    wx.reLaunch({
      url: '/pages/YFWHomeFindModule/YFWHomePage/YFWHome'
    })
  }
})