import {
  OrderApi
} from '../../../../../../apis/index'
var log = require('../../../../../../utils/log.js')
const orderApi = new OrderApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    advisoryList: [],
    orderno:'',
    inputText:"",
    height:"",
  },

  onTextInput: function (e) {
    let inputText = e.detail.value;
    this.setData({
      inputText,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        // px转换到rpx的比例
        let pxToRpxScale = 750 / res.windowWidth;
        // window的高度
        let height = res.windowHeight * pxToRpxScale-120
        that.setData({
          height,
        })
      }
    })
    let  _param = options.params &&  JSON.parse(options.params)
    this.setData({
      orderno:_param.orderno || _param.order_no || '',
    })
    this.gethistoryMessage();

  },
  send:function(){
    if(this.data.inputText == ''){
      return;
    }
    orderApi.sendMessage({orderno:this.data.orderno,content:this.data.inputText}).then(res=>{
      this.gethistoryMessage();
      this.setData({
        inputText:'',
      })
    })
  },
  //获取历史留言
  gethistoryMessage:function(){
    orderApi.gethistoryMessage(this.data.orderno).then(res=>{
      this.setData({
        advisoryList:res.advisoryList || []
      })
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {},

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