// pages/YFWHomeFindModule/YFWHomePage/YFWHome.js
import {
  IndexApi,
  PublicApi,
  UserCenterApi,
} from '../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {
  tcpImage,
  isLogin,
  upadataTabBarCount,
  getAppSystemConfig
} from '../../../utils/YFWPublicFunction.js'
const indexApi = new IndexApi()
const publicApi = new PublicApi()
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  scanCode
} from '../../../utils/YFWScanCode.js'
import {
  config
} from '../../../config.js'
var log = require('../../../utils/log')
var app = getApp()
var bmap = require('../../../libs/bmap-wx.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topHeight:"141",
    direction: 'right', //邀请有奖图标默认在右边
    miniAppName: "药房网商城",
    addressWith: "", //胶囊左侧的距离
    jnHeight: "", //胶囊高度
    navHeight: "", //导航高度
    navTop: "", //胶囊按钮与顶部的距离
    windowHeight: "",
    screenWidth: "", //设备屏幕宽度
    windowWidth: "", //小程序窗口宽度
    locationInfo: "", //定位的地址
    ads_itemImage: "", //邀请有奖的图片
    zizhiInfo: "", //底部资质相关信息
    jgqInfo: "", //金刚区相关数据
    bpgg: [], //霸屏广告
    bannerNowWidth: '', //金刚区指示器存在时 当前长度
    _ratio: '', //滚动列表长度与滑条长度比例
    bannerNowLeft: 0, //金刚区指示器 距离左边的距离
    msData: {}, //秒杀数据
    _bannerBgData: {}, //轮播背景图相关数据
    oneWithTwoData: {}, //1拖2广告相关数据
    couponData: {}, //特惠好礼相关数据
    groupWorkData: {}, //9.9元秒杀
    barBgData: {}, //带头部的滑动广告的头部背景相关数据
    barData: {}, //带头部的滑动广告相关数据
    welfareData: {}, //限时福利
    welfareHeaderData: [], //瀑布流头部滑动
    waterfall_leftData: [], //瀑布流左侧数据
    waterfall_rightData: [], //瀑布流右侧数据
    waterfall_index: 0, //瀑布流默认index
    waterfall_list_left_height: [], //左侧总高度
    waterfall_list_right_height: [], //右侧总高度
    inviteFlag: false, //进入邀请有将的flag  若为true  在页面 展示的时候自动进入
    hotwordFixed: false, //热词是否显示
    fixed: false, //搜索框显示在哪里
    firstrequtFlag: false, //在第一次渲染完数据后才显示 资质图片
    videoplayFlag: true,
    toView: "",
    bannerSelectName: '', //轮播图默认第一张
    tabbarHeight: 0,
    write: [],
  },
  // 跳转到商品详情
  goGoodsDel(){
    pushNavigation('groupGoodsDetail')
  },
  testturnto() {
    wx.navigateTo({
      url: '/pages/YFWShopCarModule/YFWOrderSettlementPage/YFWOrderSettlement?params={"Data":[{"type":"medicine","id":"51100849"}],"isBuy":true}',
    })
    // wx.requestSubscribeMessage({
    //   tmplIds: ['ls-aY7kvJQn2w5Slii2NOah8JSRZgfLY6o8c26r-Ssk'],
    //   success: res => {
    //     if (res && res['ls-aY7kvJQn2w5Slii2NOah8JSRZgfLY6o8c26r-Ssk'] == 'accept') {
    //       wx.showToast({
    //         title: '2222',
    //       })
    //     } else if (res && res['ls-aY7kvJQn2w5Slii2NOah8JSRZgfLY6o8c26r-Ssk'] == 'reject'){
    //       wx.showToast({
    //         title: '3333',
    //       })
    //     }

    //   },fail:res=>{
    //     wx.showToast({
    //       title: res.errMsg,
    //     })
    //   }
    // })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let sysInfo = wx.getSystemInfoSync() || {};
    this.data.isPhoneX = sysInfo.statusBarHeight && sysInfo.statusBarHeight >= 44 ? true:false
    this.data.screenWidth = sysInfo.screenWidth;
    this.data.windowWidth = sysInfo.windowWidth;
    this.data.windowHeight = sysInfo.windowHeight;
    this.data.wratio = sysInfo.windowWidth / 750;
    let menuButtonObject;
    if (sysInfo.statusBarHeight && sysInfo.statusBarHeight >= 44) {
      menuButtonObject = {
        bottom: 80,
        height: 32,
        left: 281,
        right: 368,
        top: 48,
        width: 87
      }
    } else {
      menuButtonObject = {
        bottom: 56,
        height: 32,
        left: 320,
        right: 407,
        top: 24,
        width: 87
      };
    }
    let allData = wx.getStorageSync('allData');
    if(allData){
      this.setData({
        allData,
      })
    }
    this.menuButtonObject = menuButtonObject;
    this.setLayout()
    this.requestAllData();
    const that = this
    this.refreshView = this.selectComponent("#refreshView")
    this.getSettingInfo();


    indexApi.getZizhiData().then((result) => {
      if (result.imageurl.indexOf('http://c1.yaofangwang.net') > -1) {
        result.imageurl = result.imageurl.replace('http', 'https');
      }
      this.setData({
        zizhiInfo: result
      })
    }, (error) => {})
    getAppSystemConfig().then((info) => {
      app.globalData.appSystemConfig = info;
      if (info && info.ads_item && info.ads_item.image) {
        this.setData({
          ads_itemImage: info.ads_item.image
        })
      }
    }, (error) => {})
  },
  setLayout(res){
    console.log('res',res)
    let menuButtonObject = res || this.menuButtonObject,that = this;
    wx.getSystemInfo({
      success: function (res) {
        app.globalData.safeAreaInsetBottom = res.safeArea && res.safeArea.bottom && res.screenHeight ? res.screenHeight - res.safeArea.bottom : 0
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2, //导航高度
          addressWith = menuButtonObject.left - 150,
          topsearchWidth = menuButtonObject.left - 20;
        that.data.navHeight = navHeight;
        that.data.navTop = navTop;
        that.data.windowHeight = res.windowHeight;
        that.setData({
          navHeight,
          navTop,
          jnHeight: menuButtonObject.height,
          addressWith,
          topScrollHeight: res.windowHeight - navHeight - 84,
          topsearchWidth,
        })
      },
    })
  },
  waterfallHeadClick(event) {
    let index = event.currentTarget.dataset.index;
    if (index == this.data.waterfall_index) return;
    this.data.waterfall_index = index;
    this.setData({
      waterfall_index: index
    })
  },
  //播放视频
  playvideo(event) {
    let info = event.currentTarget.dataset.info;
    wx.navigateTo({
      url: '/pages/video/video?params=' + JSON.stringify(info),
    })
  },
  fullscreenchange(e) {
    this.setData({
      scrollTop: this.data.scrollTop
    })
  },
  //热词点击
  hotwordClick(event) {
    let info = event.currentTarget.dataset.info;
    if (info.type == "get_search") {
      info.value = "";
      info._value = info.name;
    }
    pushNavigation(info.type, info)
  },
  //瀑布流点击
  waterfallClick(event) {
    let info = event.currentTarget.dataset.info;
    info.value = info.value ? info.value : info.id ? info.id : '';
    if (info.is_login == '1' && !isLogin()) {
      this.data.waterfallFlag = true;
      this.data.waterfallInfo = event;
      pushNavigation('get_author_login')
      return
    }
    if (info) {
      info.needToken = (info.type == 'get_h5' && info.is_login == '1') ? 1 : 0
      pushNavigation(info.type, info)
    }

  },
  //瀑布流视频点击
  waterfallVideoClick(event) {

  },
  //1拖2广告
  oneWithTwoClick(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == '1' && !isLogin()) {
      this.data.oneWithTwoFlag = true;
      this.data.oneWithTwoInfo = event;
      pushNavigation('get_author_login')
      return
    }
    if (info) {
      info.needToken = (info.type == 'get_h5' && info.is_login == '1' && newStr != 'aspx') ? 1 : 0
      pushNavigation(info.type, info)
    }
  },
  //1拖1广告
  couponLeft(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == '1' && !isLogin()) {
      this.data.couponLeftFlag = true;
      this.data.couponLeftInfo = event;
      pushNavigation('get_author_login')
      return
    }
    if (info) {
      info.needToken = (info.type == 'get_h5' && info.is_login == '1' && newStr != 'aspx') ? 1 : 0
      pushNavigation(info.type, info)
    }
  },
  //金刚区点击事件
  menuClickAction: function (event) {
    let info = event.currentTarget.dataset.info
    if (info.is_login == '1' && !isLogin()) {
      //暂存临时任务 登陆完成之后回来完成
      this.data.turnFlag = true;
      this.data.turnInfo = event;
      pushNavigation('get_author_login')
      return
    }
    if (info.name.includes('签')) {
      publicApi.getSignUrl().then((result) => {
        info.value = result.sign_url
        info.type = 'receive_h5'
        pushNavigation(info.type, info)
      }, (error) => {})
    } else if (info.name.includes('批发')) {
      wx.showToast({
        title: '正在开发中，敬请期待',
        icon: 'none',
        duration: 1000
      })
    } else if (info.name.includes('领券')) {
      publicApi.getCouponUrl().then((result) => {
        info.value = result.coupon_url
        info.type = 'receive_h5'
        pushNavigation(info.type, info)
      }, (error) => {})
    } else {
      info.index = 0;
      info.needToken = info.is_login == '1' ? 1 : 0;
      info.type = info.name == '邀请有奖' ? 'yyyj' : info.type;
      pushNavigation(info.type, info)
    }
  },
  //秒杀商品点击
  msGoodClick(e) {
    let _data = e.currentTarget.dataset.info || "";
    pushNavigation(_data.type, {
      value: _data.id
    })
  },
  groupWorkClick(e) {
    let _data = e.currentTarget.dataset.info || "";
    pushNavigation(_data.type, {
      value: _data.id
    })
  },
  //轮播点击
  bannerClickAction: function (event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == '1' && !isLogin()) {
      this.data.bannerClickActionFlag = true;
      this.data.bannerClickActionInfo = event;
      pushNavigation('get_author_login')
      return
    }
    if (info) {
      info.needToken = (info.type == 'get_h5' && info.is_login == '1' && newStr != 'aspx') ? 1 : 0
      pushNavigation(info.type, info)
    }
  },
  //霸屏广告点击
  bpggClick(e) {
    let _data = e.currentTarget.dataset.postdata || "";
    if (!_data) return;
    if (_data.is_login) {
      if (isLogin()) {
        pushNavigation(_data.type, {
          name: _data.name || "",
          url: encodeURIComponent(_data.value),
          share: encodeURIComponent(_data.share),
          value: _data.value,
        })
      } else {
        this.data.bpFlag = true;
        this.data.bpData = _data;
        pushNavigation('get_author_login');
      }
    } else {
      pushNavigation(_data.type, {
        name: _data.name || "",
        url: encodeURIComponent(_data.value),
        share: encodeURIComponent(_data.share),
        value: _data.value,
      })
    }
  },
  //点击顶部搜索
  searchAction: function () {
    wx.navigateTo({
      url: '../YFWSearchPage/YFWSearch?showSpecification=1'
    })
  },
  //二维码扫描
  scanCodeAction: function () {
    scanCode()
  },
  bannerScroll(e) {
    let scrollLeft = e.detail.scrollLeft,
      _ratio = this.data._ratio
    this.setData({
      bannerNowLeft: scrollLeft * _ratio
    })
  },
  bannerChangeAction: function (event) {
    this.setData({
      bannerSelectName: this.data.banners && this.data.banners[event.detail.current] && this.data.banners[event.detail.current].img_url
    })
  },
  //底部资质
  zizhiAction: function () {
    if (this.data.zizhiInfo) {
      pushNavigation('receive_h5', {
        value: this.data.zizhiInfo.link
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const that = this;
    let res = wx.getMenuButtonBoundingClientRect();
    if(res && res.top&& res.height&&res.left){
      console.log('存在getMenuButtonBoundingClientRect')
      this.setLayout(res)
    }
    var query = wx.createSelectorQuery();
    query.select('#topColumn').boundingClientRect();
    query.exec(function(res){
      if(res&&res[0]&&res[0].height){
        that.setData({
          topHeight:res[0].height
        })
      }
    })
  },
  //邀请有奖
  gotoInvite() {
    if (isLogin()) {
      pushNavigation('yyyj')
    } else {
      this.data.inviteFlag = true;
      pushNavigation('get_author_login')
    }
  },
  mainScroll: function (event) {
    //邀请有奖相关
    if (!this.data.hasMove) {
      this.data.hasMove = true;
      this.setData({
        hasMove: true
      })
    }
    let _this = this;
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = null;
    }
    this.scrollEndTimer = setTimeout(function () {
      _this.data.hasMove = true;
      _this.setData({
        hasMove: false
      })
    }, 300);

    //头部搜索框 动画相关
    let scrollTop = event.detail.scrollTop;
    this.data.scrollTop = scrollTop;
    if (scrollTop > 20 && !this.data.fixed) {
      this.setData({
        fixed: true
      })
    } else if (scrollTop <= 20 && this.data.fixed) {
      this.setData({
        fixed: false
      })
    }
    if (scrollTop > 80 && !this.data.hotwordFixed) {
      this.setData({
        hotwordFixed: true,
        topScrollHeight: this.data.topScrollHeight + 77
      })
    } else if (scrollTop <= 80 && this.data.hotwordFixed) {
      this.setData({
        hotwordFixed: false,
        topScrollHeight: this.data.topScrollHeight - 77
      })
    }
  },
  //触摸开始
  handletouchstart: function (event) {
    this.refreshView.handletouchstart(event)
  },
  //触摸移动
  handletouchmove: function (event) {
    if (this.data.showTop && this.data.scrollTop < 15) {
      this.data.showTop = false;
    }
    if (this.data.scrollTop < 15) {
      this.refreshView.handletouchmove(event)
    }

  },
  //触摸结束
  handletouchend: function (event) {
    this.refreshView.handletouchend(event)
  },
  //触摸取消
  handletouchcancel: function (event) {
    this.refreshView.handletouchcancel(event)
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.requestAllData()
  },
  _pullState: function () {

  },
  onshowTop: function () {
    this.data.showTop = true;
  },
  //请求首页所有数据
  requestAllData() {
    indexApi.getIndexData().then(res => {
      setTimeout(() => {
        this.refreshView && this.refreshView.stopPullRefresh();
      }, 1000)

      if (!res || res.length == 0) {
        return
      }
      this.dealAllData(res)
    }, err => {
      setTimeout(() => {
        this.refreshView && this.refreshView.stopPullRefresh();
      }, 1000)
    })
  },
  //处理首页所有数据
  dealAllData(data) {
    let allData
    data.map(item => {
      if (item.name === "app-home-hand_2" && item.data && item.data.length != 0) {
        this.setData({
          hotWordSearch: item.data
        })
      } else if (item.name === "app-home-bgimage" && item.data && item.data.length != 0) {
        this.setData({
          hatAndWordsBg: item.data
        })
      } else if (item.name === "index_data" && item.data && item.data.length != 0) {
        item.data = item.data.map(mm=>{
          mm.xcx_show='1';
          return mm
        })
        allData = item.data.map(item => {
          //金刚区
          if (item.widgettype === '15' ) {
            let _jgqBgInfo = {}
            if (item.data_dtcodeno && item.data_dtcodeno.length != 0) {
              let _jgqdata = item.data_dtcodeno[0];
              _jgqBgInfo = {
                jgqBg: _jgqdata.img_url || "",
                jgqHeight: _jgqdata.img_height || "",
                jgqWidth: _jgqdata.img_width || "",
                oldData: _jgqdata
              }
            } else {
              _jgqBgInfo = {
                jgqBg: "",
                jgqHeight: "",
                jgqWidth: "",
                oldData: {}
              }
            }
            _jgqBgInfo.data = (item.data && item.data.length != 0 && item.data) || [];
            _jgqBgInfo.xcx_show = item.xcx_show;
            let bannerNowWidth, _ratio
            if (item.data && item.data.length > 10) {
              let _datalen = Math.ceil(item.data.length / 2),
                totallen = (141.334 * _datalen);
              bannerNowWidth = (750 / totallen) * 133.334;
              _ratio = 133.334 / totallen * (750 / this.data.windowWidth); //滚动列表长度与滑条长度比例
            }
            this.data._ratio = _ratio;
            this.setData({
              jgqInfo: _jgqBgInfo,
              bannerNowWidth,
            })
          } else if (item.widgettype === '14' ) { //轮播广告
            let _bannerBgData = {};
            if (item.data_dtcodeno && item.data_dtcodeno.length != 0) {
              _bannerBgData = item.data_dtcodeno[0];
            }
            this.setData({
              banners: (item.data && item.data.length != 0 && item.data) || [],
              _bannerBgData: _bannerBgData,
              bannerSelectName: item.data && item.data.length != 0 && item.data[0].img_url || ""
            })
          } else if (item.widgettype === '18' ) { //霸屏广告
            this.setData({
              bpgg: (item.data && item.data.length != 0 && item.data) || [],
            })
          } else if (item.widgettype === '11' ) { //秒杀  限时优惠
            if (item.imgurl) {
              item.imgurl = (item.imgurl).indexOf('http') == -1 ? config.cdn_url + item.imgurl : item.imgurl;
              item.imgurl = tcpImage(item.imgurl);
            }
            let msDataItem = [];
            if (item.data && item.data.length != 0 && item.data[0].items && item.data[0].items.length != 0) {
              let _data = item.data[0].items;
              msDataItem = _data.map(j => {
                j.intro_image = (j.intro_image).indexOf('http') == -1 ? config.cdn_url + j.intro_image : j.intro_image;
                j.intro_image = tcpImage(j.intro_image);
                j.price = j.price && parseFloat(j.price).toFixed(2) || "";
                return j;
              })
            }
            item.msDataItem = msDataItem;
            this.setData({
              msData: item
            })
          } else if (item.widgettype === '16' ) { //1拖2
            if (item.dh_imgurl) {
              item.dh_imgurl = (item.dh_imgurl).indexOf('http') == -1 ? config.cdn_url + item.dh_imgurl : item.dh_imgurl
            }
            this.setData({
              oneWithTwoData: item
            })
          } else if (item.widgettype === '17' ) { //1拖1
            this.setData({
              couponData: item
            })
          } else if (item.widgettype === '19' ) { //9.9元秒杀
            if (item.dh_imgurl) {
              item.dh_imgurl = (item.dh_imgurl).indexOf('http') == -1 ? config.cdn_url + item.dh_imgurl : item.dh_imgurl
            }
            let groupWorkDataItem = [];
            if (item.data && item.data.length != 0 && item.data[0].items && item.data[0].items.length != 0) {
              let _data = item.data[0].items;
              groupWorkDataItem = _data.map(j => {
                j.intro_image = (j.intro_image).indexOf('http') == -1 ? config.cdn_url + j.intro_image : j.intro_image;
                j.intro_image = tcpImage(j.intro_image);
                j.price = j.price && parseFloat(j.price).toFixed(2) || "";
                return j;
              })
            }
            item.groupWorkDataItem = groupWorkDataItem;
            this.setData({
              groupWorkData: item
            })
          } else if (item.widgettype === '20' ) { //背景商品广告
            let barBgData = {};
            if (item.data_bgcodeno && item.data_bgcodeno.length != 0) {
              barBgData = item.data_bgcodeno[0];
            }
            let barDataItem = [];
            if (item.data && item.data.length != 0 && item.data[0].items && item.data[0].items.length != 0) {
              let _data = item.data[0].items;
              barDataItem = _data.map(j => {
                j.intro_image = (j.intro_image).indexOf('http') == -1 ? config.cdn_url + j.intro_image : j.intro_image;
                j.price = j.price && parseFloat(j.price).toFixed(2) || "";
                return j;
              })
            }
            item.barDataItem = barDataItem;
            this.setData({
              barData: item,
              barBgData,
            })
          } else if (item.widgettype === '26' ) { //限时福利
            if (item.imgurl) {
              item.imgurl = (item.imgurl).indexOf('http') == -1 ? config.cdn_url + item.imgurl : item.imgurl
            }
            let welfareDatatem = [];
            if (item.data && item.data.length != 0 && item.data[0].items && item.data[0].items.length != 0) {
              let _data = item.data[0].items;
              welfareDatatem = _data.map(j => {
                j.intro_image = (j.intro_image).indexOf('http') == -1 ? config.cdn_url + j.intro_image : j.intro_image;
                j.intro_image = tcpImage(j.intro_image);
                j.price = j.price && parseFloat(j.price).toFixed(2) || "";
                return j;
              })
            }
            item.welfareDatatem = welfareDatatem;
            this.setData({
              welfareData: item
            })
          } else if (item.widgettype === '21' ) { //瀑布流
            let _headData = [],
              // _left = this.data.waterfall_list_left_height,
              // _right = this.data.waterfall_list_right_height,
              _left = [],
              _right = [],
              _wration = this.data.wratio,
              _leftData = this.data.waterfall_leftData,
              _rightData = this.data.waterfall_rightData;
            if (item.data && item.data.length != 0) {
              _headData = item.data;
              _headData[0].checked = true;
              _headData = _headData.map((k, kindex) => {
                _leftData[kindex] = [];
                _rightData[kindex] = [];
                if (k.items && k.items.length != 0) {
                  k.items.map(m => {
                    if ((m.widgettype == 23 || m.widgettype == 24) && m.data && m.data.length != 0) {
                      m.data.map(mm => {
                        let _h = mm.img_height || 530,
                          _w = mm.img_width || 342.666,
                          _ratio = _h / _w;
                        mm.height = 340 * _ratio;
                        mm.widgettype = m.widgettype;
                        mm.price = mm.price && parseFloat(mm.price).toFixed(2) || "";
                        _left[kindex] = _left[kindex] ? _left[kindex] : 0
                        _right[kindex] = _right[kindex] ? _right[kindex] : 0
                        if (_left[kindex] <= _right[kindex]) {
                          _left[kindex] += (mm.height * _wration);
                          _leftData[kindex].push(mm)
                        } else {
                          _right[kindex] += (mm.height * _wration);
                          _rightData[kindex].push(mm)
                        }
                      })
                    } else if ((m.widgettype == 22 || m.widgettype == 25) && m.items && m.items.length != 0) {
                      m.items.map(nn => {
                        nn.widgettype = m.widgettype;

                        nn.price = nn.price && parseFloat(nn.price).toFixed(2) || "";
                        if (nn.intro_image) {
                          nn.intro_image = (nn.intro_image).indexOf('http') == -1 ? config.cdn_url + nn.intro_image : nn.intro_image
                          nn.intro_image = tcpImage(nn.intro_image);
                        }
                        if (m.imgurl) {
                          nn.imgurl = (m.imgurl).indexOf('http') == -1 ? config.cdn_url + m.imgurl : m.imgurl
                        }
                        _left[kindex] = _left[kindex] ? _left[kindex] : 0
                        _right[kindex] = _right[kindex] ? _right[kindex] : 0
                        if (_left[kindex] <= _right[kindex]) {
                          _left[kindex] += (446.666 * _wration);
                          _leftData[kindex].push(nn)
                        } else {
                          _right[kindex] += (446.666 * _wration);
                          _rightData[kindex].push(nn)
                        }
                      })
                    }
                  })
                }
                return k;
              })
            }
            //this.data.waterfall_list_left_height = _left;
            //this.data.waterfall_list_right_height = _right;
            this.setData({
              welfareHeaderData: _headData,
              waterfall_leftData: _leftData,
              waterfall_rightData: _rightData,
            })
          }
          return item
        })
      }
    })
    wx.setStorage({
      data: allData,
      key: 'allData',
    })
    this.setData({
      firstrequtFlag: true,
      allData,
    })
  },
  //授权相关信息
  getSettingInfo: function () {
    var that = this
    wx.getSetting({
      withSubscriptions: true,
      success: (res) => {
        console.log('用户授权信息====' + JSON.stringify(res))
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '使用定位服务，推荐附近商家',
            success: function (res) {
              if (res.cancel) {

              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      that.getLocation()
                    }
                  }
                })
              }
            }
          })
        } else {
          //调用wx.getLocation的API
          that.getLocation()
        }
      }
    })
  },
  getLocation: function () {
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        app.globalData.latitude = latitude
        app.globalData.longitude = longitude
        that.getLocal(latitude, longitude)
      },
      fail: function (res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  //邀请有奖拖拽
  inviteMove(e) {
    var that = this;
    var position = [e.touches[0].pageX - 25, e.touches[0].pageY - 25];
    that.setData({
      write: position
    });
  },
  //邀请有奖拖拽结束
  inviteOver() {
    let _write = this.data.write,
      direction;
    if (_write[0] && _write[0] >= this.data.windowWidth / 2) {
      _write = [this.data.windowWidth - 50, _write[1]]
      direction = 'right';
    } else {
      _write = [0, _write[1]];
      direction = 'left';
    }
    this.setData({
      write: _write,
      direction,
    })
    app.globalData.inviteInfo = {
      write: _write,
      direction,
    }
  },
  getLocal: function (a, b) {
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'ZeLblGvuygUn1o0bHFYDGRn1y9vCdyt1'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      let addressInfo = data.originalData.result,
        _address = addressInfo.formatted_address;
      app.globalData.city = addressInfo.addressComponent.city
      app.globalData.longitude = addressInfo.location.lng
      app.globalData.latitude = addressInfo.location.lat
      app.globalData.address = addressInfo.formatted_address
      if (addressInfo.pois && addressInfo.pois.length != 0) {
        _address = addressInfo.pois[0].name || ""
      }
      that.setData({
        locationInfo: _address,
        // city: addressInfo.addressComponent.city,
      });
      publicApi.getRegionID(data.originalData.result.addressComponent.city).then(res => {
        if(!res || res == null){
          log.info('获取region_id====='+JSON.stringify(data.originalData))
        }
        app.globalData.region_id = (res &&res!=null && res.id) || 95;
      })
    }
    // 发起regeocoding检索请求 
    BMap.regeocoding({
      fail: fail,
      success: success,
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _write = app.globalData.inviteInfo.write,
      that = this;
    if (_write.length == 0) {
      this.data.derction = app.globalData.inviteInfo.direction
      this.setData({
        write: [that.data.windowWidth - 50, that.data.windowHeight * 3 / 4],
      })
    } else {
      this.data.derction = app.globalData.inviteInfo.direction
      this.setData({
        write: _write,
      })
    }
    wx.getStorage({
      key: 'tabBarHeight',
      success: res => {
        if (res.data) {
          this.setData({
            tabbarHeight: 0
          })
        }
      }
    })
    let modal = this.selectComponent("#authentication");
    if (!isLogin()) {
      this.data.waterfallFlag = false;
      this.data.oneWithTwoFlag = false;
      this.data.couponLeftFlag = false;
      this.data.turnFlag = false;
      this.data.bannerClickActionFlag = false;
      this.data.bpFlag = false;
      this.data.inviteFlag = false;
    } else {
      upadataTabBarCount()
      if (app.globalData.certificationFlag) {
        app.globalData.certificationFlag = false;
        userCenterApi.getUserAccountInfo().then(res => {
          if (!res || res.dict_bool_certification != 1) {
            modal.setData({
              isShow: true,
            })
          } else {
            app.globalData.certification = res.dict_bool_certification;
            modal.setData({
              isShow: false,
            })
          }
        })
      }
      //邀请有奖登录之后跳转
      if (this.data.inviteFlag) {
        pushNavigation('yyyj')
        this.data.inviteFlag = false;
      }
      //霸屏跳转
      if (this.data.bpFlag) {
        this.data.bpFlag = false;
        let _data = this.data.bpData;
        indexApi.getAuthUrl(_data.value).then(res => {
          pushNavigation(_data.type, {
            name: _data.name || "",
            value: encodeURIComponent(res.auth_url),
            share: encodeURIComponent(_data.share),
            needToken: 0,
          })
        })
      }
      //轮播登录完成后跳转
      if (this.data.bannerClickActionFlag) {
        this.bannerClickAction(this.data.bannerClickActionInfo)
        this.data.bannerClickActionFlag = false;
      }
      //金刚区登陆完成执行
      if (this.data.turnFlag) {
        this.menuClickAction(this.data.turnInfo);
        this.data.turnFlag = false;
      }
      //1拖1广告
      if (this.data.couponLeftFlag) {
        this.couponLeft(this.data.couponLeftInfo);
        this.data.couponLeftFlag = false;
      }
      //1拖2广告
      if (this.data.oneWithTwoFlag) {
        this.oneWithTwoClick(this.data.oneWithTwoInfo);
        this.data.oneWithTwoFlag = false;
      }
      //瀑布流点击
      if (this.data.waterfallFlag) {
        this.oneWithTwoClick(this.data.waterfallInfo);
        this.data.waterfallFlag = false;
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //this.selectComponent("#promptView").hideModal()
    app.globalData.preRoute = 'get_home';
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
})