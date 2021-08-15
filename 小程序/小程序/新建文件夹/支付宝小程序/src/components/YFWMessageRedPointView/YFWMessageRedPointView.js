import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Image,
  Text
} from '@tarojs/components'
import { pushNavigation} from '../../apis/YFWRouting.js'
import './YFWMessageRedPointView.scss'
import { isLogin } from '../../utils/YFWPublicFunction.js'

export default class YFWMessageRedPointView extends Component {
    config = {
        component: true
    }

    static defaultProps = {
        messagecount: 0,
        darkstyle: false
    }

   messageAction () {
       console.log('消息中心')
       if(isLogin()){
        pushNavigation('get_message_home')
       }else{
        pushNavigation('get_author_login')
       }
   }

    render () {
        let { messagecount } = this.props
        let { darkstyle } = this.props
        const count = messagecount > 99 ? '99+' : messagecount+''
        const imageSource = darkstyle ? require('../../images/icon_notice_2.png') : require('../../images/icon_notice.png')
        let showCount = messagecount>0 ? true : false
        return (
            <View className="top_content_right" onClick={this.messageAction}>
                <Image
                className="top_content_right"
                mode="aspectFit"
                src={imageSource}
                ></Image>
                {showCount && (
                <View className="redPoint_view">
                    <Text className="messageCount">{count}</Text>
                </View>
                )}
            </View>
        )
    }
}
