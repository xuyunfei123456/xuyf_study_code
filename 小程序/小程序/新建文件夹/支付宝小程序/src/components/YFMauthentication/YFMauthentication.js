import { Block, View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { pushNavigation } from '../../apis/YFWRouting.js'
import './YFMauthentication.scss'

class AuthenTication extends Taro.Component {
  config = {
    component: true
  }
  state = {
    isShow: false
  }
  closeInfo() {
    this.setState({
      isShow: false
    })
  }
  certification() {
    pushNavigation('get_my_modify_the_name')
  }

  /**
   * 解决底部滑动穿透问题
   */
  myTouchMove() {
    return false
  }
  render() {
    const { isShow } = this.state
    return (
      <View className="modal" hidden={!isShow} onTouchMove={this.myTouchMove}>
        <View className="content">
          <Image
            src={require('../../images/returnTips_close.png')}
            className="returnTips_close"
            onClick={this.closeInfo}
          ></Image>
          <Image
            className="ava"
            src={require('../../images/real_name.png')}
          ></Image>
          <View className="title">实名认证</View>
          <View className="tip">
            根据相关政策要求，购药须进行实名认证，确认此账户是本人使用
          </View>
          <View onClick={this.certification} className="btnBtom">
            <View className="cer-add">立即前往</View>
          </View>
        </View>
      </View>
    )
  }
}

export default AuthenTication
