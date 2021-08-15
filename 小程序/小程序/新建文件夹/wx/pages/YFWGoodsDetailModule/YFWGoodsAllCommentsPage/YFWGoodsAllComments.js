// pages/YFWGoodsDetailModule/YFWGoodsAllCommentsPage/YFWGoodsAllComments.js
import {
  GoodsDetailApi
} from '../../../apis/index.js'
const goodsDetailApi = new GoodsDetailApi()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: [],
    pageIndex: 1,
    storeId: '',
    isLoding: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params&& typeof(options.params) == 'string'&&JSON.parse(options.params) || {}
    this.data.storeId = params.shopId
    this.footerView = this.selectComponent("#footerRefreshView");
    this.getComments()
  },

  /**
   * 获取评论
   */
  getComments: function (isPull) {
    if(this.data.isLoding) {
      return;
    }

    this.setData({
      isLoding: true
    })

    goodsDetailApi.getEvaluationList(this.data.storeId, this.data.pageIndex).then(response => {
      console.log(response)
      let dataArray = response.dataList

      if(this.data.pageIndex > 1) {
        dataArray = this.data.dataSource.concat(dataArray)
      }

      if(isPull) {
        wx.stopPullDownRefresh();
      }

      if (response.dataList.length == 0) {
        this.footerView.endRefreshWithNoMoreData()
      }else {
        this.footerView.endRefresh()
      }

      this.setData({
        dataSource: dataArray,
        isLoding: false
      })
    }, error => {

      if (this.data.pageIndex > 1) {
        this.pageIndex--;
      }

      if (isPull) {
        wx.stopPullDownRefresh();
      }
      this.setData({
        isLoding: false
      })

      this.footerView.endRefresh()
    });
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
    
    this.data.pageIndex = 1;

    this.getComments(true)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    this.data.pageIndex++;

    this.footerView.showFooter()

    this.getComments(false)
  },
})