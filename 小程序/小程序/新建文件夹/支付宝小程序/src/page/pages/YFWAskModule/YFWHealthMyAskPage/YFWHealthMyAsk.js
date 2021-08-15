import { Block, View, Image, Text, ScrollView } from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'

var util = require('../../../../utils/util.js')
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { HealthAskApi } from '../../../../apis/index.js'
import { tcpImage,isLogin } from '../../../../utils/YFWPublicFunction.js'
const myhealAsk = new HealthAskApi()
import { YFWHealthMyAskModel } from './Model/YFWHealthMyAskModel.js'
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import HealthAskQuestionItemView from '../../../../components/YFWHealthAskQuestionItemView/YFWHealthAskQuestionItemView'
import './YFWHealthMyAsk.scss'
class YFWHealthMyAsk extends Taro.Component {
  config = {
    navigationBarTitleText: '我的问答',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    onReachBottomDistance: 90,
  }
  constructor(props){
    super(props)
    this.state = {
      hotQuey: [
        {
          num: '1条回复'
        }
      ],
      pageType: 0,
      pageSize: 10,
      pageIndex: 1,
      pepQuion: '',
      qusList: [],
      loadhidden: false,
      hidden: false,
      selectIndex: 0,
      docImg: '',
      dataSource: [
        {
          id: 0,
          name: '全部问题',
          data: []
        },
        {
          id: 1,
          name: '已回复',
          data: []
        },
        {
          id: 2,
          name: '未回复',
          data: []
        }
      ],
      datainfo: {}
    }
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount() {

  }
  componentDidMount(){
    if(isLogin()){
      Taro.showLoading({
        title: '加载中...'
      })
    }else{
      pushNavigation('get_author_login')
      return;
    }

    this.perInform()
  }
  //上拉加载
  pullOnLoading() {
    this.state.pageIndex++
    this.perInform()
  }
  perInform() {
    let pageindex = this.state.pageIndex < 1 ? 1 : this.state.pageIndex
    myhealAsk
      .getMyAskInfo(this.state.pageSize, pageindex, this.state.pageType)
      .then(res => {
        Taro.hideLoading()
        console.log(res, '我的问答')
        let qusList = []
        qusList = res.dataList.map(info => {
          return YFWHealthMyAskModel.getModelArray(info)
        })
        this.setState({
          pepQuion: res,
          qusList:
            this.state.pageIndex == 1
              ? qusList
              : this.state.qusList.concat(qusList),
          docImg: res.profile.intro_image
        })
        if (res.dataList.length < 10) {
          this.setState({
            loadhidden: false,
            hidden: true
          })
        } else {
          this.setState({
            loadhidden: false,
            hidden: false
          })
        }
      })
  }
  replyQuey(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  }
  changeQuestionIndex(event) {
    var index = event.currentTarget.dataset.index
    if (index != this.state.selectIndex) {
      if (index == 0) {
        this.state.pageType = 0
      }
      if (index == 1) {
        this.state.pageType = 2
      }
      if (index == 2) {
        this.state.pageType = 1
      }
      this.setState({
        selectIndex: index,
        pageIndex: 1,
        qusList: [],
        pageType: this.state.pageType
      })
      this.perInform()
    }
  }
  //跳转到搜索页
  goSearch() {
    pushNavigation('get_ASK_Search')
  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.state.hidden) {
      return
    }
    this.setState({
      loadhidden: true
    })

    this.pullOnLoading()
  }
  render() {
    const {
      docImg,
      pepQuion,
      selectIndex,
      dataSource,
      qusList,
      loadhidden,
      hidden
    } = this.state
    return (
      <Block>
        <View className="topView">
          <View className="topSearchView" onClick={this.goSearch}>
            <View className="search_input_view">
              <Image
                className="search_icon"
                src={require('../../../images/search.png')}
              ></Image>
              <Text className="placeholder">请输入疾病或症状</Text>
            </View>
            <View className="search-text">
              <Text>搜索</Text>
            </View>
          </View>
        </View>
        <View className="bg-whit clearfix title">
          <Image src={docImg} className="hedPort"></Image>
          <View className="telRght">
            <View className="isname">{pepQuion.profile.account_name}</View>
            <View className="isQuion">
              已提问题：
              <Text className="isNum">{pepQuion.profile.ask_count}</Text>条
            </View>
          </View>
        </View>
        {/*  热门问题  */}
        <View className="newQ-All">
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
          {/*  <view class='line-view'></view>  */}
          {/*  个人问题列表  */}
          <HealthAskQuestionItemView
            data={qusList}
            froms="pharmacist_ask"
          ></HealthAskQuestionItemView>
        </View>
        <Block>
          {loadhidden && <View className="nomore">加载中...</View>}
          {hidden && <View className="nomore">没有更多了</View>}
        </Block>
        {/*  没有问题页面  */}
      </Block>
    )
  }
}

export default YFWHealthMyAsk
