// pages/YFWStoreModule/YFWShopDetailHomePage/YFWShopDetailHome.js
import {
  ShopDetailApi,
  UserCenterApi,
} from '../../../apis/index.js'
const userCenterApi = new UserCenterApi();
const shopDetailApi = new ShopDetailApi()
import {
  getModelArray
} from '../../../components/GoodsItemView/model/YFWGoodsListModel.js'
import {
  getShopInfo
} from '../Model/YFWShopDetailInfoModel.js'
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  isLogin
} from '../../../utils/YFWPublicFunction'
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isIphoneX: app.globalData.isiPhoneX,
    screenHeight: 0,
    listHeight: 0,
    shopInfo: {},
    dataSource: [{
        id: 1,
        name: "商家优选",
        items: []
      },
      {
        id: 2,
        name: "中西药品",
        items: []
      },
      {
        id: 3,
        name: "医疗器械",
        items: []
      },
      {
        id: 4,
        name: "养生保健",
        items: []
      },
      {
        id: 5,
        name: "美容护肤",
        items: []
      },
      {
        id: 6,
        name: "计生用品",
        items: []
      },
      {
        id: 7,
        name: "中药饮片",
        items: []
      }
    ], // 接口返回数据
    selectIndex: 0,
    pageIndex: 1,
    pageEnd: false,
    list: [],
    ratio: 1,
    shopID: 338958
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        that.data.ratio = ratio
        let height = clientHeight * ratio;
        that.setData({
          screenHeight: height
        });
        let query = wx.createSelectorQuery()
        query.select('#headerView').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          let ratio = 750 / clientWidth;
          let height = res[0].height * ratio;
          that.setData({
            listHeight: height
          });
        })
      }
    });
    this.data.shopID = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params).value || this.data.shopID
    this.getShopInfoData()
    this.getRecommendData()
  },

  /** 点击顶部item方法 */
  changeIndex: function (event) {
    console.log(event.currentTarget)
    var index = event.currentTarget.dataset.index
    if (index != this.data.selectIndex) {
      this.setData({
        selectIndex: index
      })
      this.clearIndexInfo()
      this.getRecommendData()
    }
  },
  /*领取优惠券*/

  getCoupon: function (e) {
    if(isLogin()){
      let _id = e.currentTarget.dataset.id;
      shopDetailApi.getCoupon(_id).then((res)=>{
        if(res){
          wx.showToast({
            title: '领取成功',
            icon: 'none',
            duration: 2000
          })
        }

      },(e)=>{
        wx.showToast({
          title: e.msg || '领取失败',
          icon: 'none',
          duration: 2000
        })

      })
    }else{
      pushNavigation('get_author_login')
    }

  },
  /** 下方列表滑动方法 */
  swiperChangIndex: function (event) {
    if (event.detail.source == "touch") {
      this.setData({
        selectIndex: event.detail.current
      })
      this.clearIndexInfo()
      this.getRecommendData()
    }
  },

  /**
   * 商品点击方法
   */
  goodsItemClick: function (event) {
    console.log(event)
    let params = event.detail.navitation_params;
    pushNavigation(params.type, params)
  },
  toSearch() {
    pushNavigation('get_search', {
      storeid: this.data.shopID,placeholder:'搜索药品、品牌'
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

  },

  toShopInfo() {
    pushNavigation('get_shop_detail_intro', {
      value: this.data.shopID
    })
  },

  toGoodsList() {
    pushNavigation('get_shop_detail_list', {
      value: this.data.shopID
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

  getRecommendData() {
    let index = this.data.selectIndex
    if (this.data.selectIndex == 0) {
      shopDetailApi.getShopRecommendGoods(this.data.shopID).then((response) => {
        let data = getModelArray(response, 'shop_medicine_recomand')
        this.setData({
          "dataSource[0].items": data
        })
      })
    } else {
      shopDetailApi.getShopGoods(this.data.shopID, this.data.selectIndex, 'sale_count', this.data.pageIndex, '').then((response) => {
        let data = getModelArray(response.dataList, 'shop_medicine_recomand')
        if (data.length < 20) {
          this.hideLoadingView()
        }
        if (this.data.pageIndex == 1) {
          this.data.list = data
        } else {
          data = this.data.list.concat(data)
        }
        this.data.list = data
        this.setData({
          ["dataSource[" + index + "].items"]: data
        })
      })
    }
  },
  getShopInfoData() {
    shopDetailApi.getShopInfo(this.data.shopID).then((response) => {
      let data = getShopInfo(response)
      this.setData({
        shopInfo: data
      })
    })
  },
  requestNextPage: function (e) {
    if (!this.data.pageEnd)
      this.data.pageIndex = this.data.pageIndex + 1
    else
      this.data.pageEnd = true
    this.getRecommendData()
  },
  hideLoadingView() {
    this.setData({
      pageEnd: true
    })
  },
  clearIndexInfo() {
    this.data.list = [];
    this.data.pageIndex = 1;
    this.data.pageEnd = false;
  },
  collectStore() {
    if (this.data.shopInfo.is_favorite) {
      shopDetailApi.getCancelCollectShop(this.data.shopID).then((response) => {
        wx.showToast({
          title: '取消收藏成功',
          icon: '',
          image: '',
          duration: 2000,
          mask: true,
          success: function (res) {},
          fail: function (res) {},
          complete: function (res) {},
        })
        this.data.shopInfo.is_favorite = !this.data.shopInfo.is_favorite
        this.setData({
          shopInfo: this.data.shopInfo
        })
      })
    } else {
      shopDetailApi.getCollectShop(this.data.shopID).then((response) => {
        wx.showToast({
          title: '收藏成功',
          icon: '',
          image: '',
          duration: 2000,
          mask: true,
          success: function (res) {},
          fail: function (res) {},
          complete: function (res) {},
        })
        this.data.shopInfo.is_favorite = !this.data.shopInfo.is_favorite
        this.setData({
          shopInfo: this.data.shopInfo
        })
      })
    }
  }
})