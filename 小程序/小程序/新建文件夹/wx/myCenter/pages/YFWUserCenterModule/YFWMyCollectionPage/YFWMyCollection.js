// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {
  ShopDetailApi
} from '../../../../apis/index.js'
const shopDetailApi = new ShopDetailApi()
import {
  GoodsDetailApi
} from '../../../../apis/index.js'
const goodsDetailApi = new GoodsDetailApi()
import { pushNavigation } from '../../../../apis/YFWRouting.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstSwiper:true,
    selectIndex:0,
    dataSource: [{
      id: 0,
      name: "商品",
      items: []
    },
      {
        id: 1,
        name: "商家",
        items: []
      }
    ],
    listHeight:600,
    ratio:1,
    isEdit:false,
    pageEnd:false,
    pageEndLeft:false,
    pageEndRight:false,
    pageIndexLeft:1,
    pageIndexRight:1,
    selectGoods:{},
    selectStore:{},
    isSelectAll:false
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
        let query = wx.createSelectorQuery()
        query.select('#separateView').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          let height = (clientHeight - res[0].bottom)* ratio;
          that.setData({
            listHeight: height
          });
        })
      }
    });
    this.getData()
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

  toEdit(){
    this.setData({
      listHeight : this.data.listHeight - 100,
      isEdit: !this.data.isEdit
    })
  },
  finishEdit(){
    this.setData({
      listHeight: this.data.listHeight + 100,
      isEdit: !this.data.isEdit
    })
  },
  showMore() {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent("#moreview").showModal(bottom+20)
    })
  },
  toDetail(e){
    let item = e.currentTarget.dataset.item
    let index = e.currentTarget.dataset.index
    if(index == 1){
      pushNavigation('get_shop_detail', { value: item.storeId })
    }else{
      pushNavigation('get_shop_goods_detail', { value: item.id })
    }
  },
