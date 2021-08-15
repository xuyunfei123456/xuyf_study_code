import { isNotEmpty, toDecimal, tcpImage } from '../../../../utils/YFWPublicFunction'
import { OrderApi, UploadImageApi } from '../../../../apis/index'
import { pushNavigation } from '../../../../apis/YFWRouting'
import { NUMBERS } from '../../../../utils/YFWRegular'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo:'', //订单号
    title:'',
    orderTotal:'0.00',
    inputMoney: '0,00',
    packagePrice:20.3,
    shippingPrice:10.1,
    returnType:1,
    ReturnTypeAfterSend: null,
    orderDetailData: [],
    tips: '',
    selectType: 1,
    commitable:true,
    noReceiveTips: ['一旦退款完成，积分/优惠券不返还',
      '由于商家原因而导致用户退款，请选择对应理由，平台查实后会对商家严厉处罚'],
    receiveTips: [
      '一旦退款完成，积分/优惠券不返还',
      '由于商家原因而导致用户不得不退款，请选择对应理由，平台查实后会对商家严厉处罚',
      '为了提高退款效率，请根据不同的凭证说明上传正确凭证'
    ],
    medicines: [],
    moneyReason: {
      index: 0,
      reasons: []
    },
    goodsReason: {
      index: 0,
      reasons: []
    },
    modalReasons: {
      index: 0,
      reasons: []
    },
    selectReason: { reason: '请选择', promptinfo: '' },
    certImages: [],
    reportImages: [],
    showReasonModal: false,
  },
  
  _typeChangeAction:function (event) {
    let type = event.currentTarget.dataset.type
    const { selectType } = this.data
    if (selectType != type) {
      const { goodsReason } = this.data
      const { moneyReason } = this.data
      const modalReasons = type==1 ? moneyReason : goodsReason.reasons[goodsReason.index]
      this.setData({
        selectType: type,
        modalReasons: modalReasons,
        selectReason: modalReasons.reasons[modalReasons.index]
      })
    }
  },

  /** 点击商品弹窗 */
  handleMedicineClick: function (event) {
    let { medicines } = this.data
    let { item } = event.currentTarget.dataset
    let { index } = event.currentTarget.dataset
    item.active = !item.active
    medicines[index] = item
    this.setData({ medicines: medicines })
  },

  /** 减商品数量 */
  handleSubMedicineQuantity: function (event) {
    let { medicines } = this.data
    let { item } = event.currentTarget.dataset
    let { index } = event.currentTarget.dataset
    item.amount = item.amount<=1 ? 1 : item.amount-1
    medicines[index] = item
    this.setData({ medicines: medicines })
  },

  /** 加商品数量 */
  handleAddMedicineQuantity: function (event) {
    let { medicines } = this.data
    let { item } = event.currentTarget.dataset
    let { index } = event.currentTarget.dataset
    item.amount++
    if (item.amount>item.quantity) {
      item.amount = item.quantity
      wx.showToast({ title: '超过上限', icon: 'none'})
      return
    }
    medicines[index] = item
    this.setData({ medicines: medicines })
  },

  /** 点击穿透 */
  handleCatchTap: function (event) {
    return true
  },

  /** 输入商品数量 */
  handleInputMedicineQuantity: function (event) {
    let { medicines } = this.data
    let { item } = event.currentTarget.dataset
    let { index } = event.currentTarget.dataset
    let value = event.detail.value
    value = value.replace(NUMBERS, '')
    item.amount = value
    if (Number.parseInt(value) > item.quantity) {
      wx.showToast({ title: '超过上限', icon: 'none'})
      item.amount = item.quantity
    }
    medicines[index] = item
    this.setData({ medicines: medicines })
  },

  /** 输入商品数量 */
  handleInputMedicineQuantityEnd: function (event) {
    console.log(event)
    let { medicines } = this.data
    let { item } = event.currentTarget.dataset
    let { index } = event.currentTarget.dataset
    let value = Number.parseInt(event.detail.value)
    item.amount = isNaN(value) ? 1 : ((value>item.quantity) ? item.quantity : value)
    medicines[index] = item
    this.setData({ medicines: medicines })
  },

  /** 打开弹窗 */
  handleShowReasonModal: function (event) {
    this.setData({ showReasonModal: true })
    this.animate('#reason-modal', [{opacity: '0'}, {opacity: '1'}], 300)
    this.animate('#reason-modal-content', [{bottom: '-1000rpx'}, {bottom: '0'}], 300)
  },

  /** 关闭弹窗 */
  handleCloseReasonModal: function (event) {
    const that = this
    this.animate('#reason-modal', [{opacity: '1'}, {opacity: '0'}], 300)
    this.animate('#reason-modal-content', [{bottom: '0'}, {bottom: '-1000rpx'}], 300, function () {
      that.setData({ showReasonModal: false })
    }.bind(this))
  },

  /** 选择退货原因类型 */
  handleReasonTypeClick: function (event) {
    const dataset = event.currentTarget.dataset
    const { item } = dataset
    const { index } = dataset
    let { goodsReason } = this.data
    if (goodsReason.index != index) {
      goodsReason.index = index
      this.setData({
        modalReasons: item,
        goodsReason: goodsReason
      })
    }
  },

  /** 选择退款原因 */
  handleReasonItemClick: function (event) {
    const dataset = event.currentTarget.dataset
    const { item } = dataset
    const { index } = dataset
    let { selectType } = this.data
    let { goodsReason } = this.data
    let { modalReasons } = this.data
    let { moneyReason } = this.data
    if (modalReasons.index != index) {
      modalReasons.index = index
      if (selectType==1) {
        moneyReason = modalReasons
      } else {
        goodsReason.reasons[goodsReason.index] = modalReasons
      }
      this.setData({
        goodsReason: goodsReason,
        modalReasons: modalReasons,
        moneyReason: moneyReason
      })
    }
    
  },

  /** 提交退款原因 */
  handleConfirmReason: function (event) {
    const { modalReasons } = this.data
    this.setData({ selectReason: modalReasons.reasons[modalReasons.index] })
    this.handleCloseReasonModal()
  },

  /** 输入金额 */
  handleMoneyInput: function (event) {
    let value = event.detail.value
    value = value.replace(NUMBERS, '')
    this.setData({ inputMoney: value })
  },

  /** 输入金额 */
  handleMoneyInputEnd: function (event) {
    let maxMoney = Number.parseFloat(this.data.orderTotal)
    let value = event.detail.value
    value = Number.parseFloat(value)
    value = isNaN(value) ? maxMoney : (value>maxMoney ? maxMoney : value)
    this.setData({ inputMoney: toDecimal(value) })
  },

  /** 上传凭证 */
  handleUploadCertImage: function (event) {
    const that = this
    const { type } = event.currentTarget.dataset
    wx.chooseImage({
      count: 1,
      success: function (res) {
        const path = res.tempFilePaths[0]
        let images = type=='cert' ? that.data.certImages : that.data.reportImages
        wx.showLoading({ title: '上传中...', })
        uploadImageApi.upload(path).then(res => {
          wx.hideLoading()
          if (isNotEmpty(res)) {
            images.push({
              localPath: path,
              fileId: res
            })
            if (type=='cert') {
              
              that.setData({ certImages: images })
            } else {

              that.setData({ reportImages: images })
            }
          }
        }, error => {
          wx.hideLoading()
          wx.showToast({ title: error.msg, icon: 'none', duration: 2000})
        })
      }
    })
  },

  /** 查看凭证 */
  handleLookBigImage: function (event) {
    const { type } = event.currentTarget.dataset
    const { item } = event.currentTarget.dataset
    let urls = []
    const images = type=='cert' ? this.data.certImages : this.data.reportImages
    urls = images.map(item => {
      return item.localPath
    })

    wx.previewImage({
      urls: urls,
      current: item.localPath
    })
  },

  /** 删除凭证 */
  handleDeleteImage: function (event) {
    const { type } = event.currentTarget.dataset
    const { index } = event.currentTarget.dataset
    let images = type=='cert' ? this.data.certImages : this.data.reportImages
    images.splice(index, 1)
    if (type=='cert') {
      
      this.setData({ certImages: images })
    } else {
      
      this.setData({ reportImages: images })
    }
  },

  /** 提交退款信息 */
  handleConfirmReturnApply: function (event) {
    const { selectType } = this.data
    const { orderNo } = this.data
    const { selectReason } = this.data
    if (selectType == 1) {

      wx.showLoading({ title: '提交中...', })
      orderApi.applyForRefund(orderNo, selectReason.reason).then(res => {
        wx.hideLoading()
        this.dealCommitResponse(res)
      }, error => {
        wx.hideLoading()
        wx.showToast({ title: error.msg, icon: 'none' })
      })
    } else {
      let { certImages } = this.data
      let { reportImages } = this.data
      const { medicines } = this.data
      if (selectReason.is_upload_img && certImages.length==0) {
        wx.showToast({ title: '请上传凭证', icon: 'none' })
        return
      }

      if (selectReason.is_show_upload_img_report && reportImages.length==0) {
        wx.showToast({ title: '请上传检验报告', icon: 'none' })
        return
      }      

      certImages = certImages.map(item => {
        return item.fileId
      })
      reportImages = reportImages.map(item => {
        return item.fileId
      })
      let info = new Map()
      let haveMedicine = false
      medicines.forEach(item => {
        if (item.active) {
          haveMedicine = true
          info.set(item.order_medicineno, item.quantity)
        }
      })

      const { returnType } = this.data
      if (!haveMedicine && returnType==2) {
        wx.showToast({ title: '请至少选择一件商品', icon: 'none' })
        return
      }

      wx.showLoading({ title: '提交中...', })
      const { inputMoney } = this.data
      orderApi.applyForRefundGoods(orderNo, selectReason.reason, info, certImages, reportImages, inputMoney).then(res => {
        wx.hideLoading()
        this.dealCommitResponse(res)
      }, error => {
        wx.hideLoading()
        wx.showToast({ title: error.msg, icon: 'none' })
      })
    }
  },

  /** 解析提交返回数据 */
  dealCommitResponse: function (res) {
    const isSuccess = Boolean(res)
    if (isSuccess) {
      pushNavigation('get_check_order_status', { title: '申请退货/款', tips: '您的申请已经提交，请等待商家确认'}, 'redirect')
    } else {
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  /** 请求退货款数据 */
  fetchReturnGoods: function (event) {
    orderApi.getGoodsInfoAndDesc(this.data.orderNo).then(res => {
      if (isNotEmpty(res)) {
        let medicines = res.medicineList || []
        medicines = medicines.map(item => {
          item.price = toDecimal(item.price)
          item.image = tcpImage(item.image)
          item.active = true
          item.amount = item.quantity
          return item
        })
        const { noReceiveTips } = this.data
        const { receiveTips } = this.data
        this.setData({ 
          medicines: medicines,
          noReceiveTips: res.wshDescList || noReceiveTips,
          receiveTips: res.yshDescList || receiveTips
        })
      }
    }, error => {
      wx.showToast({ title: error.msg, icon: 'none'})
    })
  },

  /** 请求申请退款原因 */
  fetchReturnReason: function (event) {
    orderApi.getReturnReason(this.data.orderNo).then(res => {
      if (isNotEmpty(res)) {
        let { moneyReason } = this.data
        let { selectType } = this.data
        let { selectReason } = this.data
        let { modalReasons } = this.data
        moneyReason.index = 0
        moneyReason.reasons = res
        selectReason = selectType==2 ? selectReason : res[0]
        modalReasons = selectType==2 ? modalReasons : moneyReason
        this.data.selectReason = selectReason
        this.setData({ moneyReason: moneyReason, selectReason: selectReason, modalReasons: modalReasons })
      }
    }, error => {
      wx.showToast({ title: error.msg, icon: 'none'})
    })
  },

  /** 请求申请退货原因 */
  fetchReturnGoodsReason: function (event) {
    orderApi.getReturnGoodsReason(this.data.orderNo).then(res => {
      if (isNotEmpty(res)) {
        const keys = Object.keys(res.type)
        let reasons = []
        reasons = keys.map(item => {
          return {
            key: item,
            name: res.type[item],
            reasons: res.reasons[item],
            index: 0,
          }
        })
        let { goodsReason } = this.data
        let { selectReason } = this.data
        let { selectType } = this.data
        let { modalReasons } = this.data
        goodsReason.index = 0
        goodsReason.reasons = reasons
        selectReason = selectType==2 ? reasons[0].reasons[0] : selectReason
        modalReasons = selectType==2 ? reasons[0] : modalReasons
        this.data.selectReason = selectReason
        this.setData({ goodsReason: goodsReason, selectReason: selectReason, modalReasons: modalReasons })
      }
    }, error => {
      wx.showToast({ title: error.msg, icon: 'none'})
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params
    if (params && typeof(params) == 'string') {
      params = JSON.parse(params)
      this.data.orderNo = params.orderNo
      this.data.selectType = params.type
      this.setData({ 
        returnType: params.type, 
        selectType: params.type, 
        inputMoney: toDecimal(params.orderTotal),
        orderTotal: toDecimal(params.orderTotal) ,
        ReturnTypeAfterSend: params.ReturnTypeAfterSend
      })

      this.fetchReturnGoods()
      this.fetchReturnReason()
      this.fetchReturnGoodsReason()
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