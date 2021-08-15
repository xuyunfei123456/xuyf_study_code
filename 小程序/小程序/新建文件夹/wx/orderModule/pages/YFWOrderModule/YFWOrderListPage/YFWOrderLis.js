// pages/YFWOrderModule/orderList.js

var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
var mtabW = 150;
var log = require('../../../../utils/log')
import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
  YFWOrderListModel
} from './Model/YFWOrderListModel.js'
const orderListModel = new YFWOrderListModel()

import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
  isLogin,
  isNotEmpty,
  safe
} from '../../../../utils/YFWPublicFunction.js'

var event = require('../../../../utils/event.js')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    aitivityItem:{},
    sendFlag:true,
    receivetipFlag:true,
    confirmReceiveFlag: false,
    list: [],
    tabs: [{
      "name": "全部",
      "value": '',
      "id": "a",
      "datas": []
    }, {
      "name": "待付款",
      "value": 'unpaid',
      "id": "b",
      "datas": []
    }, {
      "name": "待发货",
      "value": 'unsent',
      "id": "c",
      "datas": []
    }, {
      "name": "待收货",
      "value": 'unreceived',
      "id": "d",
      "datas": []
    }, {
      "name": "待评价",
      "value": 'unevaluated',
      "id": "e",
      "datas": []
    }, {
      "name": "退货/款",
      "value": 'return_goods',
      "id": "f",
      "datas": []
    }],
    destHeight: 0,
    activeIndex: 0,//swiper被选中的position
    index: 0,
    pageIndex: 1,
    orderStatus: '',
    loadMore: true,
    canRequestMore: true,
    mScrollTop: 0,
    lastTimeScrollTop: 0,
    checkPhoneModalShow: false,
    orderListLength: 0,
    showEmptyView: false,
    loadType: 1,
    topNum: 0,
    loading: false,
    firstRequest:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    event.on('refresh', this, function (data) {
      RequestOrderData(this.data.orderStatus, this,1,'','','fromPrize')
    })
    this.needRefreshScreen = false
    this.refreshAll = false
    this.needRefreshPosition = -1;
    let that = this;
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    if(screenData.index == 0){
      this.bindChange({detail:{current:0}})
    }

    if (isNotEmpty(screenData.index)) {
      var tabindex = parseInt(screenData.index);
      if(parseInt(screenData.index)<0 || parseInt(screenData.index) > 5){
        log.error('跳转到订单页的index错误==='+JSON.stringify(screenData))
        tabindex = 0;
      }

      this.data.orderStatus = this.data.tabs[tabindex] && this.data.tabs[tabindex].value;
      this.setData({
        activeIndex: tabindex,
        orderStatus:this.data.orderStatus
      })
      //选择组件对象
    }
    this.applayReturnModal = this.selectComponent("#applyReturnOrderModal");
    this.orderReceivedModal = this.selectComponent('#orderReceived');
    this.hideButtonsModel = this.selectComponent('#hideButtons');
    this.orderPayNot = this.selectComponent('#orderPayNot');
    WxNotificationCenter.addNotification('refreshScreen', that.refreshScreen, that)
    WxNotificationCenter.addNotification('refreshScreenNow', that.refreshScreenNow, that);
    //第一次进来  若没有确认过收获 则展示 确认收货相关的图   确认过之后 不再展示   根据本地存储的 receiveFlag 判断 1表示第一次 2表示不是
    wx.getStorage({
      key: 'receiveFlag',
      success: function (res) {
        that.setData({
          confirmReceiveFlag: res.data == 1 ? true : false
        })
      },
      fail: function (res) {
        wx.setStorageSync('receiveFlag', 1)
      }
    })
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
    this.setData({
      loading: true
    })
    if (info == "refreshAll") {
      this.data.pageIndex = 1
      // this.data.list = []
      this.data.tabs[this.data.activeIndex].datas = []
      this.goTop()
      RequestOrderData(this.data.orderStatus, this)
    } else if (info.substr(0, 8) == "position") {
      let array = info.split(":")
      if (array.length > 1) {
        this.needRefreshPosition = array[1]
        let pageIndex, position;
        if (Number.isInteger(this.needRefreshPosition / 10)) {
          pageIndex = this.needRefreshPosition / 10 + 1;
          position = 0;
        } else {
          pageIndex = Math.ceil(this.needRefreshPosition / 10)
          position = this.needRefreshPosition % 10;
        }
        RequestOrderData(this.data.orderStatus, this, pageIndex, position, this.needRefreshPosition)
      }
    }
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
    if(isLogin()){
      RequestOrderData(this.data.orderStatus, this)
    }else{
      wx.showModal({
        content: "您未登录或登录已过期,请重新登录",
        cancelColor: "#1fdb9b",
        cancelText: "取消",
        confirmColor: "#1fdb9b",
        confirmText: "确定",
        success(res) {
          if (res.confirm) {
            pushNavigation('get_author_login')
          }
        }
      })
      return
    }
    this.pageLoading = !1;
    if (this.goBackFromPage == 'get_order_search') {
      this.goBackFromPage = ""
      this.refreshPage()
    }
    if (this.needRefreshScreen) {
      this.needRefreshScreen = false
      this.setData({
        loading: true
      })
      if (this.refreshAll) {
        this.refreshPage()
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
        RequestOrderData(this.data.orderStatus, this, pageIndex, position, this.needRefreshPosition)
      }
    }
  },

  refreshPage: function () {
    this.refreshAll = false
    this.data.pageIndex = 1
    // this.data.list = []
    this.data.tabs[this.data.activeIndex].datas = []
    this.goTop()
    RequestOrderData(this.data.orderStatus, this)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.needRefreshPosition = -1
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
  goTop: function (e) {
    this.setData({
      topNum: this.data.topNum = 0
    });
  },

  /**
   * table切换 滑动监听
   */
  bindChange: function (e) {
    //待付款有提示时 底部的提示显示不出  对height做动态处理 20200717 
    if(!this.data.oldHeight){
      let that = this;
      wx.getSystemInfo({
        success: function (res) {
          let clientHeight = res.windowHeight;
          let clientWidth = res.windowWidth;
          let ratio = 750 / clientWidth;
          let height = clientHeight * ratio;
          that.data.oldHeight = height
          that.setData({
            destHeight: e.detail.current == 1 ? height-350 :height-250,
            swiperHeight:height-250
          });
        }
      });
    }else{
      this.setData({
        destHeight: e.detail.current == 1 ? this.data.oldHeight-350 :this.data.oldHeight-250,
      })
    }
    if (e.detail.source == "touch") {
      var current = e.detail.current;
      console.log('tabs',current)
      var offsetW = current * mtabW;
      this.data.pageIndex = 1
      // this.data.list = []
      this.data.orderStatus = this.data.tabs[current].value
      this.setData({
        activeIndex: current,
        index: current,
        topView: this.data.tabs[current].id,
        showEmptyView: false,
        loadType: 1,
        loading: true,
      });
      console.log(this.data.topView + ' ' + offsetW)
      RequestOrderData(this.data.orderStatus, this)
    }
  },
  /**
   * 点击顶部切换table监听
   */
  tabClick: function (e) {
    console.log(e)
    var that = this;
    var index = 0;
    for (var i = 0; i < this.data.tabs.length; i++) {
      if (this.data.tabs[i].id === e.currentTarget.dataset.item.id) {
        index = i
        break
      }
    }
    var offsetW = e.currentTarget.offsetLeft;
    this.data.pageIndex = 1
    this.data.orderStatus = this.data.tabs[index].value
    // this.data.list = []
    this.setData({
      activeIndex: index,
      showEmptyView: false,
      loadType: 1,
      loading: true,
      orderStatus:that.data.orderStatus
    });
    RequestOrderData(this.data.orderStatus, this)
  },
  /**
   * 分页加载
   */
  requestNextPage: function (e) {
    if (!this.data.canRequestMore) {
      return
    }
    // if (Math.abs(this.data.mScrollTop - this.data.lastTimeScrollTop) < 200){
    //   return
    // }
    this.data.lastTimeScrollTop = this.data.mScrollTop;

    this.data.getNowScrollTop = true
    this.data.canRequestMore = false
    this.data.pageIndex++;
    this.data.loadMore = false;
    RequestOrderData(this.data.orderStatus, this)
  },
  onOrderListItemClick: function (e) {
    if (!this.pageLoading) {
      this.pageLoading = !0;
      pushNavigation('get_order_detail', {
        order_no: e.currentTarget.dataset.orderno
      })
    }
  },

  onScheduledButtonClick: function (e) {
    let orderNo = e.currentTarget.dataset.orderno;
    let position = e.currentTarget.dataset.position;
    let index = e.currentTarget.dataset.index;
    let isAgree = position == 0 ? 1 : 0
    WxNotificationCenter.postNotificationName('refreshScreenNow', "position:" + index)
    wx.hideLoading()
    wx.showLoading({
      title: '提交中...',
    })
    orderApi.getDelaySend(orderNo, isAgree).then(res => {
      WxNotificationCenter.postNotificationName('refreshScreenNow', "position:" + index)
      wx.hideLoading()
    }, error => {
      WxNotificationCenter.postNotificationName('refreshScreenNow', "position:" + index)
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
    })
  },


  /**
   * 滑动监听
   * deltax:相对上一次滚动的x轴上的偏移量
   * scrollHeight:scrollview的高度
   * scrollLeft:水平方向总的已经滚动的距离
   * scrollTop:垂直方向总的已经滚动的距离
   */
  onScrollListenner: function (event) {
    this.data.mScrollTop = event.detail.scrollTop;
  },
  /*
   * 子组件 回调到父组件的方
   */
  applyReturn: function (parm) {
    console.log('通信')
    // this.setData({
    //   checkPhoneModalShow:true
    // })
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
        type: parm.detail.type,
        inputSuccess: function (phoneCode) {
          //调用组件关闭方法
          // that.applayReturnModal.closeView();
          //设置数据
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
  //隐藏广告
  confirmReceive: function () {
    this.setData({
      confirmReceiveFlag: false
    })
  },
  //
  relativeclose:function(e){
    let _flag = e.currentTarget.dataset.flag;
    this.setData({
      [_flag]:false,
    })
  },
  //确认收货  按钮点击
  orderReceived: function (parm) {
    var that = this;
    that.orderReceivedModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", parm)
  },
  //确认收货 model点击确认按钮
  onBaseModalRightButtonClick: function (parm) {
    pushNavigation('confirmReceive', {...parm})

    // console.log('确认收货').

    // this.orderReceivedModal.closeView()
    // let orderNo = parm.detail.orderNo
    // let img_url = parm.detail.img_url
    // let order_total = parm.detail.order_total
    // let shop_title = parm.detail.shop_title
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
    //   })
    // }, error => {
    //   wx.hideLoading()
    //   wx.showToast({
    //     title: error.msg,
    //     icon: 'none'
    //   })
    // })
  },
  onHideButtonsClick: function (position) {
    var that = this;
    if (this.data.destHeight - position.detail.position.top * 2 < 120) {
      position.detail.position.top = position.detail.position.top - 170
      position.detail.position.showDirection = 'bottom'
    } else {
      position.detail.position.top = position.detail.position.top - 20;
      position.detail.position.showDirection = 'top'
    }
    // position.detail.position.hideButtons = this.data.list[position.detail.position.itemIndex].hide_buttons
    position.detail.position.hideButtons = this.data.tabs[this.data.activeIndex].datas[position.detail.position.itemIndex].hide_buttons
    that.hideButtonsModel.setDatas(this.data.tabs[this.data.activeIndex].datas[position.detail.position.itemIndex].orderBottomTipsData)
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
      if (res == 1) {
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
      } else {
        this.applayReturnModal.closeView()
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
  jumpToOrderSearchPage: function () {
    this.goBackFromPage = "get_order_search"
    pushNavigation('get_order_search')
  },
  jumpToShopDetail: function (e) {
    let shopId = e.currentTarget.dataset.shopid
    pushNavigation('get_shop_detail', {
      value: shopId
    })
  },
  onOrderPayNot: function (parms) {
    let orderNo = parms.detail.orderNo
    let prompt_info = parms.detail.prompt_info
    this.orderPayNot.showView(prompt_info, orderNo)
  },
  gotoPt:function(e){
    const {jump,share,title,content,image} = e.currentTarget.dataset;
    pushNavigation('receive_h5',{
      value:encodeURIComponent(jump),
      share:encodeURIComponent(share),
      name:title,
      needToken:1
    })
    

  },
  onOrderPayNotMpdelRightButtonClick: function (parm) {
    this.orderPayNot.closeView()
    pushNavigation('get_upload_rx_info', {
      orderID: parm.detail.orderNo
    })
  },
  onReceiveEvent(modelData, position, needRefreshPosition) {
    let newItemData = modelData[position];
    this.data.tabs[this.data.activeIndex].datas[needRefreshPosition] = newItemData;
    this.setData({
      tabs: this.data.tabs
    })
  }
})

var RequestOrderData = function (orderStatus, that, pageindex, position, needRefreshPosition,_flag) {
  that.data.firstRequest = false;
  orderApi.getOrderListData(orderStatus, isNotEmpty(pageindex) ? pageindex : that.data.pageIndex).then(goods => {
    wx.hideLoading()
    that.setData({
      loading: false
    })

    if (isNotEmpty(goods)) {
      if(isNotEmpty(goods.order_list_ads)&&isNotEmpty(goods.order_list_ads.items)){
        that.setData({
          aitivityItem:goods.order_list_ads.items
        })
      }
      let modelData = orderListModel.getModelData(goods)
      if (_flag == 'fromPrize') { //当从抽奖页面返回时  只刷新收货列表
       that.data.tabs[that.data.activeIndex].datas = modelData;
        that.setData({
          tabs:that.data.tabs
        })
        return
      }
      if (isNotEmpty(pageindex)) {
        that.onReceiveEvent(modelData, position, needRefreshPosition);
        return
      }
      if (that.data.pageIndex == 1 && modelData.length == 0) {
        //展示空视图
        that.setData({
          showEmptyView: true
        })
        return
      }
      if (modelData.length === 0 || modelData.length < 10) {
        that.setData({
          loadType: 2
        })
      }
      if (that.data.pageIndex > 1) {
        modelData = that.data.tabs[that.data.activeIndex].datas.concat(modelData);
      }
      if(that.data.tabs[that.data.activeIndex]){
        that.data.tabs[that.data.activeIndex].datas = modelData
      }else{
        log.error('我的订单的activeindex==='+that.data.activeIndex+'我的订单的tabs===='+JSON.stringify(that.data.tabs))
      }
      that.data.loadMore = true;
      that.data.canRequestMore = true;
      that.setData({
        tabs: that.data.tabs,
        showEmptyView: false,

      })
    }
  }, error => {
    wx.hideLoading()
    wx.showToast({
      title: error.msg,
      icon: 'none'
    })
  });

}