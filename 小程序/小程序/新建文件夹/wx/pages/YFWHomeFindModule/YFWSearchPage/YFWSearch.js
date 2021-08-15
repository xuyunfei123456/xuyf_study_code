// pages/YFWHomeFindModule/YFWSearchPage/YFWSearch.js
import { SearchApi, ShopDetailApi } from '../../../apis/index.js'
const searchApi = new SearchApi()
const shopDetailApi = new ShopDetailApi()
import { YFWHotWordsModel } from './Model/YFWHotWordsModel.js'
import { YFWSeacrchShopModel } from './Model/YFWSeacrchShopModel.js'
import { isNotEmpty, safeObj, dismissKeyboard_yfw, isEmpty, itemAddKey } from '../../../utils/YFWPublicFunction.js'
import {
  getModelArray
} from '../../../components/GoodsItemView/model/YFWGoodsListModel.js'
import { scanCode } from '../../../utils/YFWScanCode.js'
var event = require('../../../utils/event')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholder: '搜索症状、药品、药店、品牌',
    focusFlag:false,
    clickFlag:false,
    type: 1,
    searchValue: '',
    address: '上海市',
    searchText: '',
    shopID: '',
    edit: true,
    resetFilter: false,
    showType: 'goods',
    searchEndtype: 0,   //0代表搜索框无二维码，1代表有
    hotWords: [],
    historyWords: [],
    relevantData: [],   //联想

    pageIndex: 1,
    sort: '',
    sorttype: '',
    list: [],

    associationGoodsData: [],
    associationShopsData: [],
    brands: '',
    manufacturers: '',
    showSpecification:false,
    showSpecification2:false,
    nogoodslist:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.filterBox = this.selectComponent('#filterBox');
    this.requestHotData()      //热门搜索
    this.requestHistoryData()  //历史记录
    if(options.showSpecification){
      this.setData({
        showSpecification:true
      })
    }
    let _param = options.params&& JSON.parse(options.params) || {},
    screenData = _param.storeid || this.data.shopID,
    searchData = _param.value || this.data.searchValue,
    searchText = _param._value || "",
    placeholder = _param.placeholder || '搜索症状、药品、药店、品牌'
    this.setData({
      shopID: screenData,
      searchValue: searchData,
      address: app.globalData.address,
      searchText,
      placeholder,
    })
    if(searchText){
      if (this.data.showType === 'shop') {
        this.clickSearchShopMethod(searchText)
      } else if (this.data.showType === 'goods') {
        this.clickSearchMethod(searchText)
      }
    }else{
      this.setData({
        focusFlag:true
      })
    }
    this.data.searchValue = searchData || '';
  },
  changeFilter: function (info) {
    //{brands:品牌集合   manufacturers:厂家}
    console.log(info.detail, 'new filter')
    let brand = isEmpty(info.detail.brands) ? '' : info.detail.brands.join(","),
      manufacturer = isEmpty(info.detail.manufacturers) ? '' : info.detail.manufacturers.join(","),
      standard = isEmpty(info.detail.selectspecificationsArray) ? '' : info.detail.selectspecificationsArray.join(',');
    this.setData({
      brands: brand,
      manufacturers: manufacturer,
      pageIndex: 1,
      standard,
    })
    if (isEmpty(this.data.searchValue)) {
      this.requestHandleData(this.data.searchText)
    } else {
      this.requestGoodsData(this.data.searchValue);
    }
    this.hideLoadingView(false)
  },
  requestHotData: function () {
    searchApi.getHotSearchKeywords().then((response) => {
      let dataArray = YFWHotWordsModel.getModelArray(response)
      this.setData({
        hotWords: dataArray
      })

    })
  },
  requestHistoryData: function () {
    var dataArray = wx.getStorageSync('kSearchHistoryKey') || []
    if (isNotEmpty(this.data.shopID)) {
      dataArray = dataArray.filter(item => item.showType === 'goods');
    }
    dataArray = itemAddKey(dataArray);
    this.setData({
      historyWords: dataArray
    })
  },
  //搜索联想数据
  requestRelevantData: function (keyWords) {
    searchApi.getAssociateKeywords(keyWords).then((response) => {
      let dataArray = response
      this.setData({
        relevantData: dataArray
      })
    })
  },
  requestHandleData: function (text, type) {
    if (isNotEmpty(this.data.shopID)) {
      this.requestShopGoodsData(text)
    } else {
      if (type == 'click') {
        this.data.pageIndex = 1;
      }
      if (this.data.showType === 'goods') {
        this.requestGoodsData(text);
      } else {
        this.requestShopData(text);
      }
    }
  },
  //商品搜索结果页
  requestGoodsData: function (text) {
    var that = this;
    searchApi.searchGoods(text, this.data.pageIndex, '', this.data.sort, this.data.brands, this.data.manufacturers, this.data.standard).then((response) => {
      if(!response){
        response = {
          dataList:[]
        }
      }else{
        response.dataList = response.dataList === null ? []:response.dataList;
      }
      if (response.dataList && this.data.pageIndex === 1 && response.dataList.length === 0) {
        // 第一次搜索商家无数据
        this.requestAssociationGoodsOrShopsData();
        return;
      }
      if(response.exact_query == 1){
        this.searchData({
          showSpecification2:true
        })
      }
      let data = getModelArray(response.dataList, 'all_goods_search')
      if (this.data.pageIndex == 1) {
        this.data.list = data
      } else {
        this.data.list = this.data.list.concat(data)
      }
      // if (this.data.pageIndex == 1) {
      //   setTimeout(() => {
      //     that.selectComponent("#goodsView").setData({
      //       list: that.data.list || []
      //     })
      //     if (data.length < 10) {
      //       that.hideLoadingView()
      //     }
      //   }, 50)
      // } else {
      //   setTimeout(() => {
      //     that.selectComponent("#goodsView").setData({
      //       list: that.data.list || []
      //     })
      //     if (data.length < 10) {
      //       that.hideLoadingView()
      //     }
      //   }, 50)
      // }
      this.setData({
        list: this.data.list || [],
        associationGoodsData: []
      })
      wx.nextTick(()=>{
        if(that.selectComponent("#goodsView")){
          that.selectComponent("#goodsView").setData({
            list: that.data.list || []
          })
          if (data.length < 10) {
            that.hideLoadingView()
          }
        }
      })
    },(err)=>{
      this.hideLoadingView()
    })
  },
  //商家搜索结果数据
  requestShopData: function (text) {
    searchApi.searchShops(text, this.data.pageIndex).then((response) => {
      let responseArray = YFWSeacrchShopModel.getModelArray(response.dataList)
      if (isEmpty(response.dataList) && this.data.pageIndex === 1) {
        this.requestAssociationGoodsOrShopsData();
        return;
      }
      if (responseArray.length < 14) {
        this.hideLoadingView()
      }

      this.setData({
        list: this.data.pageIndex === 1 ? responseArray : this.data.list.concat(responseArray),
        associationGoodsData: []
      })


    })
  },
  //店铺搜索结果数据
  requestShopGoodsData: function (text) {
    let that = this
    shopDetailApi.getShopGoods(this.data.shopID, '', this.data.sort, this.data.pageIndex, text).then((response) => {
      if (this.data.pageIndex == 1 && response.dataList.length === 0) {
        that.hideLoadingView()
        return
      }
      let data = getModelArray(response.dataList, 'shop_medicine_recomand')

      if (this.data.pageIndex == 1) {
        this.data.list = data
      } else {
        this.data.list = this.data.list.concat(data)
      }

      if (this.data.pageIndex == 1) {
        wx.nextTick(()=>{
          if(that.selectComponent("#goodsView")){
            that.selectComponent("#goodsView").setData({
              list: that.data.list
            })
          }
          if (data.length < 20) {
            that.hideLoadingView()
          }
        })
      } else {
        that.selectComponent("#goodsView").setData({
          list: that.data.list
        })
        if (data.length < 20) {
          that.hideLoadingView()
        }
      }

      this.setData({
        list: this.data.list
      })
    })
  },
  //商品商家搜索无结果页
  requestAssociationGoodsOrShopsData: function () {
    if (isEmpty(this.data.shopID)) {
      if (this.data.showType === 'goods') {
        searchApi.getAssociationGoods().then((response) => {
          let data = getModelArray(response, 'hot_search_goods')
          this.setData({
            associationGoodsData: data || [],
            list: [],
            nogoodslist:data || []
          })
          // this.selectComponent("#noGoodsView").setData({
          //   list: data
          // })

        })
      } else {
        searchApi.getAssociationShop().then((response) => {
          let data = YFWSeacrchShopModel.getModelArray(response.dataList);
          this.setData({
            associationShopsData: data || [],
            list: [],
            nogoodslist:data || []
          })
        })
      }
    }
  },
  changeSortType: function (e) {
    this.data.sort = e.detail.sort;
    this.setData({
      sort: this.data.sort,
      pageIndex: 1
    })
    if (isEmpty(this.data.searchValue)) {
      this.requestHandleData(this.data.searchText)
    } else {
      this.requestGoodsData(this.data.searchValue);
    }
  },
  hideLoadingView(bool = true) {
    if (this.selectComponent("#goodsView")) {
      this.selectComponent("#goodsView").setData({
        pageEnd: bool
      })
    }
    if (this.selectComponent("#searchShopResult")) {
      this.selectComponent("#searchShopResult").setData({
        pageEnd: bool
      })
    }
  },
  requestNextPage: function (e) {
    if (isEmpty(this.data.searchValue)) {
      if (this.selectComponent("#goodsView")) {
        if (!this.selectComponent("#goodsView").data.pageEnd) {
          this.data.pageIndex = this.data.pageIndex + 1
          this.requestHandleData(this.data.searchText)
        } else {
          this.selectComponent("#goodsView").data.pageEnd = true
        }
      }
      if (this.selectComponent("#searchShopResult")) {
        if (!this.selectComponent("#searchShopResult").data.pageEnd) {
          this.data.pageIndex = this.data.pageIndex + 1
          this.requestHandleData(this.data.searchText)
        } else {
          this.selectComponent("#searchShopResult").data.pageEnd = true
        }
      }
    } else {
      if (!this.selectComponent("#goodsView").data.pageEnd) {
        this.data.pageIndex = this.data.pageIndex + 1
        this.requestGoodsData(this.data.searchValue);
      } else {
        this.selectComponent("#goodsView").data.pageEnd = true
      }
    }


  },
  //搜索框变化
  onChangeText: function (e) {
    if(this.data.clickFlag){
      this.data.clickFlag = false;
      return false;
    }
    let text = e.detail.value;
    var str = text.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");
    this.setData({
      searchText: str,
      edit: true,
    })
    if (str.length > 0) {
      if (this.data.type == 1 || this.data.type == 3) {
        this.setData({
          type: 2,
        });
        this.requestRelevantData(str)
      }
    } else {
      this.setData({
        type: 1,
        resetFilter: true,
        showType: 'goods',
        searchEndtype: 0
      });
    }
  },
  //结束编辑时
  onEndEditing: function (e) {
    if (this.data.type == 2) {
      this.requestRelevantData(e.detail.value);
    }
    if (this.data.type == 1) {
      this.setData({
        searchEndtype: 1
      })
    }
  },
  //获取焦点响应事件
  onFocus: function (e) {
    if (this.data.type == 1) {
      this.setData({
        searchEndtype: 0
      })
    }
    this.onChangeText({detail:{value:this.data.searchText}})
  },
  //确定/搜索按钮
  searchClick: function (e) {
    var text = e.detail.value ? e.detail.value : e.currentTarget.dataset.keyword || "";
    text = text.replace(/(^\s*)|(\s*$)/g, "");
    if(!text)return;
    if (this.data.showType === 'shop') {
      this.clickSearchShopMethod(text)
    } else if (this.data.showType === 'goods') {
      this.clickSearchMethod(text)
    }
  },
  //点击查询
  clickSearchMethod: function (text) {
    this.searchMethod(text);
    this.addHistory('goods', text);
    this.filterBox.getsxData()
  },
  //点击热门搜索
  clickHotItemMethod: function (e) {
    this.setData({
      brands: '', manufacturers: '', standard: ''
    })
    this.hotItemMethod(e.detail.name)
    this.addHistory('goods', e.detail.name);
    this.filterBox.getsxData()
  },
  //点击历史搜索
  clickHistoryItemMethod: function (e) {
    this.setData({
      brands: '', manufacturers: '', standard: ''
    })
    console.log(e.detail.name)
    var item = e.detail.name
    var text = item.value
    if (item.showType == 'shop') {

      this.searchShopMethod(text);

    } else if (item.showType == 'goods') {

      this.hotItemMethod(text);
      this.filterBox.getsxData()

    }
  },
  hotItemMethod: function (text) {
    //this.data.clickFlag = true;
    this.setData({
      searchText: text,
      edit: false,
      showType: 'goods',
      associationGoodsData: [],
      list: [],
      sort: ''
    });
    this.data.pageIndex = 1
    this.searchMethod(text);
  },
  searchMethod: function (text) {
    if (text.length > 0) {
      this.requestHandleData(text)   //搜索结果页
      this.setData({
        type:3,
        resetFilter: true,
        showType: 'goods'
      });
    }
  },
  //添加历史搜索数据
  addHistory: function (showType, value) {
    var array = this.data.historyWords;
    if (isEmpty(array)) {
      array = [];
    }
    var object = {
      showType: showType,
      value: value
    };

    //判断历史记录是否有重复记录
    let repeat = array.some(function (item) { return item.showType == showType && item.value == value });
    if (repeat) {
      array.splice(array.findIndex(item => item.showType == showType && item.value == value), 1);
      array.unshift(object);
    } else {
      array.unshift(object);
    }
    this.setData({
      historyWords:array
    })
    wx.setStorageSync('kSearchHistoryKey', array)
  },
  clearHistoryMethod: function () {
    wx.removeStorageSync('kSearchHistoryKey')
    this.setData({
      historyWords: []
    })
  },
  removeKeywords: function () {
    this.setData({
      searchText: '',
      type: 1,
      resetFilter: true,
      showType: 'goods'
    });
  },
  //搜索店铺
  clickSearchShopMethod: function () {

    this.searchShopMethod(this.data.searchText);
    this.addHistory('shop', this.data.searchText);
  },
  searchShopMethod: function (text) {
    this.data.clickFlag = true;
    this.setData({
      searchText: text,
      showType: 'shop',
      edit: false,
      type: 3,
    });
    this.requestHandleData(text, 'click')
  },

  //展示tabbar菜单
  openUtilityMenu: function () {
    let that = this
    that.selectComponent("#moreview").showModal()
  },
  //获取条码值
  bindScanTap: function () {
    scanCode()
  },
  openControlPanel: function () {
    this.filterBox.showModal()
    //this.filterBox.getsxData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.filterBox = this.selectComponent('#filterBox');
    if (isNotEmpty(this.data.searchValue)) {
      wx.setNavigationBarTitle({
        title: this.data.searchValue,
      })
      this.requestGoodsData(this.data.searchValue);
      this.selectComponent('#filterBox').getsxData()
    } else {
      wx.setNavigationBarTitle({
        title: '搜索',
      })
    }
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