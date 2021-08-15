// pages/YFWAskModule/allHotQ/allHotQ.js
var util = require('../../../utils/util.js')
var log = require('../../../utils/log.js')
import {
  HealthAskApi
} from '../../../apis/index.js'
const healthAskApi = new HealthAskApi()
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
import {
  YFWHealthAskCategoryQuestionModel
} from './Model/YFWHealthAskCategoryQuestionModel.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadhidden: false,
    hidden: false,
    classCont: [],
    replyQuey: [],
    showView: false,
    pageIndex: 1,
    pageSize: 10,
    isclassfy: {},
    datasource: {},
    hotCont: {},
    isPageCount: [],
    pageWher: '',
    departmentNamePy: ''
  },
  expandAll: function () {

  },
  /* 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    let params, pageHomes, datasource, classfy;
    try {
      // this.data.pageIndex++;
      params = options.params && typeof (options.params) == 'string' && JSON.parse(options.params) || {}
      // console.log(params,'params')
      pageHomes = params.pageFrom
      datasource = params.model
      classfy = params.selectModel ? params.selectModel : params.model
    } catch (error) {
      log.info('model报错:' + error)
    }

    wx.showLoading({
      title: '加载中...',
      icon: 'loading'
    })
    this.setData({
      datasource: datasource, // 选中大科室
      isclassfy: classfy // 选中小科室
    })
    if (pageHomes === 'healthHome' || pageHomes === 'searchPage') {
      this.requrClass()
      this.ask()
    } else if (pageHomes === 'pageAlldepart') {
      this.classCheck()
      this.ask()
    } else if (pageHomes === 'allOfPage') {
      //科室分类
      healthAskApi.getClassdpart(this.data.departmentNamePy).then(res => {
        console.log(res, 'pppppp')
        this.setData({
          classCont: res
        })
      })
      this.ask()
    }

  },

  classCheck() {
    this.setData({
      classCont: this.data.datasource
    })
    console.log(this.data.classCont, 'classCont')
  },
  itemClick: function (event) {
    let model = event.detail.context
    // let model = event.currentTarget.dataset.item;
    this.setData({
      isclassfy: model,
      showView: false

    })
    this.onRefresh()
    console.log(this.data.isclassfy, 'isclassfy')
  },

  onRefresh: function () {
    // 下拉刷新
    this.data.pageIndex = 1;
    this.ask()
  },

  pullOnLoading: function () {
    // 上拉加载
    this.data.pageIndex++;
    this.ask()
  },

  ask: function () {

    let py_name = this.data.isclassfy.py_name ? this.data.isclassfy.py_name : this.data.datasource.py_name
    let pagindex = this.data.pageIndex < 1 ? 1 : this.data.pageIndex

    healthAskApi.getListofask(pagindex, this.data.pageSize, py_name).then(res => {
      wx.hideLoading()
      let replyQuey = YFWHealthAskCategoryQuestionModel.getQuestionArray(res.dataList)
      console.log(py_name, res, 'resCLass')
      this.setData({
        replyQuey: this.data.pageIndex === 1 ? replyQuey : this.data.replyQuey.concat(replyQuey),
        isPageCount: res.pageCount
      })
      if (res.dataList.length < 10) {
        this.setData({
          loadhidden: false,
          hidden: true
        })
      } else {
        this.setData({
          loadhidden: false,
          hidden: false
        })
      }

    }).then(err => {
      // 这个方法不管请求成功失败，都会回调，所以必须要加判断
      if (err != undefined) {
        // 这是请求错误
        this.data.pageIndex--;
      } else {
        // 这是请求成功
      }
    })
  },
  //获取某科室下的子分类 departmentNamePy 比如 内科==nk
  requrClass: function () {
    let py_name = this.data.isclassfy.parent_py_name ? this.data.isclassfy.parent_py_name : this.data.datasource
    healthAskApi.getClassdpart(py_name).then(res => {
      console.log(res, 'Bigdatasource')
      this.setData({
        classCont: res
      })
    })
  },
  openUtilityMenu: function () {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent('#onSkip').showModal(bottom)
    })

  },
  onChangeShowState: function () {

    var that = this;
    let query = wx.createSelectorQuery()
    query.select('#category_view').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      if (that.data.showView) {
        that.selectComponent('#category').showModal(bottom)
      } else {

      }
    })
    that.setData({
      showView: (!that.data.showView)
    })
  },
  // 某个问题详情
  replyQuey(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  },
  toAskQuestion: function () {
    pushNavigation('get_submit_ASK')
    // pushNavigation('get_ASK')
  },
  btnMyQA: function () {
    pushNavigation('get_myASK')
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
    if (this.data.hidden) {
      return
    }
    this.setData({
      loadhidden: true
    })
    this.pullOnLoading()

  },
})