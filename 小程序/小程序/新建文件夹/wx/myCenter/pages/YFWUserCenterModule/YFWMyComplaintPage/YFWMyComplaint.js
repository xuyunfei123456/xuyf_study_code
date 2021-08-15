import {
  UserCenterApi
} from '../../../../apis/index.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
  isNotEmpty,
  safe
} from '../../../../utils/YFWPublicFunction.js'
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArray: [],
    pageIndex: 0,
    loading: false,
    showFoot: 0,
    isCancelComplain: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
    //详情取消投诉后刷新页面
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    let json = currPage.data.isCancelComplain;
    if (json) {
      this.setData({
        showFoot: 0,
        pageIndex: 0,
      })
      this.requsetData()
    }

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
    this.setData({
      loading: true,
    });
    userCenterApi.getMyComplaints(this.data.pageIndex).then(res => {
      wx.stopPullDownRefresh()
      let dataArray
      let showFoot = 0
      if (isNotEmpty(res.dataList) && res.dataList.length == 0) {
        showFoot = 1
      }
      if (this.data.pageIndex > 0) {
        dataArray = this.data.dataArray.concat(res.dataList)
      } else {
        dataArray = res.dataList
      }
      this.setData({
        loading: false,
        dataArray: dataArray,
        showFoot: showFoot,
      })
    }, error => {
      wx.showToast({
        title: '获取数据失败',
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
  clickCompBtn: function(e) {
    let item = e.currentTarget.dataset.item
    this.jumpDetail(item)
  },

  /**
   * 详情跳转
   */
  jumpDetail(item) {
    pushNavigation('get_complaint_Details', {
      order_no: item.orderno
    })
  },
})