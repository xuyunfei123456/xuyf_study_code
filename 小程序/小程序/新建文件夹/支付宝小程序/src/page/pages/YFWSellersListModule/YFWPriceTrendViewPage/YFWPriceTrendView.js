import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Canvas } from '@tarojs/components'
import './YFWPriceTrendView.scss'
import { SaleComparePricesApi } from '../../../../apis/index'
import { isNotEmpty, safe, toDecimal, safeObj } from '../../../../utils/YFWPublicFunction'
let UCharts = require('../../../../utils/ucharts')
let lineChart
let _self
const trendApi = new SaleComparePricesApi()

export default class YFWPriceTrendView extends Component {

  config = {
    navigationBarTitleText: '价格趋势'
  }

  constructor (props) {
    super(props)
    this.state = {
      medicine_id: 0,
      medicine_name: '',
      medicine_store: '',
      trend_time: '',
      price: '¥0.00',
      price_sort: 'level',
      price_icon: require('../../../../images/pt_level.png'),
      visit_count: 0,
      store_count: 0,
      trend_decription: '',
      time_selected_index: 0,
      charts_item: {},
      trend_charts_data: {
        categories: [0], // x坐标值
        series: [{
          name: "近一个月价格趋势",
          color: '#1fdb9b',
          data: [0], // 折线图的值
          format: function (val, name) {
            return val.toFixed(2)
          }
        }] // y坐标值
      }
    }
  }

