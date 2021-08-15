import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
  OrderApi,
  UploadImageApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()

import {
  isNotEmpty,
  isEmpty,
  strMapToObj,
  toDecimal
} from '../../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    returnType: '',
    orderNo: '',
    goodsList: [],
    reasonType: [],
    checkedReasonTypePosition: 0,
    reasonList: [],
    reasonListLength: 0,
    checkedReasonPosition: 0,
    needRenderVoucher: false,
    needRenderReport: false,
    order_total: '',
    package_shipping_total: '',
    voucherImageArray: [],
    reportImageArray: [],
    promptinfo: '',
    prompt_info_report: '',
    voucherImgSucMap: '',
    reportImgSucMap: '',
    otherMoney: '',
    pageFrom:'orderDetail'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.orderNo = screenData.orderNo;
    let package_total = isNotEmpty(screenData.packaging_total) ? parseFloat(screenData.packaging_total) : 0
    let shipping_total = isNotEmpty(screenData.shipping_total) ? parseFloat(screenData.shipping_total) : 0
    let package_shipping_total = package_total + shipping_total
    this.setData({
      returnType: screenData.type,
      order_total: screenData.order_total,
      package_shipping_total: toDecimal(package_shipping_total)
    })
    this.data.voucherImgSucMap = new Map()
    this.data.reportImgSucMap = new Map()
    HandlerReturnGoodsInfo(this, this.data.orderNo)
    HandlerReturnGoodsReasonType(this, this.data.orderNo)

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

  showBigPic:function(e){
    let src = e.currentTarget.dataset.item
    wx.previewImage({
      current: src,
      urls: e.currentTarget.dataset.type == "voucher" ? this.data.voucherImageArray : this.data.reportImageArray
    })
  },

  postApplyReturnInfo: function() {
    if (isEmpty(this.data.otherMoney)) {
      wx.showToast({
        title: '请填写退款金额',
        icon: 'none'
      })
      return
    }
    if (parseFloat(this.data.otherMoney) > parseFloat(this.data.order_total)) {
      wx.showToast({
        title: '金额不能超过可退款金额',
        icon: 'none'
      })
      return
    }

    if (this.data.needRenderVoucher && this.data.voucherImageArray.length==0){
      wx.showToast({
        title: '请上传凭证图片',
        icon: 'none'
      })
      return
    }

    if (this.data.needRenderReport && this.data.reportImageArray.length == 0){
      wx.showToast({
        title: '请上检验报告',
        icon: 'none'
      })
      return
    }

    if (this.data.returnType == "returnGoods" && !this.checkGoods()){
      wx.showToast({
        title: '请选择要退的商品',
        icon: 'none'
      })
      return
    }
    this.requstTorefundGoods()
  },
  getOrderInfo: function() {
    let info = new Map();
    for (let i = 0; i < this.data.goodsList.length; i++) {
      if (this.data.goodsList[i].checked){
        let order_medicineno = this.data.goodsList[i].order_medicineno;
        let quantity = this.data.goodsList[i].quantity;
        info.set(order_medicineno, quantity);
      }
    }
    return info
  },
  checkGoods:function(){
    let goodsCkecked = false
    for (let i = 0; i < this.data.goodsList.length; i++) {
      if (this.data.goodsList[i].checked) {
       goodsCkecked = true
      }
    }
    return goodsCkecked
  },
  requstTorefundGoods: function() {
    this.repotVoucherTime = 0
    this.repotRepeatTime = 0
    let reportSucArray = this.letLocalMapToArray(this.data.reportImgSucMap,'value');
    let voucherSucArray = this.letLocalMapToArray(this.data.voucherImgSucMap,'value')
    if (reportSucArray.length == this.data.reportImageArray.length && voucherSucArray.length == this.data.voucherImageArray.length) {
      let postVoucherArray = []
      if (voucherSucArray.length > 0 ) {
        postVoucherArray = voucherSucArray
      }
      let postReportArray = []
      if (reportSucArray.length > 0 && this.data.needRenderReport) {
        postReportArray = reportSucArray
      }
      let orderInfo = ''
      if (this.data.returnType == "returnGoods") {
        orderInfo = this.getOrderInfo()
      }
      if(isNotEmpty(orderInfo)){
        orderInfo = strMapToObj(orderInfo)
      }
      wx.showLoading({
        title: '提交中...',
      })
      orderApi.applyForRefundGoods(this.data.orderNo, this.data.reasonList[this.data.checkedReasonPosition].reason, orderInfo, postVoucherArray, postReportArray, this.data.otherMoney).then(res => {
        wx.hideLoading()
        let params = {
          title: '申请退货/款',
          tips: '您的申请已经提交，请等待商家确认',
          orderNo: this.data.orderNo,
          pageFrom: this.data.pageFrom
        }
        params = JSON.stringify(params)
        wx.redirectTo({
          url: "/orderModule/pages/YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage?params=" + params,
        })
      },error=>{
        wx.hideLoading()
        wx.showToast({
          title: error.msg,
          icon:'none'
        })
      })
    } else {
      this.postVoucher()
    }
  },
  postRepot:function(){
    if (this.repotRepeatTime >= 3) {
      wx.showToast({
        title: '上传失败，请稍后重试',
        icon: 'none'
      })
    } else {
      let uploadSuccessArray = this.letLocalMapToArray(this.data.reportImgSucMap, 'key')
      let uploadFailureArray = this.data.reportImageArray.concat(uploadSuccessArray).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
      });
      if (uploadFailureArray.length == 0) {
        this.requstTorefundGoods()
      }
      uploadFailureArray.forEach((item, index) => {
        uploadImageApi.upload(item).then(res => {
          this.data.reportImgSucMap.set(item, res)
          if (index == uploadFailureArray.length - 1) {
            this.repotRepeatTime++;
            this.postRepot()
          }
        }, error => {
          if (index == uploadFailureArray.length - 1) {
            this.repotRepeatTime++;
            this.postPic()
          }
        })
      })
    }
  },
  postVoucher:function(){
    if (this.repotVoucherTime >= 3) {
      wx.showToast({
        title: '上传失败，请稍后重试',
        icon: 'none'
      })
    } else {
      let uploadSuccessArray = this.letLocalMapToArray(this.data.voucherImgSucMap, 'key')
      let uploadFailureArray = this.data.voucherImageArray.concat(uploadSuccessArray).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
      });
      if (uploadFailureArray.length == 0) {
        if (this.data.needRenderReport) {
          this.postRepot()
        }else{
          this.requstTorefundGoods()
        }
      }
      uploadFailureArray.forEach((item, index) => {
        uploadImageApi.upload(item).then(res => {
          this.data.reportImgSucMap.set(item, res)
          if (index == uploadFailureArray.length - 1) {
            this.repotVoucherTime++;
            this.postVoucher()
          }
        }, error => {
          if (index == uploadFailureArray.length - 1) {
            this.repotVoucherTime++;
            this.postVoucher()
          }
        })
      })
    }
  },
  letLocalMapToArray: function(map, type) {
    let localArray = []
    map.forEach(function(value, key, map) {
      if (type == 'key') {
        localArray.push(key)
      } else if (type == 'value') {
        localArray.push(value)
      }
    });
    return localArray
  },
  onInputChange: function(e) {
    let input = e.detail.value;
    let inputMoney = input.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
    this.setData({
      otherMoney: inputMoney
    })
  },

  deleteReportPic: function(e) {
    let index = e.currentTarget.dataset.index;
    if (isNotEmpty(this.data.reportImgSucMap.get(this.data.reportImageArray[index]))) {
      this.data.reportImgSucMap.delete(this.data.reportImageArray[index])
    }
    this.data.reportImageArray.splice(index, 1)
    this.setData({
      reportImageArray: this.data.reportImageArray
    })
  },
  postReportImage: function() {
    let that = this
    ChooseImage(this, 'report')
  },
  deleteVoucherPic: function(e) {
    let index = e.currentTarget.dataset.index;
    if (isNotEmpty(this.data.voucherImgSucMap.get(this.data.voucherImageArray[index]))) {
      this.data.voucherImgSucMap.delete(this.data.voucherImageArray[index])
    }
    this.data.voucherImageArray.splice(index, 1)
    this.setData({
      voucherImageArray: this.data.voucherImageArray
    })
  },
  postVoucherImage: function() {
    let that = this
    ChooseImage(this, 'Voucher')
  },
  changeReasonType: function(parm) {
    this.setData({
      checkedReasonTypePosition: parm.currentTarget.dataset.index,
      checkedReasonPosition: 0,
      needRenderVoucher: this.data.reasonList[0].is_upload_img,
      needRenderReport: this.data.reasonList[0].is_show_upload_img_report
    })
    let reasonType = this.data.reasonType[parm.currentTarget.dataset.index]
    HandlerReturnGoodsReason(this, this.data.orderNo, reasonType)
  },
  chooseReturnReason: function(parm) {
    this.setData({
      checkedReasonPosition: parm.currentTarget.dataset.index,
      needRenderVoucher: this.data.reasonList[parm.currentTarget.dataset.index].is_upload_img,
      needRenderReport: this.data.reasonList[parm.currentTarget.dataset.index].is_show_upload_img_report,
      promptinfo: this.data.reasonList[parm.currentTarget.dataset.index].promptinfo,
      prompt_info_report: this.data.reasonList[parm.currentTarget.dataset.index].prompt_info_report
    })
  },
  chooseReturnGoods: function(e) {
    let position = e.currentTarget.dataset.index
    this.data.goodsList[position].checked = !this.data.goodsList[position].checked
    this.setData({
      goodsList: this.data.goodsList
    })
  },
  onIputTextChange: function(e) {
    let position = e.currentTarget.dataset.index
    let text = e.detail.value
    if (parseInt(text) <= 0) {
      text = 1
    } else if (parseInt(text) > parseInt(this.data.goodsList[position].quantity)) {
      text = this.data.goodsList[position].quantity
    } else if (isEmpty(text)) {
      text = 1
    }
    this.data.goodsList[position].defaultReturnQty = text
    this.setData({
      goodsList: this.data.goodsList
    })
  },
  subtract: function(e) {
    let position = e.currentTarget.dataset.index
    if (parseInt(this.data.goodsList[position].defaultReturnQty) <= 1) {
      return
    }
    this.data.goodsList[position].defaultReturnQty = parseInt(this.data.goodsList[position].defaultReturnQty) - 1;
    this.setData({
      goodsList: this.data.goodsList
    })
  },
  add: function(e) {
    let position = e.currentTarget.dataset.index
    if (parseInt(this.data.goodsList[position].defaultReturnQty) >= parseInt(this.data.goodsList[position].quantity)) {
      return
    }
    this.data.goodsList[position].defaultReturnQty = parseInt(this.data.goodsList[position].defaultReturnQty) + 1;
    this.setData({
      goodsList: this.data.goodsList
    })
  }
})

