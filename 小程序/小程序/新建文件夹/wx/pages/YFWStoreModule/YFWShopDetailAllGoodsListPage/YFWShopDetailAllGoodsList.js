// pages/YFWStoreModule/YFWShopDetailAllGoodsListPage/YFWShopDetailAllGoodsList.js
import {
  ShopDetailApi, ShopCarApi
} from '../../../apis/index.js'
const shopDetailApi = new ShopDetailApi()
const shopCarApi = new ShopCarApi()
import { getModelArray } from '../../../components/GoodsItemView/model/YFWGoodsListModel.js'
import { toDecimal } from '../../../utils/YFWPublicFunction.js'
var log = require('../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex:1,
    categoryID:'',
    keyWords:'',
    sorttype:'sale_count desc',
    list: [],
    shopID: 338958,
    priceInShop:'',
    showShopCarTips:false,
    shopCarTipsInfo:{},
    showConditionTips:false,//结算优惠券凑单
    condition_price:0,//优惠券使用金额
    condition_money:0,//优惠券金额
    conditionTips:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _data;
    try {
      _data =  options.params && typeof(options.params) == 'string'&& JSON.parse(options.params);
    } catch (error) {
      log.error('店家全部商品详情页接收参数报错：'+options)
    }
    this.data.shopID =_data.value || this.data.shopID
    this.data.priceInShop = _data.priceInShop || 0
    this.data.showShopCarTips = _data.isShowTips || false
    this.data.showConditionTips = _data.isShowConditionTips || false
    this.data.condition_price = _data.condition_price || 0
    this.data.condition_money = _data.condition_money || 0
    this.dealTips()
    this.getShopCarTips()
    this.requestData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      showShopCarTips: this.data.showShopCarTips,
      showConditionTips: this.data.showConditionTips,
      condition_price: this.data.condition_price,
      condition_money: this.data.condition_money
    })
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
  changeSortType: function (e) {
    this.data.list = [];
    this.data.pageIndex = 1;
    this.data.sorttype = e.detail.sorttype;
    this.data.categoryID = e.detail.categoryID;
    this.requestData()
  },

  hideLoadingView() {
    this.selectComponent("#goodsView").setData({
      pageEnd: true
    })
  },
  requestNextPage: function (e) {
    if (!this.selectComponent("#goodsView").data.pageEnd){
      this.data.pageIndex = this.data.pageIndex + 1
      this.requestData()
    }
    else{
      this.selectComponent("#goodsView").data.pageEnd = true
    }
  },

  bindKeyInput: function (e) {
    this.data.keyWords = e.detail.value
  },
  search(){
    this.data.list = [];
    this.data.pageIndex = 1;
    this.requestData()
  },

  requestData(){
    shopDetailApi.getShopGoods(this.data.shopID, this.data.categoryID, this.data.sorttype,this.data.pageIndex,this.data.keyWords).then((response) => {
      let data = getModelArray(response.dataList,'all_medicine_list')
      if(data.length < 20){
        this.hideLoadingView()
      }
      data = this.data.list.concat(data)
      this.data.list = data
      this.selectComponent("#goodsView").setData({
        list: this.data.list
      })
    })
  },
  getShopCarTips(e){
    if (this.data.showConditionTips&&e&&e.detail) {
      let pages = getCurrentPages()
      let orderSettlePage = pages[pages.length - 2]
      if (orderSettlePage&&orderSettlePage._collectBillsCallback) {
        orderSettlePage._collectBillsCallback(e.detail)
      }
      this.data.priceInShop += e.detail.goodsPrice
      this.dealTips()
      return
    }
    if (this.data.priceInShop === ''){
      return
    }
    if (e&&e.detail.price){
      this.data.priceInShop = parseFloat(this.data.priceInShop) + parseFloat(e.detail.price)
    }
    shopCarApi.getFreepostageAndActivityInfo(this.data.shopID, this.data.priceInShop).then(res => {
      this.selectComponent("#goodsView").setData({
        shopCarTipsInfo: res
      })
    })
  },
  dealTips() {
    if (this.data.condition_money > 0) {
      let money = this.data.condition_price - this.data.priceInShop
      if (money > 0) {
        money = toDecimal(money)
        this.data.conditionTips = '满' +this.data.condition_price +'减'+ this.data.condition_money+ '，还差'+money+'元'
      } else {
        this.data.conditionTips = '已满' +this.data.condition_price+'元，已减'+ this.data.condition_money

      }
      this.selectComponent("#goodsView").setData({
        conditionTips: this.data.conditionTips
      })
    }
  }

})