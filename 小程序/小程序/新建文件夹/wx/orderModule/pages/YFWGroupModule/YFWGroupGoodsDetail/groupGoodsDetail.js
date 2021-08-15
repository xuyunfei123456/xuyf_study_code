import { GroupApi } from "../../../../apis/base"
import { config } from '../../../../config'
import { jsonToArray, mapToJson } from "../../../../utils/YFWPublicFunction"

const groupApi = new GroupApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg_top: "",
    tabs: [ //tab栏头部信息
      {
        id: 0,
        title: '基本信息',
        items: [
          {
            title: "通用名",
            subtitle: ""
          },
          {
            title: "商品品牌",
            subtitle: ""
          },
          {
            title: "批准文号",
            subtitle: ""
          },
          {
            title: "包装规格",
            subtitle: ""
          },
          {
            title: "剂型/型号",
            subtitle: ""
          },
          {
            title: "英文名称",
            subtitle: ""
          },
          {
            title: "汉语拼音",
            subtitle: ""
          },
          {
            title: "有效期",
            subtitle: ""
          },
          {
            title: "生产企业",
            subtitle: ""
          }
        ],
        pics: []
      }, {
        id: 1,
        title: '说明书'
      }, {
        id: 2,
        title: '服务保障',
        promise: {
          title: "药房网商城承诺",
          qualification: {
            icon: "",
            type: "",
            link: ""
          },
          items: [
            {
              //   icon: require("../../../../images/YFWGoodsDetailModule/goods_deail_qualification.png"),
              title: "品质保障",
              content:
                "药房网商城在售商品均由正规实体签约商家供货，商家提供品质保证。在购物过程中发现任何商家有违规行为，请直接向我们投诉举报！"
            },
            {
              //   icon: require("../../../../images/YFWGoodsDetailModule/goods_deail_invoice.png"),
              title: "提供发票",
              content: "药房网商城所有在售商家均可提供商家发票"
            }
          ]
        },
        store_qualification: {
          title: "商家资质",
          items: []
        },
        store_images: {
          title: "商家实景",
          items: []
        },
        returned_standard: {
          title: "退换货标准",
          return_policy: {
            title: "退换货政策",
            content:
              "由商品售出之日（以实际收货时间为准）起七日内符合退换货条件的商品享受退换货政策。"
          },
          return_condition: {
            title: "退换货条件",
            items: [
              {
                dot: true,
                tel: "因物流配送导致外包装污损、破损的商品。"
              },
              {
                dot: false,
                tel: "经质量管理部门检验，确属产品本身存在质量问题。"
              },
              {
                dot: true,
                tel: "国家权威管理部门发布公告的产品（如停售、召回等）。"
              },
              {
                dot: false,
                tel: "因商家失误造成发货错误，如商品的名称、规格、数量、产品批次等信息与所订商品不符。"
              }
            ]
          },
          return_explain: {
            title: "特殊说明",
            content:
              "因药品是特殊商品，依据中华人民共和国《药品经营质量管理规范》及其实施细则（GSP）、《互联网药品交易服务审批暂行规定》等法律、法规的相关规定：药品一经售出，无质量问题，不退不换。"
          },
          return_process: {
            title: "退换货流程",
            items: [
              "联系商家客服或自行确认符合退换货政策",
              "在线提交退换货申请及相关证明",
              "退换货申请通过后寄回商品",
              "确认商家为您重寄的商品或退款"
            ]
          }
        }
      }],
    drugs_dels: [ //药品基本信息
    ],
    isShowTabLine: 0, //控制切换tab栏索引
    shopID: 3,
    shopDelAllData: {},
    medicineInfo: {},
    banners_lists: [], //轮播图图片集合
    inventory: '',//库存
    offeredCount: '', //参团人数
    priceMap: {}, //拼团
    nowPriceInt: 0, //现价整数部分
    nowPriceDec: 0, //现价整数部分
    discountPrice: 0, //折扣价
    OTChint: 'OTC即非处方药，消费者可直接在药房或药店中即可购取的药物。',
    RXhint: '本品为处方药，须在执业药师指导下凭处方购买和使用',
    speBookArr: [],
    fixedTabsHeader: false, //是否固定导航栏
    tabsHeaderTop: 0,
    barHeight: 0,//状态栏高度
    drugName: '',
    dict_group_buy_medicine:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { shopID } = this.data;
    var that = this;
    groupApi.getGoodsDelData(shopID).then((res) => {
      let _shopDelData = that.data.shopDelData
      if (res && JSON.stringify(res) != "{}") {
        console.log('res', res)
        _shopDelData = res;
        this.dealAllData(_shopDelData)
      }
    })
    this.getTabsTop()
  },

  dealAllData(requestData) {
    if (requestData && requestData.length != 0) {
      let _image_list, _nowPriceInt, _nowPriceDec, _discountPrice, _tabs;
      if (requestData.medicine_info && requestData.medicine_info.length != 0) {
        // 轮播图
        if (requestData.medicine_info.image_list) {
          _image_list = requestData.medicine_info.image_list;
          _image_list = _image_list && _image_list.map((item) => {
            item = item.indexOf('http') == -1 ? config.cdn_url + item : item;
            return item;
          })
          this.data.banners_lists = _image_list;
        }
        //处理说明书数据
        if (requestData.medicine_info.guide) {
          let _guide = requestData.medicine_info.guide;
          this.dealSpeBook(_guide);
        }
        let subtitles = [
          requestData.medicine_info.alias_name,
          requestData.medicine_info.aliascn,
          requestData.medicine_info.authorized_code,
          requestData.medicine_info.sm_standard,
          requestData.medicine_info.troche_type,
          requestData.medicine_info.nameen,
          requestData.medicine_info.py_namecn,
          requestData.medicine_info.period,
          requestData.medicine_info.title
        ]
        _tabs = this.data.tabs;
        let _items = _tabs[0].items;
        _items = _items.map((k, index) => {
          k.subtitle = subtitles[index]
          return k;
        })
      }
      //拼团详情
      let _dict_group_buy_medicine_type;
      if (requestData.price_map && requestData.medicine_info.length != 0) {
        let { nowPriceInt, nowPriceDec, discountPrice } = this.data;
        let _price = requestData.price_map.price;
        let _arrRequset = parseFloat(_price).toFixed(2).split('.');
        let getDisPrice = requestData.price_map.discount_price;
        _dict_group_buy_medicine_type = requestData.price_map.dict_group_buy_medicine_type;
        _nowPriceInt = _arrRequset[0];
        _nowPriceDec = _arrRequset[1];
        nowPriceInt = _nowPriceInt;
        nowPriceDec = _nowPriceDec;
        _discountPrice = parseFloat(getDisPrice).toFixed(2);
        discountPrice = _discountPrice
      }
      this.setData({
        tabs: _tabs,
        banners_lists: _image_list || [],
        medicineInfo: requestData.medicine_info || {},
        inventory: requestData.reserve || '',
        offeredCount: requestData.offered_count || '',
        priceMap: requestData.price_map || {},
        nowPriceInt: _nowPriceInt || 0,
        nowPriceDec: _nowPriceDec || 0,
        discountPrice: _discountPrice || 0,
        dict_group_buy_medicine:_dict_group_buy_medicine_type || 0
      })
    }
  },
  // 处理说明书数据
  dealSpeBook(speBookData) {
    let _speBookData = JSON.parse(JSON.stringify(speBookData));
    let _valArr = [];
    let _keyArr = [];
    let _dataArr = [];
    for (let k in _speBookData) {
      _keyArr.push(k);
      _valArr.push(_speBookData[k]);
    }
    _keyArr.map((j, index) => {
      let speBookItem = {
        title: "【" + j + "】",
        content: _valArr[index]
      }
      if (_keyArr[index].indexOf("药品名称") != -1) {
        this.dealDrugName(_valArr[index])
      }
      _dataArr.push(speBookItem)
    })
    this.data.speBookArr = _dataArr;
    this.setData({
      speBookArr: _dataArr
    })
    // _guideTxt=speBookData.replace(/(↵|\r)/g, "\n")
  },
  //处理服务保障数据
  dealServe() {

  },
  // 处理药品名称数据
  dealDrugName(drugNameData) {
    let _drugNameData = drugNameData.trim().replace(/(↵|\n|\r)/g, "\n");
    this.data.drugName = _drugNameData;
    this.setData({
      drugName: _drugNameData
    })
  },
  // 切换导航栏状态
  onChangeTabs(event) {
    let name = event.currentTarget.dataset.name;
    this.setData({
      isShowTabLine: name.id
    })
  },
  getTabsTop() {
    let _barHeight,
      _tabsHeaderTop = this.data.tabsHeaderTop,
      _query = wx.createSelectorQuery(),
      sysInfo = wx.getSystemInfoSync();
    _barHeight = sysInfo.statusBarHeight;
    this.data.barHeight = _barHeight;
    _query.select("#tabs_header").boundingClientRect().exec((rect) => {
      let _top = rect[0].top;
      _tabsHeaderTop = _top;
      this.setData({
        tabsHeaderTop: _top,
        barHeight: _barHeight
      })
    })
  },
  onPageScroll(e) {
    let _scrollTop = e.scrollTop,
      _barHeight = this.data.barHeight,
      _tabsHeaderTop = this.data.tabsHeaderTop,
      _fixedTabsHeader = this.data.fixedTabsHeader;
    if (_scrollTop >= (_tabsHeaderTop + 40)) {
      _fixedTabsHeader = true
    } else {
      _fixedTabsHeader = false
    }
    this.setData({
      fixedTabsHeader: _fixedTabsHeader
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