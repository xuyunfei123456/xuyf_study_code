// pages/YFWAskModule/myAskAns/myAskAns.js
var util = require('../../../utils/util.js')
import { pushNavigation } from '../../../apis/YFWRouting.js'
import {
  HealthAskApi
} from '../../../apis/index.js'
import { isLogin, tcpImage } from '../../../utils/YFWPublicFunction.js'
const myhealAsk = new HealthAskApi()
import { YFWHealthMyAskModel } from './Model/YFWHealthMyAskModel.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotQuey:[
      {
        num:'1条回复',
      }
    ],
    pageType:0,
    pageSize:10,
    pageIndex:1,
    pepQuion:'',
    qusList:[],
    loadhidden:false,
    hidden:false,
    selectIndex: 0,
    docImg: '',
    dataSource: [{
      id: 0,
      name: "全部问题",
      data: []
    },
    {
      id: 1,
      name: "已回复",
      data: []
    },
    {
      id: 2,
      name: "未回复",
      data: []
    }
    ],
    datainfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //上拉加载
  pullOnLoading:function(){
    this.data.pageIndex++;
    this.perInform()
  },
perInform:function(){

  let pageindex=this.data.pageIndex<1 ? 1 : this.data.pageIndex
  myhealAsk.getMyAskInfo(this.data.pageSize, pageindex, this.data.pageType).then(res=>{
    wx.hideLoading()
    console.log(res,'我的问答')
    let qusList = []
    qusList = res.dataList.map((info) => {
      return YFWHealthMyAskModel.getModelArray(info)
    })
    this.setData({
      pepQuion: res,
      qusList: this.data.pageIndex == 1 ? qusList : this.data.qusList.concat(qusList),
      docImg: res.profile.intro_image
    })
    if (res.dataList.length < 10) {
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
  })
},
  replyQuey(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
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
      if (index == 0) {
        this.data.pageType = 0
      }
      if (index == 1) {
        this.data.pageType = 2
      }
      if (index == 2) {
        this.data.pageType = 1
      }
      this.setData({
        selectIndex: index,
        pageIndex: 1,
        qusList: [],
        pageType: this.data.pageType
      })
      this.perInform()
    }
  },
  //跳转到搜索页
  goSearch: function () {
    pushNavigation('get_ASK_Search')
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
    if(isLogin()){
      wx.showLoading({
        title: '加载中...'
      })
    }else{
      wx.showModal({
        content: "您未登录或登录已过期,请重新登录",
        cancelColor: "#1fdb9b",
        cancelText: "取消",
        confirmColor: "#1fdb9b",
        confirmText: "确定",
        success(res) {
          if (res.confirm) {
            pushNavigation('get_author_login')
          }
        }
      })
      return;
    }
    this.perInform()
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
    if(this.data.hidden){
      return
    }
   this.setData({
     loadhidden: true
   })

    this.pullOnLoading()
  },
})