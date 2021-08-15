import {
  OrderApi
} from '../../../../../../apis/index.js'
import {pushNavigation} from "../../../../../../apis/YFWRouting"
const orderApi = new OrderApi();
var event = require('../../../../../../utils/event.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectEnable: false,
    loading: false,
    ktxWindowHeight: '',
    result: {},
    goodsList: [],
    mobileSize:'',
  },

  onTextInput: function (e) {
    let input = e.detail.value, _index = e.currentTarget.dataset.index;
    this.data.goodsList.map((item, index) => {
      if (index == _index) {
        item.inputText = input;
      }
      return item;
    })
    this.setData({
      goodsList: this.data.goodsList
    })
  },
  add: function () {
    let list = [], flag = false;
    this.data.goodsList.map(item => {
      if (!flag) {
        flag = item.inputText == undefined || item.inputText == '' ? false : true
      }

      list.push(JSON.stringify({
        "medicineid": item.medicineid,
        "batchno": item.inputText == undefined ? '' : item.inputText,
      }))
    })
    if (!flag) {
      wx.showToast({
        title: '请填写至少一个产品批号',
        icon: 'none',
      })
      return false;
    }
    orderApi.receiveData( {orderno: this.data.orderno, list, }).then(res => {
      event.emit('refresh');
      wx.setStorageSync('receiveFlag', 2)
      pushNavigation('receive_h5',{value:res})
    }, error => {
      wx.showToast({
        title: error.msg || '服务异常',
        icon: 'none',
      })
    })
  },
  turnToExplain:function(){
    pushNavigation('check_batch_page')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _data = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}, goodsList = _data.detail.unreceive || [],that = this;
    this.setData({
      goodsList,
      orderno: _data.detail.orderNo
    })
    wx.getSystemInfo({
      success: function (res) {
        if(res.screenWidth<350){
          that.setData({
            mobileSize:'22rpx'
          })
        }
      }
    });
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.getSystemInfo({
      success(res) {
        // px转换到rpx的比例
        let pxToRpxScale = 750 / res.windowWidth;
        // window的高度
        let ktxWindowHeight = res.windowHeight * pxToRpxScale + 'rpx';
        that.setData({
          ktxWindowHeight,
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
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
})
