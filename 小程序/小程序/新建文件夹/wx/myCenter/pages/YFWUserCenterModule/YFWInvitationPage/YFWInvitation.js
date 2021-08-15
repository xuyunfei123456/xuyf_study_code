import {
  pushNavigation
} from '../../../../apis/YFWRouting'
import {
  isLogin
} from '../../../../utils/YFWPublicFunction'
import {
  BaseApi
} from '../../../../apis/base.js'
import {
  UserCenterApi
} from '../../../../apis/index.js'
const baseApi = new BaseApi()
const app = getApp();
const userCenterApi = new UserCenterApi()
// myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitation.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasLogin: 0,
    loading: false,
    loginFlag: true,
    name: '',
    avatar: "",
    invite_code: "",
    showbutton:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      hasLogin: isLogin() ? 1 : 2,
    })
    wx.login({})
    if (options.params) {
      let _param = JSON.parse(options.params);
      let _code = _param.code;
      this.data.invite_code = decodeURI(_code);
      if(_code.indexOf('code=') !=-1){
        let _codearr = _code.split('=')
        _code = _codearr[1]
      }
      userCenterApi.getYQAccountByCode(decodeURI(_code)).then(res => {
        if(res){
          this.setData({
            name: res.account_name || '',
            avatar: res.intro_image ? 'https://c1.yaofangwang.net' + res.intro_image : '',
          })
        }
        this.setData({
          showbutton:true,
        }) 
      },err=>{
        this.setData({
          showbutton:true,
        })
      })
    }
  },
  getInvitation() {
    pushNavigation('invitation_oldUser')
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
  getPhoneNumber: function (e) {
    this.setData({
      loading: true
    })
    this.data.detail = e;
    let that = this;
    wx.login({
      success(res) {
        if (res.code) {
          var code = res.code;
          baseApi.getOpenid(code).then(openid => {
            if (openid != undefined && openid != '') {
              baseApi.openidLogin(openid).then(res => {
                if (res != null && res.mobile) {
                  that.hideloading();
                  //判断登录成功
                  app.globalData.certificationFlag = true;
                  pushNavigation('invitation_oldUser')
                } else {
                  //未与我们账号绑定
                  if (e.detail.encryptedData && e.detail.iv) {
                    console.log('同意授权')
                    //同意授权
                    wx.login({
                      success: res => {
                        that.getOpenidByPhoneNumber(res.code, e.detail.encryptedData, e.detail.iv, '');
                      }
                    })

                  } else {
                    //拒绝授权
                    that.hideloading();
                  }
                }
              }, (err) => {
                that.hideloading();
                wx.showToast({
                  title: '领取异常,请稍后重试',
                  duration: 2000,
                  icon: 'none'
                })
              })
            } else {
              that.hideloading();
              wx.showToast({
                title: '领取异常,请稍后重试',
                duration: 2000,
                icon: 'none'
              })
            }
          }, (err) => {
            that.hideloading();
          })
        } else {
          that.hideloading();
          wx.showToast({
            title: '领取异常,请稍后重试',
            duration: 2000,
            icon: 'none'
          })
        }
      },
      fail(err) {
        that.hideloading();
        wx.showToast({
          title: '领取异常,请稍后重试',
          duration: 2000,
          icon: 'none'
        })
      }
    })
  },
  getOpenidByPhoneNumber(code, encryptedData, iv, avatarUrl) {
    let that = this,
      invite_code = this.data.invite_code;
    baseApi.getOpenidByPhoneNumber(code, encryptedData, iv, avatarUrl, invite_code).then(openid => {
      baseApi.openidLogin(openid).then(res => {
        that.hideloading();
        //判断登录成功
        app.globalData.certificationFlag = true;
        pushNavigation('invitation_newUser')
      }, (err) => {
        that.hideloading();
      })
    }, (err) => {
      if (that.data.loginFlag) {
        that.data.loginFlag = false;
        that.getPhoneNumber(this.data.detail)
      }
    })

  },
  handleCatchTap() {
    return true;
  },
  hideloading: function () {
    this.setData({
      loading: false
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
    return {
      // 'desc': desc, //标题
      title: '买药享低价，速领20元新人红包，药房直送有保障',
      path: 'pages/YFWHomeFindModule/YFWHomePage/YFWHome',
      imageUrl: '../../../../images/wxmin_share_invite.png',
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