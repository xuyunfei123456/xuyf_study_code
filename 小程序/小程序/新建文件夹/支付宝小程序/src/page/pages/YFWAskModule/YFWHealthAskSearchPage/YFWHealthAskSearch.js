import { Block, View, Image, Input, Button } from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'

var util = require('../../../../utils/util.js')
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { HealthAskApi } from '../../../../apis/index.js'
import './YFWHealthAskSearch.scss'
const myhealAsk = new HealthAskApi()

class YFWHealthAskSearch extends Taro.Component {
  config = {
    navigationBarTitleText: '热搜',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    onReachBottomDistance: 90
  }
  constructor(props){
    super(props)
    this.state = {
      srcEarch: '../../../../images/search.png',
      sehotCont: [],
      bindSource: [],
      searchList: [],
      hideScroll: true,
      hideScrollTwo: true,
      homeHidden: false,
      pageIndex: 1,
      inputValue: '',
      loadhidden: false,
      hidden: false
    }
  }
  // 熱搜
  onHotcont(e) {
    //  let model = e.currentTarget.dataset.item //选中大科室
    let cell = e.currentTarget.dataset.item //选中小科室
    let pageFrom = 'searchPage'
    let params = {
      // model: model,
      selectModel: cell,
      pageFrom: pageFrom
      // pushNavigation('get_ASK_all_category', 'department_id')
    }
    pushNavigation('get_ASK_all_category', params)
  }
  onSearch() {
    if (this.state.pageIndex == 1) {
      Taro.showLoading({
        title: '加载中...'
      })
    }
    myhealAsk
      .getSearchAsk(this.state.inputValue, this.state.pageIndex)
      .then(res => {
        Taro.hideLoading()
        console.log(res, '搜索结果')
        if (res.dataList.length != 0 || this.state.searchList.length != 0) {
          this.setState({
            searchList: this.state.searchList.concat(res.dataList),
            hideScrollTwo: false,
            hideScroll: true,
            homeHidden: true
          })
          if (res.dataList.length < 18) {
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
        } else if (this.state.searchList.length != 0) {
          this.setState({
            searchList: [],
            hideScrollTwo: true,
            hideScroll: true
          })
        }
      })
  }
  //input输入框
  bindinput(e) {
    this.state.searchList = []
    let prefix = e.detail.value
    myhealAsk.getSearchAsk(prefix, this.state.pageIndex).then(res => {
      console.log(res, 'input输入框')
      if (res.dataList.length != 0) {
        this.setState({
          bindSource: res.dataList,
          inputValue: prefix,
          hideScrollTwo: true,
          hideScroll: false,
          homeHidden: true
        })
      } else {
        this.setState({
          bindSource: [],
          hideScrollTwo: true,
          hideScroll: true
        })
      }
    })
  }
  // 问题
  replyQuey(e) {
    this.goTo(e)
  }
  //用户点击搜索内容
  itemtap(e) {
    this.setState({
      // bindSource: [],
      // hideScroll: true
    })
    this.goTo(e)
  }
  //跳转路由
  goTo(e) {
    let dell = e.currentTarget.dataset.item
    let params = {
      value: dell.id
    }
    pushNavigation('get_ask_detail', params)
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount() {
    Taro.showLoading({
      title: '加载中'
    })
    myhealAsk.getAnsDetal().then(res => {
      Taro.hideLoading()
      console.log(res, 'hbhbhb')
      this.setState({
        sehotCont: res.hot_department_items
      })
    })
  }

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.state.hidden || this.state.hideScrollTwo) {
      return
    }
    if (this.state.hideScroll) {
      this.setState({
        loadhidden: true
      })
      this.state.pageIndex++
      this.onSearch()
    }
  }
  render() {
    const {
      srcEarch,
      inputValue,
      hideScroll,
      bindSource,
      hideScrollTwo,
      searchList,
      loadhidden,
      hidden,
      homeHidden,
      sehotCont
    } = this.state
    return (
      <View className="searBox">
        <View className="topSearch">
          <View className="isInput">
            <View className="searchSack">
              <Image src={srcEarch}></Image>
              <Input
                placeholder="请输入疾病或症状"
                onInput={this.bindinput}
                value={inputValue}
                placeholderStyle="color:#999"
              ></Input>
            </View>
            <Button className="searchBtn fc-greNum" onClick={this.onSearch}>
              搜索
            </Button>
          </View>
          {/*  搜索下拉框  */}
          <View className="box scrollview scroTop" hidden={hideScroll}>
            {bindSource.map((item, index) => {
              return (
                <Block>
                  <View className="resultS">
                    <Image src={srcEarch} className="mySearch inlMidle"></Image>
                    <View
                      data-item={item}
                      onClick={this.itemtap}
                      className="itemview inlMidle"
                    >
                      {item.title}
                    </View>
                    <View className="clearBoth"></View>
                  </View>
                </Block>
              )
            })}
            {/*  </scroll-view>  */}
          </View>
          {/*  搜索结果列表  */}
          <View className="newQAll newMargin scrollview" hidden={hideScrollTwo}>
            {searchList.map((item, index) => {
              return (
                <View
                  className="replyQuey"
                  key="unique"
                  onClick={this.replyQuey}
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
            {loadhidden && <View className="nomore">加载中...</View>}
            {hidden && <View className="nomore">没有更多了</View>}
          </View>
          <View className="clearBoth"></View>
        </View>
        {/*  热搜  */}
        <View className="outHot" hidden={homeHidden}>
          <View className="topSearch topSLeft">热搜</View>
          <View className="hotCont">
            {sehotCont.map((item, index) => {
              return (
                <View
                  className="hot-search"
                  key="union"
                  onClick={this.onHotcont}
                  data-item={item}
                >
                  {item.department_name}
                </View>
              )
            })}
          </View>
        </View>
      </View>
    )
  }
}

export default YFWHealthAskSearch
