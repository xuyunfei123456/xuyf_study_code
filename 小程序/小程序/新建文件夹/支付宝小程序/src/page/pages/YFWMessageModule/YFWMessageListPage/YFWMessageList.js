import { Block, View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/YFWMessageModule/YFWMessageListPage/YFWMessageList.js
import { MessageApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import './YFWMessageList.scss'
const messageApi = new MessageApi()

export default class YFWMessageList extends Taro.Component {
  constructor(porps) {
    super(porps)
    this.state = {
      dataArray: [],
      pageIndex: 0,
      loading: false,
      showFoot: 0,
      msg_type_id: '0',
      jumpType: '',
      loading: true
    }
  }

  componentWillMount() {
    let options = this.$router.params
    if (options === '') {
      return
    }
    console.log(options)
    let params = JSON.parse(options.params)
    Taro.setNavigationBarTitle({
      title: params.type
    })
    this.state.msg_type_id = params.msg_type_id
    this.requsetData()
  }

  onPullDownRefresh = () => {
    this.setState({
      showFoot: 0,
      pageIndex: 0
    })
    this.requsetData()
  }

  onReachBottom = () => {
    if (this.state.showFoot == 1 || this.state.showFoot == 2) {
      return
    }
    let pageIndex = this.state.pageIndex + 1
    this.setState({
      showFoot: 2,
      pageIndex: pageIndex
    })
    this.requsetData()
  }
  
  requsetData = () => {
    console.log(this.state.pageIndex)
    this.setState({
      loading: true
    })
    messageApi
      .getMessageListByType(this.state.msg_type_id, this.state.pageIndex)
      .then(
        res => {
          Taro.stopPullDownRefresh()
          console.log(res)
          let dataArray
          let showFoot = 0
          if (res.dataList.length == 0) {
            showFoot = 1
          }
          if (this.state.pageIndex > 0) {
            dataArray = this.state.dataArray.concat(res.dataList)
          } else {
            dataArray = res.dataList
          }
          console.log(dataArray)
          this.setState({
            loading: false,
            dataArray: dataArray,
            jumpType: res.jumpType,
            showFoot: showFoot
          })
        },
        error => {
          Taro.showToast({
            title: '获取消息失败',
            icon: 'none'
          })
          this.setState({
            loading: false
          })
        }
      )
  }

  clickedItem = (e,info) => {
    console.log(e)
    if (e.jumptype == '') {
      return
    }
    this.jumpDetail(e)
  }
  
  jumpDetail = item => {
    this.markMessagereaded(item.id)
    console.log(item.id)
    let pushPath = '',_param ;
    switch (item.jumptype) {
      case 'get_invite':
        pushPath = 'get_h5',
        _param={
          'message_id': item.id,
          'value': item.url,
          'order_no': item.jumpvalue
        }
        break
      case "get_order_advisory":
        pushPath = "message",
        _param={
          'message_id': item.id,
          'value': item.url,
          'order_no': item.jumpvalue
        }
        break;
      case "get_order_detail":
        pushPath = "get_order_detail",
        _param={
          'order_no': item.jumpvalue
        }
        break;
      case "get_order_list":
        pushPath = "get_order_list",
        _param={
          'index': item.active
        }
        break;
      case "get_my_coupon":
        pushPath = "get_my_coupon",
        _param = {}
        break;
      default:
        pushPath = item.jumptype
    }
    pushNavigation(pushPath,_param)
  }

  markMessagereaded = messageID => {
    messageApi.getMessageRead(messageID).then(res => { })
  }
  
  config = {
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '我的消息',
    navigationBarBackgroundColor: '#49ddb8',
    backgroundColor: '#fafafa',
    enablePullDownRefresh: true,
    enableReachBottom: true
  }

  render() {
    const { loading, dataArray, msg_type_id, showFoot } = this.state
    return (
      <View>
        {!loading && dataArray.length == 0 ? (
          <View className="view-no-message">
            <Image
              className="image-no-message"
              src="https://c1.yaofangwang.net/common/images/miniapp/ic_no_message.png"
            ></Image>
            <Text>暂无消息</Text>
          </View>
        ) : (
            <View className="list">
              {dataArray.map((info, infoindex) => {
                var test = info
                return (
                  <View state-item={info}>
                   {info.content&&<View className="item">
                      <Text className="date-text">{info.create_time}</Text>
                      <View
                        className="message-view"
                        onClick={this.clickedItem.bind(this,info)}
                        state-item={info}
                      >
                        <View style="width: 100%;">
                          <View className="container-row">
                            <View className="hit-text">{info.title}</View>
                          </View>
                          {msg_type_id != 3 ? (
                            <View className="container-row">
                              <View className="message-text">{info.content}</View>
                            </View>
                          ) : (
                              <Image
                                className="message-image"
                                src={
                                  'https://c1.yaofangwang.net/' +
                                  info.image_file +
                                  '_300x300.jpg'
                                }
                                mode="aspectFit"
                              >
                                {info.is_expired && (
                                  <View className="message-image.center-text">
                                    活动结束
                              </View>
                                )}
                              </Image>
                            )}
                        </View>
                        {info.jumptype != '' && (
                          <Image
                            className="icon-arrow"
                            src={require('../../../../images/icon_arrow_right_gary.png')}
                          ></Image>
                        )}
                        {/*  <view class="dividing-line"/> */}
                      </View>
                    </View>}
                  </View>
                )
              })}
              <View className="foot">
                {showFoot == 1 ? (
                  <Text className="text">没有更多了</Text>
                ) : showFoot == 2 ? (
                  <Text className="text">加载更多...</Text>
                ) : (
                      <Text className="text"></Text>
                    )}
              </View>
            </View>
          )}
        {/*  loading图  */}
        {loading && (
          <Image
            src={require('../../../../images/loading_cycle.gif')}
            className="loading"
          ></Image>
        )}
      </View>
    )
  }
}