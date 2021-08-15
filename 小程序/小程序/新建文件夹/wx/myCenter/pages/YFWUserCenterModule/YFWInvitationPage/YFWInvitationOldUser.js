const { pushNavigation } = require("../../../../apis/YFWRouting")
import {
  UserCenterApi,PublicApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
// myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitationOldUser.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code:"",
    showbutton:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  goHome(){
    pushNavigation('get_home')
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
    userCenterApi.getAppinviteCode().then(res=>{
      if(res){
        this.setData({
          code:res,
          showbutton:true,
        })
      }
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
    let _param = {
      code:this.data.code,
    }
    return {
      // 'desc': desc, //标题
      title: '买药享低价，速领20元新人红包，药房直送有保障',
      path: '/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitation?params='+JSON.stringify(_param),
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