/**
 * 选中事件
 */
  itemClick:function(e){
    if(this.data.isEdit){
      let data = e.currentTarget.dataset.item
      let id = parseInt(e.currentTarget.id)
      let isSelect = data.isSelect ? false : true || !data.isSelect
      this.data.dataSource[this.data.selectIndex].items[id].isSelect = isSelect
      this.setData({
        dataSource: this.data.dataSource
      })
      if (this.data.selectIndex == 0) {
        if (isSelect) {
          this.data.selectGoods[data.medicineid + data.storeid] = data.medicineid
        } else {
          delete this.data.selectGoods[data.medicineid + data.storeid]
        }
        console.log(this.data.selectGoods)
      } else {
        if (isSelect) {
          this.data.selectStore[data.storeId] = data.storeId
        } else {
          delete this.data.selectStore[data.storeId]
        }
        console.log(this.data.selectStore)
      }
      console.log(this.data.dataSource)
      this.checkSelect()
    }else{
      this.toDetail(e)
    }
    
  },

  checkSelect(index){
    let currentIndex = index || this.data.selectIndex
    let currentSelectData = currentIndex == 0 ? this.data.selectGoods : this.data.selectStore
    let currentLength = this.data.dataSource[currentIndex].items.length
    if (Object.keys(currentSelectData).length == currentLength && Object.keys(currentSelectData).length != 0){
      this.setData({
        dataSource: this.data.dataSource,
        isSelectAll:true
      })
    }else{
      this.setData({
        dataSource:this.data.dataSource,
        isSelectAll: false
      })
    }
  },
  
  /**
   * 全选方法
   */
  toSelectAll() {
    let currentIndex = this.data.selectIndex
    let currentSelectData = currentIndex == 0 ? this.data.selectGoods : this.data.selectStore
    let currentData = this.data.dataSource[currentIndex].items
    if(this.data.isSelectAll){
      currentData.forEach((item, index, array) => {
        item.isSelect = false
      })
      if (currentIndex == 0) {
        this.data.selectGoods = {}
      } else {
        this.data.selectStore = {}
      }
    }else{
      currentData.forEach((item,index,array)=>{
        item.isSelect = true
        if(currentIndex == 0){
          this.data.selectGoods[item.medicineid + item.storeid] = item.medicineid
        }else{
          this.data.selectStore[item.storeId] = item.storeId
        }
      })
    }
    this.checkSelect()
  },


  /** 点击顶部item方法 */
  changeIndex: function (event) {
    let index = event.currentTarget.dataset.index
    if (index != this.data.selectIndex) {
      this.data.pageEnd = false;
      this.setData({
        selectIndex: index
      })
      if(this.data.firstSwiper){
        this.getData()
        this.data.firstSwiper = false;
      }

      this.data.selectGoods = {}
      this.data.selectStore = {}
      this.checkSelect(index)
    }
  },

  swiperChangIndex: function (event) {

    if (event.detail.source == "touch") {
      this.data.pageEnd = false
      this.setData({
        selectIndex: event.detail.current
      })
      if(this.data.firstSwiper){
        this.getData()
        this.data.firstSwiper = false;
      }

      this.data.selectGoods = {}
      this.data.selectStore = {}
      this.checkSelect(event.detail.current)
    }
  },
  requestNextPage: function (e) {
    if (this.data.selectIndex == 0) {
      this.data.pageEnd = this.data.pageEndLeft
    } else {
      this.data.pageEnd = this.data.pageEndRight
    }
    if (!this.data.pageEnd){
      if (this.data.selectIndex == 0) {
        this.data.pageIndexLeft = this.data.pageIndexLeft + 1
      } else {
        this.data.pageIndexRight = this.data.pageIndexRight + 1
      }
      this.getData()
    }else{
      this.hideLoadingView()
    }
  },
  hideLoadingView() {
    this.setData({
      pageEnd: true
    })
  },


  getData(){
    if(this.data.selectIndex == 0){
      userCenterApi.getMyCollectionGoods(this.data.pageIndexLeft).then((response)=>{
        let data = response.dataList
        if (data.length < 20) {
          this.data.pageEndLeft = true
          this.hideLoadingView()
        }
        if (this.data.pageIndexLeft == 1) {
          this.data.list = data
        } else {
          data = this.data.dataSource[0].items.concat(data)
        }
        this.data.dataSource[0].items = data
        this.setData({
          dataSource: this.data.dataSource
        })
      })
    }else{
      userCenterApi.getMyCollectionShops(this.data.pageIndexRight).then((response)=>{
        let data = response.dataList
        if (data.length < 20) {
          this.data.pageEndRight = true
          this.hideLoadingView()
        }
        if (this.data.pageIndexRight == 1) {
          this.data.list = data
        } else {
          data = this.data.dataSource[1].items.concat(data)
        }
        this.data.dataSource[1].items = data
        this.setData({
          dataSource: this.data.dataSource
        })
      })
    }
  },

  deleteMethod(){
    let goodsIds = ''
    let goodsStoreIds = ''
    let storeIds = ''
    let currentSelectData = this.data.selectIndex == 0 ? this.data.selectGoods : this.data.selectStore
    Object.entries(currentSelectData).forEach(([key, value],index) =>{
      console.log(`${key}: ${value}`)
      if (this.data.selectIndex == 0){
        let data = key.split(value)
        if(index == 0){
          goodsIds += value
          goodsStoreIds += data[1]
        }else{
          goodsIds += ','+value
          goodsStoreIds += ',' +data[1]
        }
      }else{
        if (index == 0) {
          storeIds += value
        }else{
          storeIds += ',' +value
        }
      }
    });
    if(this.data.selectIndex == 0){
      if (Object.keys(currentSelectData).length == 0) {
        wx.showToast({
          title: '请至少选择一件商品',
        })
        return;
      }
      goodsDetailApi.getCancleCollectGoods(goodsIds,goodsStoreIds).then((response)=>{
        wx.showToast({
          title: '删除成功',
        })
        this.data.selectGoods = {}
        this.data.selectStore = {}
        this.data.pageEndLeft=false
        this.data.pageEndRight=false
        this.data.pageIndexLeft=1
        this.data.pageIndexRight=1
        this.getData()
      })
    }else{
      if (Object.keys(currentSelectData).length == 0) {
        if (Object.keys(currentSelectData).length == 0) {
          wx.showToast({
            title: '请至少选择一个商家',
          })
          return;
        }
        return;
      }
      shopDetailApi.getCancelCollectShop(storeIds).then((response) => {
        wx.showToast({
          title: '删除成功',
        })
        this.data.selectGoods = {}
        this.data.selectStore = {}
        this.data.pageEndLeft=false
        this.data.pageEndRight=false
        this.data.pageIndexLeft=1
        this.data.pageIndexRight=1
        this.getData()
      })
    }
  }



})