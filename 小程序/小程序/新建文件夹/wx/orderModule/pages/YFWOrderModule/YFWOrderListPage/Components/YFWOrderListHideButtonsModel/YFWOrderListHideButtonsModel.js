import {
  OrderApi
} from '../../../../../../apis/index.js'
const orderApi = new OrderApi()
import {MessageApi} from '../../../../../../apis/index'
const messageApi = new MessageApi()
import {
  pushNavigation
} from '../../../../../../apis/YFWRouting.js'
import {
  isNotEmpty
} from '../../../../../../utils/YFWPublicFunction.js'
var ORDER_EVALUATION = "order_evaluation" //评价订单
var ORDER_APPLY_RETURN = 'order_apply_return' //申请退货/款
var ORDER_APPLY_RETURN_PAY = 'order_apply_return_pay' //申请退款
var ORDER_RECEIVED = 'order_received' //确认收货
var ORDER_LOOK_LOGISTICS = 'look_logistics' //查物流
var ORDER_CANCLE = 'order_cancel' //取消订单
var ORDER_COMPLAINT = 'order_complaint' //订单投诉
var ORDER_BUY_AGAIN = 'order_buy_again' //重新购买
var ORDER_COMPLAINT_DETAIL = 'order_complaint_detail' //投诉详情
var ORDER_APPLAY_RETURN_PAY_CANCEL = 'order_apply_return_pay_cancel' //取消申请退款
var ORDER_RETURN_DETAIL = 'order_return_detail' //退货款详情
var DELETE = 'delete' //删除订单
var ORDER_RX_SUBMIT = 'order_rx_submit' //上传处方
var ORDER_APPLY_RETURN_UPDATE = 'order_apply_return_update' //我要退货，或者只退款不退货
var GET_APPLY_RETURN_PAY_REASON = 'get_apply_return_pay_reason' //更新申请退款状态
var log = require('../../../../../../utils/log')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    datas: {
      type: Object,
      value: []
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    top: 0,
    left: 0,
    showDerictionTop: '',
    hideButtons: [],
    style: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showView: function(position, fromes) {
      if (fromes == 'orderDetail') {
        this.setData({
          show: true,
          showDerictionTop: 'bottom',
          hideButtons: position.hideButtons,
          style: "bottom:" + 80 + 'rpx' + '; left:' + position.left + 'rpx'
        })
      } else {
        this.setData({
          show: true,
          showDerictionTop: position.showDirection,
          hideButtons: position.hideButtons,
          style: position.showDirection == 'bottom' ? "top:" + (position.top * 2 + 100) + 'rpx' + '; left:' + position.left + 'rpx' : "top:" + (position.top * 2) + 'rpx' + '; left:' + position.left + 'rpx'
        })
      }
    },
    setDatas: function(datas) {
      this.setData({
        datas: datas
      })
    },
    closeView: function() {
      this.setData({
        show: false
      })
    },
    onHideButtonClick: function(item) {
      Click(item.currentTarget.dataset, this)
    },
    onRequestApplyReturn: function(parm) {
      this.triggerEvent('orderApplyReturn', {
        orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno,
        order_total: parm.item.order_total ? parm.item.order_total : parm.item.total_price,
        type: parm.type
      })
    },
    onOrderReceived: function(parm) {
      this.triggerEvent('orderReceived', {
        orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno
      })
    },
    onLogisticsClick: function() {
      this.triggerEvent('lookLogistics')
    },
    showHideButton: function(e) {
      let that = this;
      let targetId = e.currentTarget.dataset.id;
      let itemIndex = e.currentTarget.dataset.index;
      const query = this.createSelectorQuery()
      setTimeout(function () {
        query.select('#' + targetId).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
          if (res === null || res.length < 1 || res[0].top === null || res[0].top === undefined) {
            return;
          }
          let position = {
            top: res[0].top,
            left: 24,
            itemIndex: itemIndex
          }
          that.triggerEvent('showHideButtons', {
            "position": position
          })
        })
      }, 10)

    },
    orderPay: function(parms) {
      let orderId = parms.detail.orderNo
      // wx.showLoading({
      //   title: '加载中...',
      // })
      orderPaymentApi.orderPay(orderId).then((result) => {
        orderPaymentApi.getCurrentPayStatus(orderId, 'wxpay').then((res) =>{
          wx.hideLoading()
          if (res.success) {
            wx.showToast({
              title: '支付成功',
            })
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
                pushNavigation('get_success_receipt', {
                  value: orderId,
                  type: 'paySuccess'
                })
              }
            }) 
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
    orderPayNot: function(parms) {
      let orderId = parms.detail.orderNo
      let prompt_info = parms.detail.prompt_info
      this.triggerEvent('onOrderPayNot', {
        orderNo: orderId,
        prompt_info: prompt_info
      })
    }
  },
})

