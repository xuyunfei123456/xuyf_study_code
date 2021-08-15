// pages/YFWOrderModule/YFWApplicationForReturnPage/YFWRecentBrowse.js
import {
  isNotEmpty,
} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation }  from '../../../../apis/YFWRouting.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataInfo:{},
    dateArray: [],
    goodsArray: [],
    lastOpenSiderId :''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    try {
      let value = wx.getStorageSync('recentBrowse')
      if (value) {
        this.data.dataInfo = value
        this.handleData()
      }
    } catch (e) {
      
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
  handleData(){
    this.data.dateArray = []
    this.data.goodsArray = []
    Object.entries(this.data.dataInfo).forEach(([key, value], index) => {
      console.log(`${key}: ${value}`)
      this.data.dateArray.push(key)
      let goods = []
      Object.entries(value).forEach(([key, value], index) => {
        goods.push(value)
      })
      this.data.goodsArray.push(goods)
    })
    this.data.dateArray.reverse()
    this.data.goodsArray.reverse()
    console.log(this.data.dateArray)
    console.log(this.data.goodsArray)
    if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
      this.selectComponent('#' + this.data.lastOpenSiderId).close()//关闭打开的item
    }
    this.setData({
      dateArray: this.data.dateArray,
      goodsArray: this.data.goodsArray
    })
  },

  /**
 * 滑动删除模块打开回调方法。保存本次打开的itemId并关闭上一次打开的item。
 */
  onSidebarOpen: function (e) {
    if (this.data.lastOpenSiderId != '' && this.data.lastOpenSiderId != e.currentTarget.id) {
      if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
        this.selectComponent('#' + this.data.lastOpenSiderId).close()
      }
    }
    this.data.lastOpenSiderId = e.currentTarget.id;
  },

  toGoodsDetail(e){
    let goodsId = e.currentTarget.id;
    pushNavigation('get_shop_goods_detail', { value: goodsId })
  },

  onDeleteitem(e){
    let data = e.currentTarget.dataset.item
    let time = data.time_stamp
    let goodsId = data.shop_goods_id
    delete this.data.dataInfo[time][goodsId]
    this.handleData()
    wx.setStorageSync('recentBrowse', this.data.dataInfo)
  },
  clearAll(){
    let that = this
    wx.showModal({
      content: "确定要清空浏览记录吗?",
      cancelColor: "#999999",
      cancelText: "取消",
      confirmColor: "#49ddb8",
      confirmText: "确定",
      success(res) {
        if (res.confirm) {
          that.data.dataInfo = {}
          that.handleData()
          wx.setStorageSync('recentBrowse', that.data.dataInfo)
        } else if (res.cancel) {
          
        }
      }
    })
    
  },
  toHome(){
    pushNavigation('get_home')
  }

})