// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    userInfoModel: {},
    qq:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   

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

  bindChange_qq: function (e) {
    this.setData({qq:e.detail.value});
  },

  /**
   * 保存
   */
  save:function () {
 
    var qq= this.data.qq;
    if(qq.length>0){
      userCenterApi.updateUserQQ(qq).then(userInfoModel => {

        wx.showLoading({
          title: '',
          duration: 300
        })
      })
      wx.navigateBack({
      })
    }else{
      wx.showLoading({
        title: '请输入正确QQ号',
        duration: 500
      })
    }
    
  }


})