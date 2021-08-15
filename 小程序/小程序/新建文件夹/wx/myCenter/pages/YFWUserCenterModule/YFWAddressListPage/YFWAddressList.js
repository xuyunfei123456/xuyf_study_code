// pages/address/address.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    selectEnable:false
  },
  /**选中地址列表 */
  clickItemAction: function(event) {
    if (this.data.selectEnable) {
      let pages = getCurrentPages()
      let prePage = pages[pages.length-2]
      prePage.setData({
        selectAddress: event.currentTarget.dataset.info
      })
      wx.navigateBack({})
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let params = options.params
    if (params&& typeof(params) == 'string') {
      let info = JSON.parse(params)
      this.data.selectEnable = info.selectEnable
    }

    wx.setNavigationBarTitle({
      title: '收货地址'
    })
    
    this.requestDataFromServer()
  },

  requestDataFromServer: function () {
    var that = this;
    userCenterApi.getAddress().then(addressList => {
      that.setData({
        addressList: addressList
      })
      console.log(addressList);
    })
  },
    
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(){

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.requestDataFromServer()
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
  //新建地址
  add: function() {
    wx.navigateTo({
      url: '../YFWAddressPage/YFWAddress',
    })
  },
  
  //编辑地址
  click: function (e) {
    var address_id = e.currentTarget.dataset.address_id;
    wx.navigateTo({
      url: '../YFWAddressPage/YFWAddress?address_id=' + address_id,
    })

  },

  //删除地址
  delete: function(e) {
    var addressID = e.currentTarget.dataset.address_id;
    var that = this;
    wx.showModal({
      title: '确认删除地址',
      content: '',
      success: function(res) {
        if (res.confirm) {
          wx.showLoading()
          userCenterApi.delectAddress(addressID).then(res => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000
            })
            that.requestDataFromServer();
            wx.hideLoading()
          })
        }
      }
    })
   

  }

 

})