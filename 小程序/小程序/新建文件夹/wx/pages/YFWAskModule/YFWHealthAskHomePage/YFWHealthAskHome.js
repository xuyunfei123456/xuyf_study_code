// pages/healthy/heaIndex/heaIndex.js
var util = require('../../../utils/util.js')
import { pushNavigation } from '../../../apis/YFWRouting.js'
import { tcpImage } from '../../../utils/YFWPublicFunction.js'
import {
  HealthAskApi
} from '../../../apis/index.js'
const myhealAsk = new HealthAskApi()
import {YFWHealthAskIndexModel} from './Model/YFWHealthAskIndexModel.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    srcEarch: '../../../images/yfwsk/search.png',
    arRight: '../../../images/yfwsk/arrRight.png',
    docLecture: '',
    hotCont: [],
    queNum: '',
    replyQuey: [],
    hotQuey:[],
    dataArray:[],
    selectIndex:0,
    dataSource: [{
      id: 0,
      name: "最新",
      data: []
    },
    {
      id: 1,
      name: "热门",
      data: []
    },
    {
      id: 2,
      name: "科室",
      data: []
    }
    ],
    datainfo: {}
  },

  toDetail(e){
    // let model = e.currentTarget.dataset.item //选中大科室
    let cell = e.currentTarget.dataset.cell //选中小科室
    let pageFrom = "healthHome"
    let params = {
      // model: model,
      selectModel: cell,
      pageFrom: pageFrom
    }
    pushNavigation('get_ASK_all_category',params)
  },
  //跳转到搜索页
  goSearch:function(){
    pushNavigation('get_ASK_Search')
  },
   //问答所有科室页面
  alDpart(){
    pushNavigation('get_ASK_all_department')
  },
   //提问页面
  btnMyask(){
    pushNavigation('get_submit_ASK')
  },
  //我的问答
  btnMyQA(){
    pushNavigation('get_submit_ASK')
  },
  //问答所有问答
  newQTel(){
    pushNavigation('get_ASK_all_question')
  },
  //问题详情页面
  replyQuey(e){
    let dell = e.currentTarget.dataset.item
    let params={
      dell: dell
    }
    pushNavigation('get_ask_detail',params)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that=this
    // that.countdown()
    wx.showLoading({
      title: '加载中',
    })
    myhealAsk.getAnsDetal().then(res=>{
      wx.hideLoading()
      console.log(res,'aaaa')
      let datainfo = YFWHealthAskIndexModel.getModelArray(res)
      let dataSource = this.data.dataSource 
      dataSource[0].data = datainfo.new_ask_items
      dataSource[1].data = datainfo.popular_ask_items
      dataSource[2].data = []
      that.setData({
        // hotCont: res.hot_department_items.slice(0,6),
        // queNum: res.ask_account,
        // docLecture: res.ad_detail,
        // replyQuey: res.latest_items,
        // hotQuey: res.hot_items,
        dataSource: dataSource,
        datainfo: datainfo
      })
      console.log(res.ad_detail.image,'res.ad_detail.image')
    })
    myhealAsk.getAlloffice().then(res => {
      wx.hideLoading()
      console.log(res, 'alloffice')
      that.setData({
        dataArray: res
      })
    })
  },
  
  toH5: function (e){
    let docLecture = e.currentTarget.dataset.info
    console.log(e,'docLecture')
    pushNavigation(docLecture.type,docLecture)
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
  changeQuestionIndex: function (event) {
    var index = event.currentTarget.dataset.index
    if (index != this.data.selectIndex) {
      this.setData({
        selectIndex: index
      })
    }
  },
  swiperChangIndex: function (event) {
    if (event.detail.source == "touch") {
      this.setData({
        selectIndex: event.detail.current
      })
    }
  },
  clickMyAskMethod: function () {
    // pushNavigation('get_ASK')
    
  },
  clickMyMethod: function () {
    pushNavigation('get_myASK')
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // this.onSkip = this.selectComponent('#onSkip');
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
})