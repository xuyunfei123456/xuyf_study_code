// pages/healthy/searchPage/searchPage.js
var util = require('../../../utils/util.js')
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  HealthAskApi
} from '../../../apis/index.js'
const myhealAsk = new HealthAskApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    srcEarch: '../../../images/search.png',
    sehotCont: [],
    bindSource: [],
    searchList: [],
    hideScroll: true,
    hideScrollTwo: true,
    homeHidden:false,
    pageIndex: 1,
    inputValue: '',
    loadhidden: false,
    hidden: false
  },
  // 熱搜
  onHotcont(e) {
    //  let model = e.currentTarget.dataset.item //选中大科室
    let cell = e.currentTarget.dataset.item //选中小科室
    let pageFrom = 'searchPage'
    let params = {
      // model: model,
      selectModel: cell,
      pageFrom: pageFrom
    }
    // pushNavigation('get_ASK_all_category', 'department_id')
    pushNavigation('get_ASK_all_category', params)
  },
  onSearch: function() {
   if(this.data.pageIndex==1){
     wx.showLoading({
       title: '加载中...'
     })
   }
    myhealAsk.getSearchAsk(this.data.inputValue, this.data.pageIndex).then(res => {
      wx.hideLoading()
      console.log(res, '搜索结果')
      if (res.dataList.length != 0 || this.data.searchList.length != 0) {
        this.setData({
          searchList: this.data.searchList.concat(res.dataList),
          hideScrollTwo: false,
          hideScroll: true,
          homeHidden: true
        })
        if (res.dataList.length < 18) {

          this.setData({
            loadhidden: false,
            hidden: true,
            
          })
        } else {
          this.setData({
            loadhidden: false,
            hidden: false
          })
        }
      } else if (this.data.searchList.length != 0) {
        this.setData({
          searchList: [],
          hideScrollTwo: true,
          hideScroll: true
        })
      }
    })
  },
  //input输入框
  bindinput: function(e) {
    this.data.searchList = []
    let prefix = e.detail.value
    myhealAsk.getSearchAsk(prefix, this.data.pageIndex).then(res => {
      console.log(res, 'input输入框')
      if (res.dataList.length != 0) {
        this.setData({
          bindSource: res.dataList,
          inputValue: prefix,
          hideScrollTwo: true,
          hideScroll: false,
          homeHidden:true
        })
      } else {
        this.setData({
          bindSource: [],
          hideScrollTwo: true,
          hideScroll: true
        })
      }
    })

  },
  // 问题
  replyQuey: function(e) {
    this.goTo(e)
  },
  //用户点击搜索内容
  itemtap: function(e) {

    this.setData({
      // bindSource: [],
      // hideScroll: true
    })
    this.goTo(e)
  },
  //跳转路由
  goTo: function(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      value: dell.id
    }
    pushNavigation('get_ask_detail', params)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
    })
    myhealAsk.getAnsDetal().then(res => {
      wx.hideLoading()
      console.log(res, 'hbhbhb')
      this.setData({
        sehotCont: res.hot_department_items
      })
    })
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
    if (this.data.hidden){
      return 
    }

  

    if (this.data.hideScroll){
      this.setData({
        loadhidden: true
      })
      this.data.pageIndex++;
      this.onSearch()
    }
  },

})