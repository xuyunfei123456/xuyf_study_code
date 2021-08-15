// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
var util = require('../../../../utils/util.js')

import {
  UserCenterApi
} from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
const healthAskApi = new UserCenterApi()

var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myJF:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    healthAskApi.getUserPoint().then(res=>{
      console.log(res,'res')
      this.setData({
        myJF: res
      })
    })
  },
  rankDetail(){
    pushNavigation('rankDetail')
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
})