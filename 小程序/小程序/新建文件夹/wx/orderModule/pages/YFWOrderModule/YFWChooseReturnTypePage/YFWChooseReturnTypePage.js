import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import { OrderApi } from '../../../../apis/index'
import {
  safeObj,
  isNotEmpty,
  isEmpty
} from '../../../../utils/YFWPublicFunction.js'

const orderApi = new OrderApi()

const operation = [
  { title: '我要退款（无需退货）', type: 1, icon: '/images/return_money_icon.png' },
  { title: '我要退货退款', type: 2, icon: '/images/return_goods_icon.png' },
]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenType: 'areGoodsReceived',
    chooseTypePosition: 0,
    ReturnTypeAfterSend: '1',
    orderNo: '',
    order_total: '',
    shipping_total: '',
    packaging_total: '',
    pageFrom: '',
    needRenderBack: true,
    operation: operation
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    let status = screenData.status
    let needRenderBack = true
    if (isNotEmpty(status)) {
      needRenderBack = false
    }
    this.setData({
      orderNo: screenData.orderNo,
      order_total: screenData.order_total,
      shipping_total: screenData.shipping_total,
      packaging_total: screenData.packaging_total,
      pageFrom: screenData.pageFrom,
      screenType: safeObj(status),
      needRenderBack: needRenderBack
    })
    this.fetchReturnTypeAfterSend(screenData.orderNo)
  },
  operationAction: function(event) {
    const data = event.currentTarget.dataset
    pushNavigation('order_request_money_detail', { orderNo: this.data.orderNo, type: data.info.type, orderTotal: this.data.order_total, ReturnTypeAfterSend: this.data.ReturnTypeAfterSend }, 'redirect')
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
  chooseType: function(e) {
    this.setData({
      chooseTypePosition: e.currentTarget.dataset.position
    })
  },
  nextAction: function() {
    if (this.data.screenType == 'areGoodsReceived') {
      if (this.data.chooseTypePosition == 1) {
        pushNavigation('get_return_withoutgoods', {
          orderNo: this.data.orderNo,
          order_total: this.data.order_total,
          packaging_total: this.data.packaging_total,
          shipping_total: this.data.shipping_total,
          pageFrom: this.data.pageFrom
        })
      } else {
        this.setData({
          screenType: 'returnType'
        })
      }
    } else {
      let type = ''
      if (this.data.chooseTypePosition == 1) {
        type = 'withoutReturnGoods'
      } else {
        type = 'returnGoods'
      }
      pushNavigation('get_edite_return', {
        type: type,
        orderNo: this.data.orderNo,
        order_total: this.data.order_total,
        packaging_total: this.data.packaging_total,
        shipping_total: this.data.shipping_total
      })
    }
  },
  returnAction: function() {
    this.setData({
      screenType: 'areGoodsReceived'
    })
  },
  /**
   * 查询有无物流信息
   * @param {*} orderNo 
   */
  fetchReturnTypeAfterSend(orderNo) {
    const that = this
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.getReturnTypeAfterSend(orderNo)
    .then(res => {
      wx.hideLoading()
      that.ReturnTypeAfterSend = res
      if(res === '2') {// 无物流消息, 不退货
        that.setData({
          operation: operation.slice(0, 1)
        })
      } 
      console.log(typeof res);
    })
  }
})