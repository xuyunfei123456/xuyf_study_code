// myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWLLTX.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import {toDecimal} from '../../../../utils/YFWPublicFunction.js'
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showexplain:false,
    dataList:[],
    Cashback:'0.00',
    valid_balance:'0.00',
    reward_total:'0.00',
    total_money:'0.00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  apply(){
    wx.showToast({
      title: '请在药房网商城APP内操作',
      duration:2000,
      icon:'none'
    })
  },
  rank(){
    pushNavigation('exchange_points')
  },
  explainarea(){
    this.setData({
      showexplain:!this.data.showexplain
    })
  },
  txRecord(){
    pushNavigation('txrecord')
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
    userCenterApi.getMyBalance().then(res=>{
      let valid_balance = res.balanceinfo&& res.balanceinfo.valid_balance &&toDecimal(res.balanceinfo.valid_balance)|| '0.00',
          reward_total = res.balanceinfo && res.balanceinfo.reward_total &&toDecimal(res.balanceinfo.reward_total)|| '0.00',
          total_money = toDecimal(Number(res.Cashback || '0.00')+Number(reward_total));
      this.setData({
        dataList:res.cashlist && res.cashlist.dataList || [],
        Cashback:toDecimal(res.Cashback),
        valid_balance,
        reward_total,
        total_money,
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