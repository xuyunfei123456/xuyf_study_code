import { HealthHuiApi,UserCenterApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js';
import {
  config
} from '../../../../config.js';
import {
  isLogin,
  isNotEmpty,
} from '../../../../utils/YFWPublicFunction.js'
const healthHuiApi = new HealthHuiApi();
const userCenterApi=new UserCenterApi();
var app = getApp();
Page({
  data: {
    pageIndex:1,
    hasData:true,
    _left:0,
    _right:0,
    requestFlag:true,
    firstRequestOver:false,
    healthHuiData: [],//首页所有数据
    _bannerBgData: {}, //轮播背景图相关数据
    banners: [], //轮播背景图
    oneWithTwoData: {}, //1拖2广告相关数据
    hotTopicData: {}, //热门话题相关数据
    hotTopicTitle: "",//热门话题头部
    hotTopicContent: [],//热门话题内容
    bannerSelectName: '', //轮播图默认第一张
    waterfall_leftData: [], //瀑布流左侧数据
    waterfall_rightData: [], //瀑布流右侧数据
    list:[],//瀑布流总数据
    waterfall_index: 0, //瀑布流默认index
    waterfall_list_left_height: [], //左侧总高度
    waterfall_list_right_height: [], //右侧总高度
    bannerSelectName: '', //轮播图默认第一张
    _account_img_url:'',//头像图片
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let sysInfo = wx.getSystemInfoSync() || {};
    this.data.wratio = sysInfo.windowWidth / 750;
    healthHuiApi.getHomeData().then((res) => {
      if (!res || res.length == 0) {
        return;
      }
      this.dealAllData(res)
    }, (err) => { 
    })
  },
    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.waterfall_leftData = [];//瀑布流左侧数据
    this.data.waterfall_rightData=[];//瀑布流右侧数据
    this.data._left = 0;
    this.data._right=0;
    this.data.list = [];
    healthHuiApi.getHomeData().then((res) => {
      if (!res || res.length == 0) {
        return
      }
      this.dealAllData(res)
      wx.stopPullDownRefresh()
    }, (err) => { 
      wx.stopPullDownRefresh()
    })
  },
  // 处理首页所有数据
  dealAllData(data) {
    let allData
    data.map((item) => {
      if (item.name == "index_data" && item.data && item.data.length != 0) {
        item.data = item.data.map((mm) => {
          mm.xcx_show = "1";
          return mm
        })
        allData = item.data.map((adItem) => {
          // 轮播图
          if (adItem.widgettype === "14") {
            let _bannerBgData = {}
            _bannerBgData = adItem
            this.setData({
              _bannerBgData: _bannerBgData,
              banners: adItem.data && adItem.data.length != 0 && adItem.data || [],
              bannerSelectName: adItem.data && adItem.data.length != 0 && adItem.data[0].img_url || ""
            })
          } else if (adItem.widgettype === "16") { //1拖2
            this.setData({
              oneWithTwoData: adItem
            })
          } else if (adItem.widgettype === "28") { //热门话题
            this.setData({
              hotTopicData: adItem,
              hotTopicTitle: adItem.navname || "",
              hotTopicContent: adItem.data || []
            })
          } else if (adItem.widgettype === "21") { //健康汇瀑布流数据
            this.waterFallDeal(adItem);
          }
          return adItem;
        })
      }
    })
    wx.setStorage({
      data: allData,
      key: 'allData'
    })
    this.setData({
      healthHuiData: allData,
      firstRequestOver:true
    })
  },
  waterFallDeal(adItem){
    let _left = this.data._left,
    _right = this.data._right,
    _list,
    _leftData = this.data.waterfall_leftData,
    _rightData = this.data.waterfall_rightData,
    _wration = this.data.wratio;
  if (adItem.data && adItem.data.length != 0) {
    adItem.data.map((o) => {
      if (o.items && o.items.length!=0) {
        o.items.map((m) => {
          if ((m.widgettype == 23 || m.widgettype == 24) && m.data && m.data.length != 0) { //视频和图片广告位
            m.data.map((mm) => {
              let _h = mm.img_height || 530,
                _w = mm.img_width || 342.667,
                _ratio = _h / _w;
              mm.height = _ratio * 340;
              mm.widgettype = m.widgettype;
              mm.price = mm.price && parseFloat(mm.price).toFixed(2) || "";
              if (_left <= _right) {
                _left += (mm.height * _wration);
                _leftData.push(mm)
              } else {
                _right += (mm.height * _wration);
                _rightData.push(mm)
              }
            })
          } else if ((m.widgettype == 22) && m.items && m.items.length != 0) {//普通商品和盖图商品
            m.items.map((nn) => {
              nn.widgettype = m.widgettype;
              nn.price = nn.price && parseFloat(nn.price).toFixed(2) || "";
              nn.intro_image = (nn.intro_image).indexOf("http") == -1 ? config.cdn_url + nn.intro_image : nn.intro_image;
              if (_left <= _right) {
                _left += (446.666 * _wration);
                _leftData.push(nn)
              } else {
                _right += (446.666 * _wration);
                _rightData.push(nn)
              }
            })
          } else if ((m.widgettype == 27) && m.data && m.data.length != 0) { //文章类型
            if(m.is_page && m.is_page == 1){
              this.data.is_page = true;
              this.data.number = m.number;
              this.data.topic_name = m.topic_name;
            }
            m.data.map(((jj) => {
              let _data = jj.data;
              _data.height = 516;
              jj.widgettype = m.widgettype;
              _data.update_time = _data.update_time.substr(0, 10);
              _data.upload_img = (_data.upload_img) && (_data.upload_img).indexOf("http") == -1 ? config.cdn_url + _data.upload_img : _data.upload_img;
              if (_left <= _right) {
                _left += (_data.height * _wration);
                _leftData.push(jj)
              } else {
                _right += (_data.height * _wration);
                _rightData.push(jj)
              }
            }))
          }
        })
      }else{
        console.log(111111)
        this.data.requestFlag = false;
      }
    })
  }
  _list=[..._leftData,..._rightData];
  this.data._left = _left;
  this.data._right = _right;
  this.setData({
    waterfall_leftData: _leftData,
    waterfall_rightData: _rightData,
    list:_list,
    hasData:this.data.is_page ? true:false
  })
  },
  bannerChangeAction(event) {
    this.setData({
      bannerSelectName: this.data.banners && this.data.banners[event.detail.current] && this.data.banners[event.detail.current].img_url
    })
  },
  //点击顶部搜索
  searchAction() {
    wx.navigateTo({
      url: '/myCenter/pages/YFWUserCenterModule/HealthHuiSearchPage/HealthHuiSearch'
    })
  },
  // 轮播图点击
  bannerClickAction(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4);
    if (info.is_login == '1' && !isLogin()) {
      this.data.bannerClickActionFlag = true;
      this.data.bannerClickActionInfo = event;
      pushNavigation('get_author_login');
      return
    }
    if (info) {
      info.needToken = (info.type == 'get_h5' && info.is_login == '1' && newStr != 'aspx') ? 1 : 0;
      pushNavigation(info.type, info)
    }
  },
  // 1拖2点击
  oneWithTwoClick(event) {
    let info = event.currentTarget.dataset.info,
      newStr = info.value.substring(info.value.length - 4)
    if (info.is_login == "1" && !isLogin()) {
      this.data.oneWithTwoFlag = true;
      this.data.oneWithTwoInfo = event;
      pushNavigation('get_author_login')
      return
    }
    if (info) {
      info.needToken = (info.type == 'get_h5' && info.is_login == '1' && newStr != 'aspx') ? 1 : 0;
      pushNavigation(info.type, info)
    }
  },
  // 热词点击
  goHotTopicClick(event) {
    let info = event.currentTarget.dataset.info;
    if(info && typeof(info) === 'object'){
      app.requestName=info.name || '';
      app.requestId=info.id || '';
      pushNavigation('health_hui_hot_topic')
    }else if(info){
      app.requestName=info || '';
      app.requestId='';
      pushNavigation('health_hui_hot_topic')
    }

  },
  // 瀑布流点击
  waterfallClick(event){
    let info=event.currentTarget.dataset.info;
    if(info&&info.widgettype=="27"){
      pushNavigation(info.type,info)
    }else if(info&&info.widgettype=="22"){
     info.value=info.value ? info.value : info.id ? info.id : "";
      pushNavigation(info.type,info)
    }else if(info&&(info.widgettype=="23" || info.widgettype=="24")){
      if(info.is_login=='1'&&!isLogin()){
        this.data.waterfallFlag=true;
        this.data.waterfallInfo=event;
        pushNavigation('get_author_login')
        return
      }else{
        info.needToken=(info.type=="get_h5" && info.is_login=="1") ? 1 : 0;
        pushNavigation(info.type,info)
      }
    }
  },
  getData(){
    userCenterApi.getAccountHeaderInfo().then((response) =>{
      let _data=response;
      if(isNotEmpty(_data)){
         if(_data.account_img_url&&_data.account_img_url.length>0){
          let _account_img_url=_data.account_img_url
          this.setData({
            _account_img_url
          })
        }
      }

    })
  },
    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(!this.data.requestFlag)return;
    this.data.requestFlag = false;
    this.getNextdata();
  },
  getNextdata(){
    let param = {
      topicName:this.data.topic_name,
      pageIndex:this.data.pageIndex,
      pageSize:this.data.number || 10,
    }
    healthHuiApi.getHotTopicArticleInfo(param).then(res=>{
      let _wration = this.data.wratio;
        if(res.dataList && res.dataList.length!=0){
          let _left = this.data._left,
              _right = this.data._right,
              _leftData = this.data.waterfall_leftData,
              _rightData = this.data.waterfall_rightData;
          res.dataList.map(((jj) => {
            let _data = jj;
            _data.height = 516;
            jj.widgettype = 27;
            _data.update_time = _data.update_time.substr(0, 10);
            _data.upload_img = (_data.upload_img) && (_data.upload_img).indexOf("http") == -1 ? config.cdn_url + _data.upload_img : _data.upload_img;
            if (_left <= _right) {
              _left += (_data.height * _wration);
              _leftData.push({data:jj,widgettype:27})
            } else {
              _right += (_data.height * _wration);
              _rightData.push({data:jj,widgettype:27})
            }
          }))
          let _list=[..._leftData,..._rightData];
          this.setData({
            waterfall_leftData: _leftData,
            waterfall_rightData: _rightData,
            list:_list,
            hasData:res.dataList.length == (this.data.number || 10) ? true:false
          },()=>{
            this.data.requestFlag = true;
          })
          ++this.data.pageIndex
        }else{
          this.setData({
            hasData:false
          })
        }
    },err=>{
      this.data.requestFlag = true;
    })
  },
  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () { },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    if (!isLogin()) {
      this.data.oneWithTwoFlag = false;
      this.data.bannerClickActionFlag = false;
      this.data.waterfallFlag=false;
    } else {
      //轮播登录完成后跳转
      if (this.data.bannerClickActionFlag) {
        this.bannerClickAction(this.data.bannerClickActionInfo)
        this.data.bannerClickActionFlag = false;
      }
      //1拖2广告
      if (this.data.oneWithTwoFlag) {
        this.oneWithTwoClick(this.data.oneWithTwoInfo);
        this.data.oneWithTwoFlag = false;
      }
      //瀑布流
      if(this.data.waterfallFlag){
        this.waterfallClick(this.data.waterfallInfo);
        this.data.waterfallFlag=false;
      }
    }
    this.getData();
  },
  /**
 * 生命周期函数--监听页面隐藏
 */
  onHide: function () {
  },
})
