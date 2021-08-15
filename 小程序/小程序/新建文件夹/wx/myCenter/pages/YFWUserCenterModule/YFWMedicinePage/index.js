// pages/address/address.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting'
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userDrugList: [],
    selectEnable: false,
    picUrl: {
      '本人': '/images/drugPerson/myself.png',
      '亲戚': '/images/drugPerson/relative.png',
      '家属': '/images/drugPerson/familys.png',
      '朋友': '/images/drugPerson/friend.png',
    },
    pageIndex: 0,
    loading: false,
    showFoot: 0,
    ktxWindowHeight: '',
    result: {},
  },
  /**选中地址列表 */
  clickItemAction: function (event) {
    if (this.data.selectEnable) {
      let pages = getCurrentPages()
      let prePage = pages[pages.length - 2]
      prePage.setData({
        selectAddress: event.currentTarget.dataset.info
      })
      wx.navigateBack({})
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '用药人'
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      showFoot: 0,
      pageIndex: 0,
    })
    this.requestDataFromServer(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.showFoot == 1 || this.data.showFoot == 2) {
      return
    }
    let pageIndex = this.data.pageIndex + 1
    this.setData({
      showFoot: 2,
      pageIndex: pageIndex
    })
    this.requestDataFromServer(pageIndex)
  },
  requestDataFromServer: function (pageIndex) {
    var that = this;
    userCenterApi.getUserdrug(pageIndex).then(result => {
      wx.stopPullDownRefresh();
      if (result.length == 0) {
        userCenterApi.getPersonalInfo().then(result => {
          that.setData({
            result,
          })
        })
      }
      let userDrugList = pageIndex == 0 ? [] : this.data.userDrugList;
      userDrugList = userDrugList.concat(result)
      that.setData({
        userDrugList,
        showFoot: result.length < 10 ? 1 : 0
      })
    }, error => {
      wx.showToast({
        title: '获取数据失败',
        icon: 'none',
      })
    })
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
    this.requestDataFromServer(0)
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

  //新增用药人
  add: function () {
    pushNavigation('add_drug', { info: this.data.result, type: 1 })
  },

  //编辑地址
  editUser: function (e) {
    var id = e.currentTarget.dataset.id;
    pushNavigation('add_drug', { id, type: 2 })
  },

  //删除用药人
  deleteUser: function (e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '是否确定删除该用药人信息',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading()
          userCenterApi.deleteUser(id).then(res => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000
            })
            that.requestDataFromServer(0);
            wx.hideLoading()
          })
        }
      }
    })


  }
})