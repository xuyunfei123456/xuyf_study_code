import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import {pushNavigation} from '../../../../apis/YFWRouting'
import './YFWCheckOrderStatusPage.scss'
class YFWCheckOrderStatusPage extends Component {

    config = {
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    constructor (props) {
        super (props)
        this.state = {
            tips:'',
            orderNo:'',
            pageFrom:'',
            title:''
        }
    }

    componentWillMount () {
        let options = this.$router.params
        let screenData = JSON.parse(options.params)
        Taro.setNavigationBarTitle({
            title: screenData.title,
        })
        this.setState({
            tips: screenData.tips,
            orderNo:screenData.orderNo,
            pageFrom:screenData.pageFrom,
            title:screenData.title
        })
    }

    jumpToOrderDetal () {
        console.log(Taro.getCurrentPages().length)
        if (this.state.pageFrom == 'orederDetail'){
            if(this.state.title == '申请退款'){
                Taro.navigateBack({
                    delta:Taro.getCurrentPages().length-2
                })
            }else{
                Taro.navigateBack({
                    delta: 3
                })
            }
          
        }else{
          let params = {
            order_no: this.state.orderNo
          }
        //   params = JSON.stringify(params)
          pushNavigation('get_order_detail',params,'redirect')
        //   Taro.redirectTo({
        //     url: "/pages/YFWOrderModule/YFWOrderDetailPage/YFWOrderDetail?params=" + params,
        //   })

        }
        //Todo  刷新列表
    }

    render () {
        const { tips, orderNo, pageFrom } = this.state

        return (
            <View>
                <Image src='https://c1.yaofangwang.net/common/images/miniapp/user_center_payback_ok.png' mode='aspectFit' className='img'/>
                <View className='tips'>{tips}</View>
                <View className='button' onClick={this.jumpToOrderDetal}>查看订单详情</View>
            </View>
        )
    }
}

export default YFWCheckOrderStatusPage