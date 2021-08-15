// pages/YFWAskModule/YFWHealthAskPharmacistHomePage/YFWHealthAskPharmacistHome.js
var util = require('../../../utils/util.js')
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  tcpImage
} from '../../../utils/YFWPublicFunction.js'
import {
  HealthAskApi
} from '../../../apis/index.js'
const myhealAsk = new HealthAskApi()
var app = getApp()
var log = require('../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctorDel: '',
    docID: '',
    docImg: '',
    pageIndex: 1,
    ansList: [],
    loadhidden: false,
    hidden: false,
    allCount: ''
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params =  {}
    try {
      params = options.params && typeof (options.params) == 'string' && JSON.parse(options.params);
    } catch (error) {
      log.info('问答2'+options.params+'catchinfo===='+error)
    }
    let doctor = params.doctor
    this.data.doctorDel = doctor
    this.setData({
      doctorDel: doctor
    })
    console.log(this.data.doctorDel, 'doctorDel')
    this.askData()
    this.ansList()
  },
  // 请求药师信息接口
  askData: function () {
    wx.showLoading({
      title: '加载中...'
    })
    myhealAsk.getPharmacistInfo(this.data.doctorDel.pharmacist_id + '').then(res => {
      wx.hideLoading()
      console.log(res, '药师')
      this.setData({
        docID: res,
        docImg: tcpImage(res.intro_image)
      })
    })
  },
  pullOnLoading: function () {
    this.data.pageIndex++
    this.ansList()
  },
  // 问答列表
  ansList: function () {
    let pageindex = this.data.pageIndex < 1 ? 1 : this.data.pageIndex
    myhealAsk.getPharmacistAnswerList(this.data.doctorDel.pharmacist_id + '', pageindex).then(res => {
      console.log(res, '药师回答')
      this.setData({
        ansList: this.data.pageIndex == 1 ? res.dataList : this.data.ansList.concat(res.dataList),
        allCount: res.rowCount
      })
      if (res.dataList.length < 20) {
        this.setData({
          loadhidden: false,
          hidden: true
        })
      } else {
        this.setData({
          loadhidden: false,
          hidden: false
        })
      }
    }).then(err => {
      if (err != undefined) {
        this.data.pageIndex--;
      } else {

      }
    })
  },
  //跳转到医生所在药店
  onHospital: function (e) {
    let hops = e.currentTarget.dataset.item
    console.log(hops, 'hops')
    let params = {
      value: hops.storeid
    }
    pushNavigation('get_shop_detail', params)
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
    if (this.data.hidden) {
      return
    }
    this.setData({
      loadhidden: true
    })

    this.pullOnLoading()


  },
})