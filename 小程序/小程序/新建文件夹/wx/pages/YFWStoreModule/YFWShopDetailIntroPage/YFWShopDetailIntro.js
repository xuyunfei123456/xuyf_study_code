// pages/YFWStoreModule/YFWShopDetailIntroPage/YFWShopDetailIntro.js
import {
  ShopDetailApi
} from '../../../apis/index.js'
const shopDetailApi = new ShopDetailApi()
import { getShopInfo } from '../Model/YFWShopDetailInfoModel.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopInfo: {},
    qualificationItems:[],
    sceneItems:[],
    shopID: 338958
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.shopID = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params).value || this.data.shopID
    this.getShopInfoData()
    this.getShopQualification()
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

  toBigImage(e){
    let imageArray = e.currentTarget.dataset.images
    let images = []
    imageArray.forEach((value,index)=>{
      images.push(value.image_file)
    })
    let currentImage = e.currentTarget.dataset.current
    wx.previewImage({
      urls: images,
      current: currentImage
    })
  },
  showMore() {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent("#moreview").showModal(bottom + 30)
    })
  },
  getShopInfoData() {
    shopDetailApi.getShopInfo(this.data.shopID).then((response) => {
      let data = getShopInfo(response)
      this.setData({
        shopInfo: data
      })
    })
  },
  getShopQualification() {
    shopDetailApi.getShopQualification(this.data.shopID).then((response) => {
      let qualificationItems = []
      let sceneItems = []
      response.zz_items.forEach((item, index) => {
        qualificationItems.push({
          image_file: item.image_url,
          image_name: item.image_name,
          show_image_suffix: item.show_image_suffix
        });
      });
      response.sj_items.forEach((item, index) => {
        sceneItems.push({
          image_file: item.image_url,
          image_name: item.image_name,
          show_image_suffix: item.show_image_suffix
        });
      });
      this.setData({
        qualificationItems: qualificationItems,
        sceneItems: sceneItems
      })
    })
  }

})