import { Block, View, Button, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/YFWMessageModule/YFWMessageHomePage/YFWMessageHome.js
import { MessageApi } from '../../../../apis/index.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import './YFWMessageHome.scss'
const messageApi = new MessageApi()

export default class YFWMessageHome extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      imgUrlArray: [
        ['-1', require('../../../../images/icon_message_kf.png')],
        ['1', require('../../../../images/icon_message_xx.png')],
        ['2', require('../../../../images/icon_message_dd.png')],
        ['3', require('../../../../images/icon_message_yh.png')]
      ],
      dataArray: []
    }
  }

  componentDidShow() {
    this.requsetData()
  }

  clickedItem = e => {
    let item = e.currentTarget.dataset.item
    this.markMessagereaded(item.msg_type_id)
    console.log(item.msg_type_id)
    if (item.msg_type_id != '-1') {
      pushNavigation('get_message_list', {
        type: item.msg_type,
        msg_type_id: item.msg_type_id
      })
    } else {
      pushNavigation('get_h5', {
        value: 'https://m.yaofangwang.com/chat.html?shopid=351567&version=pc'
      })
    }
  }

  /**获取消息信息 */
  requsetData = () => {
    messageApi.getHomeMessage().then(res => {
      console.log(res)
      this.handleDate(res)
    })
  }

  handleDate = res => {
    let imgUrlMap = new Map(this.state.imgUrlArray)
    let itemArray = res
    itemArray.forEach(function (info, infoindex) {
      let url = imgUrlMap.get(info.msg_type_id)
      itemArray[infoindex].icon = url
    })
    this.setState({
      dataArray: itemArray
    })
  }

  markMessagereaded = typeID => {
    messageApi.getMessageTypeRead(typeID).then(res => { })
  }

  config = {
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '我的消息',
    navigationBarBackgroundColor: '#49ddb8'
  }

  render() {
    const { dataArray } = this.state
    return (
      <View className="page-list">
        <View style="height:9rpx"></View>
        {dataArray.map((info, infoindex) => {
          return (
            <View
              className="page-list-item"
              onClick={this.clickedItem}
              data-item={info}>
              {info.msg_type_id == '-1' && (
                <View
                  className="button"
                  openType="contact"
                  hoverClass="none"
                ></View>
              )}
              <Image className="image" src={info.icon}></Image>
              <View className="text-view">
                <Text className="text">{info.msg_type}</Text>
                <View className='imgr'>
                  {info.total_count > 0 && <View className="red-point"></View>}
                  <Text className="msg-text">{info.content}</Text>
                </View>
              </View>
              <Image
                className="image-go"
                src={require('../../../../images/icon_message_go.png')}
              ></Image>
            </View>
          )
        })}
      </View>
    )
  }
}