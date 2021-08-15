// pages/YFWSellersListModule/YFWChoseMerchantPage/YFWChoseMerchant.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items:[
      {
      name:'济南市盛兴大药房',
      price:'12.00',
      yf:'10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }, {
        name: '济南市盛兴大药房',
        price: '12.00',
        yf: '10.00'
      }
    
    ],
    isCheck:'',
    hidden:true,
    loadhidden:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onselect:function(event){
    const that=this;
    const id = event.currentTarget.dataset.id;
    if (id == that.data.isCheck){
      return
    }

that.setData({
  isCheck:id
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

})