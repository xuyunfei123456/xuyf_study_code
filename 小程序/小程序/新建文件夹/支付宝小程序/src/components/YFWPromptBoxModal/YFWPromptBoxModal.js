import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './YFWPromptBoxModal.scss'
class YFWPromptBoxModal extends Component {

    config = {
        component: true
    }
    
    static defaultProps = {
        left_text: '取消',
        right_text: '确认',
        needLeftButton: true,
        onTest: null
    }

    constructor (props) {
        super (props)
        this.state = {
            tips_text: '',
            show:false,
            orderNo:'',
            img_url:'',
            shop_title:'',
            order_total:''
        }
    }

    showViewTypeTwo (tips,parm) {
        this.setState({
          show: true,
          tips_text: tips,
          orderNo: parm.orderNo,
          shop_title: parm.shop_title,
          img_url: parm.img_url,
          order_total: parm.order_total
        })
    }
    showView (tips, orderNo) {
        this.setState({
          show:true,
          tips_text:tips,
          orderNo:orderNo
        })
    }

    closeView () {
        this.setState({
          show:false
        })
    }

    onRightButtonClick () {
        console.log('onRightButtonClick')
        if(this.props.onTest) {
            this.props.onTest({ orderNo: this.state.orderNo, img_url: this.state.img_url, shop_title: this.state.shop_title, order_total: this.state.order_total })
        }
        // this.triggerEvent('test', { orderNo: this.state.orderNo, img_url: this.state.img_url, shop_title: this.state.shop_title, order_total: this.state.order_total})
    }

    close () {
        this.setState({
          show: false
        })
    }
    render() {
        const { needLeftButton } = this.props
        const { show, tips_text } = this.state
        return (
          show && (
            <View className="modal-mask" onClick={this.close}>
              <View className="modals-content">
                <View className="mains-content">
                  <Text className="tips_text">{tips_text}</Text>
                </View>
                <View className="splites_view"></View>
                <View className="modals-footer">
                  {needLeftButton && (
                    <View className="lefts" onClick={this.closeView}>
                      取消
                    </View>
                  )}
                  {needLeftButton && <View className="vsplite"></View>}
                  <View className="rights" onClick={this.onRightButtonClick}>
                    确认
                  </View>
                </View>
              </View>
            </View>
          )
        )
    }
}

export default YFWPromptBoxModal