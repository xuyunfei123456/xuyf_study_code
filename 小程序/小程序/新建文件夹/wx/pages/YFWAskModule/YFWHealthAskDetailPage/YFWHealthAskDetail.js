// pages/YFWAskModule/progrmDel/progrmDel.js
var util = require('../../../utils/util.js')
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  HealthAskApi
} from '../../../apis/index.js'
import { tcpImage, safe, toDecimal } from '../../../utils/YFWPublicFunction.js'
import {
  getItemModel
} from './../../../components/GoodsItemView/model/YFWGoodsItemModel.js'
const healthAskApi = new HealthAskApi()
const myhealAsk = new HealthAskApi()
import { YFWHealthAskDetailModel } from './Model/YFWHealthAskDetailModel.js'
var app = getApp();
var log = require('../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    delQ: '',
    qutions: '',
    showDocotr: '',
    delarr: [],
    relateProduct:[],
    introImg:[],
    headP:[],
    docImg:'',
    isImgshow:false,
    dataInfo:{},
    askReplayId:undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  btnMyask: function() {
    pushNavigation('get_submit_ASK')
  },
  onLoad: function(options) {
    let params =  {}
    try {
      params = options.params && typeof (options.params) == 'string' && JSON.parse(options.params);
      this.infDel(params.value||'')
    } catch (error) {
      log.info('问答1'+options.params+'catchinfo===='+error)
    }
  },
  // 问题详情接口调用
  infDel: function (myID) {
    wx.showLoading({
      title: '加载中',
    })
    healthAskApi.getAskDetail(myID).then(res => {
      wx.hideLoading()
      console.log(res, 'res.infDel')
      if (res.intro_image==''){
    this.setData({
      isImgshow : false
    })
      }
      else {
        this.setData({
          isImgshow: true
        })
      }
      let isDelarr = []
      let isHeadP=[]
      res.reply_accepted_items.map((item) => {
        item.status = 'yi'
        isDelarr.push(item)
        isHeadP.push(tcpImage(item.intro_image))
      })
      res.reply_unaccepted_items.map((item) => {
        item.status = 'un'
        isDelarr.push(item)
        isHeadP.push(tcpImage(item.intro_image))
      })
      this.setData({
        dataInfo: YFWHealthAskDetailModel.getModelArray(res),
        qutions: res,
        docImg: res.intro_image,
        // delarr: isDelarr,
        // headP: isHeadP
      })
      console.log(this.data.dataInfo, 'delarr')
    })
    // 关联产品接口
    healthAskApi.getRecommendGoods(myID).then(res => {
      
      console.log(res, '关联产品接口')
      let myProduct = []
      myProduct = res.map((info) => {
        return getItemModel(info, 'health_medicine_list')
      })
      this.setData({
        relateProduct: myProduct,
      })
    })
  },
//跳转到医师主页
  getDoctor:function(e){
    let doctor = e.currentTarget.dataset.item
    let params={
      doctor: doctor
    }
    pushNavigation('get_ask_pharmacist',params)
  },
  //相关问题
  onReply: function(e) {
    // let myItem = e.currentTarget.dataset.item
    // this.infDel(myItem.id)
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  },
//查看图片
  imgUrl:function(){
    wx:wx.previewImage({
      urls: [this.data.docImg]
    })
  },
  //跳转到医生所在药店
  onHospital:function(e){
    let hops=e.currentTarget.dataset.item
    console.log(hops,'hops')
    let params={
      value: hops.shop_id
    }
    pushNavigation('get_shop_detail', params)
  },
  //跳转到买药页面
  goBuy:function(e){
    let drugs=e.currentTarget.dataset.item
    let params = {
      value: drugs.id
    }
    console.log(drugs,'买药页面')
    pushNavigation('get_shop_goods_detail', params)
  },
  openUtilityMenu: function () {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent('#onSkip').showModal(bottom)
    })

  },
  //跳转到搜索页
  goSearch: function () {
    pushNavigation('get_ASK_Search')
  },
  clickGoodsItemMethod: function (e) {
    let id = e.currentTarget.dataset.id
    pushNavigation('get_shop_goods_detail', {value:id})
  },
  clickAskAppendButtonMethod: function (e) {
    
    let myID = e.currentTarget.dataset.id
   
    if (e.currentTarget.dataset.item.type == 'submit_ask_questions_append') {
      //追问
      var that = this;
      let query = wx.createSelectorQuery()
      query.select('#AppendButton-view').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(function (res) {
        let bottom = res[0].bottom * that.data.ratio;
        that.selectComponent('#AppendButton').showModal(bottom)
      })
      that.data.askReplayId = myID
      that.setData({
        askReplayId: that.data.askReplayId
      })
    } else if (e.currentTarget.dataset.item.type.type == 'submit_ask_questions_adopt') {
      //采纳
      let myID = e.currentTarget.dataset.id
      healthAskApi.acceptReplay(myID).then(res => {
        wx.showToast({
          title: '采纳成功',
          icon: 'success'
        })
        this.infDel(myID)
      })

    }
   

  },
  formSubmit: function(e) {
    let text = e.detail.text
    healthAskApi.insertReplay(this.data.askReplayId, text).then(res => {
       
      this.infDel(this.data.askReplayId)
    })
   
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

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
})