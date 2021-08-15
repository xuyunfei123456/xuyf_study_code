import {
  OrderApi
} from '../../../../apis/index.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import { isNotEmpty} from '../../../../utils/YFWPublicFunction.js'
const orderApi = new OrderApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    reason:"",
    cancelFlag:false,
  },
  applycancel:function(){
    var that = this;
    if(this.data.reason == ""){
      wx.showToast({
        title: '请填写原因',
        icon: 'none',
        duration: 1500
      })
    }else{
      wx.showModal({
        content: "账户注销后无法恢复，且不能使用该账号注册，请谨慎操作",
        cancelColor: "#1fdb9b",
        cancelText: "返回",
        confirmColor: "#1fdb9b",
        confirmText: "申请注销",
        success(res) {
          if (res.confirm) {
            // 验证是否满足注销条件
          orderApi.getcancel().then(res=>{
            if(res){
              pushNavigation('account_verify',{reason:that.data.reason})
            }
          },error=>{
            if(error.code == -100){
              that.setData({
                cancelFlag:true,
                cancelReason:error.msg,
              })
            }
          })
          }
        }
      })
    }

  },
  onTextInput: function (text) {
    let input = text.detail.value;
    this.setData({
      reason: input,
    })
  },
  hideShadow:function(){
    this.setData({
      cancelFlag:false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
})