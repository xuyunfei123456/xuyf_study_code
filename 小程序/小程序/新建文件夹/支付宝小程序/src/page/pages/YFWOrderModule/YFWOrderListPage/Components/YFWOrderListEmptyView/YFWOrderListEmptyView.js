import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { pushNavigation } from '../../../../../../apis/YFWRouting'
import './YFWOrderListEmptyView.scss'
class YFWOrderListEmptyView extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        type:''
    }

    jumpToHome () {
        // Taro.switchTab({
        //   url: "/page/tabBar/YFWHomePage/YFWHome"
        // })
        pushNavigation('get_home')
    }
    componentWillMount () { }

    componentDidMount () { }

    render () {
        const { type } = this.props

        return (
            <View className='emptyViewLayout'>
                <Image className='image_icon' src='https://c1.yaofangwang.net/common/images/miniapp/ic_no_order.png' mode='aspectFit'/>
                <View className='tips_text'>{type == 'search'?'没有相关订单':'暂无订单'}</View>
                <View className='jump_button' onClick={this.jumpToHome}>去首页逛逛</View>
            </View>
        )
    }
}

export default YFWOrderListEmptyView