// pages/homepage/homepage.js
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  UserCenterApi,
  PublicApi
} from '../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {
  getUserInfo
} from './Model/YFWUserInfoModel.js'
import {
  isLogin,
  getAppSystemConfig,
  upadataTabBarCount,
  checkShopCarCount,
} from '../../../utils/YFWPublicFunction.js'
import {
  config
} from '../../../config.js'
var event = require('../../../utils/event')
const publicApi = new PublicApi()
var app = getApp();
var log = require('../../../utils/log')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    write:[],
    direction:"right",
    inviteFlag: false,
    hasMove: false,
    ads_itemImage: "",
    userHeaderInfo: {first:1},
    trafficnoArray: [],
    recentCount: 0,
    currentIndex: 0,
    loginstatus: false,
    interval:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    event.on('logout', this, function (res) {
      this.setData({
        userHeaderInfo: {first:1},
        trafficnoArray: [],
        recentCount: 0,
        currentIndex: 0
      })
    })
    let  menuButtonObject={
      bottom: 56,
      height: 32,
      left: 320,
      right: 407,
      top: 24,
      width: 87
    };
    let that = this
    //当wx.getMenuButtonBoundingClientRect失效时  设置默认参数
    try {
       let _menuButtonObject = wx.getMenuButtonBoundingClientRect();
       menuButtonObject = _menuButtonObject
    } catch (error) {
      if(sysInfo.statusBarHeight&&sysInfo.statusBarHeight>=44){
        menuButtonObject={
            bottom: 80,
            height: 32,
            left: 281,
            right: 368,
            top: 48,
            width: 87
          }
      }
    }
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.safeAreaInsetBottom = res.safeArea && res.safeArea.bottom && res.screenHeight ? res.screenHeight - res.safeArea.bottom : 0
        let statusBarHeight = res.statusBarHeight,
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2; //导航高度
        that.data.navHeight = navHeight;
        that.data.windowWidth = res.windowWidth;
        that.data.windowHeight = res.windowHeight;
        that.setData({
          navHeight,
          scrollHeight: res.windowHeight - navHeight,
        })
      },
    })
    getAppSystemConfig().then((info) => {
      app.globalData.appSystemConfig = info;
      if (info && info.ads_item && info.ads_item.image) {
        this.setData({
          ads_itemImage: info.ads_item.image
        })
      }
    }, (error) => {})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //邀请有奖拖拽
  inviteMove(e){
    var that = this;
    var position = [e.touches[0].pageX - 25, e.touches[0].pageY - 25];
    that.setData({
      write: position
    });
  },
  //邀请有奖拖拽结束
  inviteOver(){
    let _write = this.data.write,direction;
    if(_write[0]&&_write[0]>=this.data.windowWidth/2){
      _write = [this.data.windowWidth-50,_write[1]]
      direction = 'right';
    }else{
      _write = [0,_write[1]];
      direction = 'left';
    }
    this.setData({
      write:_write,
      direction,
    })
    app.globalData.inviteInfo = {
      write:_write,
      direction,
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  let _write  = app.globalData.inviteInfo.write,that = this;
  if(_write.length == 0 ){
    this.setData({
      write:[that.data.windowWidth-50,that.data.windowHeight*3/4],
      direction:app.globalData.inviteInfo.direction
    })
  }else{
    this.setData({
      write:_write,
      direction:app.globalData.inviteInfo.direction
    })
  }
  wx.getStorage({
    key: 'tabBarHeight',
    success:res=>{
      if(res.data){
        this.setData({
          tabbarHeight:res.data
        })
      }
    }
  })
    //判断是否登录
    if (!isLogin()) {
      // if(app.globalData.loginBackFlag){
      //   app.globalData.loginBackFlag = false;
      //   pushNavigation(app.globalData.preRoute);
      //   return;
      // }
      // pushNavigation('get_login')
      this.setData({
        loginstatus: false
      })
      return;
    } else {
      upadataTabBarCount()
      this.setData({
        loginstatus: true
      })
    }
    let modal = this.selectComponent("#authentication");
    if (app.globalData.certificationFlag) {
      app.globalData.certificationFlag = false;
      if (app.globalData.certification == '_unCertification') {
        userCenterApi.getUserAccountInfo().then(res => {
          if (!res || res.dict_bool_certification != 1) {
            modal.setData({
              isShow: true,
            })
          } else {
            app.globalData.certification = res.dict_bool_certification;
          }
        })
      } else {
        modal.setData({
          isShow: app.globalData.certification == 1 ? false : true,
        })
      }
    }
    this.getData();
    this.handleRecentData();

    //邀请有奖登录之后跳转
    if (this.data.inviteFlag) {
      pushNavigation('yyyj')
      this.data.inviteFlag = false;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.interval);
  },
  dologin: function () {
    pushNavigation('get_author_login')
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.interval);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData()
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
      title: config.share_title,
      imageUrl: config.share_image_url
    }
  },

  nextPage: function () {
    console.log("滚动到底部")
  },

  /**
   * deltax:相对上一次滚动的x轴上的偏移量
   * scrollHeight:scrollview的高度
   * scrollLeft:水平方向总的已经滚动的距离
   * scrollTop:垂直方向总的已经滚动的距离
   */

  onScrollListenner: function (event) {
    if (!this.data.hasMove) {
      this.data.hasMove = true;
      this.setData({
        hasMove: true
      })
    }
    let _this = this;

    this.scrollEndTimer = setTimeout(function () {
      _this.data.hasMove = true;
      _this.setData({
        hasMove: false
      })
    }, 300);
  },
  gotoInvite() {
    if (isLogin()) {
      pushNavigation('yyyj')
    } else {
      this.data.inviteFlag = true;
      pushNavigation('get_author_login')
    }
  },

  /**
   * 跳转消息首页
   */
  toMessageHome() {
    pushNavigation('get_message_home')
  },
  /**
   * 跳转设置页
   */
  toSetting() {
    pushNavigation('get_set')
  },

  /**
   * 跳转用户管理
   */
  toUserInfoManager() {
    pushNavigation('get_account_management')
  },

  /**
   * 点击签到
   */
  toSign() {
    publicApi.getSignUrl().then((result) => {
      let info = {
        value: result.sign_url,
        share: 'pages/YFWHomeFindModule/YFWHomePage/YFWHome',
        type: 'receive_h5',
        name: '签到'
      }
      pushNavigation(info.type, info)
    }, (error) => {})

  },
  /**
   * 跳转浏览历史
   */
  toHistory() {
    pushNavigation('get_rechent_browse')
  },
  /**
   * 跳转收藏
   */
  toFaverate() {
    pushNavigation('get_my_collection')
  },
  /**
   * 跳转积分
   */
  toPoint() {
    pushNavigation('get_my_points')
  },
  /**
   * 跳转优惠券
   */
  toConpon() {
    pushNavigation('get_my_coupon')
  },
  /**
   * 跳转收货地址
   */
  toAddress() {
    pushNavigation('get_address_list')
  },
  /**
   * 跳转评价
   */
  toRating() {
    pushNavigation('get_my_evaluation')
  },
  /**
   * 跳转我的投诉
   */
  toComplaint() {
    pushNavigation('get_my_complaint')
  },
  /**
   * 跳转用药人
   */
  toMedicinePerson() {
    pushNavigation('get_medicine_person')
  },
  /**
   * 跳转我的保单
   */
  toMyPolicy() {
    userCenterApi.getMyPolicy().then(res => {
      if (res) {
        pushNavigation('receive_h5', {
          value: res
        })
      } else {
        wx.showToast({
          title: '未获取到保单,请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    }, () => {
      wx.showToast({
        title: '未获取到保单,请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  },
  /**
   * 跳转用药提醒
   */
  toDrugRemind() {
    pushNavigation('get_medication_reminder_list')
  },
  /**
   * 跳转物流详情
   */
  toLogistics: function (e) {
    let item = e.currentTarget.dataset.item;
    if(!item){
      log.info('物流详情==='+JSON.stringify(this.data.trafficnoArray));
      return;
    }
    pushNavigation('get_logistics_detail', {
      'order_no': item.orderno,
      'medecine_image': item.imageurl
    })
  },
  /**
   * 跳转商家入驻
   */
  toStoreSettledIn: function (e) {
    let item = e.currentTarget.dataset.item;
    item = {
      backgroundcolor: null,
      end: null,
      img_height: "243",
      img_url: "http://c1.yaofangwang.net/4/3516/320ef381a51ebbdd58f9fc6e8dc729aa.png",
      img_width: "1125",
      is_login: "0",
      is_sellout: "0",
      name: "商家入驻",
      price: "0.00",
      share: "https://m.yaofangwang.com/JoinIn.html",
      start: null,
      type: "receive_h5",
      value: "https://m.yaofangwang.com/JoinIn.html"
    }
    pushNavigation(item.type, item)
  },

  //跳转订单
  orderList: function (e) {
    let index = e.currentTarget.dataset.index
    pushNavigation('get_order_list', {
      index: index
    })
  },
  //历史浏览商品个数
  handleRecentData() {
    let totalCount = 0
    try {
      let value = wx.getStorageSync('recentBrowse')
      if (value) {
        Object.entries(value).forEach(([key, value], index) => {
          console.log(`${key}: ${value}`)
          let length = Object.keys(value).length;
          totalCount += length
        })
        this.setData({
          recentCount: totalCount
        })
      }
    } catch (e) {

    }
  },

  getData() {
    userCenterApi.getAccountHeaderInfo().then((response) => {
      let data = getUserInfo(response)
      this.setData({
        userHeaderInfo: data,
        issigntody: response.issigntody
      })
      wx.stopPullDownRefresh();
    },error=>{
      if (error) {
        wx.stopPullDownRefresh();
      }
    })
    userCenterApi.getTrafficnoInfo().then((response) => {
      let data = response;
      clearInterval(this.interval);
      if(data.length>1){
        this.interval=setInterval(()=>{
          let _index;
          if(this.data.currentIndex+1 == this.data.trafficnoArray.length){
            _index=0;
          }else{
            _index = this.data.currentIndex+1;
          }
          this.setData({
            currentIndex:_index
          })
        },4000)
      }
      this.setData({
        trafficnoArray: data
      })
      wx.stopPullDownRefresh();
    }).then((error) => {
      if (error) {
        wx.stopPullDownRefresh();
      }
    })
  },
  myTouchMove() {
    return false;
  }



})