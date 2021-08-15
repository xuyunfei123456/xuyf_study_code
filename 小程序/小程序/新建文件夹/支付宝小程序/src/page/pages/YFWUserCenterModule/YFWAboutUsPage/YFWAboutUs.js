import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './YFWAboutUs.scss'

class YFWAboutUs extends Taro.Component {

  componentWillMount(options = this.$router.params || {}) {}
  onPullDownRefresh = () => {}
  onReachBottom = () => {}
  config = {
    navigationBarTitleText: '关于我们',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }

  render() {
    return (
      <Block>
        <View className="main">
          <Image
            className="top"
            src="https://c1.yaofangwang.net/common/images/miniapp/icon_about_content.jpg"
            mode="scaleToFill"
          ></Image>
          <Image
            className="middle"
            src={require('../../../../images/icon_about_fix.png')}
            mode="scaleToFill"
          ></Image>
          <Image
            className="bottom"
            src={require('../../../../images/icon_about_bottom.png')}
            mode="scaleToFill"
          ></Image>
        </View>
        <View className="yfw">@2007-2020药房网商城版权所有</View>
        <View className="yb">上海伊邦医药信息科技有限公司</View>
      </Block>
    )
  }
} // pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js

export default YFWAboutUs
