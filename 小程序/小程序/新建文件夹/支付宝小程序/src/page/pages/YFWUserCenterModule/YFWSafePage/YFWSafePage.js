import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { pushNavigation } from '../../../../apis/YFWRouting'
import './YFWSafePage.scss'
export default class YFWSafePage extends Taro.Component {
  render() {
    return (
        <View className = "containers">
        <View className="item_view" onClick={this.clickItem}>
            <Text className= "title" >注销账号</Text>
            <Image className="img_next"  src={require('../../../../images/uc_next.png')}></Image> 
        </View>
        </View>
    )
  }
  clickItem() {
    pushNavigation('cancel_account')
  }
}
