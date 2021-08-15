import { OrderApi, SafeApi} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const safeApi = new SafeApi()
import { tcpImage, removeEmoji ,isEmpty} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation} from '../../../../apis/YFWRouting.js'
var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
      orderno:'',
      shop_title:'',
      img_url:'',
      order_total:'',
      inputText:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    let image = tcpImage(screenData.img_url)
    this.setData({
      orderno: screenData.order_no,
      shop_title: screenData.shop_title,
      img_url: image,
      order_total: screenData.order_total
    })
    this.serviceStar = this.selectComponent("#service");
    this.sendStar = this.selectComponent('#send');
    this.logistStar = this.selectComponent('#logist');
    this.packageStar = this.selectComponent('#package');
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

  onTextChange: function (eventhandle){
    let text = eventhandle.detail.value.replace(removeEmoji, '') 
    this.setData({
      inputText: text
    })
  },
  postEvaluation:function(){
    if (isEmpty(this.data.inputText)){
      wx.showToast({
        title: '评价的内容不能为空',
        icon:'none'
      })
      return
    }
    safeApi.getMsgSecCheck(this.data.inputText).then(res => {
      console.log(res)
      if(!res){
        wx.showToast({
          title: '评价合理的内容',
          icon: 'none'
        })
        return;
      }

    })
    let servieceStar = this.serviceStar.getStarScores()
    let sendStar = this.sendStar.getStarScores()
    let logistStar = this.logistStar.getStarScores()
    let packageStar = this.packageStar.getStarScores()
    wx.showLoading({
      title: '提交中...',
    })
    orderApi.evaluateOfOrder(this.data.orderno, this.data.inputText,servieceStar, sendStar, logistStar, packageStar).then(res=>{
      WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
      wx.hideLoading()
      let params = {
        title: '评价成功',
        orderNo: this.data.orderno,
        type: 'evaluate',
      }
      params =  JSON.stringify(params)
      wx.redirectTo({
        url: "/orderModule/pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt?params=" + params,
      })
    },error=>{
      wx.hideLoading()
      wx.showToast({
        title: error.msg,
        icon:'none'
      })
    })
  }
})