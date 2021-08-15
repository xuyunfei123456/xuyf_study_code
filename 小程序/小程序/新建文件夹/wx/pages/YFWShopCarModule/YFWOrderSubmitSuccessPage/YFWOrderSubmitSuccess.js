// pages/YFWShopCarModule/YFWOrderSubmitSuccessPage/YFWOrderSubmitSuccess.js
import { OrderPaymentApi} from '../../../apis/index.js'
import { toDecimal} from '../../../utils/YFWPublicFunction.js'
import { pushNavigation} from '../../../apis/YFWRouting.js'
import {MessageApi} from '../../../apis/index'
const orderPaymentApi = new OrderPaymentApi()
const messageApi = new MessageApi()
var WxNotificationCenter = require("../../../utils/WxNotificationCenter.js");
var log = require('../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArray:[],
    addressInfo:{
      name:'',
      mobile:'',
      address:'',
      is_default:false
    },
    orderIds:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let info = options.params
    var that = this
    if (info && typeof(info) == 'string') {
      info = JSON.parse(info)
      console.log(info)
      let orderIds = info.orderIds.join(',')
      this.data.orderIds = orderIds
      this.setData({
        addressInfo: info.addressInfo
      })
      this.requestDataFromServer(orderIds)
    } else {

    }
    WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
  },
  requestDataFromServer: function (orderIds) {
    var that = this
    orderPaymentApi.getNotPayOrdersList(orderIds).then((result) => {
      result.map((item) => {
        item.total_price = toDecimal(item.total_price)
      })
      that.setData({
        dataArray: result,
      })
    }).then((error) => {

    })
  },
  itemClickAction: function (event) {
    let orderId = event.currentTarget.dataset.orderId,
    info = event.currentTarget.dataset.info,
    actionType = info.action,
    inquiry = event.currentTarget.dataset.inquiry;
    if (actionType == 'pay_not') {
      wx.showModal({
        title: '',
        content: info.prompt_info,
        showCancel:false,
        confirmText:'立即上传',
        confirmColor:'#1fdb9b',
        success:(result)=>{
          if(result.confirm) {
            pushNavigation('get_upload_rx_info',{orderID:orderId})
          }
        },
      })
    } else if (actionType == 'rx_upload') {
      pushNavigation('get_upload_rx_info', { orderID: orderId })
    } else if ( actionType == 'pay') {
      this.payAction(orderId,inquiry)
    }
    
  },

  payAction: function(orderId,inquiry) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let currentOrderCount = this.data.dataArray.length
    orderPaymentApi.orderPay(orderId).then((result) => {
      orderPaymentApi.getCurrentPayStatus(orderId, 'wxpay').then((res) =>{
        wx.hideLoading()
        if (res.success) {
          wx.showToast({
            title: '支付成功',
          })
          if(inquiry>0){
            wx.requestSubscribeMessage({
              tmplIds: ['ls-aY7kvJQn2w5Slii2NOah8JSRZgfLY6o8c26r-Ssk'],
              success: res => {
                if (res && res['ls-aY7kvJQn2w5Slii2NOah8JSRZgfLY6o8c26r-Ssk'] == 'accept') {
                  messageApi.subScribeMessage(orderId,21,1).then(res=>{})
                }else if(res){
                  let type =res['ls-aY7kvJQn2w5Slii2NOah8JSRZgfLY6o8c26r-Ssk'] || "-1"
                  messageApi.subScribeMessage(orderId,21,type).then(res=>{})
                }
              },fail:error=>{
                if(error){
                  messageApi.subScribeMessage(orderId,21,error.errCode).then(res=>{})
                }
              },
              complete:res=>{
                let info = { orderNo: orderId, title: '付款成功', type: 'paySuccess' }
                if(currentOrderCount <= 1) {
                  wx.redirectTo({
                    url: '/orderModule/pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt?params=' + JSON.stringify(info),
                  })
                } else {
                  pushNavigation('get_success_receipt', info)
                }
              }
            }) 
          }else{
            let info = { orderNo: orderId, title: '付款成功', type: 'paySuccess' }
            if(currentOrderCount <= 1) {
              wx.redirectTo({
                url: '/orderModule/pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt?params=' + JSON.stringify(info),
              })
            } else {
              pushNavigation('get_success_receipt', info)
            }
          }
        } else {
          wx.showToast({
            icon:'none',
            title: '支付失败',
          })
        }
      }, (error) => {
        wx.hideLoading()
        wx.showToast({
          icon:'none',
          title: '支付失败',
        })
       })
    },(error) => {
      wx.hideLoading()
      if (error) {
        wx.showToast({
          icon:'none',
          title: '支付失败',
        })
      }
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
    if (this.data.orderIds){
      this.requestDataFromServer(this.data.orderIds)
    }
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
})