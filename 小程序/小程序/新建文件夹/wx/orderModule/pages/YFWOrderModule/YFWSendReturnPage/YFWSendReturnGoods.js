import {OrderApi} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {isNotEmpty,isEmpty} from '../../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo:'',
    returnType:'orderReturnSend',
    trafficName:'',
    trafficNum:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params&& typeof(options.params) == 'string' && JSON.parse(options.params) || {}
    let type = screenData.type
    this.data.orderNo = screenData.order_no
    this.setData({
      returnType:type
    })
    if (type == 'orderReturnSend'){
      wx.setNavigationBarTitle({
        title: '寄回商品',
      })
    }else{
      wx.setNavigationBarTitle({
        title: '变更退货信息',
      })
    }
    this.cimfirmModel = this.selectComponent("#cimfirmModel");
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

  onLogisticsNumberInput:function(e){
    this.data.trafficNum = e.detail.value
  },
  onLogisticsCompanyInput:function(e){
    this.data.trafficName = e.detail.value
  },
  post:function(){
    if(isEmpty(this.data.trafficName)){
      wx.showToast({
        title: '发货物流不能为空',
        icon:'none'
      })
      return
    }
    if(isEmpty(this.data.trafficNum)){
      wx.showToast({
        title: '寄回物流单号不能为空',
        icon:'none'
      })
      return
    }
    wx.showLoading({
      title: '提交中',
    })
    orderApi.submitRefundGoodsTrafficInfo(this.data.orderNo, this.data.trafficName,this.data.trafficNum).then(res=>{
      wx.hideLoading()
      this.cimfirmModel.showView(this.data.returnType == 'orderReturnSend' ? '录入成功，商家确认收货后将\n为您操作退款，请耐心等待。' :'更新成功，商家确认收货后将\n为您操作退款，请耐心等待')
    },error=>{
      wx.hideLoading()
    })
  },
  rightButtonClick:function(){
    wx.navigateBack()
  }
})