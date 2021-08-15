import {
  IndexApi,
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const indexApi = new IndexApi()
import {
  isEmpty,
  isNotEmpty,
  safe,
  toDecimal
} from '../../../../utils/YFWPublicFunction.js'

import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
  getOrderBottomTipsModel
} from '../YFWOrderListPage/Components/YFWOderListBottomTips/OrderBottomsTipsModel.js'

var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
let log = require('../../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLogisticsStatus:false,
    orderStatusImage: '/images/order_status_icon_success.png',
    orderStatustText: '',
    haveLogistsInfo: true,
    trafficno: '',
    traffic_icon: '',
    traffic_name: '',
    user_name: '',
    user_phone: '',
    order_address_detaial: '',
    shop_title: '',
    shop_id: '',
    medicineList: [],
    packmedicine_list: [],
    havePackage: false,
    needreceipt: false,
    priceInfoData: [],
    statusList: [],
    orderno: '',
    destHeight: 0,
    showButtons: [],
    hideButtons: [],
    datas: [],
    contactSoler: '-1',
    store_phone: '',
    scheduled_days_item: {},
    scheduled_days_item_desc_tips: '',
    scheduled_days_item_desc_value: '',
    invoiceInfo: {},
    invoiceShowName: '',
    showRx: false,
    rx_status_item: {},
    dict_order_status:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.isDefalutLoad = true
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        that.setData({
          destHeight: height - 100
        });
      }
    });
    let screenData = options.params && JSON.parse(decodeURIComponent(options.params)) || {}
    this.setData({
      orderno:screenData.order_no
    })
    RequsetOrderDetailData(this, screenData.order_no)
    this.applayReturnModal = this.selectComponent("#applyReturnOrderModal");
    this.orderReceivedModal = this.selectComponent('#orderReceived');
    this.orderDeleteModal = this.selectComponent("#orderDelete");
    this.orderPayNot = this.selectComponent('#orderPayNot');
    this.hideButtonsModel = this.selectComponent('#hideButtons');
    WxNotificationCenter.addNotification('refreshScreenNow', that.refreshScreenNow, that)
  },

  refreshScreenNow: function () {
    wx.showLoading({
      title: '',
    })
    RequsetOrderDetailData(this, this.data.orderno)
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
    if (this.isDefalutLoad) {
      this.isDefalutLoad = false
      return
    }
    RequsetOrderDetailData(this, this.data.orderno)
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

  checkLogstics: function () {
    if (!this.data.haveLogistsInfo) {
      return
    }
    pushNavigation('get_logistics_detail', {
      'order_no': this.data.orderno,
      'medecine_image': (this.data.medicineList&&this.data.medicineList[0]&&this.data.medicineList[0].intro_image) || ''
    })
  },

  onHideButtonsClick: function (e) {
    e.detail.position.hideButtons = this.data.hideButtons,
      this.hideButtonsModel.showView(e.detail.position, 'orderDetail')
  },
  scheduledButtonClick: function (e) {
    let index = e.currentTarget.dataset.position
    let isAgree = this.data.scheduled_days_item.buttons[index].text == '同意' ? 1 : 0
    wx.showLoading({
      title: '提交中...',
    })
    orderApi.getDelaySend(this.data.orderno, isAgree).then(res => {
      WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
      wx.hideLoading()
      RequsetOrderDetailData(this, this.data.orderno)
    }, error => {
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
    })
  },
  onOrderPayNot: function (parms) {
    let orderNo = parms.detail.orderNo
    let prompt_info = parms.detail.prompt_info
    this.orderPayNot.showView(prompt_info, orderNo)
  },
  onOrderPayNotMpdelRightButtonClick: function (parm) {
    this.orderPayNot.closeView()
    pushNavigation('get_upload_rx_info', {
      orderID: parm.detail.orderNo
    })
  },

  applyReturn: function (parm) {
    var that = this
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.getAccountMobile().then(res => {
      wx.hideLoading()
      that.applayReturnModal.showView({
        phone: res.value,
        orderNo: parm.detail.orderNo,
        orderTotal: parm.detail.order_total,
        packagingTotal: parm.detail.packaging_total,
        shippingTotal: parm.detail.shipping_total,
        type: parm.detail.type,
        inputSuccess: function (phoneCode) {
          that.data.code = phoneCode
        },
      });
    }, error => {
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
    })
  },
  checkPhoneNum: function (parm) {
    let arrary = parm.detail.phone.split('****')
    let pheone = safe(arrary[0]) + this.data.code + safe(arrary[1])
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.verifyMobile(pheone).then(res => {
      wx.hideLoading()
      if (res == 1) {
        this.applayReturnModal.closeView()
        if (parm.detail.type == 'order_apply_return_pay') {
          pushNavigation('get_application_return', {
            orderNo: parm.detail.orderNo,
            order_total: parm.detail.order_total,
            pageFrom: 'orderDetail'
          })
        } else {
          pushNavigation('get_choose_return_type', {
            orderNo: parm.detail.orderNo,
            order_total: parm.detail.order_total,
            packaging_total: parm.detail.packaging_total,
            shipping_total: parm.detail.shipping_total,
            pageFrom: 'orderDetail',
            status: "areGoodsReceived"
          })
        }
      } else {
        //this.applayReturnModal.closeView()
        wx.showToast({
          title: '手机号验证失败',
          icon: 'none'
        })
      }
    }, error => {
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
    })
  },
  call: function() {
    wx: wx.makePhoneCall({
      phoneNumber: this.data.store_phone,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  message:function(){
    wx.showLoading();
    indexApi.getAuthUrl(this.data.advisory_link).then(res=>{
      let newurl = res.auth_url ?decodeURIComponent(res.auth_url) :"";
      wx.hideLoading();
      pushNavigation('receive_h5',{value:newurl})
    })
  },
  jumpToH5: function () {
    pushNavigation('receive_h5', {
      'value': 'https://m.yaofangwang.com/app/check.html?os=miniapp'
    })
  },
  contactCustomerServic: function () {
    pushNavigation('receive_h5', {
      'value': 'https://m.yaofangwang.com/chat.html'
    })
  },
  jumpToGoodsDetail: function (e) {
    let shopGoodsId = e.currentTarget.dataset.goodsid
    pushNavigation('get_shop_goods_detail', {
      value: shopGoodsId
    })
  },
  jumpToShopDetail: function () {
    pushNavigation('get_shop_detail', {
      value: this.data.shop_id
    })
  },
  handleRxInfoClick: function (event) {
    pushNavigation('get_prescription_detail_page', {orderNo: this.data.orderno})
  },
  handleInvoiceClick: function (event) {
    const { needreceipt } = this.data
    if (needreceipt) {
      pushNavigation('get_invoice_detail', this.data.invoiceInfo)
    }
  },
  onBaseModalRightButtonClick: function (parm) {
    console.log('确认收货')
    this.orderReceivedModal.closeView()
    let orderNo = parm.detail.orderNo
    let img_url = parm.detail.img_url
    let order_total = parm.detail.order_total
    let shop_title = parm.detail.shop_title

    let unreceive = [];
    if(this.data.packmedicine_list&&this.data.packmedicine_list[0]){
      let _data = this.data.packmedicine_list[0].medicine_list;
      _data.map(item=>{
        unreceive.push(item);
      })
    }
    if(this.data.medicineList&&this.data.medicineList.lenght!=0){
      let _data = this.data.medicineList;
      _data.map(item=>{
        unreceive.push(item);
      })
    }
    let _param={
      'detail':{
        'orderNo': orderNo,
        'shop_title': shop_title,
        'img_url': img_url,
        'order_total': order_total,
        unreceive,
      }
    }
    pushNavigation('confirmReceive', _param);

      /*上面的是确认收货有奖的版本   下面的是原来确认收货的版本*/
    // wx.showLoading({
    //   title: '加载中...',
    // })
    // orderApi.confirmReceiving(orderNo).then(res => {
    //   WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
    //   wx.hideLoading()
    //   pushNavigation('get_success_receipt', {
    //     title: '收货成功',
    //     orderNo: orderNo,
    //     type: 'received',
    //     img_url: img_url,
    //     order_total: order_total,
    //     shop_title: shop_title
    //   }, error => {
    //     wx.hideLoading()
    //     wx.showToast({
    //       title: error.msg,
    //     })
    //   })
    // })
  },
  orderReceived: function (parm) {
    var that = this;
    that.orderReceivedModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", parm)
  },
  onOrderDelete: function () {
    this.orderDeleteModal.showView("是否删除该订单？\n删除后可以从电脑端订单回收站恢复")
  },
  onDeleteRightButtonClick: function () {
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.delectOrder(this.data.orderno).then(rex => {
      WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
      wx.hideLoading()
      this.orderDeleteModal.closeView()
      wx.showToast({
        title: '删除成功',
        icon: 'none'
      })
      RequsetOrderDetailData(this, this.data.orderno)
    }, error => {
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
    })
  },
  copyOderNo: function () {
    wx.setClipboardData({
      data: this.data.orderno,
      success: function () {
        wx.showToast({
          title: '订单编号复制成功',
          icon: 'none'
        })
      }
    })
  }
})

var RequsetOrderDetailData = function (that, orderNo) {
  wx.showLoading({
    title: '加载中',
  })
  if(!orderNo){
    let pages = getCurrentPages();
    log.info('接受到的orderno为空== 页面信息 === '+JSON.stringify(pages));
    wx.showToast({
      title: '暂无查到订单详情 请稍后在个人中心的订单中查看',
      icon:'none'
    });
    return false
  }
  orderApi.getOrderDetail(orderNo).then(res => {
    that.setData({
      dict_sckf_off:res.dict_sckf_off  == 1 ? 1:0,
      advisory_link:res.advisory_link || '',
      unreceive:{
        rx_status_item:res.rx_status_item || {}
      }
    })
    HanderlerOrderBottomsData(that, res)
    HandlerOrderStatusImage(that, res.dict_order_status_name)
    HandlerLogistsInfoAndAdress(that, res)
    HandlerRxInfo(that, res)
    HandlerSeninfoTps(that, res)
    HandlerOrderMedecineInfo(that, res)
    HandlerContactInfo(that, res)
    HandlerInveceiptInfo(that, res)
    HandlerOrderPriceInfo(that, res)
    HandlerOrderStatusList(that, res)
    HandlerOrderButtons(that, res)
    wx.hideLoading()
  }, error => {
    wx.hideLoading()
    wx.showToast({
      title: error.msg,
      icon: 'none'
    })
  })
}

var HanderlerOrderBottomsData = function (that, res) {
  let data = getOrderBottomTipsModel(res, 'order_detail')
  if (isNotEmpty(data)) {
    that.setData({
      datas: data
    })
  }
}

var HandlerOrderStatusImage = function (that, status) {
  let order_status_icon = '/images/order_status_icon_success.png'
  let order_status_title = status
  if (status === '交易完成') {
    order_status_icon = '/images/order_status_icon_success.png'
  } else if (status === '交易失败' || status === '交易取消' || status === '交易关闭') {
    order_status_icon = '/images/order_status_icon_failed.png'
  } else if (status === '申请退货' || status === '申请退款' || status === '同意退货' ||
    status === '退货发出' || status === '收到退货' || status === '退货/款完成' ||
    status === '商家拒绝退货/款' || status === '退货/款已取消' ||
    status === '退款已取消' || status === '商家拒绝退款' || status === '正在退款') {
    order_status_icon = '/images/order_status_icon_return.png'
  } else {
    if (status === '暂未付款') {
      order_status_title = '等待买家付款'
    } else if (status === '等待发货') {
      order_status_title = '等待商家发货'
    }
    order_status_icon = '/images/order_status_icon_wait.png'
  }
  let showLogisticsStatus = true;
  if(order_status_title === '交易失败' || order_status_title === '交易取消' || order_status_title === '交易关闭' || order_status_title === '暂未付款' ) {
    showLogisticsStatus = false
  }
  that.setData({
    orderStatusImage: order_status_icon,
    orderStatustText: order_status_title, 
    showLogisticsStatus,
  })
}

var HandlerLogistsInfoAndAdress = function (that, res) {
  if (isEmpty(res.trafficno)) {
    that.setData({
      haveLogistsInfo: false,
      user_name: res.shopping_name,
      user_phone: res.shopping_mobile,
      order_address_detaial: res.shopping_address,
    })
  } else {
    that.setData({
      traffic_name: res.traffic_name,
      traffic_icon: res.traffic_icon,
      trafficno: res.trafficno,
      user_name: res.shopping_name,
      user_phone: res.shopping_mobile,
      order_address_detaial: res.shopping_address,
    })
  }
}

var HandlerRxInfo = function (that, res) {
  if (isNotEmpty(res)) {
    if (isNotEmpty(res.rx_status_item) && Object.keys(res.rx_status_item).length>0) {
      that.setData({
        showRx: true,
        rx_status_item: res.rx_status_item
      })
    }
  }
}

var HandlerSeninfoTps = function (that, res) {
  if (isNotEmpty(res)) {
    if (isNotEmpty(res.scheduled_days_item)) {
      if (isNotEmpty(res.scheduled_days_item.desc)) {
        let descArray = res.scheduled_days_item.desc.split('：')
        if (descArray.length >= 2) {
          that.setData({
            scheduled_days_item: res.scheduled_days_item,
            scheduled_days_item_desc_tips: descArray[0],
            scheduled_days_item_desc_value: descArray[1]
          })
        } else {
          that.setData({
            scheduled_days_item: res.scheduled_days_item
          })
        }
      } else {
        that.setData({
          scheduled_days_item: res.scheduled_days_item
        })
      }
    }
  }
}

var HandlerContactInfo = function(that, res) {
  if (isNotEmpty(res)) {
    if (isNotEmpty(res.phone_show_type)) {
      that.setData({
        contactSoler: res.phone_show_type,
        store_phone: safe(res.store_phone),
        dict_advisory_notice:res.dict_advisory_notice,
      })
    }
  }
}

var HandlerOrderMedecineInfo = function (that, res) {
  let havePackage = false
  if (isNotEmpty(res.packmedicine_list) && res.packmedicine_list.length > 0) {
    havePackage = true
  }
  HandlerMedicineMoney(res)
  that.setData({
    shop_title: res.title,
    medicineList: res.medicineList,
    packmedicine_list: res.packmedicine_list,
    havePackage: havePackage,
    shop_id: res.storeid
  })
}

var HandlerInveceiptInfo = function (that, res) {
  let invoiceInfo = isNotEmpty(res.invoice_info) ? res.invoice_info : {}
  invoiceInfo.orderNo = that.data.orderno
  that.setData({
    needreceipt: Number.parseInt(safe(res.dict_invoice_type)) == 1,
    invoiceInfo: invoiceInfo,
    invoiceShowName: res.invoice_showname
  })
  // if (Number.parseInt(safe(res.dict_invoice_type)) == 1) {
  // }
}

var HandlerOrderPriceInfo = function (that, res) {
  let orderPriceInfo = []
  if (parseFloat(res.medicine_total) != 0) {
    let medicineTotal = {
      type: '商品总价',
      price: toDecimal(res.medicine_total)
    }
    orderPriceInfo.push(medicineTotal)
  }
  if (parseFloat(res.shipping_total) != 0) {
    let shipping = {
      type: '配送费',
      price: toDecimal(res.shipping_total)
    }
    orderPriceInfo.push(shipping)
  }
  if (parseFloat(res.packaging_total) != 0) {
    let packing = {
      type: '包装费',
      price: toDecimal(res.packaging_total)
    }
    orderPriceInfo.push(packing)
  }
  if (parseFloat(res.use_point) != 0) {
    let usrPoint = {
      type: ' 积分抵扣',
      price: '-' + toDecimal(res.use_point)
    }
    orderPriceInfo.push(usrPoint)
  }
  if (parseFloat(res.use_coupon_price) != 0) {
    let usrCoupon = {
      type: '商家优惠券',
      price: '-' + toDecimal(res.use_coupon_price)
    }
    orderPriceInfo.push(usrCoupon)
  }
  if (parseFloat(res.plat_coupon_price) != 0) {
    let platformYh = {
      type: '商城优惠券',
      price: '-' + toDecimal(res.plat_coupon_price)
    }
    orderPriceInfo.push(platformYh)
  }
  if (parseFloat(res.update_price) != 0) {
    let updatePrice = {
      type: '商品优惠',
      price: toDecimal(res.update_price)
    }
    orderPriceInfo.push(updatePrice)
  }
  that.setData({
    priceInfoData: orderPriceInfo,
    total_price: toDecimal(res.total_price)
  })
}

var HandlerOrderStatusList = function (that, res) {
  that.setData({
    dict_order_status:res.dict_order_status || ""
  })
  if (isNotEmpty(res.statusList)) {
    that.setData({
      statusList: res.statusList,
      orderno: res.orderno,
    })
  } else {
    that.setData({
      orderno: res.orderno,
    })
  }
}

var HandlerOrderButtons = function (that, res) {
  let showButtons = [], hideButtons = [];
  if (res.buttons.lengtgh != 0) {
    res.buttons.map(item => {
      if (item.value == "order_complaint" || item.value == "delete") {
        hideButtons.push(item);
      } else {
        showButtons.push(item);
      }
    })
    that.setData({
      showButtons, hideButtons,
    })
  }
}

var HandlerMedicineMoney = function (res) {
  if (isNotEmpty(res.medicineList)) {
    if (res.medicineList.length > 0) {
      res.medicineList.forEach((item, index) => {
        item.unit_price = toDecimal(item.unit_price)
      })
    }
  }
  if (isNotEmpty(res.packmedicine_list)) {
    if (res.packmedicine_list.length > 0) {
      res.packmedicine_list.forEach((item, index) => {
        item.medicine_list.forEach((innerItem, position) => {
          innerItem.unit_price = toDecimal(innerItem.unit_price)
        })
      })
    }
  }
}

var HandlerOrderBuyAgain = function (orderNo) {
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