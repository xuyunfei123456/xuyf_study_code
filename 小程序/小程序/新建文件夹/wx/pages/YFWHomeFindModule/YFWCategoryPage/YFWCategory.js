// pages/YFWHomeFindModule/YFWCategoryPage/YFWCategory.js
import {
  GoodsCategaryApi
} from '../../../apis/index.js'
import { pushNavigation } from '../../../apis/YFWRouting.js'
import { isNotEmpty, safeObj } from '../../../utils/YFWPublicFunction.js'
const goodsCategaryApi = new GoodsCategaryApi()
import {YFWCategoryModel} from './Model/YFWCategoryModel.js'
let categoryModel = new YFWCategoryModel()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:[],
    selectIndex:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params).index || this.data.selectIndex
    this.requestData()
    this.setData({
      selectIndex: screenData
    })
    
  },

  //商品分类数据
  requestData() {
    goodsCategaryApi.getCategaryInfo().then(res => {
      let array = [];
      array = YFWCategoryModel.getModelArray(res)
      this.setData({
        data: array
      })

    })
  },
  pressRow: function(event) {
    this.setData({
      selectIndex: event.currentTarget.dataset.index,
    })
  },
  //
  pushCategory: function(event) {
    console.log(event.currentTarget.dataset.name)
    console.log(event.currentTarget.id)
    pushNavigation('get_category', { value: event.currentTarget.id, name: event.currentTarget.dataset.name})
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