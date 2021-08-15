import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {
  is_phone_number,
} from '../../../../utils/YFWPublicFunction.js'
import {
  isNotEmpty,
  safe
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
    yzmNum: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var mobile = options.mobile;
    var default_mobile = options.default_mobile;
    if (isNotEmpty(mobile)) {
      that.setData({
        mobile: mobile,
        phone: default_mobile
      });
    }

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

  //验证码
  yzm_num: function(e) {
    var num = e.currentTarget.dataset.name;
    this.setData({
      [num]: e.detail.value.replace(/\s+/g, ''),
      yzmNum: e.detail.value
    })
  },
  /**
   * 获取验证码
   */
  getCode: function(e) {

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
  
    userCenterApi.getOldMobileSMSCode().then(res => {
      this._countdownTimes()
    },(err=>{
      wx.showToast({
        title: err.msg,
        icon:'none',
        duration:500
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
  },
 
  /**
   * 提交更改手机号
   */
  commit: function() {

    //跳转到修改手机号
    userCenterApi.verifySMSCode(this.data.yzmNum).then(res => {
      wx.navigateTo({
        url: '../YFWModifyThePhoneNextPage/YFWModifyThePhoneNext?oldermobile=' + this.data.phone,
      })
    }, (err => {
      wx.showToast({
        title: err.msg,
        icon: 'none',
        duration: 500
      })
    }));

  }
})