import { OrderApi, SearchApi} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const searchApi = new SearchApi()

import {isNotEmpty,isEmpty} from '../../../../utils/YFWPublicFunction.js'
import { getItemModel } from '../../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
import {pushNavigation} from '../../../../apis/YFWRouting.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logo:'',
    medecineImage:'',
    trafficNum:'',
    web:'',
    trafficStatus:'',
    trafficList: [],
    trafficListIsOpen:false,
    recommendData:[],
    partOfListData:[],
    phone:'',
    orderNo:'',
    goodsImage:'',
    isInvoice: false,
    invoiceInfo: {}
  },
  from_type:'',//来源，refund==退货物流

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    let isInvoice = screenData.isInvoice || false
    this.from_type = screenData.from
    if (isInvoice) {
      this.data.orderNo = screenData.invoiceInfo.orderNo;
      this.data.isInvoice = isInvoice
      this.setData({ isInvoice: isInvoice, invoiceInfo: screenData.invoiceInfo })
    } else {
      this.data.orderNo = screenData.order_no;
      this.setData({
        medecineImage: screenData.medecine_image.replace('_300x300.jpg', '') + '_300x300.jpg'
      })
    }
    RequestTrafficData(this,false)
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
  trafficListChange:function(){
    this.setData({
      trafficListIsOpen : !this.data.trafficListIsOpen
    })
  },
  copyNum:function(){
    wx.setClipboardData({
      data: this.data.trafficNum,
      success:function(){
        wx.showToast({
          title: '复制成功',
          icon:'none'
        })
      }
    })
  },
  callSer:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.phone,
    })
  },
  jumpToQuere:function(){
    if (isEmpty(this.data.web)){
      return
    }
    pushNavigation('receive_h5', {'value':this.data.web})
  },
  refreshMessage:function(){
    RequestTrafficData(this, true)
  }
})

var RequestTrafficData = function (that,refresh){
  wx.showLoading({
    title: '加载中...',
  })
  orderApi.getLogisticsDetails(that.data.orderNo, refresh, that.data.isInvoice, that.data.invoiceInfo.trafficno,that.from_type == 'refund').then(res => {
    wx.hideLoading()
    HandlerTrafficList(that, res.data)
    that.setData({
      logo: res.logo,
      trafficNum: res.trafficno,
      web: res.web,
      trafficStatus: res.state_name,
      phone: res.phone
    })
  },error=>{
    wx.hideLoading()
    wx.showToast({
      title: error.msg,
      icon: 'none'
    })
  })
}


var HandlerTrafficList = function(that,list){
  if (isNotEmpty(list)&&list.length>0){
    that.setData({
      trafficList:list,
    })
    if(that.data.trafficList.length>3){
      let data = []
      that.data.trafficList.forEach((item, index) => {
        if(index<=2){
          data.push(item)
        }
      })
      that.setData({
        partOfListData:data
      })
    }
  }
}