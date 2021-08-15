
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tips:'',
    orderNo:'',
    pageFrom:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    wx.setNavigationBarTitle({
      title: screenData.title,
    })
    this.setData({
      tips: screenData.tips,
      orderNo:screenData.orderNo,
      pageFrom:screenData.pageFrom
    })
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

  jumpToOrderDetal:function(){
    // if (this.data.pageFrom == 'oederDetail'){
    //   wx.navigateBack()
    // }else{
    //   let params = {
    //     order_no: this.data.orderNo
    //   }
    //   params = JSON.stringify(params)
    //   wx.redirectTo({
    //     url: "/orderModule/pages/YFWOrderModule/YFWOrderDetailPage/YFWOrderDetail?params=" + params,
    //   })
    // }
    let params = {
      order_no: this.data.orderNo
    }
    params = JSON.stringify(params)
    wx.redirectTo({
      url: "/orderModule/pages/YFWOrderModule/YFWOrderDetailPage/YFWOrderDetail?params=" + params,
    })
    //Todo  刷新列表
  }
})