const { isNotEmpty } = require("../../../../utils/YFWPublicFunction")

// pages/YFWOrderModule/YFWInvoiceDetailPage/YFWInvoicePage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invoiceInfo: {},
    invoiceImage: ''
  },

  handleLookInovicImage: function (event) {
    const { invoiceImage } = this.data
    if (invoiceImage.length>0) {
      wx.previewImage({
        urls: [invoiceImage],
        current: invoiceImage
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    let images = isNotEmpty(params.invoice_image) ? params.invoice_image.split('|') : []
    this.setData({
      invoiceInfo: params,
      invoiceImage: images.length>0 ? images[0] : ''
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})