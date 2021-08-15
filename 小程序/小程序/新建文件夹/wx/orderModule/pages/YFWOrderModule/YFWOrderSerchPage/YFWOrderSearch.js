var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi();
import {
  isNotEmpty, safe
} from '../../../../utils/YFWPublicFunction.js'
import {
  YFWOrderListModel
} from '../YFWOrderListPage/Model/YFWOrderListModel.js'
const orderListModel = new YFWOrderListModel()
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArray: [],
    keywords: '',
    pageIndex: 1,
    showEmptyView: false,
    showBottomLoading: false,
    loadType:1,
    canRequestMore: true,
    loadMore: true,
    showDeletIcon:false,
    focus:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.needRefreshScreen = false
    this.refreshAll = false
    this.needRefreshPosition = -1;
    let that = this;
    this.applayReturnModal = this.selectComponent("#applyReturnOrderModal");
    this.orderReceivedModal = this.selectComponent('#orderReceived');
    this.hideButtonsModel = this.selectComponent('#hideButtons');
    this.orderPayNot = this.selectComponent('#orderPayNot');
    WxNotificationCenter.addNotification('refreshScreen', that.refreshScreen, that)
    WxNotificationCenter.addNotification('refreshScreenNow', that.refreshScreenNow, that)
  },

  refreshScreen: function (info) {
    this.needRefreshScreen = true
    if (info == "refreshAll") {
      this.refreshAll = true
    } else if (info.substr(0, 8) == "position") {
      let array = info.split(":")
      if (array.length > 1) {
        this.needRefreshPosition = array[1]
      }
    }
  },

  refreshScreenNow: function (info) {
    wx.showLoading({
      title: '',
    })
    if (info == "refreshAll") {
      this.data.pageIndex = 1
      this.data.list = []
      RequestOrderListDatas(this)
    } else if (info.substr(0, 8) == "position") {
      let array = info.split(":")
      if (array.length > 1) {
        let pageIndex, position;
        this.needRefreshPosition = array[1]
        if (Number.isInteger(this.needRefreshPosition / 10)) {
          pageIndex = this.needRefreshPosition / 10 + 1;
          position = 0;
        } else {
          pageIndex = Math.ceil(this.needRefreshPosition / 10)
          position = this.needRefreshPosition % 10;
        }
        RequestOrderListDatas(this, pageIndex, position, this.needRefreshPosition)
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  jumpToShopDetail:function(e){
    let shopId = e.currentTarget.dataset.shopid
    pushNavigation('get_shop_detail', {
      value: shopId
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.pageLoading = !1;
    if (this.needRefreshScreen) {
      this.needRefreshScreen = false
      wx.showLoading({
        title: '',
      })
      if (this.refreshAll) {
        this.refreshAll = false
        this.data.pageIndex = 1
        this.data.list = []
        RequestOrderListDatas(this)
      }
      if (this.needRefreshPosition != -1) {
        //计算position处于哪一页 计算pageIndex
        let pageIndex, position;
        if (Number.isInteger(this.needRefreshPosition / 10)) {
          pageIndex = this.needRefreshPosition / 10 + 1;
          position = 0;
        } else {
          pageIndex = Math.ceil(this.needRefreshPosition / 10)
          position = this.needRefreshPosition % 10;
        }
        RequestOrderListDatas(this, pageIndex, position, this.needRefreshPosition)
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.needRefreshPosition = -1;
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

  onSearchClick:function(){
    RequestOrderListDatas(this)
  },
  onScheduledButtonClick: function (e) {
    let orderNo = e.currentTarget.dataset.orderno;
    let position = e.currentTarget.dataset.position;
    let isAgree = position == 0 ? 1 : 0
    let index = e.currentTarget.dataset.index;
    wx.showLoading({
      title: '提交中...',
    })
    orderApi.getDelaySend(orderNo, isAgree).then(res => {
      WxNotificationCenter.postNotificationName('refreshScreenNow', "position:" + index)
      wx.hideLoading()
      RequestOrderListDatas(this)
    }, error => {
      WxNotificationCenter.postNotificationName('refreshScreenNow', "position:" + index)
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon:'none'
      })
    })
  },
  serchOrder: function() {
    wx.showLoading({
      title: '搜索中...',
      icon:'none'
    })
    RequestOrderListDatas(this)
  },
  listenKeyInput(text) {
    var input = text.detail.value;
    this.data.keywords = input;
    if (input.length>0){
      this.setData({
        showDeletIcon:true
      })
    }else{
      this.setData({
        showDeletIcon:false
      })
    }
  },
  requestNextPage: function (e) {
    if (!this.data.canRequestMore) {
      return
    }
    this.data.canRequestMore = false
    this.data.pageIndex++;
    this.data.loadMore = false;
    RequestOrderListDatas(this)
  },
  onOrderListItemClick: function (e) {
    if (!this.pageLoading) {
      this.pageLoading = !0;
      pushNavigation('get_order_detail', {
        order_no: e.currentTarget.dataset.orderno
      })
    }
  },
  applyReturn: function (parm) {
    console.log('通信')
    var that = this
    wx.showLoading({
      title:'加载中...',
    })
    orderApi.getAccountMobile().then(res => {
      wx.hideLoading()
      that.applayReturnModal.showView({
        phone: res.value,
        orderNo: parm.detail.orderNo,
        orderTotal: parm.detail.order_total,
        type: parm.detail.type,
        inputSuccess: function (phoneCode) {
          //调用组件关闭方法
          // that.applayReturnModal.closeView();
          //设置数据
          that.data.code = phoneCode
        },
      });
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon:'none'
      })
    })
  },
  //确认收货  按钮点击
  orderReceived: function (parm) {
    var that = this;
    that.orderReceivedModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", parm)
  },
  //确认收货 model点击确认按钮
  onBaseModalRightButtonClick: function (parm) {
    console.log('确认收货')
    this.orderReceivedModal.closeView()
    let orderNo = parm.detail.orderNo
    let img_url = parm.detail.img_url
    let order_total = parm.detail.order_total
    let shop_title = parm.detail.shop_title
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.confirmReceiving(orderNo).then(res => {
      wx.hideLoading()
      pushNavigation('get_success_receipt', {
        title: '收货成功',
        orderNo: orderNo,
        type: 'received',
        img_url: img_url,
        order_total: order_total,
        shop_title: shop_title
      })
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
      })
    })
  },
  onHideButtonsClick: function (position) {
    var that = this;
    if (this.data.destHeight - position.detail.position.top * 2 < 120) {
      position.detail.position.top = position.detail.position.top - 120
      position.detail.position.showDirection = 'bottom'
    } else {
      position.detail.position.top = position.detail.position.top + 20
      position.detail.position.showDirection = 'top'
    }
    position.detail.position.hideButtons = this.data.list[position.detail.position.itemIndex].hide_buttons
    that.hideButtonsModel.showView(position.detail.position)
  },
  checkPhoneNum: function (parm) {
    let arrary = parm.detail.phone.split('****')
    let pheone = safe(arrary[0]) + this.data.code + safe(arrary[1])
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.verifyMobile(pheone).then(res => {
      wx.hideLoading()
      if(res == 1){
        this.applayReturnModal.closeView()
        if (parm.detail.type == 'order_apply_return_pay') {
          pushNavigation('get_application_return', {
            orderNo: parm.detail.orderNo,
            order_total: parm.detail.order_total
          })
        } else {
          pushNavigation('get_choose_return_type', {
            orderNo: parm.detail.orderNo,
            order_total: parm.detail.order_total
          })
        }
      }else{
        this.applayReturnModal.closeView()
        wx.showToast({
          title: '手机号验证失败',
          icon: 'none'
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
  clearInputText:function(){
    this.setData({
      keywords:'',
      showDeletIcon:false
    })
  },
  onOrderPayNotMpdelRightButtonClick: function (parm) {
    this.orderPayNot.closeView()
    pushNavigation('get_upload_rx_info', { orderID: parm.detail.orderNo })
  },
  onOrderPayNot: function (parms){
    let orderNo = parms.detail.orderNo
    let prompt_info = parms.detail.prompt_info
    this.orderPayNot.showView(prompt_info, orderNo)
  },
  onReceiveEvent(modelData, position, needRefreshPosition) {
    let newItemData = modelData[position];
    this.data.dataArray[needRefreshPosition] = newItemData;
    this.setData({
      dataArray: this.data.dataArray
    })
  }
})

var RequestOrderListDatas = function (that,pageindex, position, needRefreshPosition){
  orderApi.searchOrder(that.data.keywords, isNotEmpty(pageindex) ? pageindex : that.data.pageIndex).then(goods => {
    wx.hideLoading()
    if (isNotEmpty(goods)) {
      let modelData = orderListModel.getModelData(goods)
      if (isNotEmpty(pageindex)) {
        that.onReceiveEvent(modelData, position, needRefreshPosition);
        return
      }
      let type = 1;
      if (that.data.pageIndex == 1 && modelData.length == 0) {
        //展示空视图
        that.setData({
          showEmptyView: true
        })
        return
      }
      if (modelData.length === 0 || modelData.length < 20) {
        type = 2
      }
      if (that.data.pageIndex > 1) {
        modelData = that.data.dataArray.concat(modelData);
      }
      that.data.loadMore = true;
      that.data.canRequestMore = true;
      that.setData({
        dataArray: modelData,
        showEmptyView: false,
        showBottomLoading:true,
        loadType: type
      })
    }
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