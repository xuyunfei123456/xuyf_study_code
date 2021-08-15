// pages/YFWSellersListModule/YFWSellersListViewPage/YFWSellersListView.js
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  SaleComparePricesApi, ShopCarApi,UserCenterApi
} from '../../../apis/index.js'
import {
  YFWSellersListGoodsInfoModel
} from './model/YFWSellersListGoodsInfoModel.js'
import {
  YFWSellersShopInfoModel
} from './model/YFWSellersShopInfoModel.js'
const userCenterApi = new UserCenterApi()
const saleComparePricesApi = new SaleComparePricesApi()
const shopCarApi = new ShopCarApi()
var bmap = require('../../../libs/bmap-wx.js');
var app = getApp();
var log = require('../../../utils/log')
import { isLogin, safeObj,deepCopyObj, formatDateTime,addZero,getAppSystemConfig, isNotEmpty} from '../../../utils/YFWPublicFunction.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchFixed:false,
    provinceArray:[],
    note:{},
    showAllIntro:false,// 说明书展开判断删除，功能还在
    hasSpecification: false,
    specificationOrder: [
      '贮藏',
      '禁忌症',
      '性状',
      '用法用量',
      '药品名称',
    ],
    effectareaFlag:false,
    // 筛选
    a:[
      {
        index:0,
        value:0
      },
      {
        index:1,
        value:1
      },
      {
        index:2,
        value:2
      }
    ],
    _preferentialActivities:[],
    fakeObj:{},
    is_activity:0,
    is_coupons:0,
    period_type:0,
    discount:0,
    animationData: {},
    isShow:false,
    showAll: false,
    ktxWindowHeight:null,
    remainingValidity:[
      {
        index:0,
        name:'180天-1年',
        select:false,
        value:1
      },
      {
        index:1,
        name:'1年以上',
        select:false,
        value:2
      },
      {
        index:2,
        name:'2年以上',
        select:false,
        value:3
      },
    ],
    preferentialActivities:[
      {
        index:0,
        name:'多买优惠',
         select:false,
         value:'discount'
      },
      {
        index:1,
        name:'满减优惠',
         select:false,
         value:'is_activity'
      },
      {
        index:2,
        name:'优惠券',
         select:false,
         value:'is_coupons'
      },
    ],
    areaData:[],
    //
    showChose: false,
    loadhidden: false,
    hidden: false,
    isScrollY: true,
    scrollTop: '',
    isPrice: true,
    isMR: true,
    isRank: true,
    isRankTwo: false,
    checkType: '',
    showView: false,

    showPrice: false,
    showDefault: false,
    bYS: [{
      value: '多件优惠',
      checked: false
    }],
    myPrices: [],
    goodsInfo: null,
    shopInfoArray: [],
    sameStoreGoodsArray:[],
    pageIndex: 1,
    currentPageIndex: 1,
    totalPage:1,
    goodsID: '',
    sort:'distance',
    sortType:'asc',
    isFreepostage:'0',
    isLogin:false,
    shopCarCount:0,
    goodsOriginInfo: {},
    lowPrice:"",
    highPrice:"",
    locationInfo:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(app.globalData.address){
      this.setData({locationInfo:app.globalData.address})
    }else{
      this.getLocal()
    }
    let sysInfo = wx.getSystemInfoSync()
    this.data.windowHeight = sysInfo.windowHeight
    var that = this;
    showView: (options.showView == "true" ? true : false)
    showDefault: (options.showDefault == "true" ? true : false)
    var params = {};

    try {
      let _param = options.params && decodeURIComponent(options.params)
      params = options.params && JSON.parse(_param) ;
    } catch (error) {
      if(!wx.getStorageInfoSync('settleinfo')){
        wx.setStorage({
          data: 'has',
          key: 'settleinfo',
        })
        log.info('decode信息==='+JSON.stringify(dic)+'catchinfo===='+error)
      }
    }
    let goodsID =params&& params.value || "";
    let goodsInfoData =params&& params.goodsInfoData || {};
    if (JSON.stringify(goodsInfoData)!='{}') {
      if (goodsInfoData.mill_title && !goodsInfoData.title) {
        goodsInfoData.title = goodsInfoData.mill_title
      }
      if (goodsInfoData.authorizedCode && !goodsInfoData.authorized_code) {
        goodsInfoData.authorized_code = goodsInfoData.authorizedCode
      }
      if (goodsInfoData.is_buy && !goodsInfoData.show_buy_button) {
        goodsInfoData.show_buy_button = goodsInfoData.is_buy == '1' ? 'true' : ''
      }
      goodsInfoData.image_list = [goodsInfoData.intro_image ? goodsInfoData.intro_image : goodsInfoData.introImage]
      if (goodsInfoData.namecn) {
        goodsInfoData.name_cn = goodsInfoData.namecn
      }
      this.dealGoodsInfoData(goodsInfoData)
    }
    this.data.goodsID = goodsID
    this.getInitData()
    this.requestShopcarCount()
    // that.getSameShopGoodsList()
    userCenterApi.getProvinceAndCityInfo(0).then((result) => {
      var result = result.map((item,index)=>{
        item.name = item.region_name;
        item.select = false;
        item.index = index;
        return item;
      })
      let areaData = [];
      if(result&&result.length>9){
        let copyObj = deepCopyObj(result)
        areaData = copyObj.slice(0,8);
        areaData.push({
          name:'查看全部...',
          isShowAll:true,
        })
      }
      this.setData({
        provinceArray: result || [],
        areaData:areaData.length == 0?result:areaData
      })
    }).then((error) => {

    })
    wx.getSystemInfo({
      success(res) {
        // px转换到rpx的比例
        let pxToRpxScale = 750 / res.windowWidth;
        // window的高度
        let ktxWindowHeight = res.windowHeight * pxToRpxScale - 200 + 'rpx';
        that.setData({
          ktxWindowHeight,
        })
      }
    })
  },
  getLocal: function () {
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'ZeLblGvuygUn1o0bHFYDGRn1y9vCdyt1'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      console.log(data)
      let addressInfo = data.originalData.result
      that.setData({
        locationInfo: addressInfo.formatted_address,
      });
    }
    // 发起regeocoding检索请求 
    BMap.regeocoding({
      fail: fail,
      success: success,
    });
  },
  //登录
  loginAction: function() {
    pushNavigation('get_author_login')
  },
  searchAction: function() {
    pushNavigation('get_search')
  },
  clickItemAction: function(event) {
    let info = event.currentTarget.dataset.info
    let originInfo = this.data.goodsOriginInfo
    
    let medicine = {
      id: info.shop_goods_id,
      price: info.price,
      price_desc: info.price_desc,
      discount: info.discount,
      dict_medicine_type: originInfo.dict_medicine_type,
      aliascn: originInfo.aliascn,
      namecn: originInfo.namecn,
      authorized_code: originInfo.authorized_code,
      authorizedCode_title: originInfo.authorizedCode_title,
      applicability: originInfo.applicability.replace(/<[^>]+>/g, "").replace(/(↵|\r|\n|&|=|\?)/g, "").trim(),
      scheduled_name: info.scheduled_name,
      image_list: originInfo.image_list,
      standard: originInfo.standard,
      troche_type: originInfo.troche_type,
      title: info.title,
      nameen: originInfo.nameen,
      py_namecn: originInfo.py_namecn,
      period: originInfo.period,
      period_to: info.period_to,
      buy_prompt_info: originInfo.buy_prompt_info,
      bentrusted_store_name: originInfo.bentrusted_store_name,
      rx_giude_url: originInfo.rx_giude_url,
      region: info.region,
      reserve: info.reserve,
      shipping_price: info.shipping_price,
      star: info.star,
      shop_id: info.shop_id,
      manufacturer: originInfo.title
    }
    console.log("商品信息", medicine)
    //pushNavigation('get_shop_goods_detail', { type: 'sellers', value: info.shop_goods_id, data: medicine})
    pushNavigation('get_shop_goods_detail', { value: info.shop_goods_id})
  },
  //购物车
  goShopCarAction: function(event) {
    pushNavigation('get_shopping_car')
  },
  //价格趋势
  priceTrendAction: function(event) {
    pushNavigation('get_price_trend',{value:this.data.goodsID})
  },
  //添加购物车
  addCarAction: function(event) {
    let id = event.currentTarget.dataset.id
    shopCarApi.addGoodsToShopCar(1,id).then((result)=>{
      wx.showToast({
        title: '添加成功',
      })
      let _arr = wx.getStorageSync('checkedArr') || [];
      _arr.push(id);
      wx.setStorageSync('checkedArr', _arr)
      this.requestShopcarCount()
    },error=>{
      if (error&&error.msg) {
        wx.showModal({
          content: error.msg,
          showCancel:false,
        })
      }
    })
  },
  // 点击同店购
  gosame: function() {
    if (this.data.showChose === false) {
      this.setData({
        showChose: true
      })
    } else {
      this.setData({
        showChose: false
      })
    }
  },
  getSameShopGoodsList: function() {
    saleComparePricesApi.getSameShopGoodsList().then((result)=>{
      console.log(result)
    }).then((error)=>{

    })
  },
  //选择药量
  onScale:function(){
    this.onscale.showModal()
  },
  isClosescal:function(event){
    this.onscale.hideModal()
    let index=event.currentTarget.dataset.index;
    let info = this.data.goodsInfo.standards[index]
    this.data.goodsID = info.id
    this.data.pageIndex = 1
    this.getInitData()
  },
  //选择商家
  onchose: function() {
    pushNavigation('get_chose_cerchant')
  },
  // 取消同店购、加入同店购
  onChangeShowState: function() {
    var that = this;
    // that.setData({
    //   showView: (!that.data.showView)
    // })

    if (!that.data.showView) {
      saleComparePricesApi.addGoodsToSameShop(this.data.goodsID).then((result) => {

      }).then((error) => {

      })
    } else {
      saleComparePricesApi.delectGoodsFromSameShop(this.data.goodsID).then((result) => {

      }).then((error) => {

      })
    }

  },
  //包邮
  checkboxChange: function(event) {
    console.log(event)
    this.data.isFreepostage = event.detail.value[0] == 'false'?'1':'0'
    this.data.pageIndex = 1
    this.getShopList()
  },
  // 显示隐藏默认按钮
  onChangeDefault: function() {
    var that = this;
    that.setData({
      showDefault: (!that.data.showDefault)
    })
  },
  // 显示隐藏价格升降
  onChangePrice: function() {
    var that = this;
    that.data.sort = 'sprice'
    that.data.sortType = that.data.showPrice ? 'asc' :'desc'
    that.data.pageIndex = 1
    that.setData({
      showPrice: (!that.data.showPrice)
    })
    that.getShopList()
  },
  // 点击显示隐藏默认列表
  onSelect: function(event) {
    var that = this;
    const id = event.currentTarget.dataset.id;
    if (id == that.data.checkType) {
      return
    };
    that.data.sort = event.currentTarget.dataset.sort
    that.data.sortType = event.currentTarget.dataset.sortType
    that.data.pageIndex = 1;
    that.setData({
      checkType: id,
      showDefault: id == '' ? that.data.showDefault : false,
      showPrice: id == '2' ? false: false,
      pageIndex:1
    })
    that.getShopList()
  },
  // 点击排序列表
  sortTypeAction: function(event) {
    var that = this;
    this.data.sort = event.currentTarget.dataset.sort
    this.data.sortType = event.currentTarget.dataset.sortType
    this.data.pageIndex = 1
    this.getShopList()
    that.setData({
      showDefault:false
    })
  },
  // 点击遮罩层关闭遮罩
  closeRank: function() {
    var that = this;
    that.setData({
      showDefault: false
    })
  },
  // 返回顶部
  gotop: function() {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新最新版本使用该功能'
      })
    }
  },
  // tab栏固定
  onPageScroll: function(e) {
    const {searchFixed} = this.data;
    if(e.scrollTop>270&&!searchFixed){
      this.setData({
        searchFixed:true,
      })
    }else if(e.scrollTop<=270&&searchFixed){
      this.setData({
        searchFixed:false,
      })
    }

    let scrollDistance = e.scrollTop - 270 + this.data.windowHeight
    if (scrollDistance > 0) {
      let index = Math.min( parseInt(scrollDistance/(110*10)+1),this.data.totalPage )
      if (index != this.data.currentPageIndex) {
        this.setData({
          currentPageIndex: index
        })
      }
      
    }
  },

  getInitData: function() {
    let conditions = {
      "sort": '',//排序规则 {sort:'score',sorttype:'desc'} == 综合 {sort:'distance',sorttype:'asc'} == 距离  {sort:'sprice',sorttype:'desc'} == 价格降序 {sort:'sprice',sorttype:'asc'} == 价格升序
      "sorttype": '',
      "medicineid": this.data.goodsID,//商品ID
      "period_type":'0',//剩余有效期 0 == 不选  1 == 108天-1年  2 == 1年以上  3 == 2年以上
      "discount": "0", //0、1 是否选中多买优惠
      "is_activity":'0',//是否选中满减优惠
      "is_coupons":"0",//是否选中优惠券
      "min_price":'',//最小价格
      "max_price":'',//最大价格
      "regionid":'',//所在地 地区ID 根据接口 paramMap.set('__cmd', 'guest.sys_region.getListByParentId');paramMap.set('regionid', 0); 获取所有所在地 取返回数据的id字段
      "lat": app.globalData.latitude,//
      "lng":  app.globalData.longitude,//
      "user_city_name": app.globalData.city,//
      "user_region_id": app.globalData.region_id,//
  }
    saleComparePricesApi.getGoodsAndShopData(conditions,1).then((result) => {
      this.dealGoodsInfoData(result.goodsInfo)
      getAppSystemConfig().then((info)=>{
        this.dealShopListData(result.shopsInfo)
      },(error)=>{
        this.dealShopListData(result.shopsInfo)
      })
    },error=>{
        wx.showToast({
          title:error.msg,
          icon:'none'
        })
    })
  },

  dealGoodsInfoData: function (result) {
    var that = this;
    var showFlag = false;
    var showAllIntro = true;
    let goodsInfoModel = YFWSellersListGoodsInfoModel.getGoodsInfo(result)
    if (!goodsInfoModel) {
      return
    }
    this.data.goodsInfoModel = goodsInfoModel;
    if(goodsInfoModel.applicability.length && goodsInfoModel.applicability.length<22){
      showFlag = true;
    }
    if(goodsInfoModel.applicability.length && goodsInfoModel.applicability.length>47){
      goodsInfoModel.applicabilityCut = goodsInfoModel.applicability.substring(0,47);
      showAllIntro = false;
    }
    that.data.goodsInfo = goodsInfoModel
    that.data.goodsOriginInfo = result;
    that.setData({
      goodsInfo: goodsInfoModel,
      isLogin: isLogin(),
      effectareaFlag:showFlag,
      showAllIntro,
      hasSpecification: Object.keys(goodsInfoModel.guide).length > 0
      // hasSpecification: true
    })
    if (goodsInfoModel.name_cn) {
      wx.setNavigationBarTitle({
        title: goodsInfoModel.name_cn
      })
    }
  },

  getShopList: function() {
    let conditions = {
      "sort": this.data.sort,//排序规则 {sort:'score',sorttype:'desc'} == 综合 {sort:'distance',sorttype:'asc'} == 距离  {sort:'sprice',sorttype:'desc'} == 价格降序 {sort:'sprice',sorttype:'asc'} == 价格升序
      "sorttype": this.data.sortType,
      "medicineid": this.data.goodsID,//商品ID
      "period_type":this.data.period_type,//剩余有效期 0 == 不选  1 == 108天-1年  2 == 1年以上  3 == 2年以上
      "discount": this.data.discount, //0、1 是否选中多买优惠
      "is_activity":this.data.is_activity,//是否选中满减优惠
      "is_coupons":this.data.is_coupons,//是否选中优惠券
      "min_price":this.data.lowPrice,//最小价格
      "max_price":this.data.highPrice,//最大价格
      "regionid":this.data.regionid,//所在地 地区ID 根据接口 paramMap.set('__cmd', 'guest.sys_region.getListByParentId');paramMap.set('regionid', 0); 获取所有所在地 取返回数据的id字段
      "lat": app.globalData.latitude,//
      "lng":  app.globalData.longitude,//
      "user_city_name": app.globalData.city,//
      "user_region_id": app.globalData.region_id,//
  }
    saleComparePricesApi.getSaleShopsList(conditions,this.data.pageIndex).then((result) => {
      getAppSystemConfig().then((info)=>{
        this.dealShopListData(result)
      },(error)=>{
        this.dealShopListData(result)
      })
    }).then((error) => {

    })
  },
  dealShopListData: function(result) {
    console.log(111)
    var that = this
    let shopInfoModelArray = YFWSellersShopInfoModel.getModelArray(result)
    shopInfoModelArray.map((item) => {
      item.is_add_cart = (parseInt(app.globalData.appSystemConfig.wx_rx_is_buy) != 0 || parseInt(that.data.goodsInfo.prescriptionType) < 0) && that.data.goodsInfo.isCanSale;
      item.star = addZero(item.star);
    })
    console.log(shopInfoModelArray)
    if (this.data.pageIndex > 1) {
      shopInfoModelArray = this.data.shopInfoArray.concat(shopInfoModelArray)
    }
    that.setData({
      shopInfoArray: shopInfoModelArray,
      hidden: !result.dataList||result.dataList.length < 10,
      loadhidden: false,
      totalPage: result.pageCount + 1,
      note:result.note || {}
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.onscale = this.selectComponent('#onscale')
    this.specificationModal = this.selectComponent('#specificationModal')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let currentLoginStatus = isLogin()
    if (this.data.isLogin != currentLoginStatus) {
      this.getInitData()
      this.setData({
        isLogin:currentLoginStatus
      })
    }
    this.requestShopcarCount()
  },

  requestShopcarCount: function() {
    if (!isLogin()) {
      return
    }
    shopCarApi.getShopCarCount().then((result)=>{
      console.log(result)
      if(result.cartCount && result.cartCount>99){
        result.cartCount = '99+'
      }
      this.setData({
        shopCarCount: result.cartCount
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.hidden) {
      return
    }
    this.data.pageIndex++
    this.setData({
      loadhidden:true
    })
    this.getShopList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let goodsID = this.data.goodsID
    return {
      title: this.data.goodsInfo&&this.data.goodsInfo.title || '',
      path:'/pages/YFWSellersListModule/YFWSellersListViewPage/YFWSellersListView?params='+JSON.stringify({value:goodsID}),
      imageUrl: this.data.goodsInfo&&this.data.goodsInfo.img_url || ""
    }
  },

      /**
 * 隐藏弹窗
 */
hideModal: function () {
  let animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  this.animation = animation
  animation.translateX(300).step()
  this.setData({
    animationData: animation.export()
  })
  let that = this
  if (this.data.isShow) {
    setTimeout(function () {
      animation.translateX(0).step()
      that.setData({
        animationData: animation.export(),
        isShow: false
      })
      //wx.showTabBar({});
    }.bind(this), 200)

  }
},

/**
 * 显示弹窗
 */
showModal: function () {
  if(JSON.stringify(this.data.fakeObj) !='{}'){
    let _obj = this.data.fakeObj,_query={};
    _query = {
      lowPrice: _obj.lowPrice || '',
      highPrice: _obj.highPrice || '',
      preferentialActivities: _obj.preferentialActivities || this.data.preferentialActivities,
      remainingValidity: _obj.remainingValidity || this.data.remainingValidity,
      areaData: _obj.areaData || this.data.areaData,
      provinceArray: _obj.provinceArray || this.data.provinceArray,
    }
    this.setData(_query)
  }
  let animation = wx.createAnimation({
    duration: 200,
    timingFunction: "linear",
    delay: 0
  })
  this.animation = animation
  if (!this.data.isShow) {
    animation.translateX(300).step()
    this.setData({
      animationData: animation.export(),
      isShow: true
    })
  }
  let that = this
  setTimeout(function () {
    animation.translateX(0).step()
    that.setData({
      animationData: animation.export()
    })
  }.bind(this), 0)
},
backAction: function () {
  this.setData({
    showAll: false,
  })
},
itemClickAction: function (e) {
  let item = e.currentTarget.dataset.info
  let index = e.currentTarget.dataset.index
  let type = e.currentTarget.dataset.type
  if (item.isShowAll) {
    this.setData({
      showAll: true,
      showType: type,
    })
  } else if(type== 'provinceArray' || type == 'areaData'){
    let _data = this.data.provinceArray.map(item=>{
      item.select = item.select ? false : item.index == index ? true:false;
      return item;
    })
    let _data2 = this.data.areaData.map(item=>{
      item.select = item.select ? false : item.index == index ? true:false;
      return item;
    })
    this.setData({
      provinceArray: _data || [],
      areaData:_data2 || []
    })

  }else if(type == 'preferentialActivities'){
    let _data = this.data[type].map(item=>{
      if(item.index == index){
        item.select = !item.select;
      }
      return item;
    })
    this.setData({
      'preferentialActivities': _data,
    })
  }else{
    let _data = this.data[type].map(item=>{
      item.select = item.select ? false : item.index == index ? true:false;
      return item;
    })
    this.setData({
      [type]: _data,
    })
  }
},
/*
关于筛选条件 重置部分的逻辑   
1。 重置还原的是页面上所依赖的数据源
2. 点击确定之后 将 页面上所依赖的数据源 复制一份到 fakeobj中
3. 每次点机筛选展示条件的时候 按照fakeobj中的展示 如果fakeobj没有数据 就展示所依赖的数据源
*/
resetAction:function(){
  let _provinceArray = JSON.parse(JSON.stringify(this.data.provinceArray || []));
  _provinceArray = _provinceArray.map(item=>{
    item.select = false;
    return item;
  })
  let _areaData = JSON.parse(JSON.stringify(this.data.areaData || []));
  _areaData = _areaData.map(item=>{
    item.select = false;
    return item;
  })
  this.setData({
    provinceArray:_provinceArray,
    areaData:_areaData,
    lowPrice:"",
    highPrice:"",
    is_activity:0,
    is_coupons:0,
    period_type:0,
    discount:0,
    regionid:"",
  })
  if(!this.data.showAll){
    let _preferentialActivities = JSON.parse(JSON.stringify(this.data.preferentialActivities));
    _preferentialActivities = _preferentialActivities.map(item=>{
      item.select = false;
      return item;
    })
    let _remainingValidity = JSON.parse(JSON.stringify(this.data.remainingValidity));
    _remainingValidity =_remainingValidity.map(item=>{
      item.select = false;
      return item;
    })
    this.setData({
      remainingValidity:_remainingValidity,
      preferentialActivities:_preferentialActivities,
    })
  }
},
PriceChange(e){
  let newVal = e.detail.value,type = e.currentTarget.dataset.type;
  newVal = newVal.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
  newVal = newVal.replace(/^\./g, ""); //验证第一个字符是数字而不是字符
  newVal = newVal.replace(/\.{2,}/g, "."); //只保留第一个.清除多余的
  newVal = newVal
    .replace(".", "$#$")
    .replace(/\./g, "")
    .replace("$#$", ".");
  newVal = newVal.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
  this.setData({
    [type]:newVal
  })
},
confirmAction:function(){
  if(this.data.lowPrice && this.data.highPrice && parseFloat(this.data.lowPrice)>parseFloat(this.data.highPrice)){
    wx.showToast({
      title: '最低价不能大于最高价',
      icon:'none'
    })
    return false;
  }
  for(let item of this.data.remainingValidity){
    if(item.select){
      this.data.period_type = item.value;
      break;
    }else{
      this.data.period_type = "";
    }
  }
  let _remainingValidity = this.data.remainingValidity.map(item=>item);
  let _preferentialActivities = this.data.preferentialActivities.map(item=>{
    if(item.select){
      this.data[item.value] = 1;
    }else{
      this.data[item.value] = 0;
    }
    return item;
  })
  let _areaData = (this.data.areaData || []).map(item=>item)
  let _provinceArray = (this.data.provinceArray || []).map(item=>item)
  for(let item of this.data.provinceArray){
    if(item.select){
      this.data.regionid = item.id;
      break;
    }else{
      this.data.regionid = "";
    }
  }
  this.setData({
    'fakeObj.lowPrice':this.data.lowPrice,
    'fakeObj.highPrice':this.data.highPrice,
    'fakeObj.remainingValidity':_remainingValidity,
    'fakeObj.preferentialActivities':_preferentialActivities,
    'fakeObj.areaData':_areaData,
    'fakeObj.provinceArray':_provinceArray,
  })
  this.hideModal();
  this.data.pageIndex = 1;
  this.getShopList();//查询数据
},
  showGuideModal() {
    this.specificationModal.showModal()
  }
})