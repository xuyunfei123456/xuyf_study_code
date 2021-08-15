// pages/YFWHomeFindModule/YFWFindYaoPage/YFWFindYao.js
import {
  FindGoodsApi, MessageApi
} from '../../../apis/index.js'
import { pushNavigation } from '../../../apis/YFWRouting.js'
import { isNotEmpty, safeObj, mobClick, upadataTabBarCount,isLogin} from '../../../utils/YFWPublicFunction.js'
const findGoodsApi = new FindGoodsApi()
const messageApi = new MessageApi()
import {YFWFindYaoShopModel} from './Model/YFWFindYaoShopModel.js'
const findYaoShopModel = new YFWFindYaoShopModel()
import { scanCode } from '../../../utils/YFWScanCode.js'
import { config } from '../../../config.js'

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: '',
    address: '上海市',
    data:[],
    shopData:[],
    dataSource:[
      {
        key:'分类找药',
        data:[],
        images: [
          '/images/findyao/sort_icon_zxyp.png',
          '/images/findyao/sort_icon_ysbj.png',
          '/images/findyao/sort_icon_ylqx.png',
          '/images/findyao/sort_icon_jsyp.png',
          '/images/findyao/sort_icon_zyyp.png',
          '/images/findyao/sort_icon_mrhf.png',
          
          ],
        id:0
      },
      {
        key: '附近的药房',
        data: [],
        images: [
        ],
        id: 1
      },
      {
        key: '高发疾病',
        data: [],
        images: [
          '/images/findyao/sort_icon_FT.png',
          '/images/findyao/sort_icon_FR.png',
          '/images/findyao/sort_icon_WY.png',
          '/images/findyao/sort_icon_XC.png',
          '/images/findyao/sort_icon_GXY.png',
          '/images/findyao/sort_icon_TNB.png',
          '/images/findyao/sort_icon_ZF.png',
          '/images/findyao/sort_icon_FSB.png',
          '/images/findyao/sort_icon_RXA.png',
          '/images/findyao/sort_icon_GA.png',
          '/images/findyao/sort_icon_TF.png',
          '/images/findyao/sort_icon_JZB.png',
        ],
        id: 2
      },
      {
        key: '热门品牌',
        data: [],
        images: [
          '/images/findyao/sort_icon_YNBY.png',
          '/images/findyao/sort_icon_RH.png',
          '/images/findyao/sort_icon_TRT.png',
          '/images/findyao/sort_icon_999.png',
          '/images/findyao/sort_icon_BYS.png',
          '/images/findyao/sort_icon_YST.png',
          '/images/findyao/sort_icon_TCBJ.png',
          '/images/findyao/sort_icon_TT.png',
          '/images/findyao/sort_icon_PZH.png',
          '/images/findyao/sort_icon_SC.png',
          '/images/findyao/sort_icon_HSY.png',
          '/images/findyao/sort_icon_QS.png',
        ],
        id: 3
      },
    ],
    messageCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    findGoodsApi.getFindGoodsInfo().then(response=>{
      this._handle_requestData_TCP(response)
      this.setData({
        // address: app.globalData.address
      })
    })
    
  },
  _handle_requestData_TCP(res){
    let dataSource = this.data.dataSource 
    let categoryData = []
    if (isNotEmpty(res.main_category)){
      res.main_category.forEach((item,index)=>{
        categoryData.push({
          id:item.id,
          name: item.name,
          img: dataSource[0].images[index]
        })
      })
    }
    let diseaseData = []
    if (isNotEmpty(res.top_disease)) {
      res.top_disease.forEach((item, index) => {
        diseaseData.push({
          id: item.id,
          name: item.name,
          hot: item.hot,
          img: dataSource[2].images[index]
        })
      })
    }
    let brandData = []
    if (isNotEmpty(res.top_brand)) {
      res.top_brand.forEach((item, index) => {
        brandData.push({
          name: item.name,
          img: dataSource[3].images[index]
        })
      })
    }

    dataSource[0].data = categoryData
    dataSource[1].data = res.near_shop
    dataSource[2].data = diseaseData
    dataSource[3].data = brandData
      //
    let shopArray = [];
    shopArray = findYaoShopModel.getModelData(res.near_shop);
      this.setData({
        dataSource: dataSource,
        shopData:shopArray
        
      })
  

  },
  //事件处理函数
  bindSearchTap: function () {
    console.log('dfg');
    wx.navigateTo({
      url: '../YFWSearchPage/YFWSearch?showSpecification=1'
    })
  },
  //跳转商家详情
  toShopDetaiMethod: function(event) {
    var id = event.currentTarget.id
    pushNavigation('get_shop_detail', {value: id})
    
  },
  ////跳转分类页
  toCategoryMethod: function (event) {
    console.log(event.currentTarget.dataset.index)
    pushNavigation('get_all_category', {index: event.currentTarget.dataset.index})
  },
  //跳转分类详情列表
  toSubCategoryMethod: function(event) {
    let id = event.currentTarget.id
    let name = event.currentTarget.dataset.name
    pushNavigation('get_category', { value: id, name: name })

  },
   //跳转搜索页面(热门品牌)
  toSearchMethod: function(event) {
    console.log(event.currentTarget.dataset.name)
    pushNavigation('get_search', { value: event.currentTarget.dataset.name })
    
  },
  //附近商家
  nearShopMethod: function(event) {
    console.log('附近的药店')
    pushNavigation('get_around_store')
  },

  //获取地址
  getLocation() {
    const that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        console.log(res)
        that.setData({
          hasLocation: true,
        })
      }
    })
  },
  messageAction: function () {
    pushNavigation('get_message_home')
  },
  //获取条码值
  bindScanTap: function () {
    scanCode()
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
  wx.getStorage({
    key: 'tabBarHeight',
    success:res=>{
      if(res.data){
        this.setData({
          tabbarHeight:res.data+app.globalData.safeAreaInsetBottom
        })
      }
    }
  })
    let ssid = wx.getStorageSync('cookieKey')
    if (ssid && ssid.length > 0) {
      upadataTabBarCount()
      messageApi.getMessageUnreadCount().then((result) => {
        console.log(result)
        this.setData({
          messageCount: result
        })
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.preRoute = 'get_findyao';
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    return {
      title: config.share_title,
      imageUrl: config.share_image_url
    }
  }
})