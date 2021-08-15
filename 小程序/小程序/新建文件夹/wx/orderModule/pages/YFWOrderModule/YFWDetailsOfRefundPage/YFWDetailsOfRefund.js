import {
  OrderApi
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
  isNotEmpty,
  toDecimal,
  safeArray,
  tcpImage
} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation} from '../../../../apis/YFWRouting.js'
import { EMOJIS } from '../../../../utils/YFWRegular.js';
var WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo: "",
    button_list: [],
    status_name: '',
    return_reason: '',
    return_name: '',
    return_mobile: '',
    return_phone: '',
    return_address: '',
    return_reply: '',
    return_money: '',
    order_returnno: '',
    status_id: '',
    voucher_images: [],
    report_images: [],
    goodsList: [],
    order_total:'',
    need_return_status:'',
    selectLogistics:{},//物流公司
    logistic_no:'',//物流单号
  },

  send_type: '',//退货快递填写入口，orderReturnSend == 发出退货 orderReturnSendUpdate == 更新单号

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.applayReturnModal = this.selectComponent("#cancelReturn");
    this.cimfirmModel = this.selectComponent("#cimfirmModel");
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.orderNo = screenData.order_no;
    this.data.order_total = screenData.order_total
    RequstReturnInfo(this)
    RequestReturnGoodsDetailData(this)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.onSend = this.selectComponent('#onSend')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    RequstReturnInfo(this)
    RequestReturnGoodsDetailData(this)
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

  showBigPIC:function(e){
    let src = e.currentTarget.dataset.item
    wx.previewImage({
      current: src,
      urls: e.currentTarget.dataset.type == "voucher" ? this.data.voucher_images : this.data.report_images
    })
  },
  showLogisticAction: function () {
    pushNavigation('get_logistics_company',{
      order_no: this.data.orderNo,
      type:'orderReturnSend',
      selectData:this.data.selectLogistics,
    })
  },
  /** 物流单号 */
  handleLogisticCodeInput: function (event) {
    let value = event.detail.value
    value = value.replace(EMOJIS, '')
    this.setData({ logistic_no: value })
  },
  handleSendConfirm: function() {
    if (!this.data.selectLogistics || !this.data.selectLogistics.name) {
      wx.showToast({
        title: '发货物流不能为空',
        icon:'none'
      })
    } else if (!this.data.logistic_no || this.data.logistic_no.length == 0) {
      wx.showToast({
        title: '寄回物流单号不能为空',
        icon:'none'
      })
    } else {
      this.onSend.hideModal()
      wx.showLoading({
        title: '提交中',
      })
      orderApi.submitRefundGoodsTrafficInfo(this.data.orderNo, this.data.selectLogistics.name,this.data.logistic_no).then(res=>{
        wx.hideLoading()
        this.cimfirmModel.showView(this.send_type == 'orderReturnSend' ? '录入成功，商家确认收货后将\n为您操作退款，请耐心等待。' :'更新成功，商家确认收货后将\n为您操作退款，请耐心等待')
      },error=>{
        wx.hideLoading()
      })
    }
  },
  rightButtonClick:function(){
    RequstReturnInfo(this)
  },
  onButtonClick: function(e) {
    let type = e.currentTarget.dataset.type
    switch (type) {
      case 'updateReturnGoods': //更改退货/款
        pushNavigation('get_choose_return_type', {
          orderNo: this.data.orderNo,
          order_total: this.data.order_total,
          status:'returnType'})
        break
      case 'orderReturnSend': //发出退货
        this.send_type = 'orderReturnSend'
        this.onSend.showModal()
        break
      case 'orderReturnSendUpdate': //修改单号
        this.send_type = 'orderReturnSendUpdate'
        this.onSend.showModal()
        break
      case 'cancelReturnGoods': // 取消退货/款
        this.applayReturnModal.showView("取消退货/款后，将无法再次发起")
        break
    }
  },
  onBaseModalRightButtonClick:function(){
    orderApi.cancelRefundGoods(this.data.orderNo).then(res=>{
      WxNotificationCenter.postNotificationName('refreshScreen', "refreshAll")
      this.applayReturnModal.closeView()
      wx.navigateBack()
    })
  },
  showLogicAction:function(e) {
    pushNavigation('get_logistics_detail', {
      'order_no': this.data.orderNo,
      'medecine_image': this.data.goodsList[0].image,
      'from':'refund',
    })
  },
  showNegotiationAction:function(e) {
    pushNavigation('get_return_negotiation',{order_no:this.data.orderNo})
  }
})

var RequstReturnInfo = function(that) {
  orderApi.getRefundInfo(that.data.orderNo).then(res => {
    if (isNotEmpty(res)) {
      let info = res
      let logicInfo = null
      if (info.status_id == 22) {
          logicInfo = {}
          logicInfo.address = '地址:'+info.return_address
          logicInfo.phone = '收货人电话：'
          if((info.return_mobile)) {
              logicInfo.phone += info.return_mobile
          }
          if ((info.return_phone)) {
              logicInfo.phone += " , " + info.return_phone
          }
          logicInfo.name = '收货人：'+info.return_name
      }
      let trafficInfo = null
      if (info.status_id == 23) {
          trafficInfo = {}
          trafficInfo.info = '退货物流：' + info.return_traffic_name +'（'+ info.return_trafficno + '）'
          if (info.traffic_state_name&&info.traffic_state_name.length > 0) {
              trafficInfo.status = '状态：' + info.traffic_state_name
          } else {
              trafficInfo.status = ''
          }
      }
      let return_reply = ''
      if (info.status_id == 28 || info.status_id == 26) {
        return_reply = res.return_reply.replace(/[\r\n]/g)
      }
      let process = null
      if (info.status_id == 25) {
        process=[
          {msg:'商家同意退款',timeStr:res.status_time},
          {msg:'退款中',timeStr:''},
          {msg:'退款成功',timeStr:''},]
      }
      
      that.setData({
        button_list: safeArray(res.button_list),
        status_name: res.status_name,
        return_reason: res.return_reason,
        return_name: res.return_name,
        return_mobile: res.return_mobile,
        return_phone: res.return_phone,
        return_address: res.return_address,
        return_reply: return_reply,
        return_money: toDecimal(res.return_money),
        order_returnno: res.order_returnno,
        status_id: res.status_id,
        voucher_images: HandlerImageArray(res.voucher_images),
        report_images: HandlerImageArray(res.report_images),
        need_return_status: res.need_return_status,
        status_time:res.status_time,
        status_desc:res.status_desc,
        status_id:res.status_id,
        description:res.description,
        apply_time:res.apply_time,
        logicInfo:logicInfo,
        trafficInfo:trafficInfo,
        process:process,
      })
    }
  }, error => {

  })
}
var HandlerImageArray = function(parms){
  let array = []
  parms.forEach((path,index)=>{
    array.push('https://c1.yaofangwang.net'+path)
  })
  return array
}

var RequestReturnGoodsDetailData = function(that) {
  orderApi.getReturnGoodsInfo(that.data.orderNo).then(res => {
    if (isNotEmpty(res)) {
      res.forEach((item, index) => {
        if (isNotEmpty(item.short_title)) {
          item.medicine_name = item.name + '(' + item.standard + ')' + '-' + item.short_title
        } else {
          item.medicine_name = item.name + '(' + item.standard + ')'
        }
        item.image = tcpImage(item.image)
        item.price = toDecimal(item.price)
      })
    }
    if (isNotEmpty(res)) {
      that.setData({
        goodsList: res
      })
    }
  }, error => {

  })
}