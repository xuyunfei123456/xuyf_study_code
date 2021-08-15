// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  OrderPaymentApi
} from '../../../../apis/index.js'
let log = require('../../../../utils/log')
const orderPaymentApi = new OrderPaymentApi()
var app = getApp()
import {
  BaseApi
} from '../../../../apis/base.js'
const baseApi = new BaseApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginFlag: true,
    loading: false,
    from: '',
    code:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.orderNo = options.orderNo;
    wx.showLoading();
    let that = this;
    wx.login({
      success(res) {
        let code = res.code;
        baseApi.getOpenid(code).then(openid => {
          if (openid != undefined && openid != '') {
            baseApi.openidLogin(openid).then(res => {
              if (res != null && res.mobile) {
                //判断登录成功
                var app = getApp()
                app.globalData.certificationFlag = true;
                that.pay(openid,options.orderNo)
              }else{
                wx.hideLoading()
                wx.showToast({
                  title: '请先登录',
                })
              }
            },error=>{
              log.info(type+'获取手机号后登录错误信息'+JSON.stringify(err)+'其他支付1')
              wx.hideLoading()
            })
          }
        }, (err) => {
          log.info(type+'获取手机号后登录错误信息'+JSON.stringify(err)+'其他支付2')
          wx.hideLoading()
        })
      }
    })
  },
  pay(openid,orderNo){
    orderPaymentApi.otherPay(openid,orderNo).then((result) => {
      orderPaymentApi.getCurrentPayStatus(orderNo, 'wxpay').then((res) => {
        wx.hideLoading()
        if (res.success) {
          wx.showToast({
            title: '支付成功',
          })
          this.back('success')
        } else {
          wx.showToast({
            icon:'none',
            title: '支付失败',
          })
          this.back('fail')
        }
      }, (error) => {
        wx.hideLoading()
        wx.showToast({
          icon:'none',
          title: '支付失败',
        })
        this.back('fail')
      })
    }, (error) => {
      wx.hideLoading()
      if (error) {
        wx.showToast({
          icon:'none',
          title: '支付失败',
        })
        this.back('fail')
      }
    })
  },
  back(status){
    wx.navigateBackMiniProgram({
      extraData: {
      status,
    },
      success(res) {
        // 返回成功
      }
    })
  },
    /**
   * 微信授权手机号
   */
  getPhoneNumber: function (e) {
    this.setData({
      loading: true
    })
    let that = this;
    //未与我们账号绑定
    if (e.detail.encryptedData && e.detail.iv) {
      console.log('同意授权')
      //同意授权
      wx.checkSession({
        success () {
          console.log('checksession success')
          wx.login({
            success(res){
              if(res.code){
                that.getOpenidByPhoneNumber(res.code, e.detail.encryptedData, e.detail.iv, 'checksuccess');
              }
            }
          })
        },
        fail () {
          wx.login({
            success(res){
              if(res.code){
                that.getOpenidByPhoneNumber(res.code, e.detail.encryptedData, e.detail.iv, 'checkfail');
              }
            }
          })
        }
      })
      
    } else {
      //拒绝授权
      wx.hideLoading()
      wx.showToast({
        title: '您已拒绝登录',
        duration: 2000,
        icon: 'none'
      })
    }
  },
  handleCatchTap() {
    return true;
  },
  getOpenidByPhoneNumber(code, encryptedData, iv, avatarUrl,type) {
    let that = this;
    baseApi.getOpenidByPhoneNumber(code, encryptedData, iv, avatarUrl).then(openid => {
      baseApi.openidLogin(openid).then(res => {
        wx.hideLoading()
        //判断登录成功
        app.globalData.certificationFlag = true;
        that.pay(openid,that.data.orderNo)
      }, (err) => {
        wx.hideLoading()
        wx.showToast({
          title: err.msg || '登录失败',
          duration: 2000,
          icon: 'none'
        })
        log.info(type+'获取手机号后登录错误信息'+JSON.stringify(err)+'其他支付3')
      })
    }, (err) => {
      log.info(type+'解密手机号错误信息'+JSON.stringify(err)+'其他支付4')
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