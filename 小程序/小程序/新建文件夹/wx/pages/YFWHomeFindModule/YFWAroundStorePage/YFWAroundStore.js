// pages/YFWHomeFindModule/YFWAroundStorePage/YFWAroundStore.js
import { SearchApi, ShopDetailApi } from '../../../apis/index.js'
const searchApi = new SearchApi()
import { YFWSeacrchShopModel } from '../YFWSearchPage/Model/YFWSeacrchShopModel.js'
import { pushNavigation } from '../../../apis/YFWRouting.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showingTable:false,
    frameClassMain: 'frame z1',//默认正面在上面
    frameClassBack: 'frame z2',
    shops:[],
    markers:[],
    scale:10,
    latitude:'',
    longitude:'',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    searchApi.getAssociationShop().then((response) => {
      let data = YFWSeacrchShopModel.getModelArray(response.dataList);
      var marker =[]
      data.forEach((item, index) => {
        marker.push({
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          iconPath: '/images/findyao/FJYD_icon_WXZ.png',
          title: item.title,
          width:19,
          height:23,
          zIndex:999999,
        
        })
      })
      let that = this
      setTimeout(() => {
        that.data.scale = 14
        that.setData({
          scale: that.data.scale
        })
      },2)
      this.setData({
        shops: data,
        markers: marker,
        latitude: app.globalData.latitude,
        longitude: app.globalData.longitude
      })
    })
  },
  makertap: function (e) {
    var that = this;
    var id = e.markerId;
  }, 
  //跳转商家详情
  toShopDetaiMethod: function (event) {
    if (event.currentTarget.id=='map'){
      var id = event.markerId+''
    }else{
      var id = event.currentTarget.id
    }
    pushNavigation('get_shop_detail', { value: id })

  },
  switchMapTable: function(){
    var that = this
    this.data.showingTable = !this.data.showingTable
    var that = this
    if (this.data.frameClassMain == 'frame z1' &&
      this.data.frameClassBack == 'frame z2') {
      that.setData({
        frameClassMain: "frame front",
        frameClassBack: "frame back",
      })
      setTimeout(function () {
        that.setData({
          frameClassMain: "frame z2",
          frameClassBack: "frame z1",
          showingTable: true
        })
      }, 600);
    }
    else {
      that.setData({
        frameClassMain: "frame back",
        frameClassBack: "frame front",
      })
      setTimeout(function () {
        that.setData({
          frameClassMain: "frame z1",
          frameClassBack: "frame z2",
          showingTable: false
        })
      }, 600);
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

})