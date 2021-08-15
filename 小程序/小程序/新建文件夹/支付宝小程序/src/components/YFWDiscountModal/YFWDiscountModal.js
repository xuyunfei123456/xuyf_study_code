import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './YFWDiscountModal.scss'
import YFWFloatLayout from '../YFWFloatLayout/YFWFloatLayout'
import {
  isNotEmpty,
} from '../../utils/YFWPublicFunction.js'

export default class YFWDiscountModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { discounts } = props
    const { isOpened } = props
    this.state = {
      _discounts: discounts,
      _isOpened: isOpened
    }
  }

  componentWillReceiveProps (nextProps) {
    const { _discounts } = this.state
    const { _isOpened } = this.state
    const { discounts } = nextProps
    const { isOpened } = nextProps

    if (_discounts.length !== discounts.length) {
      this.setState({ _discounts: discounts })
    }

    if (isOpened !== _isOpened) {
      this.setState({ _isOpened: isOpened })
    }
  }

  close () { 
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render () {
    const { _discounts } = this.state
    const { _isOpened } = this.state

    return (
      <YFWFloatLayout
        title='促销'
        isOpened={_isOpened}
        onClose={this.close.bind(this)}
      >
        <View className='discount-content'>
          {_discounts.map( discount => {
            const typeName = discount.type === 0 ? '满减' : '包邮'
            const discountTypeClass = discount.type === 0 ? 'discount-type-yellow' : 'discount-type-blue'

            return(
              <View className='discount-content-item'>
                <View className={'discount-content-type ' + discountTypeClass}>
                  <Text className='discount-content-type-name'>{typeName}</Text>
                </View>
                <Text className='discount-desc'>{discount.title}</Text>
              </View>
            )
          })}
        </View>
      </YFWFloatLayout>
    )
  }
}

YFWDiscountModal.defaultProps = {
  discounts: [],
  isOpened: false
}
