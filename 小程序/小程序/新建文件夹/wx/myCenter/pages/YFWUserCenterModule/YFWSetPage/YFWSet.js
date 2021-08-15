// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
  config
} from '../../../../config.js'
var event = require('../../../../utils/event')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataInfo: [{
        id: 1,
        isShowHeader: false,
        data: [{
          id: 1,
          key: 'info',
          title: '账户管理',
        }],
      },
      {
        id: 2,
        title: '关于我们',
        isShowHeader: true,
        data: [{
            id: 1,
            key: 'feedBack',
            title: '意见反馈',
          },
          {
            id: 3,
            key: 'callWe',
            title: '联系我们',
          },
          {
            id: 4,
            key: 'about',
            title: '关于我们',
            subtitle: 'v' + config.app_version,
          },
          {
            id: 5,
            key: 'safe',
            title: '安全管理',
          },
        ],
      },
      {
        id: 3,
        title: '协议条款',
        isShowHeader: true,
        data: [{
            id: 1,
            key: 'serviceRules',
            title: '服务条款',
          },
          {
            id: 5,
            key: 'privacy',
            title: '隐私政策',
          },
          {
            id: 2,
            key: 'checkRules',
            title: '商品验收标准',
          },
          {
            id: 3,
            key: 'returnRules',
            title: '商品退换货政策',
          },
          {
            id: 4,
            key: 'returnLogin',
            title: '退出登录',
          },
        ],
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {



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

  clickItem(e) {
    let item = e.currentTarget.dataset.item
    switch (item.key) {
      case 'info':
        pushNavigation('get_account_management')
        break
      case 'feedBack':
        pushNavigation('get_feed_back')
        break
      case 'callWe':
        pushNavigation('get_contact_us')
        break
      case 'about':
        pushNavigation('get_about_us')
        break
      case 'serviceRules':
        pushNavigation('receive_h5', {
          value: "https://m.yaofangwang.com/app/agreement.html?os=miniapp"
        })
        break
      case 'checkRules':
        pushNavigation('receive_h5', {
          value: "https://m.yaofangwang.com/app/check.html?os=miniapp"
        })
        break
      case 'returnRules':
        pushNavigation('receive_h5', {
          value: "https://m.yaofangwang.com/app/exchange.html?os=miniapp"
        })
        break
      case 'safe':
        pushNavigation('get_safe')
        break
      case 'privacy':
          pushNavigation('receive_h5', {
            value: "https://reg.yaofangwang.com/secrecy.html?os=miniapp"
          })
          break
      case 'returnLogin':
           this.logout();
           break;
    }

  },
  logout(){
    wx.clearStorageSync()
    wx.setStorageSync('cookieKey','')
    event.emit('logout')
    wx.reLaunch({
      url: '/pages/YFWHomeFindModule/YFWHomePage/YFWHome'
    })
  }

})