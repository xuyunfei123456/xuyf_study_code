import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
  isNotEmpty,
  jsonToArray
} from '../../../../utils/YFWPublicFunction.js'
var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancleReasonList: [],
    order_no: '',
    reasonListLength:0,
    checkedIndex:0,
    position:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.order_no = screenData.order_no
    this.data.position = screenData.position
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.getCancelOrderReason(screenData.order_no).then(res => {
      wx.hideLoading()
      if (isNotEmpty(res)) {
        this.setData({
          cancleReasonList: jsonToArray(res),
          reasonListLength: jsonToArray(res).length
        })
      }
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
      })
    })
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
  chooseReason: function (e) {
    this.setData({
      checkedIndex: e.currentTarget.dataset.index,
    })
  },
  postCancleReason:function(){
    wx.showLoading({
      title: '提交中...',
    })
    orderApi.cancelOrder(this.data.order_no, this.data.cancleReasonList[this.data.checkedIndex]).then(res=>{
      if (this.data.position !=-1){
        WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
      }
      wx.hideLoading()
      //刷新列表
      wx.navigateBack()
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
      })
    })
  }
})