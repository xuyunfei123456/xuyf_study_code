import Taro, { Component, Config } from "@tarojs/taro";
import {
  Block,
  ScrollView,
  View,
  Image,
  Text,
  Swiper,
  SwiperItem,
} from "@tarojs/components";
// pages/YFWHomeFindModule/YFWHomePage/YFWHome.js
import {
  IndexApi,
  PublicApi,
  MessageApi,
  UserCenterApi,
} from "../../../apis/index.js";
import { BaseApi } from "../../../apis/base.js";
const userCenterApi = new UserCenterApi();
import {
  tcpImage,
  isLogin,
  upadataTabBarCount,
  isEmpty,
  getAppSystemConfig,
} from "../../../utils/YFWPublicFunction.js";
const indexApi = new IndexApi();
const publicApi = new PublicApi();
const messageApi = new MessageApi();
const baseApi = new BaseApi();
import { categoryArray } from "./category.js";
import { getItemModel } from "./../../../components/GoodsItemView/model/YFWGoodsItemModel.js";
import { pushNavigation } from "../../../apis/YFWRouting.js";
import { scanCode } from "../../../utils/YFWScanCode.js";
import { config } from "../../../config.js";
import Yfwwaterfallgoods from "../../../components/YfwWaterfallGoods/YfwWaterfallGoods";
import Yfwnormalgoods from "../../../components/YfwNormalGoods/YfwNormalGoods";
import Authentication from "../../../components/YFMauthentication/YFMauthentication";
import PromptView from "../../../components/YFWPromptView/YFWPromptView";
import YfwMessageRedPointView from "../../../components/YFWMessageRedPointView/YFWMessageRedPointView";
import YfwPriceView from "../../../components/YFWPriceView/YFWPriceView";
import YfwTitleView from "../../../components/YFWTitleView/YFWTitleView";
import {
  set as setGlobalData,
  get as getGlobalData,
} from "../../../global_data";
import "./YFWHome.scss";
const bmap = require("../../../libs/bmap-taro.js");
export default class YFWHome extends Component {
  config = {
    enablePullDownRefresh: true,
    transparentTitle: "always",
    defaultTitle: "",
    titlePenetrate: "YES",
    navigationStyle:'custom',
    pullRefresh:"false",
  };
  /**
   * 页面的初始数据
   */

