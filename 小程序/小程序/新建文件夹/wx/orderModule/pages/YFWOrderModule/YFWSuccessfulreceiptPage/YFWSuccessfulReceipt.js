// pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt.js
import {
  SearchApi,
  OrderPaymentApi,
  OrderApi
} from '../../../../apis/index.js'
const searchApi = new SearchApi()
const orderPaymentApi = new OrderPaymentApi()
const orderApi = new OrderApi()
import {
  getItemModel
} from '../../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
import {
  isNotEmpty,
  safeObj
} from '../../../../utils/YFWPublicFunction.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import { config} from '../../../../config.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    orderNo: '',
    recommendData: [],
    buttonArray: [{
      text: '订单详情',
      type: 'get_order_detail'
    }, {
      text: '回到首页',
      type: 'get_main_page'
    }],
    adsImage: "",
    topText: '',
    bottomText: '',
    adBadge: {},
    prompt: '',
    type: '',
    invite_win_cash_url_share:'',
    content:'',
    title_share:'',
    img_url:'',
    shop_title:'',
    order_total:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let screenData = options.params&& typeof(options.params) == 'string' && JSON.parse(decodeURIComponent(options.params)) || {}
    this.data.orderNo = screenData.orderNo
    this.data.type = screenData.type
    this.data.img_url = screenData.img_url
    this.data.shop_title = screenData.shop_title
    this.data.order_total = screenData.order_total
    this.setData({
      title: screenData.title,
      type: screenData.type
    })
    RequestOrderInfo(this, this.data.orderNo, this.data.type)
    searchApi.getAssociationGoods().then(res => {
      let recommendData = [];
      recommendData = res.map((info) => {
        return getItemModel(info, 'cart_list_recommend')
      })
      this.setData({
        recommendData: recommendData
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let params = {
      value: this.data.invite_win_cash_url_share
    };
    let urls = params.value.split('?')
    params.value = urls[0]
    if (urls[1] && urls[1].includes('=')) {
      params.extraValue = { key: urls[1].split('=')[0], value: urls[1].split('=')[2] }
    }
    return {
      title: this.data.title_share,
      path: '/components/YFWWebView/YFWWebView?params=' + JSON.stringify(params),
      imageUrl: config.share_image_url
    }
  },
  onButtonClick: function(parms) {
    let item = parms.currentTarget.dataset.item;
    if (item.type === 'get_order_detail' || item.type === 'get_order') {
      pushNavigation('get_order_detail', {
        order_no: item.value
      })
    } else if (item.type === 'get_comment_detail') {
      pushNavigation('get_order_evaluation', {
        'order_no': item.value,
        'shop_title': this.data.shop_title,
        'img_url': this.data.img_url,
        'order_total': this.data.order_total
      },'redirect')
    } else if (item.type === 'get_main_page') {
      pushNavigation('get_home')
    }
  },
  onLargeBtClick: function() {
    if (isNotEmpty(this.data.adBadge)) {
      pushNavigation(this.data.adBadge.type, {
        value: this.data.adBadge.value
      })
    }
  }
})
var RequestOrderInfo = function(that, orderNo, type) {
  wx.showLoading({
    title: '加载中...',
  })
  if (type == 'paySuccess') {
    orderPaymentApi.getPayInfo(orderNo).then(res => {
      wx.hideLoading()
      HandlerButtons(that, res, orderNo)
      HandlerLargeBtn(that, res)
    },error=>{
      wx.hideLoading()
    })
  } else{
    orderApi.getOrderStatus(orderNo, type).then(res => {
      wx.hideLoading()
      HandlerButtons(that, res, orderNo)
      HandlerLargeBtn(that, res)
    },error=>{
      wx.hideLoading()
    })
  }
}

var HandlerButtons = function(that, res, orderNo) {
  let buttonObj = {
    text: '查看订单',
    type: 'get_order_detail',
    value: safeObj(orderNo)
  };
  let btArray = (isNotEmpty(res.items['0'].buttons) && res.items['0'].buttons.length > 0) ? res.items['0'].buttons : [buttonObj]
  if (btArray.length <= 1) {
    let button = {
      text: '回到首页',
      type: 'get_main_page'
    }
    btArray.push(button)
  }
  that.setData({
    buttonArray: btArray,
    prompt: res.prompt,
    payInfo: res.items[0],
    invite_win_cash_url_share: res.invite_win_cash_url_share,
    content: res.content_share,
    title_share: res.title_share
  })
}

var HandlerLargeBtn = function(that, res) {
  let text1 = '抽奖送好礼，积分领不停';
  let text2 = '邀请好友注册，最多赚500元/人';
  let adBadge = res.ad_app_payment[0];
  let img_url = adBadge.img_url.replace('https', 'http')
  let ad_name = adBadge.name ? adBadge.name : text1
  that.setData({
    adsImage: img_url,
    topText: ad_name,
    bottomText: text2,
    adBadge: adBadge
  })
}