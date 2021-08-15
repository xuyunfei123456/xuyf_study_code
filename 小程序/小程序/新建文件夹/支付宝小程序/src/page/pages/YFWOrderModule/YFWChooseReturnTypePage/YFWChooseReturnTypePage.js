import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import {
    pushNavigation
} from '../../../../apis/YFWRouting.js'
import {
    safeObj,
    isNotEmpty,
    isEmpty
} from '../../../../utils/YFWPublicFunction.js'
import './YFWChooseReturnTypePage.scss'
class YFWChooseReturnTypePage extends Component {

    config = {
        navigationBarTitleText: '申请退货/款',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }
    constructor (props) {
        super (props)
        this.state = {
            screenType: 'areGoodsReceived',
            chooseTypePosition: 0,
            orderNo: '',
            order_total: '',
            shipping_total: '',
            packaging_total: '',
            pageFrom: '',
            needRenderBack: true
        }
    }
    componentWillMount () { 
        let options = this.$router.params
        let screenData = JSON.parse(options.params);
        let status = screenData.status
        let needRenderBack = true
        if (isNotEmpty(status)) {
            needRenderBack = false
        }
        this.setState({
            orderNo: screenData.orderNo,
            order_total: screenData.order_total,
            shipping_total: screenData.shipping_total,
            packaging_total: screenData.packaging_total,
            pageFrom: screenData.pageFrom,
            screenType: safeObj(status),
            needRenderBack: needRenderBack
        })
    }

    chooseType (e) {
        this.setState({
          chooseTypePosition: e.currentTarget.dataset.position
        })
    }

    nextAction () {
        if (this.state.screenType == 'areGoodsReceived') {
          if (this.state.chooseTypePosition == 1) {
            pushNavigation('get_return_withoutgoods', {
              orderNo: this.state.orderNo,
              order_total: this.state.order_total,
              packaging_total: this.state.packaging_total,
              shipping_total: this.state.shipping_total,
              pageFrom: this.state.pageFrom
            })
          } else {
            this.setState({
              screenType: 'returnType'
            })
          }
        } else {
          let type = ''
          if (this.state.chooseTypePosition == 1) {
            type = 'withoutReturnGoods'
          } else {
            type = 'returnGoods'
          }
          pushNavigation('get_edite_return', {
            type: type,
            orderNo: this.state.orderNo,
            order_total: this.state.order_total,
            packaging_total: this.state.packaging_total,
            shipping_total: this.state.shipping_total
          })
        }
    }
    componentDidMount () { }

    render() {
        const { screenType, chooseTypePosition, needRenderBack } = this.state
        return (
          <Block>
            <View className="top_bg">
              <View className="tips">
                {screenType == 'areGoodsReceived'
                  ? '亲，请确认您收到货了吗？'
                  : '请选择退款类型'}
              </View>
            </View>
            <View className="returnTypeLayout">
              <View
                className="typeItemTop"
                onClick={this.chooseType}
                data-position="0"
              >
                <View
                  className={
                    chooseTypePosition == 0
                      ? 'typeTextChoosed'
                      : 'typeTextUnChoosed'
                  }
                >
                  {screenType == 'areGoodsReceived' ? '已收到货' : '我要退货'}
                </View>
                {chooseTypePosition == 0 && (
                  <Image
                    className="choosedIcon"
                    src={require('../../../../images/check_checked.png')}
                  ></Image>
                )}
              </View>
              <View className="splite"></View>
              <View
                className="typeItemBottom"
                onClick={this.chooseType}
                data-position="1"
              >
                <View
                  className={
                    chooseTypePosition == 1
                      ? 'typeTextChoosed'
                      : 'typeTextUnChoosed'
                  }
                >
                  {screenType == 'areGoodsReceived'
                    ? '未收到货'
                    : '我要退款（无需退货）'}
                </View>
                {chooseTypePosition == 1 && (
                  <Image
                    className="choosedIcon"
                    src={require('../../../../images/check_checked.png')}
                  ></Image>
                )}
              </View>
            </View>
            {screenType == 'returnType' && needRenderBack && (
              <View className="return" onClick={this.returnAction}>
                <View className="text">上一步</View>
              </View>
            )}
            <View className="next" onClick={this.nextAction}>
              <View className="text">下一步</View>
            </View>
          </Block>
        )
    }
}

export default YFWChooseReturnTypePage