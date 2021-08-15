import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text
} from '@tarojs/components'
import {
  isNotEmpty,
  toDecimal,
  safe
} from '../../utils/YFWPublicFunction.js'
import './YFWPriceView.scss'

export default class YFWPriceView extends Component {
  config = {
    component: true
  }

  static defaultProps = {
    price: '0.00',
    color: '#ff3300',
    fontSize: 30,
    discount: '',
    discountColor: '#ff6d60',
    isInvalid: false
  }

  render () {
    const { isInvalid } = this.props
    let { color } = this.props
    const { fontSize } = this.props
    let { discountColor } = this.props
    const { discount } = this.props
    color = isInvalid ? '#ccc' : color
    discountColor = isInvalid ? '#ccc' : discountColor
    const largeStyle = 'color: '+color+';font-size: '+fontSize+'rpx;font-weight: bold'
    const smallStyle = 'color: '+color+';font-size: '+(fontSize*0.8)+'rpx;font-weight: bold'
    const discountStyle = 'color: '+discountColor+';font-size: '+(fontSize*0.67)+'rpx;line-height:'+(fontSize*0.67)+'rpx;border:solid 1px '+discountColor+';border-radius: 8rpx;padding: 2px 6rpx;margin-left: 10rpx;'
    const invalidStyle = 'color: #fff;font-size: '+(fontSize*0.67)+'rpx;line-height:'+(fontSize*0.67)+'rpx;border-radius: 30rpx;padding: 2px 10rpx;margin-left: 30rpx;background-color:#ccc';
    
    let { price } = this.props
    price = safe(price)
    const haveRise = price.indexOf('起') !== -1
    price = price.replace('起', '')
    price = toDecimal(price)
    const priceList = price.split('.')
    const interger_part = isNotEmpty(priceList) ? priceList[0] : 0
    const decimal_part = isNotEmpty(priceList) ? priceList[1] + (haveRise ? '起' : '') : '00'

    return (
      <View className='yfw-price'>
          <Text style={smallStyle}>¥</Text>
          <Text style={largeStyle}>{safe(interger_part) + '.'}</Text>
          <Text style={smallStyle}>{safe(decimal_part)}</Text>
        {safe(discount).length > 0 && <Text style={discountStyle}>{discount}</Text>}
        {isInvalid && <Text style={invalidStyle}>失效</Text>}
      </View>
    )
  }
}