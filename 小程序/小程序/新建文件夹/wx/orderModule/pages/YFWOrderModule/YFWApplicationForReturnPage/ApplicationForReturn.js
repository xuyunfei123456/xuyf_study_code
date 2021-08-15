import {OrderApi} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import { isNotEmpty, toDecimal, safeObj} from '../../../../utils/YFWPublicFunction.js'
var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reasonList:[],
    checkedIndex:0,
    returnMoney:0,
    orderNo:"",
    pageFrom:'',
    goodsDataArray:[],
    descArray:[],
    reason:'',
    isShowReturnModal:false,
    opacityAnimation: {},
    translateAnimation: {},
    medicineList: [],
    packmedicine_list: [],
    havePackage: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.orderNo = screenData.orderNo
    this.data.pageFrom = screenData.pageFrom
    this.setData({
      medicineList: screenData.medicineList,
      packmedicine_list: screenData.packmedicine_list,
      havePackage: screenData.havePackage,
      
    })
    wx.showLoading({
      title: '加载中...',
    })
    orderApi.getReturnReason(screenData.orderNo).then(res=>{
      wx.hideLoading()
      this.setData({
        reasonList:res,
        returnMoney: '￥' + toDecimal(res[0].total_price)
      })
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
      })
    })

    this._requestReturnGoodsDetail(screenData.orderNo) 
  },
  _requestReturnGoodsDetail: function (orderNo) {
    orderApi.getGoodsInfoAndDesc(orderNo).then(res => {
      wx.hideLoading()
      this.setData({
        descArray: safeObj(res.descList),
        goodsDataArray: safeObj(res.medicineList)
      })
    }, error => {
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
      })
    })
  },
  showReasonAlert: function () {
    if (!this.data.isShowReturnModal) {
      let that = this
      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

      that.setData({
        isShowReturnModal: true,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(1).step()
        translateAni.translateY(0).step()
        that.setData({
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
        })
      }.bind(this), 0)
    }
  },
  hideReturnModal: function () {
    if (this.data.isShowReturnModal) {
      let that = this
      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      that.setData({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(0).step()
        translateAni.translateY(0).step()
        that.setData({
          translateAnimation: translateAni.export(),
          opacityAnimation: opacityAni.export(),
          isShowReturnModal: false
        })
      }.bind(this), 300)
    }
  },
  onComfire: function () {
    this.hideReturnModal()
    this.setData({
      reason: this.data.reasonList[this.data.checkedIndex].reason,
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

  chooseReason:function(e){
    this.setData({
      checkedIndex: e.currentTarget.dataset.index,
      returnMoney: toDecimal(this.data.reasonList[e.currentTarget.dataset.index].total_price)
    })
  },
  post:function(){
    wx.showLoading({
      title: '提交中....',
    })
    let _reason = (this.data.reasonList.length != 0 && this.data.reasonList[this.data.checkedIndex] && this.data.reasonList[this.data.checkedIndex].reason) || "";
    if(!_reason){
      wx.showToast({
        title: '若退款原因为空 ,请稍后重试',
        icon:'none'
      })
      return;
    }
    orderApi.applyForRefund(this.data.orderNo, _reason).then(res=>{
      WxNotificationCenter.postNotificationName('refreshScreen',"refreshAll")
      wx.hideLoading()
      let params = {
        title:'申请退款',
        tips:'您的申请已经提交，请等待商家确认',
        orderNo:this.data.orderNo,
        pageFrom: this.data.pageFrom
      }
      params =  JSON.stringify(params)
      wx.redirectTo({
        url: "/orderModule/pages/YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage?params=" + params,
      })
    },error=>{
      wx.hideLoading()
      if (isNotEmpty(error.msg)){
        wx.showToast({
          title: error.msg,
          icon:'none'
        })
      }
    })
  }
})