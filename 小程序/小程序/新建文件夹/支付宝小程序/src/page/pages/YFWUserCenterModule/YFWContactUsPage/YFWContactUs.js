import { Block, View, Button, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { pushNavigation } from '../../../../apis/YFWRouting.js'
import './YFWContactUs.scss'

class YFWContactUs extends Taro.Component {

  componentWillMount() {
    Taro.setNavigationBarTitle({
      title: '联系我们'
    })
  }

  config = {
    navigationBarTitleText: '联系我们',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }

  toContact = () =>{
    pushNavigation('get_h5', {
      value: 'https://m.yaofangwang.com/chat.html?shopid=351567&version=pc'
    })
  }

  render() {
    return (
      <View className="containers">
        <View className="divLine"></View>
        <View className="contact-us" onClick = {this.toContact}>
          <Image
            className="img-information"
            src={require('../../../../images/xx_khfw.png')}
          ></Image>
          <View className="online-service">在线客服</View>
          <Image
            className="img-navigate"
            src={require('../../../../images/around_detail_icon.png')}
          ></Image>
        </View>
        <View className="view-bottom">
          <View className="view-phone">
            <Image
              className="phone"
              src={require('../../../../images/icon_phone.png')}
            ></Image>
            <Text className="tv-phone">400-8810-120</Text>
          </View>
          <View className="view-email">
            <Image
              className="email"
              src={require('../../../../images/icon_emial.png')}
            ></Image>
            <Text className="tv-email">service@yaofangwang.com</Text>
          </View>
        </View>
      </View>
    )
  }
}

export default YFWContactUs
