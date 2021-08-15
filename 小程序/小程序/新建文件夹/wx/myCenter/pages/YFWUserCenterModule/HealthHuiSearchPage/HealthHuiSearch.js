import { SearchApi, ShopDetailApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { config } from '../../../../config.js'
import { isEmpty, isNotEmpty, itemAddKey } from '../../../../utils/YFWPublicFunction.js'
// import { YFWHotWordsModel } from './Model/YFWHotWordsModel.js'
// import { YFWSeacrchShopModel } from './Model/YFWSeacrchShopModel.js'
const searchApi = new SearchApi()
const shopDetailApi = new ShopDetailApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholder: '搜索疾病/科普等内容',
    clickFlag: false,
    hotWords: [],
    historyWords: [],
    searchText: '',//搜索关键字
    shopID: '',
    type: 1,
    pageIndex: 1,
    articleList: [], //搜索关键字后请求的文章数据
    articleRecommandList: [], //推荐文章数据
    pageEnd: false,
    pageCount: 1,
    isSearchData: false, //是否调用搜索的接口
    isSearchRecommendData: false,//是否调用推荐数据的接口
    isShowSearchArticleSign: false,
    isFirstFocus:false
  },
  //获取焦点响应事件
  onFocus: function (e) {
    this.onChangeText({ detail: { value: this.data.searchText } })
    this.data.isFirstFocus=true;
  },
  //结束编辑
  onEndEditing: function (e) {
    if (this.data.type == 2) {
      //触发搜索事件
    }
    this.onChangeText({ detail: { value: this.data.searchText } })
  },
  //推荐文章
  recommendArticleData: function () {
    searchApi.getRecommendArticle().then((res) => {
      console.log(res, '推荐文章')
      if (isNotEmpty(res)) {
        res = res.map((j) => {
          j.hits = Number.parseInt(j.hits) >= 10000 ? '1w+' : Number.parseInt(j.hits)
          j.likes = Number.parseInt(j.likes) >= 10000 ? '1w+' : Number.parseInt(j.likes)
          j.update_time = j.update_time.substr(0, 10)
          j.upload_img = j.upload_img && (j.upload_img).indexOf('http') == -1 ? config.cdn_url + j.upload_img : j.upload_img;
          return j
        })
        this.setData({
          articleRecommandList: res,
          type:3,
          pageEnd: true
        })
      }
    })
  },
  //搜索框变化
  onChangeText: function (e) {
    if (this.data.clickFlag) {
      this.data.clickFlag = false;
      return false;
    }
    let text = e.detail.value;
    var str = text.replace(/[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig, "");

    if (this.data.searchText != str) {
      this.data.isSearchData = true;
      this.data.searchText = str;
      this.setData({
        searchText: str,
        isSearchData:true
      })
    }
    if (str.length > 0) {
      if (this.data.type == 1 || this.data.type == 3) {
        this.setData({
          type: 2
        })
      }
    } else {
      this.data.isSearchRecommendData = false;
      this.setData({
        type: 1
      })
    }
  },
  //点击历史搜索
  clickHistoryItemMethod: function (e) {
    let _name = e.detail.name.value || ""
    if (_name) {
      this.data.isSearchData = true;
      this.setData({
        searchText: _name,
        isSearchData:true
      })
      this.searchClickEd(e)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.requestHotData()      //热门搜索
    this.requestHistoryData()  //历史记录
  },
  requestHotData: function () {
    searchApi.getHotHealthHuiKeyWords().then((res) => {
      if (isNotEmpty(res.dataList)) {
        this.setData({
          hotWords: res.dataList
        })
      }
      // let dataArray = YFWHotWordsModel.getModelArray(res);
      // this.setData({
      //   hotWords: dataArray
      // })
    })
  },

  //搜索文章
  searchClick:function(e){
    if(this.data.isSearchData == true){
      this.searchClickEd(e)
    }
    if(!this.data.isFirstFocus){
      this.recommendArticleData()
    }
  },
  searchClickEd: function (e) {
    this.data.clickFlag = true;
    this.data.pageEnd = false;
    // e.detail.name.value
    var text = e.detail.value ? e.detail.value : e.detail.name ? e.detail.name.value : e.currentTarget.dataset.keyword || "";

    text = text.replace(/(^\s*)|(\s*$)/g, "");
    if (!text) {
      this.setData({
        articleList: []
      })
      if (this.data.isSearchRecommendData == false) {
        this.recommendArticleData()
        this.data.isSearchRecommendData = true;
      }
    }
    else {
      this.setData({
        articleRecommandList: [],
        isShowSearchArticleSign: false
      })
      if (this.data.isSearchData == true) {
        this.data.articleList = [];
        this.setData({
          articleList: []
        })
        this.requestArticleData(text, 1)
        this.addHistory('article', text)
        this.data.isSearchData = false;
      }else{
        return
      }
    }
    this.setData({
      type: 3,
      searchText: text
    })

  },
  //文章搜索结果页
  requestArticleData: function (text, pageIndex) {
    var that = this;
    if (pageIndex == 1) {
      this.setData({
        isShowSearchArticleSign: false
      })
    }
    searchApi.getHealthHuiArticle(text, pageIndex).then((res) => {
      this.data.isShowSearchArticleSign = true;
      let _data = res.dataList || [];
      let _pageCount = res.pageCount || 0;
      if (!res) {
        res = {
          dataList: []
        }
      } else {
        if (_data.length == 0 || _data == []) {
          this.recommendArticleData();
          this.data.pageIndex = 1;
        }
      }
      if (_data.length < 5) {
        this.data.pageEnd = true;
      }
      if (_pageCount == 1) {
        this.data.articleList = _data;
        this.data.pageEnd = true;
      } else {
        this.data.articleList = this.data.articleList.concat(_data);
      }
      if (this.data.pageIndex >= _pageCount) {
        this.data.pageEnd = true;
        this.data.pageIndex = 1;
      }
      if (isNotEmpty(res.dataList)) {
        res.dataList = res.dataList.map((j) => {
          j.hits = Number.parseInt(j.hits) >= 10000 ? '1w+' : Number.parseInt(j.hits)
          j.likes = Number.parseInt(j.likes) >= 10000 ? '1w+' : Number.parseInt(j.likes)
          j.update_time = j.update_time.substr(0, 10)
          j.upload_img = j.upload_img && (j.upload_img).indexOf('http') == -1 ? config.cdn_url + j.upload_img : j.upload_img;
          return j
        })
        console.log('文章搜索结果', res)
      }
      this.setData({
        articleList: this.data.articleList || [],
        pageCount: _pageCount,
        pageEnd: this.data.pageEnd,
        isShowSearchArticleSign: true
      })
    })

  },
  // 页面滚动到底部时触发
  requestNextPage: function () {
    let _pageCount = this.data.pageCount || 1;
    let _searchText = this.data.searchText || "";
    let _pageEnd = this.data.pageEnd || false;
    if (!this.data.pageEnd) {
      this.data.pageIndex = this.data.pageIndex + 1;
      if (this.data.pageIndex <= _pageCount) {
        this.requestArticleData(_searchText, this.data.pageIndex);
        console.log(' this.data.pageIndex ', this.data.pageIndex)
      }else{
        return
      }
    } else {
      return
    }

  },
  requestHistoryData: function () {
    var dataArray = wx.getStorageSync('artSearchHistoryKey') || [];
    dataArray = itemAddKey(dataArray)
    this.setData({
      historyWords: dataArray
    })
  },
  hideLoadingView: function () {
    this.setData({
      pageEnd: true
    })
  },
  //点击文章模块内的子元素
  onClickArticleItem:function(e){
    let _name=e.detail.name;
    pushNavigation(_name.type,_name)
  },
  //添加历史搜索数据
  addHistory: function (_newsType, value) {
    var array = this.data.historyWords;
    if (isEmpty(array)) {
      array = []
    }
    var object = {
      _newsType: _newsType,
      value: value
    }
    var repeat = array.some((item) => {
      return item.value == value && item._newsType == _newsType
    })
    if (repeat) {
      array.splice(array.findIndex((item) => item._newsType == _newsType && item.value == value), 1);
      array.unshift(object)
    } else {
      array.unshift(object)
    }
    this.setData({
      historyWords: array
    })
    wx.setStorageSync('artSearchHistoryKey', array)
  },
  clearHistoryMethod: function () {
    wx.removeStorageSync('artSearchHistoryKey')
    this.setData({
      historyWords: []
    })
  },
  removeKeywords: function () {
    this.setData({
      type: 1,
      searchText: ''
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})