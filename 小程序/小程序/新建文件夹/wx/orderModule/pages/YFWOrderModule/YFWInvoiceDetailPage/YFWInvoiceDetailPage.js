const { pushNavigation } = require("../../../../apis/YFWRouting")
const { safe } = require("../../../../utils/YFWPublicFunction")

// pages/YFWOrderModule/YFWInvoiceDetailPage/YFWInvoiceDetailPage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: '待开票',
    invoiceEtax: false,
    invoiceType: '增值税纸质普通发票',
    invoiceName: '',
    invoiceCode: '',
    invoiceInfo: {},
    showLogistics: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    
    this.setData({ 
      invoiceInfo: params,
      invoiceName: params.invoice_applicant,
      invoiceCode: params.invoice_code,
      status: params.dict_bool_status==1?(params.dict_bool_invoice_sent==1?'已开票（随货寄出）':'已开票'):'待开票',
      invoiceEtax: params.dict_bool_etax==1,
      invoiceType: params.dict_bool_etax==1 ? '增值税电子普通发票' : '增值税纸质普通发票',
      showLogistics: safe(params.traffic_name).length>0
    })
  },

  handleLookInvoice: function (event) {
    pushNavigation('get_invoice_page', this.data.invoiceInfo)
  },

  handleLookLogistics: function event(params) {
   pushNavigation('get_logistics_detail', {
      isInvoice: true,
      invoiceInfo: this.data.invoiceInfo
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