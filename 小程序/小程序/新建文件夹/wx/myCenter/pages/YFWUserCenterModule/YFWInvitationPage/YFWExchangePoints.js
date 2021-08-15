// myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWExchangePoints.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {toDecimal} from '../../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    valid_balance:0,
    invite_exchange_point:0,
    prize:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  prizeChange(e) {
    let {
      value
    } = e.detail;
    value = value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    value = value.replace(/^\./g, ""); //验证第一个字符是数字而不是字符
    value = value.replace(/\.{2,}/g, "."); //只保留第一个.清除多余的
    value = value
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
    let _data = Number(value) > Number(this.data.valid_balance) ? this.data.valid_balance : value;
    this.setData({
      prize:_data,
      invite_exchange_point:_data*100
    })
  },
  submitChange(){
    if(this.data.valid_balance == 0 || this.data.valid_balance == '0.00' || !this.data.valid_balance){
      wx.showToast({
        title: '当前无可用奖励兑换积分',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(this.data.prize == 0 || this.data.prize == '0.00' || !this.data.prize){
      wx.showToast({
        title: '请输入兑换积分的奖励',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(Number(this.data.prize) > Number(this.data.valid_balance)){
      wx.showToast({
        title: '您输入的奖励大于可用奖励,请重新输入',
        icon:'none',
        duration:2000
      })
      return false;
    }
    userCenterApi.balanceToPoint(this.data.prize).then(res=>{
      if(res){
        wx.showToast({
          title: '兑换成功',
          icon:'none',
          duration:2000
        })
        setTimeout(()=>{
          wx.navigateBack({})
        },1000)

      }else{
        wx.showToast({
          title: res.msg ||'兑换失败',
          icon:'none',
          duration:2000
        })
      }
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
    userCenterApi.getBalanceInfo().then(res=>{
      this.setData({
        valid_balance:res.valid_balance || 0,
        invite_exchange_point:res.invite_exchange_point
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

  }
})