var Click = function(parm, that) {
  switch (parm.type) {
    case ORDER_EVALUATION:
      pushNavigation('get_order_evaluation', {
        'order_no': parm.item.order_no,
        'shop_title': parm.item.shop_title,
        'img_url': parm.item.img_url,
        'order_total': parm.item.order_total
      })
      break
    case ORDER_APPLY_RETURN:
    case ORDER_APPLY_RETURN_UPDATE:
    case GET_APPLY_RETURN_PAY_REASON:
      that.onRequestApplyReturn(parm)
      break
    case ORDER_APPLY_RETURN_PAY:
      that.onRequestApplyReturn(parm)
      break
    case ORDER_RECEIVED:
      that.onOrderReceived(parm)
      break
    case ORDER_LOOK_LOGISTICS:
      pushNavigation('get_logistics_detail', {
        'order_no': parm.item.order_no,
        'medecine_image': parm.item.img_url
      })
      break
    case ORDER_CANCLE:
      pushNavigation('get_cancle_order', {
        'order_no': parm.item.order_no
      })
      break
    case ORDER_COMPLAINT:
      pushNavigation('get_complaint_order', {
        'order_no': parm.item.order_no,
        'shop_title': parm.item.shop_title
      })
      break
    case ORDER_BUY_AGAIN:
      HandlerOrderBuyAgain(parm.item.order_no)
      break
    case ORDER_COMPLAINT_DETAIL:
      pushNavigation('get_complaint_Details', {
        order_no: parm.item.order_no
      })
      break
    case ORDER_APPLAY_RETURN_PAY_CANCEL:
      HandlerReturnPayCancel(parm.item.order_no)
      break
    case ORDER_RETURN_DETAIL:
      pushNavigation('get_detail_refund', {
        order_no: parm.item.order_no,
        order_total: parm.item.order_total
      })
      break
    case DELETE:
      that.triggerEvent('orderDelete', {
        order_no: parm.item.order_no
      })
      break
    case ORDER_RX_SUBMIT:
      pushNavigation('get_upload_rx_info', {
        orderID: parm.item.order_no
      })
      break
  }
}

var HandlerOrderBuyAgain = function(orderNo) {
  wx.showLoading({
    title: '加载中...',
  })
  orderApi.buyAgain(orderNo).then(res => {
    wx.hideLoading()
    wx.switchTab({
      url: "/pages/YFWShopCarModule/YFWShopCarPage/YFWShopCar"
    })
  }, error => {
    wx.hideLoading()
    if (isNotEmpty(error.msg)) {
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
    }
  })
}

var HandlerReturnPayCancel = function(orderNo) {
  wx.showLoading({
    title: '加载中...',
  })
  orderApi.cancelRefund(orderNo).then(res => {
    wx.hideLoading()
    wx.showToast({
      title: '取消申请退款成功',
      icon: 'none',
      duration: 2000
    })
  }, error => {
    wx.hideLoading()
    if (isNotEmpty(error.msg)) {
      wx.showToast({
        title: error.msg,
        icon: 'none',
        duration: 2000
      })
    }
  })
}