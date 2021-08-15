// pages/video/video.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showback:true,
    url:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
    this.videoContext = wx.createVideoContext('video')
    if(options.params){
      let _param = JSON.parse(options.params);
      this.setData({
        url:_param.value
      })
      wx.setNavigationBarTitle({
        title:_param.name,
      })
    }
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    let navTop = menuButtonObject.top;
    this.setData({
      navTop,
    })
  },
  back(){
    wx.navigateBack()
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
    //this.videoContext.play();
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})