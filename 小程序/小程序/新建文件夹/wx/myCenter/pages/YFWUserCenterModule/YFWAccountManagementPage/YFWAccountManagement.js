// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
var app = getApp()
import {
  config
} from '../../../../config.js'

import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()

import {
  UploadImageApi,
  SafeApi
} from '../../../../apis/index.js'
const uploadImageApi = new UploadImageApi()
const safeApi = new SafeApi()
import {
  isLogin
} from '../../../../utils/YFWPublicFunction.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoModel: {},
    text_sex: '',
    intro_image: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //判断是否登录
    if (isLogin()) {
      this.getData();
    }

  },
  /**
   * 上传头像
   */
  clickPortrait: function () {
    var that = this
    wx.showActionSheet({
      itemList: ['拍照', '手机相册'],
      itemColor: "#167EFB",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            wx.chooseImage({
              count: 1,
              sizeType: ['compressed'],
              sourceType: ['camera'],
              success(res) {
                uploadImageApi.upload(res.tempFilePaths[0]).then(res => {
                  console.log(res, 'aa')
                  var introImage = res;
                  var imageUrl = config.cdn_url + introImage
                  safeApi.getImgSecCheck(introImage).then(res => {
                    console.log(res, 'ccxc')
                    if (res) {
                      wx.showLoading({
                        title: '修改成功',
                        duration: 300
                      })
                      userCenterApi.updateUserIcon(introImage).then(res => {
                        if (res) {
                          that.setData({
                            intro_image: config.cdn_url + introImage
                          });
                        }
                      })

                    } else {
                      wx.showLoading({
                        title: '修改失败',
                        duration: 300
                      })
                    }
                  })

                })
              }
            })
          } else if (res.tapIndex == 1) {
            wx.chooseImage({
              count: 1,
              sizeType: ['compressed'],
              sourceType: ['album'],
              success(res) {
                uploadImageApi.upload(res.tempFilePaths[0]).then(res => {
                  console.log(res, 'bb')
                  var introImage = res;
                  var imageUrl = config.cdn_url + introImage
                  safeApi.getImgSecCheck(introImage).then(res => {
                    console.log(res)
                    if (res) {
                      wx.showLoading({
                        title: '修改成功',
                        duration: 300
                      })
                      userCenterApi.updateUserIcon(introImage).then(res => {

                        if (res) {
                          that.setData({
                            intro_image: imageUrl
                          });
                        }
                      })

                    } else {
                      wx.showLoading({
                        title: '修改失败',
                        duration: 300
                      })
                    }

                  })

                })
              }
            })
          }



        }
      }
    })


  },

  /**
   * 实名认证
   */
  certification: function () {
    pushNavigation('get_my_modify_the_name',{
      certification:this.data.userInfoModel.dict_bool_certification,
      name:this.data.userInfoModel.real_name,
      idcard:this.data.userInfoModel.idcard_no,
    })
  },

  /**
   * 修改性别
   */
  clickSex: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['男', '女'],
      itemColor: "#167EFB",
      success: function (res) {
        console.log(res)
        var sex = 1;
        if (res.tapIndex == 1) {
          sex = 0
          that.setData({
            text_sex: '女'
          })
        } else {
          that.setData({
            text_sex: '男'
          })
        }
        userCenterApi.updateUserSexInfo(sex).then(res => {
          wx.showLoading({
            title: '修改成功',
            duration: 300
          })
          // wx.hideLoading()
        }, err => {
          wx.showLoading({
            title: '修改失败',
            duration: 500
          })
          wx.hideLoading()
        })
      }
    })

  },

  /**
   * 修改手机
   */

  clickPhone: function () {
    var userInfoModel = this.data.userInfoModel;
    var mobile = userInfoModel.mobile;
    var default_mobile = userInfoModel.default_mobile;
    wx.navigateTo({
      url: '../YFWModifyThePhonePage/YFWModifyThePhone?mobile=' + mobile + '&default_mobile=' + default_mobile,
    })
  },

  /**
   * 修改QQ
   */
  clickQQ: function () {

    wx.navigateTo({
      url: '../YFWModifyTheQQPage/YFWModifyTheQQ',
    })
  },
  /**
   * 修改密码
   */
  clickPassword: function () {
    wx.navigateTo({
      url: '../YFWChangeThePasswordPage/YFWChangeThePassword',
    })
  },

  getData() {
    userCenterApi.getUserAccountInfo().then((response) => {
      if (response.dict_sex == 1) {
        this.setData({
          text_sex: '男'
        })
      } else {
        this.setData({
          text_sex: '女'
        })
      }
      // let imageUrl = response.intro_image
      // safeApi.getImgSecCheck(imageUrl).then(res => {
      //   console.log(res)
      //   if (res){
      //     this.setData({
      //       intro_image: response.intro_image
      //     })
      //   }else{
      //     this.setData({
      //       intro_image: ''
      //     })
      //   }
      // })


      this.setData({
        intro_image: response.intro_image,
        userInfoModel: response,
      })
      app.globalData.userInfo = response;
    })
  }

})