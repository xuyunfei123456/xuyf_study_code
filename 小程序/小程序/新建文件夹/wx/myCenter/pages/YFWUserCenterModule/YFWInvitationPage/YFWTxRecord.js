// myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWTxRecord.js
import {toDecimal} from '../../../../utils/YFWPublicFunction.js'
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Cashback:'0.00',
    valid_balance:'0.00',
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
    userCenterApi.getTxRecord().then(res=>{
      let valid_balance = res.balanceinfo&& res.balanceinfo.valid_balance &&toDecimal(res.balanceinfo.valid_balance)|| '0.00';
      this.setData({
        dataList:res.accountbalanceList&&res.accountbalanceList.dataList || [],
        Cashback:toDecimal(res.Cashback),
        valid_balance,

      })
    })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})