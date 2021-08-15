import { OrderApi } from '../../../../apis/index'
import { isNotEmpty, safe } from '../../../../utils/YFWPublicFunction'
const orderApi = new OrderApi()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo: '',
    prescImages: [],
    patientInfo: [],
    prescInfo: []
  },

  handleLookPrescImage: function (event) {
    const { prescImages } = this.data  
    const { item } = event.currentTarget.dataset
    wx.previewImage({
      urls: prescImages,
      current: item
    })
  },

  /** 获取处方信息 */
  fetchPrescData: function (event) {
    const { orderNo } = this.data
    orderApi.getPrescriptionDetail(orderNo).then(res => {
      if (isNotEmpty(res)) {
        this.dealPrescImages(res)
        this.dealPatientInfo(res)
        this.dealPrescInfo(res)
      }
    }, error => {
      wx.showToast({ title: error.msg, icon: 'none', duration: 2000 })
    })
  },

  /** 解析处方图片 */
  dealPrescImages: function (res) {
    let images = res.image_url || []
    this.setData({ prescImages: images })
  },

  /** 解析用药人信息 */
  dealPatientInfo: function (res) {
    let patientInfo = []
    patientInfo.push({ title: '姓名', content: safe(res.medicate_name), icon: '' })
    patientInfo.push({ title: '身份证号码', content: safe(res.medicate_idcardno), icon: '' })
    patientInfo.push({ title: '性别', content: safe(res.medicine_sex).toString()=='1' ? '男' : '女', icon: '' })
    patientInfo.push({ title: '年龄', content: safe(res.medicate_age), icon: '' })
    const weight = isNaN(Number.parseInt(safe(res.medicate_weight))) ? 0 : Number.parseInt(safe(res.medicate_weight))
    if (weight>0) {
      patientInfo.push({ title: '体重', content: weight+'kg', icon: '' })
    }
    this.setData({ patientInfo: patientInfo })
  },

  /** 解析处方信息 */
  dealPrescInfo: function (res) {
    if (safe(res.audit_real_name).length>0) {
      let prescInfo = []
      prescInfo.push({ title: '审方药师', content: safe(res.audit_real_name), icon: '/images/prescription_doctor_aptitude.png' })
      prescInfo.push({ title: '审方记录', content: safe(res.audit_time), icon: '' })
      prescInfo.push({ title: '审方结果', content: safe(res.audit_content), icon: '' })
      this.setData({ prescInfo: prescInfo })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.orderNo = safe(params.orderNo)
    if (this.data.orderNo.length>0) {
      this.fetchPrescData()
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