// pages/YFWHomeFindModule/YFWSubCategoryPage/YFWSubCategory.js
import {
  GoodsCategaryApi
} from '../../../apis/index.js'
const goodsCategaryApi = new GoodsCategaryApi()
import {
  getModelArray
} from '../../../components/GoodsItemView/model/YFWGoodsListModel.js'
import { isNotEmpty, safeObj, isEmpty, itemAddKey } from '../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    list: [],
    categoryID: '',
    sort: '',
    sorttype: '',
    paramJson: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let screenData = options.params&& typeof(options.params) == 'string'&&JSON.parse(options.params) || {};
    wx.setNavigationBarTitle({
      title: screenData.name,
    })
    this.filterBox = this.selectComponent('#filterBox');
    this.filterBox.setData({
      category_id:screenData.value
    })
    this.filterBox.getsxData();
    this.data.categoryID = screenData.value
    this.requestData()

  },
  openControlPanel: function () {
    this.filterBox.showModal()
  },

  changeSortType: function (e) {
    this.data.list = [];
    this.data.pageIndex = 1;
    this.data.sort = e.detail.sort;
    this.data.sorttype = e.detail.sorttype;
    this.requestData()
  },
  changeFilter: function (info) {
    //{brands:品牌集合   manufacturers:厂家}
    // console.log(info.detail, 'new filter')
      // * aliascn  品牌 多品牌以, 分割
      //   * titleAbb  厂家 多厂家以, 分割
    let brand = isEmpty(info.detail.brands) ? '' : info.detail.brands.join(","),
    manufacturer = isEmpty(info.detail.manufacturers) ? '' : info.detail.manufacturers.join(",");
    this.setData({
      paramJson: { aliascn: brand, titleAbb: manufacturer }
    })
    this.selectComponent("#goodsView").setData({
      pageEnd: false
    })
    this.data.pageIndex = 1;
    this.requestData()
  },

  requestData() {
    goodsCategaryApi.getCategaryGoods(this.data.categoryID, this.data.sort, this.data.sorttype, this.data.pageIndex, this.data.paramJson, '4.0.00').then((response) => {
      let data = getModelArray(response.dataList, 'all_medicine_subCategory')
      if (data.length < 20) {
        this.hideLoadingView()
      }
      if (this.data.pageIndex == 1) {

      } else {
        data = this.data.list.concat(data)
      }
      this.data.list = data
      this.selectComponent("#goodsView").setData({
        list: this.data.list
      })
    })
  },

  hideLoadingView() {
    this.selectComponent("#goodsView").setData({
      pageEnd: true
    })
  },
  requestNextPage: function(e) {
    if (!this.selectComponent("#goodsView").data.pageEnd)
      this.data.pageIndex = this.data.pageIndex + 1
    else
      this.selectComponent("#goodsView").data.pageEnd = true
    this.requestData()
  },
  bindSearchTap: function () {
    wx.navigateTo({
      url: '../YFWSearchPage/YFWSearch'
    })
  },
  openUtilityMenu: function () {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent("#moreview").showModal(bottom)
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

  },

  
})