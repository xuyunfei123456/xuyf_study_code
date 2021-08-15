import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './YFWCountdownView.scss'

// const countdown = (that) => {
//     CountdownTimer = setInterval(() => {
//       if (parseInt(that.props.waitpaytime) >= 0) {
//         that.props.waitpaytime = that.props.waitpaytime - 1
//         let times = parseInt(that.props.waitpaytime)
//         if (times <= 0) {
//           clearInterval(CountdownTimer)
//           that.setState({
//             timestr: ''
//           })
//         } else {
//           let lastSeaconds = (times % 60) + ''
//           let lastSeacondStr =
//             lastSeaconds.length == 1 ? '0' + lastSeaconds : lastSeaconds
//           that.setState({
//             timestr: parseInt(times / 60) + ':' + lastSeacondStr
//           })
//         }
//       }
//     }, 1000)
// }
class YFWCountdownView extends Component {

    config = {
        component: true
    }

    static defaultProps = {
        waitpaytime: 0,
        orderNo: '',
        value: '',
        promptInfo: '',
        onOrderPay: null,
        onOrderPayNot: null
    }

    constructor (props) {
        super (props)
        this.state = {
            timestr: ''
        }
    }


    orderPay () {
        switch (this.props.value) {
          case 'order_pay':
                if(this.props.onOrderPay){
                    this.props.onOrderPay({ orderNo: this.props.orderNo })
                }
            // this.triggerEvent('orderPay', { orderNo: this.state.orderNo })
            break
          case 'order_pay_not':
                if(this.props.onOrderPayNot){
                    this.props.onOrderPayNot({
                        orderNo: this.props.orderNo,
                        prompt_info: this.props.promptInfo
                      })
                }
            // this.triggerEvent('orderPayNot', {
            //   orderNo: this.state.orderNo,
            //   prompt_info: this.state.prompt_info
            // })
            break
        }
    }
    
    componentDidMount () {
        let that = this
        that.countdownTimer=setInterval(() => {
            if (parseInt(that.props.waitpaytime) >= 0) {
              that.props.waitpaytime = that.props.waitpaytime - 1
              let times = parseInt(that.props.waitpaytime)
              if (times <= 0) {
                that.setState({
                  timestr: ''
                })
              } else {
                let lastSeaconds = (times % 60) + ''
                let lastSeacondStr =
                  lastSeaconds.length == 1 ? '0' + lastSeaconds : lastSeaconds
                that.setState({
                  timestr: parseInt(times / 60) + ':' + lastSeacondStr
                })
              }
            }
          }, 1000)
    }
    componentWillUnmount () {
      clearInterval(this.countdownTimer)
    }
    render() {
        const { timestr } = this.state
        return (
          <View className='buton_green' onClick={this.orderPay}>
            {'付款' + timestr}
          </View>
        )
      }
}

export default YFWCountdownView