var HandlerReturnGoodsInfo = function(that, orderNo) {
  orderApi.getRefundGoodsInfo(orderNo).then(res => {
    res.forEach((item, index) => {
      let showEditeBox = false
      if (parseInt(item.quantity) > 1) {
        showEditeBox = true
      }
      item.checked = true
      item.showEditeBox = showEditeBox
      item.defaultReturnQty = item.quantity,
        item.price =toDecimal(item.price)
    })
    that.setData({
      goodsList: res
    })
  })
}

var HandlerReturnGoodsReasonType = function(that, orderNo) {
  orderApi.getRefundGoodsReasonType(orderNo).then(res => {
    let data = [];
    if (isNotEmpty(res)) {
      data.push(res.a)
      data.push(res.b)
      data.push(res.d)
      that.setData({
        reasonType: data
      })
      HandlerReturnGoodsReason(that, orderNo, data[0])
    }
  })
}

var HandlerReturnGoodsReason = function(that, orderNo, reason) {
  orderApi.getRefundGoodsReason(orderNo, reason).then(res => {
    that.setData({
      reasonList: res,
      reasonListLength: res.length,
      needRenderVoucher: res[0].is_upload_img,
      needRenderReport: res[0].is_show_upload_img_report,
      promptinfo: res[0].promptinfo,
      prompt_info_report: res[0].prompt_info_report
    })
  })
}

var ChooseImage = function(that, froms) {
  wx.chooseImage({
    count: froms == 'Voucher' ? 3 - that.data.voucherImageArray.length : 3 - that.data.reportImageArray.length,
    sizeType: ['400', '400'],
    success: function(res) {
      res.tempFiles.forEach((item,index)=>{
        uploadImageApi.upload(item.path).then(path => {
          if (froms == 'Voucher') {
            that.data.voucherImgSucMap.set(item.path, path)
          } else {
            that.data.reportImgSucMap.set(item.path, path)
          }
        })
      })
      if (froms == 'Voucher') {
        res.tempFiles.forEach((item,index)=>{
          that.data.voucherImageArray.push(item.path)
        })
        that.setData({
          voucherImageArray: that.data.voucherImageArray
        })
      } else {
        res.tempFiles.forEach((item, index) => {
          that.data.reportImageArray.push(item.path)
        })
        that.setData({
          reportImageArray: that.data.reportImageArray
        })
      }
    },
  })
}