// pages/YFWMessageModule/YFWMessageHomePage/YFWMessageHome.js
import {
  MessageApi
} from '../../../apis/index.js'
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
const messageApi = new MessageApi()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrlArray: [
      ["-1", "/images/icon_message_kf.png"],
      ["1", "/images/icon_message_xx.png"],
      ["2", "/images/icon_message_dd.png"],
      ["3", "/images/icon_message_yh.png", ]
    ],
    dataArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
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
    this.requsetData()
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
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 点击事件
   */
  clickedItem: function(e) {
    console.log(e)
    let item = e.currentTarget.dataset.item
    this.markMessagereaded(item.msg_type_id)
    if (item.msg_type_id != '-1'){
      pushNavigation('get_message_list', {
        'type': item.msg_type,
        'msg_type_id': item.msg_type_id,
      })
    }
  },

  /**
   * 请求数据
   */
  requsetData: function() {
    messageApi.getHomeMessage().then(res => {
      console.log(res)
      this.handleDate(res)
    });
  },

  /**
   * 处理返回的数据
   */
  handleDate: function(res) {
    let imgUrlMap = new Map(this.data.imgUrlArray)
    let itemArray = res
    itemArray.forEach(function(item, index) {
      var url = imgUrlMap.get(item.msg_type_id)
      itemArray[index].icon = url
    });
    this.setData({
      dataArray: itemArray
    })
  },

  /**
 * 取消栏目消息红点
 */
  markMessagereaded(typeID) {
    messageApi.getMessageTypeRead(typeID).then(res => {})
  },

})