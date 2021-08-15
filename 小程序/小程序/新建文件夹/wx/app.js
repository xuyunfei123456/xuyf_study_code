// var fundebug = require('./fundebug.1.3.1.min.js');
// fundebug.init(
// {
//     apikey : '519c0c135652a2de5b41f8a00d34f212b0cadda0aa34ba50ec98012f233d5a54'
// })
const mtjwxsdk = require("./utils/mtj-wx-sdk.js");
let log = require('utils/log.js')
import {
  BaseApi
} from './apis/base.js'
const baseApi = new BaseApi()
App({
  onLaunch: function (info) {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log('onCheckForUpdate====', res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          console.log('res.hasUpdate====')
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                console.log('success====', res)
                // res: {errMsg: "showModal: ok", cancel: false, confirm: true}
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    }
    if (info && info.scene && info.scene == 1037) {
      //当其他小程序打开我们小程序时 追加日志
      if (info.referrerInfo && info.referrerInfo.appId) {
        let _data = info.referrerInfo,
          _time = new Date().getTime();
        log.info('onshow+其他小程序跳转到我们小程序携带的参数:' + _data.extraData.data + '-----extraData=======' + JSON.stringify(_data.extraData))
        baseApi.insertUnionIPLog({
          uid: _data.extraData.data,
          sid: ""
        }).then(res => {}, err => {})
        wx.setStorageSync('_expiredinfo_', {
          expired: _time,
          uid: _data.extraData && _data.extraData.data
        });
        let _info_ = wx.getStorageSync('_expiredinfo_')
        log.info('小程序跳转之后存入本地的信息:' + JSON.stringify(_info_))
      }
      log.info('onshow+其他小程序跳转到我们小程序:' + JSON.stringify(info))
    } else {
      console.log('appjs_info=====' + JSON.stringify(info))
    }
    wx.getSystemInfo({
      success: (res) => {
        wx.setStorageSync('system_info', res)
      },
    })
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
              }
            })
          }
        }, (err) => {})
      }
    })
  },
  onError(msg) {
    //调用接口上传错误日志
    console.error('app onError: ' + msg);
    let pages = getCurrentPages();
    try {
      if (msg && wx.getStorageSync('errortype')) {
        if (msg.substring(20, 30) != wx.getStorageSync('errortype')) {
          log.error("小程序 App onError" + msg + '===页面信息===' + JSON.stringify(pages));
        }
      } else {
        let _msg = msg || "";
        wx.setStorageSync('errortype', _msg.substring(20, 30));
        log.error("小程序 App onError" + msg + '===页面信息===' + JSON.stringify(pages));
      }
    } catch (error) {
      log.error("小程序 App onError" + msg + '===页面信息===' + JSON.stringify(pages))
    }

  },
  onShow(info) {

  },
  globalData: {
    modaltype: 1,
    inviteInfo: {
      write: [],
      direction: 'right',
    },
    systemInfo: {},
    hasUserInfo: true,
    loginBackFlag: false,
    preRoute: '',
    certificationFlag: false,
    certification: "_unCertification",
    userInfo: null,
    latitude: '31.236276',
    longitude: '121.480248',
    region_id: '95',
    address: '上海市',
    city: '上海市',
    isiPhoneX: false,
    inquiryInfo: {
      isSave: false,
      rx_mode: 1,
      drug_items: [],
      selectPatient: null,
      medicine_disease_items: [],
      disease_xz_add: 1,
      diseaseDesc: '',
      medicine_disease_xz_count: 2,
      is_certificate_upload: 0,
      certificationImages: [],
      rx_images: [],
      cartids: '',
      packageids: '',
      isPrescrption: false,
      isEditPatient: false,
      editPatientId: 0,
      drugid: '',
    },
    yqfkInfo: {
      drugname: "",
      drugidcardno: "",
      drugmobile: '',
      temperature: "",
      fs: "",
      ks: "",
      xm: "",
      desc_sym: "",
      qt: "",
      isarrivals: "",
      iscontact: "",
      isSave: false,
      medicate_purpose: "",
      work_trade: "",
      from_where: "",
      last_come_time: "",
      is_fl: "",
      agreeFlag: "",
      is_resident: "",
      is_ownuse: "",
    },
    appSystemConfig: {}
  }
})