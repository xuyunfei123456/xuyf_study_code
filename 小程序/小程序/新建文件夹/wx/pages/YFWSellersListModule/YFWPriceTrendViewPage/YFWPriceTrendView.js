// pages/YFWSellersListModule/YFWPriceTrendViewPage/YFWPriceTrendView.js
var wxCharts = require('../../../utils/wxcharts.js');
var lineChart = null;
import { SaleComparePricesApi } from '../../../apis/index.js'
const trendApi = new SaleComparePricesApi()

import {
  isNotEmpty,
} from '../../../utils/YFWPublicFunction.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: {
      medicine_id: 0,
      medicine_name: "",
      medicine_store: "",
      trend_time: "",
      price: "¥0.00",
      price_sort: 'level',
      price_icon: '/images/pt_level.png',
      visit_count: 0,
      store_count: 0,
      trend_decription: "",
      time_selected_index: 0,
      charts_item: {},
      trend_charts_data:{
        categories: [0], // x坐标值
        series: [{
          name: "近一个月价格趋势",
          color: '#1fdb9b',
          data: [0], // 折线图的值
          format: function (val, name) {
            return val.toFixed(2);
          }
        }] // y坐标值
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params && typeof(options.params) == 'string' && JSON.parse(options.params) ||{ value: 562245 }
    this.data.dataSource.medicine_id = params.value

    this.createTrendChartsView()
    this.getTrendInfo()
  },

  /** 创建折线图 */
  createTrendChartsView: function () {
    let chartsWidth = 310;
    let chartsHeight = 200
    try {
      let res = wx.getSystemInfoSync();
      chartsWidth = res.windowWidth / 375 * 310;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    /** 构建折线图 */
    lineChart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: this.data.dataSource.trend_charts_data.categories,
      animation: false,
      series: this.data.dataSource.trend_charts_data.series,
      xAxis: {
        disableGrid: true,
        fontColor: "#999999"
      },
      yAxis: {
        fontColor: "#999999",
        gridColor: "#e5e5e5",
        format: function (val) {
          return val.toFixed(2);
        },
      },
      width: chartsWidth,
      height: chartsHeight,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve',
      }
    })
  },

  /**
   * 请求价格趋势信息
   */
  getTrendInfo: function () {
    wx.showLoading({
      title: '加载中',
    })
    trendApi.getPriceTrendInfo(this.data.dataSource.medicine_id).then(response => {
      console.log(response)
      wx.hideLoading();
      let _price;
      if(response.price && response.price != '--'){
        _price = response.price.toFixed(2) || '--'
      }else{
        _price =response.price
      }
      this.setData({
        'dataSource.medicine_name': response.goods_name,
        'dataSource.medicine_store': response.mill_title,
        'dataSource.trend_time': this.replaceString(response.time),
        'dataSource.price': '¥' + _price,
        'dataSource.price_sort': response.price_sort,
        'dataSource.price_icon': '/images/pt_' + response.price_sort + '.png',
        'dataSource.visit_count': response.visit_count,
        'dataSource.store_count': response.store_num,
        'dataSource.trend_decription': response.chart_desc,
        'dataSource.charts_item': response.chart_item,
        'dataSource.trend_charts_data': this.dealChartsData(response.chart_item)
      })

      // 折线图更新数据      
      lineChart.updateData(this.data.dataSource.trend_charts_data)

    }).then(error => {
      if(error) {
        wx.hideLoading()
        wx.showToast({
          title: '价格趋势加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * 请求折线图数据
   */
  getChartsInfo: function (dayCount) {
    trendApi.getPriceTrendChart(this.data.dataSource.medicine_id,dayCount).then(response => {
      console.log(response)
      this.setData({
        'dataSource.charts_item': response,
        'dataSource.trend_charts_data': this.dealChartsData(response)
      })

      // 折线图更新数据
      lineChart.updateData(this.data.dataSource.trend_charts_data)
    }).then(error => {

    })
  },

  /**
   * 处理折线图数据
   */
  dealChartsData: function (chartsData) {
    // 价格数据
    let price_list = chartsData.price_list
    let seriesData = []
    for (let index = 0; index < price_list.length; index++) {
      let price_model = price_list[index];
      seriesData.push(price_model.price)
    }

    // 时间数据
    let time_list = chartsData.time_list
    let categories = []
    for (let index = 0; index < time_list.length; index++) {
      let time_model = time_list[index];
      categories.push(time_model.time)
    }

    // 标题
    let name = "近一个月价格趋势图"
    if (this.data.dataSource.time_selected_index == 0){
      name = "近一个月价格趋势图"
    } else if (this.data.dataSource.time_selected_index == 1) {
      name = "近三个月价格趋势图"
    } else if(this.data.dataSource.time_selected_index == 2){
      name = "近一年价格趋势图"
    }

    // 组合数据
    let charts = {
      categories: categories, // x坐标值
      series: [{
        name: name,
        color: '#1fdb9b',
        data: seriesData, // 折线图的值
        format: function (val, name) {
          return val.toFixed(2);
        }
      }]
    }

    return charts;
  },

  /**
   * 切换价格趋势时间
   */
  changeTrendTime: function (event) {
    let index = event.currentTarget.dataset.index
    if (index != this.data.dataSource.time_selected_index) {
      let dayCount = 30
      if(index == 0) {
        dayCount = 30
      }else if (index == 1) {
        dayCount = 90
      }else if (index == 2) {
        dayCount = 365
      }
      this.getChartsInfo(dayCount)
      this.setData({
        'dataSource.time_selected_index': index
      })
    }
  },

  /**
   * 点击折线图弹窗
   */
  showChartValue: function (event) {
    lineChart.showToolTip(event, {
      format: function (item, category) {
        return category + ' ' + '平均成交价' + item.data
      }
    });
  },

  /**
   * 点击去购买
   */
  toBuyMedicine: function () {
    wx.navigateBack({
      
    })
  },

  /** 
   * 格式化时间字符串 横线替换为小数点
   * @time 要替换的时间字符串
   */
  replaceString: function(time) {
    while (time.indexOf('-') > 0) {
      time = time.replace('-','.')
    }
    return time;
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
    return {
      title: this.data.dataSource.medicine_name,
      path: 'pages/YFWSellersListModule/YFWPriceTrendViewPage/YFWPriceTrendView?params=' + JSON.stringify({ value: this.data.dataSource.medicine_id})
    }
  }
})