  componentWillMount () { 
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.state.medicine_id = value.value || 0
    }
    this.dayCount = 30
  }

  componentDidMount () { 
    this.buildChartView()
    this.fetchPriceTrendData()
  }

  onShareAppMessage () {
    const { medicine_id } = this.state
    const { medicine_name } = this.state
    return {
      title: safe(medicine_name),
      path:'/page/pages/YFWSellersListModule/YFWPriceTrendViewPage/YFWPriceTrendView?params='+JSON.stringify({value: medicine_id})
    }
  }

  /** 获取数据 */
  fetchPriceTrendData () {
    const { medicine_id } = this.state
    Taro.showLoading({ title: '加载中...' })
    trendApi.getPriceTrendInfo(medicine_id).then(response => {
      
      Taro.hideLoading()
      const price_sort = safe(response.price_sort)
      let price_icon = require('../../../../images/pt_level.png')
      if (price_sort === 'level') {
        price_icon = require('../../../../images/pt_level.png')
      } else if (price_sort === 'up') {
        price_icon = require('../../../../images/pt_up.png')
      } else if (price_sort === 'down') {
        price_icon = require('../../../../images/pt_down.png')
      }
      const chartData = this.dealChartsData(safeObj(response.chart_item))
      this.setState({
        medicine_name: safe(response.goods_name),
        medicine_store: safe(response.mill_title),
        trend_time: this.replaceString(safe(response.time)),
        price: '¥' + toDecimal(safe(response.price)),
        price_sort: price_sort,
        price_icon: price_icon,
        visit_count: safe(response.visit_count),
        store_count: safe(response.store_num),
        trend_decription: safe(response.chart_desc),
        charts_item: safeObj(response.chart_item),
        trend_charts_data: chartData
      })

      // 折线图更新数据      
      lineChart.updateData(chartData)

    }, error => {
      Taro.hideLoading()
      Taro.showToast({
        title: error.msg || '价格趋势加载失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  /** 请求折线图数据 */
  fetchChartsData () {
    const { medicine_id } = this.state
    Taro.showLoading({ title: '加载中...' })
    trendApi.getPriceTrendChart(medicine_id, this.dayCount).then(response => {
      Taro.hideLoading()
      const chartData = this.dealChartsData(safeObj(response))
      this.setState({
        charts_item: safeObj(response),
        trend_charts_data: chartData
      })
      // 折线图更新数据      
      lineChart.updateData(chartData)
    }, error => {
      Taro.hideLoading()
    })
  }

  /** 处理折线图数据 */
  dealChartsData (chartsData) {
    // 价格数据
    let price_list = chartsData.price_list
    let seriesData = []
    for (let index = 0; index < price_list.length; index++) {
      let price_model = price_list[index]
      seriesData.push(price_model.price)
    }

    // 时间数据
    let time_list = chartsData.time_list
    let categories = []
    for (let index = 0; index < time_list.length; index++) {
      let time_model = time_list[index]
      categories.push(time_model.time)
    }

    // 标题
    const { time_selected_index } = this.state
    let name = "近一个月价格趋势图"
    if (time_selected_index == 0){
      name = "近一个月价格趋势图"
    } else if (time_selected_index == 1) {
      name = "近三个月价格趋势图"
    } else if(time_selected_index == 2){
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
          return val.toFixed(2)
        }
      }]
    }

    return charts
  }

  /** 构建折线图View */
  buildChartView () {
    let _self = this
    let chartsWidth = 315
    let chartsHeight = 200
    try {
      let res = Taro.getSystemInfoSync()
      chartsWidth = res.windowWidth*0.9
    } catch (e) {
      console.error('getSystemInfoSync failed!')
    }
    /** 构建折线图 */
    const { trend_charts_data } = this.state
    lineChart = new UCharts({
      $this: _self,
      canvasId: 'lineChartCanvas',
      type: 'line',
      categories: trend_charts_data.categories,
      animation: false,
      series: trend_charts_data.series,
      padding: [5, 0, 0, 0],
      fontSize: 11,
      xAxis: {
        disableGrid: true,
        fontColor: "#999999"
      },
      yAxis: {
        fontColor: "#999999",
        gridColor: "#e5e5e5",
        gridType:'dash',
        format: function (val) {
          return val.toFixed(2)
        },
      },
      width: chartsWidth,
      height: chartsHeight,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve',
        // tooltip:{
        //   confine:true,
        //   extraCssText:{
       
        //   }
        // }
      },
      legend: {
        backgroundColor: '#ffffff',
        borderColor: '#ffffff'
      },
 
    })
  }

  render () {

    return (
      <View className='trend'>
        {this.renderMedicinInfoView()}
        {this.renderTrendChartView()}
        {this.renderTrendDescView()}
      </View>
    )
  }

  /** 渲染药品信息 */
  renderMedicinInfoView () {
    const { medicine_name } = this.state
    const { medicine_store } = this.state
    const { trend_time } = this.state
    const { price } = this.state
    const { price_icon } = this.state
    const { visit_count } = this.state
    const { store_count } = this.state

    return (
      <View className='trend-card-view trend-row trend-wrap trend-content-between'>
        <Text className='trend-line-2 trend-width-84 trend-dark-text trend-15-text trend-bold-text'>{medicine_name}</Text>
        <View className='trend-row trend-width-84 trend-margin-bottom-25 trend-margin-top-5'>
          <Text className='trend-store trend-line-2 trend-10-text trend-light-text'>{medicine_store}</Text>
          <Text className='trend-time trend-10-text trend-white-text'>{trend_time}</Text>
        </View>
        <View className='trend-column trend-content-center trend-algin-center'>
          <Text className='trend-normal-text trend-15-text trend-bold-text'>均价</Text>
          <View className='trend-row trend-content-center trend-algin-center'>
            <Text className='trend-red-text trend-15-text trend-bold-text'>{price}</Text>
            <Image className='trend-sort-icon' src={price_icon} mode='widthFix' />
          </View>
        </View>
        <View className='trend-column trend-content-center trend-algin-center'>
          <Text className='trend-normal-text trend-15-text trend-bold-text'>浏览次数</Text>
            <Text className='trend-dark-text trend-15-text trend-bold-text'>{visit_count}</Text>
        </View>
        <View className='trend-column trend-content-center trend-algin-center'>
          <Text className='trend-normal-text trend-15-text trend-bold-text'>在售商家</Text>
            <Text className='trend-dark-text trend-15-text trend-bold-text'>{store_count}</Text>
        </View>
      </View>
    )
  }

  /** 渲染折线图 */
  renderTrendChartView () {
    const { time_selected_index } = this.state
    const timeList = ['近一个月', '近三个月', '近一年']

    return (
      <View className='trend-card-view trend-row trend-wrap trend-content-between trend-algin-center' style='padding-bottom: 0;'>
        <Text className='trend-dark-text trend-15-text trend-bold-text'>价格趋势</Text>
        <View className='trend-width-84 trend-row trend-algin-center trend-margin-top-10 trend-margin-bottom-25'>
          <Text className='trend-dark-text trend-12-text trend-margin-right-5'>时间</Text>
          {timeList.map((timeItem, timeIndex) => {
            const timeClass = time_selected_index === timeIndex ? 'trend-time-item trend-time-item-select' : 'trend-time-item'
            return <Text className={timeClass} onClick={this.onChartsTimeClick.bind(this, timeIndex)}>{timeItem}</Text>
          })}
        </View>
        <View className='trend-width-84'>
          <Canvas style='width: 100%; height: 420rpx' className='trend-charts' canvasId='lineChartCanvas' id='lineChartCanvas' disableScroll={true} onTouchStart={this.onshowChartValue.bind(this)} ></Canvas>
        </View>
      </View>
    )
  }

  /** 渲染指数解读 */
  renderTrendDescView () {
    const { trend_decription } = this.state

    return (
      <View className='trend-card-view trend-row trend-wrap trend-content-between trend-algin-center'>
        <Text className='trend-dark-text trend-15-text trend-bold-text'>指数解读</Text>
        <Text className='trend-buy trend-orange-text trend-10-text trend-bold-text' onClick={this.onBuyClick.bind(this)}>去购买</Text>
        <Text className='trend-width-84 trend-margin-top-15 trend-light-text trend-10-text'>{trend_decription}</Text>
      </View>
    )
  }

  /** 折线图时间改变 */
  onChartsTimeClick (currentIndex) {
    const { time_selected_index } = this.state
    if (currentIndex === time_selected_index) {
      return
    }

    if (currentIndex === 0) {
      this.dayCount = 30
    } else if (currentIndex === 1) {
      this.dayCount = 90
    } else if (currentIndex === 2) {
      this.dayCount = 365
    }
    this.fetchChartsData()
    this.setState({
      time_selected_index: currentIndex
    })
  }

  /** 点击折线图弹窗 */
  onshowChartValue (event) {
    lineChart.showToolTip(event, {
      format: function (item, category) {
        return category + ' ' + '平均成交价' + item.data
        // this.textList=[{text:category},{text:"平均成交价"+item.data}]
        // return this.textList
      }
    })
  }

  /** 点击去购买 */
  onBuyClick () {
    Taro.navigateBack()
  }

  /** 格式化时间字符串 横线替换为小数点 */
  replaceString (timeString) {
    while (timeString.indexOf('-') > 0) {
      timeString = timeString.replace('-','.')
    }
    return timeString
  }
}