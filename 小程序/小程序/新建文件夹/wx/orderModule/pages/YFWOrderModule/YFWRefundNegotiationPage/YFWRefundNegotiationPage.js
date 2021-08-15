import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
  isNotEmpty,
  toDecimal,
  safeArray,
  tcpImage,
  convertImg
} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation} from '../../../../apis/YFWRouting.js'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo: "",
    destHeight:0,
    dataArray:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let screenData = options.params&& typeof(options.params) == 'string' && JSON.parse(options.params) || {}
    this.data.orderNo = screenData.order_no;
    RequstReturnInfo(this)
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        that.setData({
          destHeight: height
        });
      }
    });
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

  showImageAction:function(e){
    let images = e.currentTarget.dataset.images
    if (!images) {
      return
    }
    wx.previewImage({
      current: images[0],
      urls:images,
    })
  },
  
  
})

var RequstReturnInfo = function(that) {
  orderApi.getNegotiatedDetail(that.data.orderNo).then(res => {
    if (isNotEmpty(res)) {
      let dataArray = []
      res.map((item)=>{
          let hasVoucheImage = false
          let hasReportImage = false
          let detailInfo = {}
          if (item.status_id == 21) {
              hasVoucheImage = item.voucher_images&&item.voucher_images.length>0
              hasReportImage = item.report_images&&item.report_images.length>0
              detailInfo = {
                  type:item.return_type,
                  reason:item.description,
                  price:item.return_money
              }
          }
          let voucher_images = hasVoucheImage?item.voucher_images.split('|'):[]
          let report_images = hasReportImage?item.report_images.split('|'):[]
          voucher_images = voucher_images.map((url)=>{
              return convertImg(url)
          })
          report_images = report_images.map((url)=>{
              return convertImg(url)
          })
          dataArray.push(
              {   title:item.status_name,
                  timeString:item.create_time,
                  detail:detailInfo,
                  hasVoucheImage:hasVoucheImage,
                  voucher_images:voucher_images,
                  hasReportImage:hasReportImage,
                  report_images:report_images,
              }
          )
      })
      
      that.setData({
        dataArray:dataArray,
      })
    }
  }, error => {

  })
}