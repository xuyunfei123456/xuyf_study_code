// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()

import {
  LoginRegisterApi
} from '../../../../apis/index.js'
const loginRegisterApi = new LoginRegisterApi()
Page({


  /**
   * 页面的初始数据
   */
  data: {
    oldPassword:"",
    newPassword:"",
    abend:true,
    abend_new:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  
  bindChange_oldPassword: function (e) {
    this.setData({ oldPassword: e.detail.value });
  },

  bindChange_newPassword: function (e) {
    this.setData({ newPassword:e.detail.value})
  },

  /**
   * 修改密码
   */
   save:function(){

     var that =this;
     var oldPassword =this.data.oldPassword;
     var newPassword =this.data.newPassword;
     
     if(oldPassword==""|| newPassword==""){
       console.log("111")
       wx.showToast({
         title: '密码强度不符合规则(至少6位英文字符和数字组合)',
         duration: 1000
       })
     }
     loginRegisterApi.updatePassword(oldPassword, newPassword).then(res=>{
      //  console.log(res);
      //  that.setData({ newPassword: newPassword});
       if(res){
        wx.showToast({
          title: '修改成功',
          duration: 10000
        })
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1
          })
        },1000)

       }
     },(err)=>{
      wx.showToast({
        title: err.msg ||'修改失败',
        duration: 1000,
        icon: 'none',
      })
     })
   
  },

    clickOn:function(){
      this.setData({
        abend: !this.data.abend
      })
    },

    clickOn_new: function () {
    console.log("aaaa");
    this.setData({
      abend_new: !this.data.abend_new
    })
  }

})