// myCenter/pages/YFWUserCenterModule/YFWInvitatioReappearancePage/YFWInvitatioReappearance.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js';
const userCenterApi = new UserCenterApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showbottom: false,
    scrollheight: null,
    showrule: true,
    top20: [],
    priceTotal: "",
    toView: "",
    connt_invite: 0,
    total_money: 0,
    invite_record: [],
    code:"",
    showbutton:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  turnToTx() {
    pushNavigation('lltx')
  },
  hiderule() {
    this.setData({
      showrule: true
    })
  },
  ruletip() {
    return
  },
  /** 点击穿透 */
  handleCatchTap: function (event) {
    return false
  },
  rule() {
    this.setData({
      showrule: false
    })
  },
  mainscroll: function (e) {
    let scrollTop = e.detail.scrollTop;
    this.setData({
      showbottom: scrollTop > 340 ? true : false
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
    userCenterApi.getInviteIndex().then(res => {
      if (res) {
        this.setData({
          priceTotal: res.priceTotal,
          top20: res.top20,
          connt_invite: res.connt_invite || 0,
          total_money: res.total_money,
          invite_record: res.invite_record || [],
        })
      }
    })
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollheight: res.windowHeight,
        })
      },
    })
    userCenterApi.getAppinviteCode().then(res=>{
      this.data.code = res;
      this.setData({
        code:res,
        showbutton:true
      })
    })
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
    return{
      // 'desc': desc, //标题
      title: '买药享低价，速领20元新人红包，药房直送有保障',
      path: '/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitation?params=' + JSON.stringify({code:this.data.code}),
      imageUrl:'../../../../images/wxmin_share_invite.png',
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }


  }
})