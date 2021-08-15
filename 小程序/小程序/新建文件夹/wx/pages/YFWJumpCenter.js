// pages/YFWJumpCenter.js
import {
  pushNavigation
} from '../apis/YFWRouting.js'
import {
  isEmpty, isNotEmpty
} from '../utils/YFWPublicFunction.js'
import {
  isLogin
} from '../utils/YFWPublicFunction.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (isEmpty(options.params)) {
      return
    }
    let obj = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    console.log(obj)
    obj.value = obj.id;
    if (obj.type == "get_save_photo") {
      obj.value = obj.imgsrc;
    }
    if (isNotEmpty(obj.type)) {
      if (obj.type == "get_share") {
        // this.shareSign(obj)
      } else if (obj.type == "get_coupon_detail") {
        if (isLogin()) {
          pushNavigation('get_coupon_detail', obj, 'redirect')
        }
      } else {
        pushNavigation(obj.type, obj, 'redirect')
      }
    } else {
      // this._webView.injectJavaScript('window.location.href=\'' + data + '\'');
    }

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