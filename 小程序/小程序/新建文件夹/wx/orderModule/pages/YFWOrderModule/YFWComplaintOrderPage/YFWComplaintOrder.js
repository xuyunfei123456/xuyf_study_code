import {
  OrderApi,
} from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
  pushNavigation
} from '../../../../apis/YFWRouting'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: '',
    typeinfo: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      params: options.params,
    })
    this.getData();
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
  getData: function () {
    orderApi.getTsList().then(result => {
      this.setData({
        typeinfo: result.TypeInfo,
        complainData: result.ComplaintInfo
      })
    })
  },
  turnto: function (e) {
    let id = e.currentTarget.dataset.id;
    let params = {
      orderInfo: this.data.params,
      typeinfo: this.data.typeinfo,
      complainData: this.data.complainData,
      id,
    }
    pushNavigation('get_ts', { info: params })
  }
})