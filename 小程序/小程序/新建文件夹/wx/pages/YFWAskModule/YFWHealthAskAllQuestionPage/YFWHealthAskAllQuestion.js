// pages/YFWAskModule/allHotQ/allHotQ.js
var util = require('../../../utils/util.js')

import {
  HealthAskApi
} from '../../../apis/index.js'
const healthAskApi = new HealthAskApi()
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex:1,
    pageSize:10,
    replyQuey: [],
    hotCont: [],
    hotContTwo:[],
    departmentNamePy:'',
    showView: false,
    loadhidden:false,
    hidden:false
  },
expandAll:function(){

},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    showView: (options.showView == "true" ? true : false)

    //科室分类
    healthAskApi.getClassdpart(this.data.departmentNamePy).then(res => {
      console.log(res,'pppppp')
    that.setData({
      hotCont: res.items.slice(0, 8),
      hotContTwo: res.items.slice(8)
    })
    })
    //问答列表
    this.onReachBottom()

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
  onChangeShowState: function () {
    var that = this;
    that.setData({
      showView: (!that.data.showView)
    })
  },
  // 问题
  replyQuey:function(e){
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  },
  itemClick:function(event){
    let model = event.currentTarget.dataset.item;
    let pageFrom = "allOfPage"
    let params={
      model: model,
      pageFrom: pageFrom
    }
    pushNavigation('get_ASK_all_category', params)
  },

  ask:function(){
        //问答列表

    healthAskApi.getListofask(this.data.pageIndex, this.data.pageSize, '').then(res => {
      // setTimeout(function () {
      //   wx.hideLoading()
      // }, 500)
      console.log(res, 'qqqqq')

      this.setData({
        replyQuey: this.data.replyQuey.concat(res.dataList)
      })
      if(res.dataList.length<10){
        this.setData({
          loadhidden: false,
          hidden: true
        })
      }else {
        this.setData({
          loadhidden: false,
          hidden: false
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
    // wx.showLoading({
    //   title: '加载中...',
    //   icon:'loading'
    // })
    if (this.data.hidden) {
      return
    }
    this.setData({
      loadhidden: true
    })
    this.data.pageIndex++;
this.ask()

   

  },
  
})