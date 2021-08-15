// pages/YFWMessageModule/YFWMessageListPage/YFWMessageList.js
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
    dataArray: [],
    pageIndex: 0,
    loading: false,
    showFoot: 0,
    msg_type_id: 0,
    jumpType: '',
    loading:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options == '') {
      return
    }
    console.log(options)
    let params = options.params&& typeof(options.params) == 'string'&&JSON.parse(options.params) || {};
    wx.setNavigationBarTitle({
      title: params.type,
    })
    if (params.msg_type_id != undefined) {
      this.setData({
        msg_type_id: params.msg_type_id
      })
    }
    this.requsetData();
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
    this.setData({
      showFoot: 0,
      pageIndex: 0,
    })
    this.requsetData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.showFoot == 1 || this.data.showFoot == 2) {
      return
    }
    let pageIndex = this.data.pageIndex + 1
    this.setData({
      showFoot: 2,
      pageIndex: pageIndex
    })
    this.requsetData()
  },

  /**
   * 请求数据
   */
  requsetData: function() {
    console.log(this.data.pageIndex)
    this.setData({
      loading:true,
    })
    messageApi.getMessageListByType(this.data.msg_type_id, this.data.pageIndex).then(res => {
      wx.stopPullDownRefresh()
      console.log(res)
      let dataArray
      let showFoot = 0
      if (res.dataList.length == 0) {
        showFoot = 1
      }
      if (this.data.pageIndex > 0) {
        dataArray = this.data.dataArray.concat(res.dataList)
      } else {
        dataArray = res.dataList
      }
      console.log(dataArray)
      this.setData({
        loading: false,
        dataArray: dataArray,
        jumpType: res.jumpType,
        showFoot: showFoot,
      })
    }, error => {
      wx.showToast({
        title: '获取消息失败',
        icon: 'none',
      })
      this.setData({
        loading: false,
      })
    });
  },

  /**
   * 点击事件
   */
  clickedItem: function(e) {
    let item = e.currentTarget.dataset.item
    console.log(item)
    if (item.jumptype == '') {
      return
    }
    this.jumpDetail(item)
  },

  /**
   * 消息跳转
   */
  jumpDetail(item) {
    this.markMessagereaded(item.id)
    console.log(item.id)
    let pushPath = '',_param ;
    switch (item.jumptype) {
      case "get_invite":
        pushPath = "receive_h5",
        _param={
          'message_id': item.id,
          'value': item.url,
          'order_no': item.jumpvalue
        }
        break;
      case "get_order_advisory":
        pushPath = "message",
        _param={
          'message_id': item.id,
          'value': item.url,
          'order_no': item.jumpvalue
        }
        break;
      case "get_order_detail":
        pushPath = "get_order_detail",
        _param={
          'order_no': item.jumpvalue
        }
        break;
      case "get_order_list":
        pushPath = "get_order_list",
        _param={
          'index': item.active
        }
        break;
      case "get_my_coupon":
        pushPath = "get_my_coupon",
        _param = {}
        break;
      default:
        pushPath = item.jumptype
    }
    pushNavigation(pushPath, _param)
  },

  /**
   * 消除消息红点
   */
  markMessagereaded(messageID) {
    messageApi.getMessageRead(messageID).then(res => {})
  }
})