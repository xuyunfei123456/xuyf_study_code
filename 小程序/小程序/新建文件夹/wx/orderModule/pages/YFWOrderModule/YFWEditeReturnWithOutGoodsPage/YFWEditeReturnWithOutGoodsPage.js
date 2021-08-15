import { OrderApi } from '../../../../apis/index.js'
const orderApi = new OrderApi()
import { isNotEmpty, isEmpty, toDecimal} from '../../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo:'',
    reasonList:[],
    checkedIndex:0,
    reasonListLength:0,
    havePromptinfo:'yes',
    order_total:'',
    pageFrom: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.pageFrom = screenData.pageFrom
    this.data.orderNo = screenData.orderNo
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.getReturnReason(screenData.orderNo).then(res=>{
      wx.hideLoading()
      if(isNotEmpty(res)){
        this.setData({
          reasonList:res,
          reasonListLength:res.length,
          havePromptinfo: isEmpty(res[0].promptinfo)?'no':'yes',
          order_total: toDecimal(res[0].total_price)
        })
      }
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon:'none'
      })
    })
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
  chooseReason: function (e) {
    this.setData({
      checkedIndex: e.currentTarget.dataset.index,
      havePromptinfo: isEmpty(this.data.reasonList[e.currentTarget.dataset.index].promptinfo)?'no':'yes',
      order_total: toDecimal(this.data.reasonList[e.currentTarget.dataset.index].total_price)
    })
  },
  postReturnApplay:function(){
    wx.showLoading({
      title: '提交中...',
    })
    orderApi.applyForRefund(this.data.orderNo, this.data.reasonList[this.data.checkedIndex].reason).then(res=>{
      wx.hideLoading()
      let params = {
        title: '申请退款',
        tips: '您的申请已经提交，请等待商家确认',
        orderNo: this.data.orderNo,
        pageFrom: this.data.pageFrom
      }
      params = JSON.stringify(params)
      wx.redirectTo({
        url: "/orderModule/pages/YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage?params=" + params,
      })
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon:'none'
      })
    })
  }
})