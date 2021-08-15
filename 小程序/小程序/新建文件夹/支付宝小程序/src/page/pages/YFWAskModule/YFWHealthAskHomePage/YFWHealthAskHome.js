import {
  Block,
  View,
  Image,
  Text,
  ScrollView,
  Swiper,
  SwiperItem
} from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'
var util = require('../../../../utils/util.js')
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { tcpImage } from '../../../../utils/YFWPublicFunction.js'
import { HealthAskApi } from '../../../../apis/index.js'
const myhealAsk = new HealthAskApi()
import { YFWHealthAskIndexModel } from './Model/YFWHealthAskIndexModel.js'
import HealthAskQuestionItemView from '../../../../components/YFWHealthAskQuestionItemView/YFWHealthAskQuestionItemView'
import HealthAskAllDepartView from '../../../../components/YFWHealthAskAllDepartView/YFWHealthAskAllDepartView'
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import './YFWHealthAskHome.scss'

class YFWHealthAskHome extends Taro.Component {
  config = {
    navigationBarTitleText: '健康问答',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    onReachBottomDistance: 90,
  }
  constructor(props){
    super(props)
    this.state = {
      docLecture: '',
      hotCont: [],
      queNum: '',
      replyQuey: [],
      hotQuey: [],
      dataArray: [],
      selectIndex: 0,
      dataSource: [
        {
          id: 0,
          name: '最新',
          data: []
        },
        {
          id: 1,
          name: '热门',
          data: []
        },
        {
          id: 2,
          name: '科室',
          data: []
        }
      ],
      datainfo: {}
    }
  }
  toDetail(e) {
    let cell = e.currentTarget.dataset.cell //选中小科室
    let pageFrom = 'healthHome'
    let params = {
      selectModel: cell,
      pageFrom: pageFrom
    }
  pushNavigation('get_ASK_all_category', params)
  }
  //跳转到搜索页
  goSearch() {
    pushNavigation('get_ASK_Search')
  }
  //问答所有科室页面
  alDpart() {
    pushNavigation('get_ASK_all_department')
  }
  //提问页面
  btnMyask() {
    pushNavigation('get_submit_ASK')
  }
  //我的问答
  btnMyQA() {
    pushNavigation('get_submit_ASK')
  }
  //问答所有问答
  newQTel() {
    pushNavigation('get_ASK_all_question')
  }
  //问题详情页面
  replyQuey(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount() {
    var that = this
    Taro.showLoading({
      title: '加载中'
    })
    myhealAsk.getAnsDetal().then(res => {
      Taro.hideLoading()
      let datainfo = YFWHealthAskIndexModel.getModelArray(res)
      let dataSource = this.state.dataSource
      dataSource[0].data = datainfo.new_ask_items
      dataSource[1].data = datainfo.popular_ask_items
      dataSource[2].data = []
      that.setState({
        dataSource: dataSource,
        datainfo: datainfo
      })
      console.log(res.ad_detail.image, 'res.ad_detail.image')
    })
    myhealAsk.getAlloffice().then(res => {
      Taro.hideLoading()
      console.log(res, 'alloffice')
      that.setState({
        dataArray: res || []
      })
    })
  }

  toH5(e) {
    let docLecture = e.currentTarget.dataset.info
    console.log(e, 'docLecture')
    pushNavigation(docLecture.type, docLecture)
  }
  changeQuestionIndex(event) {
    var index = event.currentTarget.dataset.index
    if (index != this.state.selectIndex) {
      this.setState({
        selectIndex: index
      })
    }
  }
  swiperChangIndex(event) {
    if (event.detail.source == 'touch') {
      this.setState({
        selectIndex: event.detail.current
      })
    }
  }
  clickMyAskMethod() {
    // pushNavigation('get_ASK')
  }
  clickMyMethod() {
    pushNavigation('get_myASK')
  }
  render() {
    const { selectIndex, dataSource, datainfo, dataArray } = this.state
    const replyName = datainfo.last_ask&&datainfo.last_ask[0]&&datainfo.last_ask[0].name || '',
    replyTime = datainfo.last_ask&&datainfo.last_ask[0]&&datainfo.last_ask[0].reply_time || '';
    return (
      <View className="myBox">
        <View className="topView">
          <View className="topSearchView" onClick={this.goSearch}>
            <View className="search_input_view">
              <Image
                className="search_icon"
                src={require('../../../../images/search.png')}
              ></Image>
              <Text className="placeholder">请输入疾病或症状</Text>
            </View>
            <View className="search-text">
              <Text>搜索</Text>
            </View>
          </View>
        </View>
        <ScrollView
          className="health-top-view"
          scrollX="true"
          scrollY="false"
          scrollIntoView={'item-' + selectIndex}
        >
          {dataSource.map((item, index) => {
            return (
              <Block key={item.id}>
                <View
                  className="select-text"
                  onClick={this.changeQuestionIndex}
                  data-index={index}
                >
                  <TitleView
                    title={item.name}
                    fontWeight={index == selectIndex ? '500' : 'normal'}
                    showLine={index == selectIndex}
                    lineHeight="25"
                  ></TitleView>
                </View>
              </Block>
            )
          })}
        </ScrollView>
        <View className="health-view">
          <View className="health-top-context" onClick={this.btnMyQA}>
            <Text className="health-top-mine">我的问答</Text>
            <View className="health-top-mineView">
              <Image src={datainfo.last_ask[0].intro_image}></Image>
              <Text>
                {replyName +
                  '  ' +
                  replyTime +
                  '回答了问题'}
              </Text>
            </View>
            <Image
              src={require('../../../../images/yfwsk/wytw.png')}
              className="health-top-image"
            ></Image>
          </View>
          <Swiper
            current={selectIndex}
            className="healyh-context"
            onChange={this.swiperChangIndex}
          >
            {dataSource.map((item, index) => {
              return (
                <Block key={item.id}>
                  <SwiperItem>
                    {index == 0 && (
                      <ScrollView
                        className="last-new"
                        scrollX="false"
                        scrollY="true"
                      >
                        <HealthAskQuestionItemView
                          data={datainfo.new_ask_items}
                        ></HealthAskQuestionItemView>
                      </ScrollView>
                    )}
                    {index == 1 && (
                      <ScrollView
                        className="last-new"
                        scrollX="false"
                        scrollY="true"
                      >
                        <HealthAskQuestionItemView
                          data={datainfo.popular_ask_items}
                        ></HealthAskQuestionItemView>
                      </ScrollView>
                    )}
                    {index == 2 && (
                      <HealthAskAllDepartView
                        data={dataArray}
                      ></HealthAskAllDepartView>
                    )}
                  </SwiperItem>
                </Block>
              )
            })}
          </Swiper>
        </View>
        <View className="bottom-button">
          <View className="bottom-button-line"></View>
          <View className="bottom-button-context">
            <View
              className="bottom-button-view"
              onClick={this.clickMyAskMethod}
            >
              <Image src={require('../../../../images/yfwsk/wenda.png')}></Image>
              <Text>问答</Text>
            </View>
            <View className="bottom-button-view" onClick={this.clickMyMethod}>
              <Image
                src={require('../../../../images/yfwsk/health_mine.png')}
              ></Image>
              <Text>我的</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default YFWHealthAskHome
