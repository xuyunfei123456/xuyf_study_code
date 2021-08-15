import Taro, { Component, Config } from '@tarojs/taro'
import {
    Block,
    View,
    Image,
    Text,
    Button
} from '@tarojs/components'
var util = require('../../../../utils/util.js')

import { HealthAskApi } from '../../../../apis/index.js'
const healthAskApi = new HealthAskApi()
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import './YFWHealthAskAllQuestion.scss'
import YFWMoreModal from '../../../../components/YFWMoreModal/YFWMoreModal'

export default class YFWHealthAskAllQuestion extends Component {
  config = {
    navigationBarTitleText: '全部问题',
  }
  constructor(props){
    super(props)
    this.state = {
      pageIndex: 1,
      pageSize: 10,
      replyQuey: [],
      hotCont: [],
      hotContTwo: [],
      departmentNamePy: '',
      showView: false,
      loadhidden: false,
      hidden: false,
      isOpenMore:false,
    }
  }

  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount() {
    //科室分类
    healthAskApi.getClassdpart(this.state.departmentNamePy).then(res => {
      this.setState({
        hotCont: res.items.slice(0, 8),
        hotContTwo: res.items.slice(8)
      })
    })
    //问答列表
    this.onReachBottom()
  }
  openUtilityMenu() {
    this.setState({isOpenMore:true})
  }
  onChangeShowState() {
    this.setState({
      showView: this.state.showView
    })
  }
  // 问题
  replyQueyFn(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      dell: dell
    }
    pushNavigation('get_ask_detail', params)
  }
  itemClick(event) {
    let model = event.currentTarget.dataset.item
    let pageFrom = 'allOfPage'
    let params = {
      model: model,
      pageFrom: pageFrom
    }
    pushNavigation('get_ASK_all_category', params)
  }

  ask() {
    //问答列表

    healthAskApi
      .getListofask(this.state.pageIndex, this.state.pageSize, '')
      .then(res => {
        this.setState({
          replyQuey: this.state.replyQuey.concat(res.dataList)
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
  onReachBottom() {
    if (this.state.hidden) {
      return
    }
    this.setState({
      loadhidden: true
    })
    this.state.pageIndex++
    this.ask()
  }
  render() {
    const {
      isOpenMore,
      hotCont,
      showView,
      hotContTwo,
      replyQuey,
      loadhidden,
      hidden
    } = this.state
    return (
      <Block>
        <View className="outSkip">
        
          <YFWMoreModal  isOpened={isOpenMore} onClose={() => this.setState({ isOpenMore: false })}></YFWMoreModal>
          <View className="topViewSBotm">
            <View className="iSkip" onClick={this.openUtilityMenu}>
              <Image
                className="moreView"
                src={require('../../../../images/more_white.png')}
                mode="aspectFit"
                id="more_image"
              ></Image>
            </View>
          </View>
        </View>
        <View>
          <View className="Qhead">
            <View className="hotCont hotWth">
              {hotCont.map((item, index) => {
                return (
                  <View
                    className="hotSon QheadSon"
                    key="index"
                    onClick={this.itemClick}
                    data-item={item}
                  >
                    {item.department_name}
                  </View>
                )
              })}
            </View>
            <View className={'hotCont hotWth hide' + (showView ? 'show' : '')}>
              {hotContTwo.map((item, index) => {
                return (
                  <View
                    className="hotSon QheadSon"
                    key="index"
                    onClick={this.itemClick}
                    data-item={item}
                  >
                    {item.department_name}
                  </View>
                )
              })}
            </View>
            <View>
              <Button
                className={'hide' + (showView ? 'show' : '') + ' btnCol'}
                onClick={this.onChangeShowState}
              >
                <Text className="inlMidle">收起分类</Text>
                <Image
                  src={require('../../../../images/arrow_downGren.png')}
                  className="mrOn inlMidle"
                  mode="widthFix"
                ></Image>
              </Button>
              <Button
                className={'hide' + (showView ? '' : 'show') + ' btnCol'}
                onClick={this.onChangeShowState}
              >
                <Text className="inlMidle">展开全部分类</Text>
                <Image
                  src={require('../../../../images/arrow_upGren.png')}
                  className="mrOn inlMidle"
                  mode="widthFix"
                ></Image>
              </Button>
            </View>
            <View></View>
          </View>
          <View className="newQAll newMargin">
            {replyQuey.map((item, index) => {
              return (
                <View
                  className="replyQuey"
                  key="unique"
                  onClick={this.replyQueyFn}
                  data-item={item}
                >
                  <View className="replyOne">{item.title}</View>
                  <View className="replyTwo">
                    <View className="replyNum">
                      {item.reply_count + '条回复'}
                    </View>
                    {item.status === '待回复' && (
                      <View className="repState repCol_gray">
                        <View className="QuesImg">
                          <Image
                            src={require('../../../../images/yfwsk/inf999.png')}
                          ></Image>
                          <View className="Quesname">{item.status}</View>
                          <View className="clearBoth"></View>
                        </View>
                      </View>
                    )}
                    {item.status === '已回复' && (
                      <View className="repState repCol_gren">
                        <View className="QuesImg">
                          <Image
                            src={require('../../../../images/yfwsk/infgreen.png')}
                          ></Image>
                          <View className="Quesname">{item.status}</View>
                          <View className="clearBoth"></View>
                        </View>
                      </View>
                    )}
                    {item.status === '已采纳' && (
                      <View className="repState repCol_red">
                        <View className="QuesImg">
                          <Image
                            src={require('../../../../images/yfwsk/caina.png')}
                          ></Image>
                          <View className="Quesname">{item.status}</View>
                          <View className="clearBoth"></View>
                        </View>
                      </View>
                    )}
                    <View className="replyTime">{item.update_time}</View>
                  </View>
                </View>
              )
            })}
          </View>
          {loadhidden && <View className="nomore">加载中...</View>}
          {hidden && <View className="nomore">没有更多了</View>}
        </View>
      </Block>
    )
  }
}

