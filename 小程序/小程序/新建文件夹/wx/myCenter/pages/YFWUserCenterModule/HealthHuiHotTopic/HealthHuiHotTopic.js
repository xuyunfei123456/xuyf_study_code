import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { HealthHuiApi } from '../../../../apis/index.js'
import {
  config
} from '../../../../config.js';
import { isEmpty, isNotEmpty, itemAddKey, jsonToArray } from '../../../../utils/YFWPublicFunction.js'
let healthHuiApi = new HealthHuiApi();
var app = getApp();
// health_hui_hot_topic
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article_topic_name:"",
    articleHotWords: [],
    article_topic_bgc:"",
    hotTopicObj: {
      topicId: '',
      topicName: "",
      pageIndex: 1
    },
    pageCount: 1,
    pageEnd: false
  },
  clickTitle(name,e){
    if(name.detail.name == this._name)return false;
    app.requestName=name.detail.name || '';
    app.requestId='';
    pushNavigation('health_hui_hot_topic')
  },
  onClickHotWordsItem: function (event) {
    console.log()
    let info=event.currentTarget.dataset.info;
    if(info&&info.value){
      pushNavigation('receive_h5',info)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let _hotTopicObj = this.data.hotTopicObj;
    this.hotTopicData(_hotTopicObj);
    this._name = app.requestName;
  },
  //热门话题搜索结果数据
  hotTopicData: function (hotTopicObj) {
    let _dataList, 
    _pageCount,
    _article_topic_bgc,
     _pageEnd=this.data.pageEnd;
    let that = this;
    if (app.requestName && app.requestName != "") {
      hotTopicObj.topicName = app.requestName;
    } else if (app.requestId && app.requestId != "") {
      hotTopicObj.topicId = app.topicId;
    }

    healthHuiApi.getHotTopicArticleInfo(hotTopicObj).then((res) => {
      if (res && JSON.stringify(res) != '{}'&& isNotEmpty(res.dataList)) {
        _dataList = res.dataList || [];
        _pageCount = res.pageCount || 1;
        _dataList = _dataList.map(item=>{
          if(item.upload_img && !item.upload_img.startsWith("http")){
            item.upload_img = config.cdn_url+item.upload_img;
          }
          item.update_time = item.update_time&&item.update_time.substring(0,10)
          return item;
        })
        that.data.articleHotWords = _dataList;
        if (_pageCount == 1) {
          _pageEnd = true;
        }
        if (hotTopicObj.pageIndex&&hotTopicObj.pageIndex >= _pageCount) {
          _pageEnd = true;
          hotTopicObj.pageIndex = 1;
        }
        this.setData({
          articleHotWords: _dataList,
          pageCount: _pageCount,
          pageEnd: _pageEnd,
        })
      }
      if(res && JSON.stringify(res) != '{}'&&isNotEmpty(res.article_topic.background_img)){
        _article_topic_bgc=res.article_topic.background_img || "";
        _article_topic_bgc=_article_topic_bgc.indexOf("http")==-1 ? config.cdn_url+_article_topic_bgc : _article_topic_bgc;
        this.data.article_topic_bgc=_article_topic_bgc;
        this.setData({
          article_topic_bgc:_article_topic_bgc,
          article_topic_name:res.article_topic.topic_name
        })
      }
    })

  },
  //页面滚动到底部
  requestNextPage() {
    let _pageCount = this.data.pageCount || 1;
    let _pageEnd = this.data.pageEnd || false;
    let _hotTopicObj = this.data.hotTopicObj || {};
    if (!_pageEnd) {
      _hotTopicObj.pageIndex = _hotTopicObj.pageIndex + 1;
      if (_hotTopicObj.pageIndex <= _pageCount) {
        this.hotTopicData(_hotTopicObj);
      } else {
        return
      }
    }else{
      return
    }
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