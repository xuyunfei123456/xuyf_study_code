// pages/YFWUserCenterModule/YFWModifyThePhoneNextPage/YFWModifyThePhoneNext.js
import {
  is_phone_number,
} from '../../../../utils/YFWPublicFunction.js'
import {
UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()

var oldermobile='';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNum: "",
    yzmNum: "",
    disabled: false,
    getYZMCode: "获取验证码"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    oldermobile = options.oldermobile;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  //手机号
  phone_num: function(e) {
    var num = e.currentTarget.dataset.name;
    this.setData({
      [num]: e.detail.value.replace(/\s+/g, ''), //去除空格
      phoneNum: e.detail.value
    })
  },
  //验证码
  yzm_num: function(e) {
    var num = e.currentTarget.dataset.name;
    this.setData({
      [num]: e.detail.value.replace(/\s+/g, ''),
      yzmNum: e.detail.value
    })
  },
  //发送验证码
  getCode: function(res) {

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
    userCenterApi.getNewMobileSMSCode(this.data.phoneNum).then(res => {
      this._countdownTimes()
    },(err=>{
      wx.showToast({
        title: err.msg,
        icon:'none',
        duration:500
      })
    }))
  },
  //点击确定按钮
  commit: function(e) {
    userCenterApi.updateUserMobile(this.data.phoneNum, this.data.yzmNum, oldermobile).then(res => {
        wx.navigateBack({
           delta: 2
        })
    },(err=>{
        wx.showToast({
          title: err.msg,
          icon: 'none',
          duration: 500
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
    var i = setInterval(function() {
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
  }
})