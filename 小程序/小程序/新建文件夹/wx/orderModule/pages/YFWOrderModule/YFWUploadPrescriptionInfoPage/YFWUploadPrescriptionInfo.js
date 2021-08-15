// pages/YFWOrderModule/YFWUploadPrescriptionInfoPage/YFWUploadPrescriptionInfo.js
import { OrderApi, UploadImageApi} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()
var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataInfo:{},
    imagePath:null,
    position:-1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let orderID =options.params&& typeof(options.params) == 'string' && JSON.parse(options.params).orderID || {}
    this.data.position = options.params&& typeof(options.params) == 'string' && JSON.parse(options.params).position || {}
    orderApi.getUploadRXInfo(orderID).then((result)=>{
      console.log(result)
      this.setData({
        dataInfo:result
      })
    }).then((error)=>{

    })


  },
  uploadImageAction:function () {
    console.log('up')
    var that = this
    wx.chooseImage({
      count:1,
      success: function(res) {
        let path = res.tempFilePaths[0]
        that.setData({
          imagePath:path
        })
      },
    })
  },

  delectImageAction: function () {
    console.log('dele')
    this.setData({
      imagePath:null
    })
  },
  commitAction:function () {
    if(!this.data.imagePath){
      wx.showToast({
        title: '请上传处方图片!',
        icon:'none',
      })
      return
    }
    wx.showLoading({
      title: '加载中...',
    })
    uploadImageApi.upload(this.data.imagePath).then((path)=>{
      this.uploadInfo(path)
    }).then((error)=>{
      wx.hideLoading()
    })

  },

  uploadInfo: function(imageUrl) {
    orderApi.uploadRXInfo(this.data.dataInfo.orderno,imageUrl).then((result)=>{
      wx.hideLoading()
      if(result){
        if(this.data.position != -1){
          WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
        }
        wx.navigateBack({})
      }
    }).catch((error)=>{
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.msg?error.msg:'操作失败',
          icon:'none',
        })
      }
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
})