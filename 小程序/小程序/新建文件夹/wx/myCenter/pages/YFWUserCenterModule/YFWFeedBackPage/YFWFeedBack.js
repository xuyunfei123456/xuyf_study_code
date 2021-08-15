// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()

var phoneNum,qq,ssid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    textarea:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '意见反馈',
    })
       this.getUserInfo();
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
    clearTimeout(this.timer);
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


  bindChange_name:function(e){

    this.setData({textarea:e.detail.value})
  
  },
  commit:function(){
    var textarea = this.data.textarea;
    if (textarea.length > 0) {
      this.getCommit();
    
    } else {
      wx.showLoading({
        title: '请填写反馈内容',
        duration: 500
      })
    } 
  },
  /**
   * 获取手机号 qq
   */
  getUserInfo:function(){
    userCenterApi.getUserAccountInfo().then(res => {
      phoneNum = res.default_mobile;
      qq=res.qq;
    });
  },
  /**
  * 提交
  */
  getCommit: function () {
    ssid = wx.getStorageSync('cookieKey');
    userCenterApi.feedBack(phoneNum, qq, ssid).then(res => {
      wx.showToast({
        title: '反馈成功',
        icon: 'none',
        duration:500
      })
      this.timer=setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 400)
    });
  }

})