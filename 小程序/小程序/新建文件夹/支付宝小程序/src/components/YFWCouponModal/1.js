import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './YFWCouponModal.scss'
import { getModel } from '../../model/YFWCouponModel.js'
import { isNotEmpty } from '../../utils/YFWPublicFunction.js'
import { GoodsDetailApi } from '../../apis/index'
import YFWFloatLayout from '../YFWFloatLayout/YFWFloatLayout'
const goodsDetailApi = new GoodsDetailApi

export default class YFWCouponModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { coupons } = props
    const { isOpened } = props
    this.state = {
      _coupons: coupons,
      _isOpened: isOpened,
      receiveingCoupons: [], // 未领取优惠券
      receivedCoupons: [] // 已领取优惠券
    }
  }

  componentDidMount () {
    const { _coupons } = this.state
    this.dealCoupons(_coupons)
  }

  componentWillReceiveProps(nextProps) {
    const { _coupons } = this.state
    const { _isOpened } = this.state
    const { coupons } = nextProps
    const { isOpened } = nextProps

    if (isSameArray(coupons, _coupons)) {
      this.dealCoupons(coupons)
    }

    if (_isOpened !== isOpened) {
      this.setState({ _isOpened: isOpened })
    }
  }

  /** 处理初始化时组件传递过来的数据 */
  dealCoupons(coupons) {    

    if (isNotEmpty(coupons) && coupons.length > 0) {

      let receiveing = []
      let received = []

      for (let index = 0; index < coupons.length; index++) {
        let model = coupons[index]
        let couponModel = getModel(model)
        if (couponModel.get === 1) {
          receiveing.push(couponModel)
        }
        if (couponModel.user_coupon_count > 0) {
          let user_coupon_count = couponModel.user_coupon_count
          while (user_coupon_count > 0) {
            user_coupon_count--
            received.push(couponModel)
          }
        }
      }

      this.setState({
        receiveingCoupons: receiveing,
        receivedCoupons: received
      })
    }
  }

  /** 关闭 */
  close () {
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render () {
    const { receiveingCoupons } = this.state
    const { receivedCoupons } = this.state
    const { _isOpened } = this.state

    return (
      <YFWFloatLayout
        isOpened={_isOpened}
        title='优惠券'
        onClose={this.close.bind(this)}
      >
        <View className='coupon-content'>
          {receiveingCoupons.length > 0 && <View className='coupon-20-bottom'>
            <Text className='coupon-14-text coupon-dark-text'>可领取优惠券</Text>
            {receiveingCoupons.map(coupon => {
              return this.renderCouponItem(coupon, false)
            })}
          </View>}          
          {receivedCoupons.length > 0 && <View>
            <Text className='coupon-14-text coupon-dark-text'>已领取优惠券</Text>
            {receivedCoupons.map(coupon => {
              return this.renderCouponItem(coupon, true)
            })}
          </View>} 
        </View>
      </YFWFloatLayout>
    )
  }

  /** 
   * 渲染优惠券item 
   * @param coupon 优惠券
   * @param isReceived 是否已领取
   */
  renderCouponItem(coupon, isReceived) {
    const couponType = Number.parseInt(coupon.coupons_type) === 1 ? "店铺" : "单品"
    const receiveBtnClass = isReceived ? 'coupon-item-button-received' : 'coupon-item-button'
    const receiveTitle = isReceived ? '已领取' : '点击领取'
    const receiveTitleColor = isReceived ? 'coupon-12-text coupon-green-text' : 'coupon-12-text coupon-white-text'

    return(
      <View className='coupon-item' taroKey={coupon.id} onClick={this.onReceiveCoupon.bind(this, coupon, isReceived)}>
        <View className='coupon-item-left'>
          <Text className='coupon-21-text coupon-white-text'>¥</Text>
          <Text className='coupon-42-text coupon-white-text'>{coupon.price}</Text>
        </View>
        <View className='coupon-item-right'>
          <View className='coupon-item-right-top'>
            <Text className='coupon-item-type coupon-12-text coupon-green-text'>{couponType}</Text>
            <Text className='coupon-14-text coupon-dark-text coupon-bold-text'>{coupon.title}</Text>
          </View>
          <View className='coupon-item-right-bottom'>
            <Text className='coupon-12-text coupon-dark-text'>{coupon.start_time+'-'+coupon.end_time}</Text>
            <View className={receiveBtnClass}>
              <Text className={receiveTitleColor}>{receiveTitle}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  /** 点击领取优惠券 */
  onReceiveCoupon(couponItem, isReceived) {
    if (!isReceived) {

      goodsDetailApi.getCoupon(couponItem.id).then(response => {
        Taro.showToast({
          title: '优惠券领取成功',
          icon: 'none',
          duration: 2000
        })

        let coupon = couponItem
        let { receiveingCoupons } = this.state
        let { receivedCoupons } = this.state
        let index = -1
        let i = receiveingCoupons.length
        while ((i--) > 0) {
          if (coupon.id === receiveingCoupons[i].id) {
            index = i;
          }
        }
        coupon.user_coupon_count++;
        if (coupon.user_coupon_count !== coupon.max_claim_quantity) {
          receivedCoupons.push(coupon)
          receiveingCoupons.splice(index, 1, coupon)
        } else {
          receivedCoupons.push(coupon)
          receiveingCoupons.splice(index, 1)
        }

        this.setState({
          receiveingCoupons: receiveingCoupons,
          receivedCoupons: receivedCoupons
        })
        
      }, error => {
        Taro.showToast({
          title: '优惠券领取失败',
          icon: 'none',
          duration: 2000
        })
      })
    }
  }
}

YFWCouponModal.defaultProps = {
  coupons: [],
  isOpened: false
}

function isSameArray(arrayOne, arrayTwo) {
  let isSamed = false
  if (arrayOne.length === arrayTwo.length) {
    if (arrayOne.length === 0) {
      isSamed = false
    } else if (arrayOne[0].id === arrayTwo[0].id) {
      isSamed = false
    } else {
      isSamed = true
    }
  } else {
    isSamed = true
  }

  return isSamed
}