  constructor(props) {
    super(props);
    this.state = {
      allData: [],
      miniAppName: "药房网商城",
      windowHeight: "",
      screenWidth: "", //设备屏幕宽度
      windowWidth: "", //小程序窗口宽度
      locationInfo: "", //定位的地址
      ads_itemImage: "", //邀请有奖的图片
      zizhiInfo: "", //底部资质相关信息
      jgqInfo: "", //金刚区相关数据
      bpgg: [], //霸屏广告
      bannerNowWidth: "", //金刚区指示器存在时 当前长度
      _ratio: "", //滚动列表长度与滑条长度比例
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
      bannerSelectName: "", //轮播图默认第一张
      tabbarHeight: 0,
      recommendTop: 0,
      recommendTopFixed: false,
    };
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount() {
    this.scrollTop = 0;
    let sysInfo = Taro.getSystemInfoSync();
    Taro.setStorageSync("system_info", sysInfo);
    this.state.screenWidth = sysInfo.screenWidth;
    this.state.windowWidth = sysInfo.windowWidth;
    this.state.windowHeight = sysInfo.windowHeight;
    this.state.wratio = sysInfo.windowWidth / 750;
    console.log(sysInfo.brand)
    let diff = sysInfo.brand && sysInfo.brand.indexOf('iPhone') !=-1 ? 0 : 10
    this.state.statusBarHeight = sysInfo.statusBarHeight; //状态栏
    this.state.titleBarHeight = sysInfo.titleBarHeight; //标题栏
    this.state.topScrollHeight = sysInfo.windowHeight-sysInfo.statusBarHeight- sysInfo.titleBarHeight-150*this.state.wratio-diff;
    this.state.searchFixedHeight = sysInfo.statusBarHeight+(sysInfo.titleBarHeight-66.666*this.state.wratio)/2;
    this.state.fixHeight = sysInfo.statusBarHeight+sysInfo.titleBarHeight+20*this.state.wratio
    this.setState({
      topScrollHeight:this.state.topScrollHeight,
      searchFixedHeight:this.state.searchFixedHeight
    })
    const that = this;
    this.getLocation();
    indexApi.getZizhiData().then(
      (result) => {
        if (result.imageurl.indexOf("http://c1.yaofangwang.net") > -1) {
          result.imageurl = result.imageurl.replace("http", "https");
        }
        this.setState({
          zizhiInfo: result,
        });
      },
      (error) => {}
    );
    getAppSystemConfig().then(
      (info) => {
        setGlobalData("appSystemConfig", info);
        if (info && info.ads_item && info.ads_item.image) {
          this.setState({
            ads_itemImage: info.ads_item.image,
          });
        }
      },
      (error) => {}
    );
  }
  componentDidMount() {
    this.requestAllData();
  }
  waterfallHeadClick(event) {
    let index = event.currentTarget.dataset.index;
    if (index == this.state.waterfall_index) return;
    this.state.waterfall_index = index;
    this.setState({
      waterfall_index: index,
    });
  }
  fullscreenchange(e) {
    this.setState({
      scrollTop: this.state.scrollTop,
    });
  }
  //热词点击
  hotwordClick(event) {
    let info = event.currentTarget.dataset.info;
    if (info.type == "get_search") {
      info.value = "";
      info._value = info.name;
    }
    pushNavigation(info.type, info);
  }
  //瀑布流点击
  waterfallClick(event) {
    let info = event.currentTarget.dataset.info;
    info.value = info.value ? info.value : info.id ? info.id : "";
    if (info.is_login == "1" && !isLogin()) {
      this.state.waterfallFlag = true;
      this.state.waterfallInfo = event;
      pushNavigation("get_author_login");
      return;
    }
    if (info) {
      info.needToken = info.type == "get_h5" && info.is_login == "1" ? 1 : 0;
      pushNavigation(info.type, info);
    }
  }
  //瀑布流视频点击
  waterfallVideoClick(info) {
    info.type = info.widgettype == 24 ? 'video_play' : info.type
    pushNavigation(info.type, { value: info.value });
  }
  //1拖2广告
  oneWithTwoClick(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == "1" && !isLogin()) {
      this.state.oneWithTwoFlag = true;
      this.state.oneWithTwoInfo = event;
      pushNavigation("get_author_login");
      return;
    }
    if (info) {
      info.needToken =
        info.type == "get_h5" && info.is_login == "1" && newStr != "aspx"
          ? 1
          : 0;
      pushNavigation(info.type, info);
    }
  }
  //1拖1广告
  couponLeft(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == "1" && !isLogin()) {
      this.state.couponLeftFlag = true;
      this.state.couponLeftInfo = event;
      pushNavigation("get_author_login");
      return;
    }
    if (info) {
      info.needToken =
        info.type == "get_h5" && info.is_login == "1" && newStr != "aspx"
          ? 1
          : 0;
      pushNavigation(info.type, info);
    }
  }
  //金刚区点击事件
  menuClickAction(event) {
    let info = event.currentTarget.dataset.info;
    if (info.is_login == "1" && !isLogin()) {
      //暂存临时任务 登陆完成之后回来完成
      this.state.turnFlag = true;
      this.state.turnInfo = event;
      pushNavigation("get_author_login");
      return;
    }
    if (info.name.includes("签")) {
      publicApi.getSignUrl().then(
        (result) => {
          info.value = result.sign_url;
          info.type = "receive_h5";
          pushNavigation(info.type, info);
        },
        (error) => {}
      );
    } else if (info.name.includes("批发")) {
      Taro.showToast({
        title: "正在开发中，敬请期待",
        icon: "none",
        duration: 1000,
      });
    } else if (info.name.includes("领券")) {
      publicApi.getCouponUrl().then(
        (result) => {
          info.value = result.coupon_url;
          info.type = "receive_h5";
          pushNavigation(info.type, info);
        },
        (error) => {}
      );
    } else {
      info.index = 0;
      info.needToken = info.is_login == "1" ? 1 : 0;
      info.type = info.name == "邀请有奖" ? "yyyj" : info.type;
      pushNavigation(info.type, info);
    }
  }
  //秒杀商品点击
  msGoodClick(e) {
    let _data = e.currentTarget.dataset.info || "";
    pushNavigation(_data.type, {
      value: _data.id,
    });
  }
  groupWorkClick(e) {
    let _data = e.currentTarget.dataset.info || "";
    pushNavigation(_data.type, {
      value: _data.id,
    });
  }
  //轮播点击
  bannerClickAction(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == "1" && !isLogin()) {
      this.state.bannerClickActionFlag = true;
      this.state.bannerClickActionInfo = event;
      pushNavigation("get_author_login");
      return;
    }
    if (info) {
      info.needToken =
        info.type == "get_h5" && info.is_login == "1" && newStr != "aspx"
          ? 1
          : 0;
      pushNavigation(info.type, info);
    }
  }
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
        });
      } else {
        this.state.bpFlag = true;
        this.state.bpData = _data;
        pushNavigation("get_author_login");
      }
    } else {
      pushNavigation(_data.type, {
        name: _data.name || "",
        url: encodeURIComponent(_data.value),
        share: encodeURIComponent(_data.share),
        value: _data.value,
      });
    }
  }
  //点击顶部搜索
  searchAction() {
    pushNavigation("get_search", { showSpecification: 1 });
  }
  //二维码扫描
  scanCodeAction() {
    scanCode();
  }
  bannerScroll(e) {
    let scrollLeft = e.detail.scrollLeft,
      _ratio = this.state._ratio;
    this.setState({
      bannerNowLeft: scrollLeft * _ratio,
    });
  }
  bannerChangeAction(event) {
    this.setState({
      bannerSelectName:
        this.state.banners &&
        this.state.banners[event.detail.current] &&
        this.state.banners[event.detail.current].img_url,
    });
  }
  //底部资质
  zizhiAction() {
    if (this.state.zizhiInfo) {
      pushNavigation("receive_h5", {
        value: this.state.zizhiInfo.link,
      });
    }
  }
  //邀请有奖
  gotoInvite() {
    if (isLogin()) {
      pushNavigation("yyyj");
    } else {
      this.state.inviteFlag = true;
      pushNavigation("get_author_login");
    }
  }
  mainScroll(event) {
    //邀请有奖相关
    if (!this.state.hasMove) {
      this.state.hasMove = true;
      this.setState({
        hasMove: true,
      });
    }
    let _this = this;
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
      this.scrollEndTimer = null;
    }
    this.scrollEndTimer = setTimeout(function () {
      _this.state.hasMove = true;
      _this.setState({
        hasMove: false,
      });
    }, 300);

    //头部搜索框 动画相关
    let scrollTop = event.detail.scrollTop;
    this.state.scrollTop = scrollTop;
    this.scrollTop = scrollTop 
    if (scrollTop > 20 && !this.state.fixed) {
      this.setState({
        fixed: true,
      });
    } else if (scrollTop <= 20 && this.state.fixed) {
      this.setState({
        fixed: false,
      });
    }
    if (scrollTop > 80 && !this.state.hotwordFixed) {
      this.setState({
        hotwordFixed: true,
        topScrollHeight: this.state.topScrollHeight + 77,
      });
    } else if (scrollTop <= 80 && this.state.hotwordFixed) {
      this.setState({
        hotwordFixed: false,
        topScrollHeight: this.state.topScrollHeight - 77,
      });
    }
    if (this.state.recommendTop == 0) {
      this.state.recommendTop = null;
      var that = this;
      var query = Taro.createSelectorQuery();
      query.select("#recommend").boundingClientRect();
      query.exec(function (res) {
        if (
          res === null ||
          res.length < 1 ||
          res[0] === null ||
          res[0].top === null ||
          res[0].top === undefined
        ) {
          return;
        }
        that.state.recommendTop =res[0].top -that.state.titleBarHeight-that.state.statusBarHeight-164*that.state.wratio

      });
    }
    if (
      this.state.recommendTop > 0 &&
      !this.state.recommendTopFixed &&
      scrollTop >= this.state.recommendTop
    ) {
      this.setState({
        recommendTopFixed: true,
      });
    } else if (
      this.state.recommendTop > 0 &&
      this.state.recommendTopFixed &&
      scrollTop < this.state.recommendTop
    ) {
      this.setState({
        recommendTopFixed: false,
      });
    }
  }
  //下拉刷新
  onPullDownRefresh() {
    this.requestAllData();
  }
  onshowTop() {
    this.setState({
      showTop: true,
    });
  }
  //请求首页所有数据
  requestAllData() {
    indexApi.getIndexData().then(
      (res) => {
        if (!res || res.length == 0) {
          return;
        }
        this.dealAllData(res);
      },
      (err) => {}
    );
  }
  //处理首页所有数据
  dealAllData(data) {
    let allData;
    data.map((item) => {
      if (
        item.name === "app-home-hand_2" &&
        item.data &&
        item.data.length != 0
      ) {
        this.setState({
          hotWordSearch: item.data,
        });
      } else if (
        item.name === "app-home-bgimage" &&
        item.data &&
        item.data.length != 0
      ) {
        this.setState({
          hatAndWordsBg: item.data,
        });
      } else if (
        item.name === "index_data" &&
        item.data &&
        item.data.length != 0
      ) {
        allData = item.data.map((item) => {
          //金刚区
          if (item.widgettype === "15" && item.xcx_show === "1") {
            let _jgqBgInfo = {};
            if (item.data_dtcodeno && item.data_dtcodeno.length != 0) {
              let _jgqdata = item.data_dtcodeno[0];
              _jgqBgInfo = {
                jgqBg: _jgqdata.img_url || "",
                jgqHeight: _jgqdata.img_height || "",
                jgqWidth: _jgqdata.img_width || "",
                oldData: _jgqdata,
              };
            } else {
              _jgqBgInfo = {
                jgqBg: "",
                jgqHeight: "",
                jgqWidth: "",
                oldData: {},
              };
            }
            _jgqBgInfo.data =
              (item.data && item.data.length != 0 && item.data) || [];
            _jgqBgInfo.xcx_show = item.xcx_show;
            let bannerNowWidth, _ratio;
            if (item.data && item.data.length > 10) {
              let _datalen = Math.ceil(item.data.length / 2),
                totallen = 141.334 * _datalen;
              bannerNowWidth = (750 / totallen) * 133.334;
              _ratio = (133.334 / totallen) * (750 / this.state.windowWidth); //滚动列表长度与滑条长度比例
            }
            this.setState({
              jgqInfo: _jgqBgInfo,
              bannerNowWidth,
              _ratio,
            });
          } else if (item.widgettype === "14" && item.xcx_show === "1") {
            //轮播广告
            let _bannerBgData = {};
            if (item.data_dtcodeno && item.data_dtcodeno.length != 0) {
              _bannerBgData = item.data_dtcodeno[0];
            }
            this.setState({
              banners: (item.data && item.data.length != 0 && item.data) || [],
              _bannerBgData: _bannerBgData,
              bannerSelectName:
                (item.data && item.data.length != 0 && item.data[0].img_url) ||
                "",
            });
          } else if (item.widgettype === "18" && item.xcx_show === "1") {
            //霸屏广告
            this.setState({
              bpgg: (item.data && item.data.length != 0 && item.data) || [],
            });
          } else if (item.widgettype === "11" && item.xcx_show === "1") {
            //秒杀  限时优惠
            if (item.imgurl) {
              item.imgurl =
                item.imgurl.indexOf("http") == -1
                  ? config.cdn_url + item.imgurl
                  : item.imgurl;
              item.imgurl = tcpImage(item.imgurl);
            }
            let msDataItem = [];
            if (
              item.data &&
              item.data.length != 0 &&
              item.data[0].items &&
              item.data[0].items.length != 0
            ) {
              let _data = item.data[0].items;
              msDataItem = _data.map((j) => {
                j.intro_image =
                  j.intro_image.indexOf("http") == -1
                    ? config.cdn_url + j.intro_image
                    : j.intro_image;
                j.intro_image = tcpImage(j.intro_image);
                j.price = (j.price && parseFloat(j.price).toFixed(2)) || "";
                return j;
              });
            }
            item.msDataItem = msDataItem;
            this.setState({
              msData: item,
            });
          } else if (item.widgettype === "16" && item.xcx_show === "1") {
            //1拖2
            if (item.dh_imgurl) {
              item.dh_imgurl =
                item.dh_imgurl.indexOf("http") == -1
                  ? config.cdn_url + item.dh_imgurl
                  : item.dh_imgurl;
            }
            this.setState({
              oneWithTwoData: item,
            });
          } else if (item.widgettype === "17" && item.xcx_show === "1") {
            //1拖1
            this.setState({
              couponData: item,
            });
          } else if (item.widgettype === "19" && item.xcx_show === "1") {
            //9.9元秒杀
            if (item.dh_imgurl) {
              item.dh_imgurl =
                item.dh_imgurl.indexOf("http") == -1
                  ? config.cdn_url + item.dh_imgurl
                  : item.dh_imgurl;
            }
            let groupWorkDataItem = [];
            if (
              item.data &&
              item.data.length != 0 &&
              item.data[0].items &&
              item.data[0].items.length != 0
            ) {
              let _data = item.data[0].items;
              groupWorkDataItem = _data.map((j) => {
                j.intro_image =
                  j.intro_image.indexOf("http") == -1
                    ? config.cdn_url + j.intro_image
                    : j.intro_image;
                j.intro_image = tcpImage(j.intro_image);
                j.price = (j.price && parseFloat(j.price).toFixed(2)) || "";
                return j;
              });
            }
            item.groupWorkDataItem = groupWorkDataItem;
            this.setState({
              groupWorkData: item,
            });
          } else if (item.widgettype === "20" && item.xcx_show === "1") {
            //背景商品广告
            let barBgData = {};
            if (item.data_bgcodeno && item.data_bgcodeno.length != 0) {
              barBgData = item.data_bgcodeno[0];
            }
            let barDataItem = [];
            if (
              item.data &&
              item.data.length != 0 &&
              item.data[0].items &&
              item.data[0].items.length != 0
            ) {
              let _data = item.data[0].items;
              barDataItem = _data.map((j) => {
                j.intro_image =
                  j.intro_image.indexOf("http") == -1
                    ? config.cdn_url + j.intro_image
                    : j.intro_image;
                j.price = (j.price && parseFloat(j.price).toFixed(2)) || "";
                return j;
              });
            }
            item.barDataItem = barDataItem;
            this.setState({
              barData: item,
              barBgData,
            });
          } else if (item.widgettype === "26" && item.xcx_show === "1") {
            //限时福利
            if (item.imgurl) {
              item.imgurl =
                item.imgurl.indexOf("http") == -1
                  ? config.cdn_url + item.imgurl
                  : item.imgurl;
            }
            let welfareDatatem = [];
            if (
              item.data &&
              item.data.length != 0 &&
              item.data[0].items &&
              item.data[0].items.length != 0
            ) {
              let _data = item.data[0].items;
              welfareDatatem = _data.map((j) => {
                j.intro_image =
                  j.intro_image.indexOf("http") == -1
                    ? config.cdn_url + j.intro_image
                    : j.intro_image;
                j.intro_image = tcpImage(j.intro_image);
                j.price = (j.price && parseFloat(j.price).toFixed(2)) || "";
                return j;
              });
            }
            item.welfareDatatem = welfareDatatem;
            this.setState({
              welfareData: item,
            });
          } else if (item.widgettype === "21" && item.xcx_show === "1") {
            //瀑布流
            let _headData = [],
              // _left = this.state.waterfall_list_left_height,
              // _right = this.state.waterfall_list_right_height,
              _left = [],
              _right = [],
              _wration = this.state.wratio,
              _leftData = this.state.waterfall_leftData,
              _rightData = this.state.waterfall_rightData;
            if (item.data && item.data.length != 0) {
              _headData = item.data;
              _headData[0].checked = true;
              _headData = _headData.map((k, kindex) => {
                _leftData[kindex] = [];
                _rightData[kindex] = [];
                if (k.items && k.items.length != 0) {
                  k.items.map((m) => {
                    if (
                      (m.widgettype == 23 || m.widgettype == 24) &&
                      m.data &&
                      m.data.length != 0
                    ) {
                      m.data.map((mm) => {
                        let _h = mm.img_height || 530,
                          _w = mm.img_width || 342.666,
                          _ratio = _h / _w;
                        mm.height = 340 * _ratio;
                        mm.widgettype = m.widgettype;
                        mm.price =
                          (mm.price && parseFloat(mm.price).toFixed(2)) || "";
                        _left[kindex] = _left[kindex] ? _left[kindex] : 0;
                        _right[kindex] = _right[kindex] ? _right[kindex] : 0;
                        if (_left[kindex] <= _right[kindex]) {
                          _left[kindex] += mm.height * _wration;
                          _leftData[kindex].push(mm);
                        } else {
                          _right[kindex] += mm.height * _wration;
                          _rightData[kindex].push(mm);
                        }
                      });
                    } else if (
                      (m.widgettype == 22 || m.widgettype == 25) &&
                      m.items &&
                      m.items.length != 0
                    ) {
                      m.items.map((nn) => {
                        nn.widgettype = m.widgettype;

                        nn.price =
                          (nn.price && parseFloat(nn.price).toFixed(2)) || "";
                        if (nn.intro_image) {
                          nn.intro_image =
                            nn.intro_image.indexOf("http") == -1
                              ? config.cdn_url + nn.intro_image
                              : nn.intro_image;
                          nn.intro_image = tcpImage(nn.intro_image);
                        }
                        if (m.imgurl) {
                          nn.imgurl =
                            m.imgurl.indexOf("http") == -1
                              ? config.cdn_url + m.imgurl
                              : m.imgurl;
                        }
                        _left[kindex] = _left[kindex] ? _left[kindex] : 0;
                        _right[kindex] = _right[kindex] ? _right[kindex] : 0;
                        if (_left[kindex] <= _right[kindex]) {
                          _left[kindex] += 446.666 * _wration;
                          _leftData[kindex].push(nn);
                        } else {
                          _right[kindex] += 446.666 * _wration;
                          _rightData[kindex].push(nn);
                        }
                      });
                    }
                  });
                }
                return k;
              });
            }
            this.setState({
              welfareHeaderData: _headData,
              waterfall_leftData: _leftData,
              waterfall_rightData: _rightData,
            });
          }
          return item;
        });
      }
    });
    this.setState({
      firstrequtFlag: true,
      allData,
    });
  }
  getLocation() {
    let that = this;
    Taro.getLocation({
      type: "wgs84",
      success: function (res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        var speed = res.speed;
        var accuracy = res.accuracy;
        setGlobalData("latitude", latitude);
        setGlobalData("longitude", longitude);
        setGlobalData("city", res.province);
        publicApi.getAddressByLatAndLng({'lat':latitude,'lng':longitude}).then(res=>{
          if(res){
            that.setState({
              locationInfo:res
            })
          }
        }).catch(error=>{
          console.log(error)
        })
      },
      fail: (res) => {
        console.log(res);
      },
    }).catch((err) => {
      console.log(err);
    });
  }
  //手动选择地址
  chooseaddRess(){
    let that = this;
    Taro.chooseLocation({
      success: function (res) {
        setGlobalData("address", res.address);
        that.setState({
          locationInfo: res.address,
        });
      },
      fail: (res) => {
        console.log(res);
      },
    }).catch((err) => {
      console.log(err);
    });
  }
  /**
   * 生命周期函数--监听页面显示
   */
  componentDidShow() {
    Taro.getStorage({
      key: "tabBarHeight",
      success: (res) => {
        if (res.data) {
          this.setState({
            tabbarHeight: 0,
          });
        }
      },
    });
    //let modal = this.selectComponent('#authentication')
    if (!isLogin()) {
    } else {
      upadataTabBarCount();
      // if (app.globalData.certificationFlag) {
      //   app.globalData.certificationFlag = false
      //   userCenterApi.getUserAccountInfo().then(res => {
      //     if (!res || res.dict_bool_certification != 1) {
      //       modal.setData({
      //         isShow: true
      //       })
      //     } else {
      //       app.globalData.certification = res.dict_bool_certification
      //       modal.setData({
      //         isShow: false
      //       })

      //     }
      //   })
      // }
      //邀请有奖登录之后跳转
      if (this.state.inviteFlag) {
        pushNavigation("yyyj");
        this.state.inviteFlag = false;
      }
      //霸屏跳转
      if (this.state.bpFlag) {
        this.state.bpFlag = false;
        let _data = this.state.bpData;
        indexApi.getAuthUrl(_data.value).then((res) => {
          pushNavigation(_data.type, {
            name: _data.name || "",
            value: encodeURIComponent(res.auth_url),
            share: encodeURIComponent(_data.share),
            needToken: 0,
          });
        });
      }
      //轮播登录完成后跳转
      if (this.state.bannerClickActionFlag) {
        this.bannerClickAction(this.state.bannerClickActionInfo);
        this.state.bannerClickActionFlag = false;
      }
      //金刚区登陆完成执行
      if (this.state.turnFlag) {
        this.menuClickAction(this.state.turnInfo);
        this.state.turnFlag = false;
      }
      //1拖1广告
      if (this.state.couponLeftFlag) {
        this.couponLeft(this.state.couponLeftInfo);
        this.state.couponLeftFlag = false;
      }
      //1拖2广告
      if (this.state.oneWithTwoFlag) {
        this.oneWithTwoClick(this.state.oneWithTwoInfo);
        this.state.oneWithTwoFlag = false;
      }
      //瀑布流点击
      if (this.state.waterfallFlag) {
        this.oneWithTwoClick(this.state.waterfallInfo);
        this.state.waterfallFlag = false;
      }
    }
  }

  /**
   * 生命周期函数--监听页面隐藏
   */
  componentDidHide() {
    //this.selectComponent("#promptView").hideModal()
    setGlobalData("preRoute", "get_home");
  }
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: config.share_title,
      imageUrl: config.share_image_url,
    };
  }

  render() {
    const {
      statusBarHeight,
      titleBarHeight,
      locationInfo,
      fixed,
      topsearchWidth,
      hotwordFixed,
      hotWordSearch,
      scrollTop,
      topScrollHeight,
      allData,
      jgqInfo,
      bannerNowWidth,
      bannerNowLeft,
      _bannerBgData,
      banners,
      bannerSelectName,
      msData,
      welfareData,
      oneWithTwoData,
      groupWorkData,
      barBgData,
      barData,
      couponData,
      recommendTopFixed,
      fixHeight,
      welfareHeaderData,
      waterfall_index,
      waterfall_leftData,
      waterfall_rightData,
      zizhiInfo,
      firstrequtFlag,
      tabbarHeight,
      hasMove,
      ads_itemImage,
      searchFixedHeight,
    } = this.state;
    let _statusBarHeight=statusBarHeight+22;
    return (
      <Block>
        <View className="navbar">
          <View
            className="nameAndAddress"
            style={"padding-top:" + statusBarHeight + "px;height:" + titleBarHeight + "px;"}
          >
            <Image
              className="logo"
              src={require("../../../images/logoname.png")}
            ></Image>
            <View className="line"></View>
            <Image
              onClick={this.chooseaddRess}
              className="top_content_left_icon"
              mode="aspectFit"
              src={require("../../../images/sy_location_icon.png")}
            ></Image>
            {!fixed && (
              <View className="address" onClick={this.chooseaddRess}>
                {locationInfo}
              </View>
            )}
          </View>
        </View>
        <View className="searchWrapper">
          <View
            onClick={this.searchAction}
            className={"top_search " + (fixed ? "animationSearch" : "")}
            style={
              "top:" +
              (fixed ? searchFixedHeight : "") +
              "px;width:" +
              (fixed ? '70%' : "")
            }
          >
            <Image
              className="top_search_left_icon"
              src={require("../../../images/top_bar_search.png")}
            ></Image>
            <Text className="top_search_title">
              批准文号、通用名、商品名、症状
            </Text>
            <View className="top_search_right" onClick={this.scanCodeAction}>
              <Image
                className="top_search_scan"
                src={require("../../../images/qr_sys.png")}
              ></Image>
            </View>
          </View>
        </View>
        {!hotwordFixed && (
          <View className="hotWordWrapper">
            <View style="margin: 0 20rpx">
              {!hotwordFixed && (
                <ScrollView
                  className="hotWord"
                  enableFlex="true"
                  scrollX="true"
                >
                  {hotWordSearch.map((item, index) => {
                    return (
                      <Block key={item.name}>
                        <View
                          className="hotwordSin"
                          onClick={this.hotwordClick}
                          data-info={item}
                        >
                          {item.img_url && (
                            <Image
                              src={item.img_url}
                              style={
                                "height:" +
                                (item.img_height / 3) * 2 +
                                "rpx;width:" +
                                (item.img_width / 3) * 2 +
                                "rpx"
                              }
                            ></Image>
                          )}
                          {!item.img_url && (
                            <View
                              style={
                                "color:" +
                                (!item.backgroundcolor
                                  ? "white"
                                  : item.backgroundcolor)
                              }
                            >
                              {item.name}
                            </View>
                          )}
                        </View>
                      </Block>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
        )}
        <ScrollView
          scrollY="true"
          onScroll={this.mainScroll}
          style={
            "width:100%;height:" +
            topScrollHeight +
            "px;-webkit-overflow-scrolling: touch;background-color:white"
          }
          className="scroll"
        >
          {allData.map((item, index) => {
            return (
              <Block key={"a+" + index}>
                {item.widgettype == 18 && item.xcx_show === "1" && (
                  <Block>
                    {item.data && item.data[0] && item.data[0].img_url && (
                      <View
                        className="bpgg"
                        onClick={this.bpggClick}
                        data-postdata={item.data[0]}
                        style={
                          "margin-top:" +
                          (item.data[0].top || 10) +
                          "rpx;margin-bottom:" +
                          item.data[0].bottom +
                          "rpx"
                        }
                      >
                        <Image
                          className="bpggImg"
                          mode="widthFix"
                          src={item.data[0].img_url}
                        ></Image>
                      </View>
                    )}
                  </Block>
                )}
                {item.widgettype == 15 &&
                  item.xcx_show === "1" &&
                  jgqInfo.xcx_show && (
                    <View
                      className="activityJgq"
                      style={
                        "margin-top:" +
                        (item.top || 10) +
                        "rpx;margin-bottom:" +
                        item.bottom +
                        "rpx"
                      }
                    >
                    {jgqInfo.jgqBg && <Image className="jgqbg" src={jgqInfo.jgqBg}></Image>}
                      <View className="jgq_scroll_wrapper">
                        <ScrollView
                          className="jgq_icon_wrapper"
                          enableFlex={true}
                          scrollX="true"
                          onScroll={this.bannerScroll}
                        >
                          {jgqInfo.data.map((m, index) => {
                            return (
                              <Block>
                                <View
                                  className="jgq_single_menu"
                                  onClick={this.menuClickAction}
                                  data-info={m}
                                >
                                  <Image
                                    src={m.img_url}
                                    className="jgq_single_menu_size"
                                  ></Image>
                                  <View
                                    className="jgq_single_menu_name"
                                    style={
                                      "color:" +
                                      (jgqInfo.jgqBg
                                        ? m.backgroundcolor
                                          ? m.backgroundcolor
                                          : "#666666"
                                        : "#666666")
                                    }
                                  >
                                    {m.name}
                                  </View>
                                </View>
                              </Block>
                            );
                          })}
                        </ScrollView>
                      </View>
                      <View className="bannerIndexWrapper">
                        <View className="bannerIndex">
                          <View
                            className="bannerIndex_now"
                            style={
                              "width:" +
                              bannerNowWidth +
                              "rpx;margin-left:" +
                              bannerNowLeft +
                              "rpx"
                            }
                          ></View>
                        </View>
                      </View>
                    </View>
                  )}
                {item.widgettype == 14 && item.xcx_show === "1" && (
                  <Block>
                    {banners && banners.length != 0 && (
                      <View
                        className="banner"
                        style={
                          "margin-top:" +
                          (item.top || 20) +
                          "rpx;margin-bottom:" +
                          (item.bottom || 0) +
                          "rpx"
                        }
                      >
                        {_bannerBgData.img_url && (
                          <Image
                            mode="widthFix"
                            src={_bannerBgData.img_url}
                            className="bannerBgData"
                          ></Image>
                        )}
                        <View className="bannerContainer">
                          <Swiper
                            className="banner_container"
                            onChange={this.bannerChangeAction}
                            circular="true"
                            indicatorDots={false}
                            autoplay={true}
                            interval={2000}
                            duration={100}
                          >
                            {banners.map((m, index) => {
                              return (
                                <Block key={m.img_url}>
                                  <SwiperItem>
                                    <Image
                                      src={m.img_url}
                                      mode="widthFix"
                                      className="banner_content"
                                      data-info={m}
                                      onClick={this.bannerClickAction}
                                    ></Image>
                                  </SwiperItem>
                                </Block>
                              );
                            })}
                          </Swiper>
                          <View className="banner_dots_container">
                            {banners.map((n, index) => {
                              return (
                                <Block key={n.img_url}>
                                  {bannerSelectName == n.img_url ? (
                                    <View className="banner_dots_select">
                                      <View className="banner_dots_select_one"></View>
                                      <View className="banner_dots_select_two"></View>
                                    </View>
                                  ) : (
                                    <View className="banner_dots"></View>
                                  )}
                                </Block>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    )}
                  </Block>
                )}
                {item.widgettype == 11 && item.xcx_show === "1" && (
                  <Block>
                    {msData &&
                      msData.msDataItem &&
                      msData.msDataItem.length != 0 && (
                        <View
                          className="msWrapper"
                          style={
                            "margin-top:" +
                            (item.top || 20) +
                            "rpx;margin-bottom:" +
                            item.bottom +
                            "rpx"
                          }
                        >
                          <View className="ms_img_wrapper">
                            <Image
                              src={msData.imgurl}
                              className="ms_img"
                            ></Image>
                            <View className="msGoodsWrapper">
                              <ScrollView
                                enableFlex={true}
                                scrollX="true"
                                className="msGoodsScroll"
                              >
                                {msData &&
                                  msData.msDataItem.map((u, index) => {
                                    return (
                                      <Block>
                                        <Yfwnormalgoods
                                          imgWrapperHeight="158.666"
                                          img={u.intro_image}
                                          name={u.name}
                                          key={u.name}
                                          price={u.price}
                                        ></Yfwnormalgoods>
                                      </Block>
                                    );
                                  })}
                                <View className="white"></View>
                              </ScrollView>
                            </View>
                          </View>
                        </View>
                      )}
                  </Block>
                )}
                {item.widgettype == 26 && item.xcx_show === "1" && (
                  <Block>
                    {welfareData && welfareData.welfareDatatem.length != 0 && (
                      <View
                        className="msWrapper"
                        style={
                          "margin-top:" +
                          (item.top || 20) +
                          "rpx;margin-bottom:" +
                          item.bottom +
                          "rpx"
                        }
                      >
                        <View className="ms_img_wrapper">
                          <Image
                            src={welfareData.imgurl}
                            className="ms_img"
                          ></Image>
                          <View className="msGoodsWrapper">
                            <ScrollView
                              enableFlex={true}
                              scrollX="true"
                              className="msGoodsScroll"
                            >
                              {welfareData &&
                                welfareData.welfareDatatem.map(
                                  (k, index) => {
                                    return (
                                      <Block key={k.name}>
                                        <View
                                          className="msGood"
                                          onClick={this.msGoodClick}
                                          data-info={k}
                                        >
                                          <Yfwnormalgoods
                                            imgWrapperHeight="158.666"
                                            img={k.intro_image}
                                            name={k.name}
                                            price={k.price}
                                          ></Yfwnormalgoods>
                                        </View>
                                      </Block>
                                    );
                                  }
                                )}
                              <View className="white"></View>
                            </ScrollView>
                          </View>
                        </View>
                      </View>
                    )}
                  </Block>
                )}
                {item.widgettype == 16 && item.xcx_show === "1" && (
                  <Block>
                    {oneWithTwoData.data && oneWithTwoData.data.length != 0 && (
                      <View
                        className="oneWithTwo"
                        style={
                          "margin-top:" +
                          (item.top ||0) +
                          "rpx;margin-bottom:" +
                          item.bottom +
                          "rpx"
                        }
                      >
                        <View className="oneWithTwo_wrapper">
                          {oneWithTwoData.name && (
                            <View className="oneWithTwo_nameRow">
                              <View className="oneWithTwo_name">
                                {oneWithTwoData.name}
                              </View>
                              {oneWithTwoData.dh_imgurl && (
                                <Image
                                  mode="widthFix"
                                  src={oneWithTwoData.dh_imgurl}
                                  className="oneWithTwo_icon"
                                ></Image>
                              )}
                            </View>
                          )}
                          <View
                            className="oneWithTwo_content"
                            style={
                              "margin-top:" +
                              (oneWithTwoData.name ? null : 40) +
                              "rpx"
                            }
                          >
                            <View
                              className="oneWithTwo_content_left"
                              onClick={this.oneWithTwoClick}
                              data-info={oneWithTwoData.data[0]}
                            >
                              <Image
                                className="oneWithTwo_content_left_img"
                                src={
                                  oneWithTwoData.data &&
                                  oneWithTwoData.data[0] &&
                                  oneWithTwoData.data[0].img_url
                                }
                              ></Image>
                            </View>
                            <View className="oneWithTwo_content_right">
                              <View
                                className="oneWithTwo_content_right_top"
                                onClick={this.oneWithTwoClick}
                                data-info={oneWithTwoData.data[1]}
                              >
                                <Image
                                  className="oneWithTwo_content_right_top_img"
                                  src={
                                    oneWithTwoData.data &&
                                    oneWithTwoData.data[1] &&
                                    oneWithTwoData.data[1].img_url
                                  }
                                ></Image>
                              </View>
                              <View
                                className="oneWithTwo_content_right_bottom"
                                onClick={this.oneWithTwoClick}
                                data-info={oneWithTwoData.data[2]}
                              >
                                <Image
                                  className="oneWithTwo_content_right_bottom_img"
                                  src={
                                    oneWithTwoData.data &&
                                    oneWithTwoData.data[2] &&
                                    oneWithTwoData.data[2].img_url
                                  }
                                ></Image>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </Block>
                )}
                {item.widgettype == 19 && item.xcx_show === "1" && (
                  <Block>
                    {groupWorkData.groupWorkDataItem &&
                      groupWorkData.groupWorkDataItem.length != 0 && (
                        <View
                          className="groupWork"
                          style={
                            "margin-top:" +
                            (item.top || 0) +
                            "rpx;margin-bottom:" +
                            item.bottom +
                            "rpx"
                          }
                        >
                          <View className="groupWork_wrapper">
                            <View className="groupWork_wrapper_nameRow">
                              <View className="groupWork_wrapper_name">
                                {groupWorkData.name}
                              </View>
                            </View>
                            <View className="groupWork_content">
                              <ScrollView
                                enableFlex={true}
                                scrollX="true"
                                className="msGoodsScroll"
                              >
                                {groupWorkData.groupWorkDataItem.map(
                                  (s, index) => {
                                    return (
                                      <Block>
                                        <View
                                          className="groupWork_good"
                                          onClick={this.groupWorkClick}
                                          data-info={s}
                                          key={s.name}
                                        >
                                          <Yfwnormalgoods
                                            imgWrapperHeight="158.666"
                                            img={s.intro_image}
                                            name={s.name}
                                            price={s.price}
                                          ></Yfwnormalgoods>
                                        </View>
                                      </Block>
                                    );
                                  }
                                )}
                                <View className="white"></View>
                              </ScrollView>
                            </View>
                          </View>
                        </View>
                      )}
                  </Block>
                )}
                {item.widgettype == 20 && item.xcx_show === "1" && (
                  <Block>
                    {barData.barDataItem && barData.barDataItem.length != 0 && (
                      <View
                        className="barWrapper"
                        style={
                          "margin-top:" +
                          item.top +
                          "rpx;margin-bottom:" +
                          item.bottom +
                          "rpx"
                        }
                      >
                        <View className="barWrapper_head">
                          {barBgData.img_url && (
                            <View className="barWrapper_head_imgWrapper">
                              <Image
                                src={barBgData.img_url}
                                mode="widthFix"
                                className="barWrapper_head_img"
                              ></Image>
                            </View>
                          )}
                          <View className="barWrapper_content">
                            {barData.barDataItem.map((item, index) => {
                              return (
                                <Block>
                                  <View
                                    className="barWrapper_good"
                                    key={item.name}
                                  >
                                    <Yfwnormalgoods
                                      imgWrapperHeight="158.666"
                                      img={item.intro_image}
                                      name={item.name}
                                      price={item.price}
                                    ></Yfwnormalgoods>
                                  </View>
                                </Block>
                              );
                            })}
                          </View>
                        </View>
                      </View>
                    )}
                  </Block>
                )}
                {item.widgettype == 17 && item.xcx_show === "1" && (
                  <Block>
                    <View
                      className="coupon"
                      style={
                        "margin-top:" +
                        (item.top || 0) +
                        "rpx;margin-bottom:" +
                        item.bottom +
                        "rpx"
                      }
                    >
                      <View className="coupon_wrapper">
                        <View className="coupon_wrapper_nameRow">
                          <View className="coupon_wrapper_name">
                            {couponData.name}
                          </View>
                        </View>
                        <View className="coupon_content">
                          <View
                            className="coupon_left"
                            onClick={this.couponLeft}
                            data-info={couponData.data[0]}
                          >
                            <Image
                              className="coupon_left_img"
                              src={
                                couponData.data &&
                                couponData.data[0] &&
                                couponData.data[0].img_url
                              }
                            ></Image>
                          </View>
                          <View
                            className="coupon_right"
                            onClick={this.couponLeft}
                            data-info={couponData.data[1]}
                          >
                            <Image
                              className="coupon_right_img"
                              src={
                                couponData.data &&
                                couponData.data[1] &&
                                couponData.data[1].img_url
                              }
                            ></Image>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Block>
                )}
                {item.widgettype == 21 && item.xcx_show === "1" && (
                  <Block>
                    {welfareHeaderData && welfareHeaderData.length != 0 && (
                      <View
                        className="waterfall"
                        style={
                          "margin-top:" +
                          (item.top || 20) +
                          "rpx;margin-bottom:" +
                          item.bottom +
                          "rpx"
                        }
                      >
                        {recommendTopFixed && (
                          <View className="waterfull_scroll"></View>
                        )}
                        <ScrollView
                          scrollX="true"
                          enableFlex="true"
                          className={
                            "waterfull_scroll " +
                            (recommendTopFixed ? "fixed-top" : "")
                          }
                          id="recommend"
                          style={
                            "top:" + (recommendTopFixed ? fixHeight : 0) + "px"
                          }
                        >
                          {welfareHeaderData.map((k, index) => {
                            return (
                              <Block key={k.name}>
                                <View
                                  className="welfareHeader_name_out"
                                  onClick={this.waterfallHeadClick}
                                  data-index={index}
                                >
                                  <View className="welfareHeader_name_wrapper">
                                    <View
                                      className={
                                        "welfareHeader_name " +
                                        (index == waterfall_index
                                          ? "welfareHeader_name_checked"
                                          : "")
                                      }
                                      style={
                                        "color:" +
                                        (k.color ? k.color : "#333333")
                                      }
                                    >
                                      {k.name}
                                    </View>
                                    {index == waterfall_index && (
                                      <View className="welfareHeader_name_bottom"></View>
                                    )}
                                  </View>
                                </View>
                              </Block>
                            );
                          })}
                        </ScrollView>
                        <View className="waterfall_wrapper">
                          <View className="waterfall_list">
                            <View className="waterfall_list_left">
                              {waterfall_leftData[waterfall_index].map(
                                (h, index) => {
                                  return (
                                    <Block key={h.img_url}>
                                      {h.widgettype == 23 ? (
                                        <View
                                          className="leftlist noPadding"
                                          data-info={h}
                                          onClick={this.waterfallClick}
                                        >
                                          <Image
                                            src={h.img_url}
                                            style={
                                              "height:" +
                                              h.height +
                                              "rpx;width:100%;border-radius:14rpx"
                                            }
                                          ></Image>
                                        </View>
                                      ) : h.widgettype == 24 ? (
                                        <View
                                          className="leftlist noPadding"
                                          data-info={h}
                                          onClick={this.waterfallVideoClick.bind(this,h)}
                                          style={
                                            "height:" +
                                            h.height +
                                            "rpx;width:340rpx"
                                          }
                                        >
                                          <View
                                            className="videoWrapper"
                                            style={
                                              "height:" +
                                              h.height +
                                              "rpx;width:340rpx"
                                            }
                                          >
                                            <Image
                                              src={h.img_url}
                                              className="videoWrapper"
                                            ></Image>
                                            <Image
                                              className="playvideo"
                                              src={require("../../../images/playvedio.png")}
                                              data-info={h}
                                            ></Image>
                                          </View>
                                        </View>
                                      ) : (
                                        <View
                                          className="noraml_goods leftlist"
                                          data-info={h}
                                          onClick={this.waterfallClick}
                                        >
                                          <Yfwwaterfallgoods
                                            imgWrapperHeight="281.334"
                                            hasActivity="item.widgettype == 25 ? true:false"
                                            postdata={h}
                                          ></Yfwwaterfallgoods>
                                        </View>
                                      )}
                                    </Block>
                                  );
                                }
                              )}
                            </View>
                            <View className="waterfall_list_right">
                              {waterfall_rightData[waterfall_index].map(
                                (g, index) => {
                                  return (
                                    <Block key={g.img_url}>
                                      {g.widgettype == 23 ? (
                                        <View
                                          className="rightlist noPadding"
                                          data-info={g}
                                          onClick={this.waterfallClick}
                                        >
                                          <Image
                                            src={g.img_url}
                                            style={
                                              "height:" +
                                              g.height +
                                              "rpx;width:100%;border-radius:14rpx"
                                            }
                                          ></Image>
                                        </View>
                                      ) : g.widgettype == 24 ? (
                                        <View
                                          className="rightlist noPadding"
                                          data-info={g}
                                          onClick={this.waterfallVideoClick.bind(this,g)}
                                          style={
                                            "height:" +
                                            g.height +
                                            "rpx;width:340rpx"
                                          }
                                          id={"avideo" + index}
                                        >
                                          <View
                                            className="videoWrapper"
                                            style={
                                              "height:" +
                                              g.height +
                                              "rpx;width:340rpx"
                                            }
                                          >
                                            <Image
                                              src={g.img_url}
                                              className="videoWrapper"
                                            ></Image>
                                            <Image
                                              className="playvideo"
                                              src={require("../../../images/playvedio.png")}
                                              data-info={g}
                                            ></Image>
                                          </View>
                                        </View>
                                      ) : (
                                        <View
                                          className="rightlist noraml_goods"
                                          data-info={g}
                                          onClick={this.waterfallClick}
                                        >
                                          <Yfwwaterfallgoods
                                            imgWrapperHeight="281.334"
                                            hasActivity="g.widgettype == 25 ? true:false"
                                            postdata={g}
                                          ></Yfwwaterfallgoods>
                                        </View>
                                      )}
                                    </Block>
                                  );
                                }
                              )}
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </Block>
                )}
              </Block>
            )
          })}
          {firstrequtFlag && zizhiInfo.imageurl && (
            <Image
              className="bottom_ad"
       
              src={zizhiInfo.imageurl}
              onClick={this.zizhiAction}
            ></Image>
          )}
          {/*  占位  */}
          <View style={"height:" + tabbarHeight + "px;width:100%"}></View>
        </ScrollView>
        <View>
          <Authentication id="authentication"></Authentication>
        </View>
        <Image
          onClick={this.gotoInvite}
          className={hasMove ? "dis_ads_itemImage" : "ads_itemImage"}
          src={ads_itemImage}
        ></Image>
      </Block>
    );
  }
}
