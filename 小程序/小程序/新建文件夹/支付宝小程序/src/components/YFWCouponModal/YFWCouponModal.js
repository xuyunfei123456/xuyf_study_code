import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './YFWCouponModal.scss'
import { getModel } from '../../model/YFWCouponModel.js'
import { isNotEmpty } from '../../utils/YFWPublicFunction.js'
import { GoodsDetailApi } from '../../apis/index'
import YFWFloatLayout from '../YFWFloatLayout/YFWFloatLayout'
import { pushNavigation } from '../../apis/YFWRouting'
const goodsDetailApi = new GoodsDetailApi

export default class YFWCouponModal extends Component {
  config = {
    component: true
  }

  constructor (props) {
    super(...arguments)

    const { coupons,isOpened,isShowDiscount,discounts,freepostages,storeID } = props
    this.state = {
      _coupons: coupons,
      _isOpened: isOpened,
      receiveingCoupon: [], // 可领取优惠券
      receivedCoupon: [], // 已领取优惠券
      isShowDiscount,
      discounts,
      freepostages,
      storeID,

    }
  }

  componentDidMount () {
    //const {coupons} = this.state
    //this.dealCoupons(coupons)
  }

  componentWillReceiveProps(nextProps) {
    const { _coupons,_isOpened } = this.state
    const { coupons,isOpened,isShowDiscount,discounts,freepostages,storeID } = nextProps
    this.dealCoupons(coupons)

    if (_isOpened !== isOpened) {
      this.setState({ _isOpened: isOpened })
    }
    this.setState({
      isShowDiscount,
      discounts,
      freepostages,
      storeID,
    })
  }

  /** 处理初始化时组件传递过来的数据 */
  dealCoupons(coupons) {    
    let coupon_list = coupons
    let receiveing = []
    let received = []

    if (isNotEmpty(coupon_list)) {
      for (let index = 0; index < coupon_list.length; index++) {
        let model = coupon_list[index]
        let couponModel = getModel(model)
        if (coupon_list[index].get) {
          receiveing.push(couponModel)
        }
        if (coupon_list[index].user_coupon_count > 0) {
          let user_coupon_count = coupon_list[index].user_coupon_count
          while (user_coupon_count > 0) {
            user_coupon_count--
            received.push(couponModel)
          }
        }
      }
      this.setState({
        receiveingCoupon: receiveing,
        receivedCoupon: received
      })
    }

  }
  toshopAllGoods(event) {
    let storeid = event.currentTarget.dataset.storeid
    pushNavigation('get_shop_detail_list', { value: storeid,from:'shopcar' })
  }
  /** 关闭 */
  close () {
    this.setState({ _isOpened: false })
    if (this.props.onClose) {
      this.props.onClose()
    }
  }
    /**
     * 领取优惠券
     */
    receiveCoupon(event) {
      let coupon = event.currentTarget.dataset.coupon
      let that = this

      goodsDetailApi
        .getCoupon(coupon.id)
        .then(response => {
          console.log(response)
          let received = that.state.receivedCoupon
          received.push(coupon)
          if (isNotEmpty(that.state.receiveingCoupon)) {
            for (
              let index = 0;
              index < that.state.receiveingCoupon.length;
              index++
            ) {
              if (that.state.receiveingCoupon[index].user_coupon_count == 0) {
                if (that.state.receiveingCoupon[index].id == coupon.id) {
                  that.state.receiveingCoupon.splice(index, 1)
                }
              }
            }
          }
          that.setState({
            receiveingCoupon: that.state.receiveingCoupon,
            receivedCoupon: received
          })
          Taro.showToast({
            title: "领取成功",
            icon: 'none',
            duration: 2000
          })
        },error=>{
          Taro.showToast({
            title: error.msg ||"领取失败",
            icon: 'none',
            duration: 2000
          })
        })
    }
  render () {
    const {
      storeID,
      discounts,
      freepostages,
      isShowDiscount,
      receiveingCoupon,
      receivedCoupon,
      _isOpened
    } = this.state
    return (
      <YFWFloatLayout
        isOpened={_isOpened}
        title='优惠券'
        onClose={this.close.bind(this)}
      >
        {isShowDiscount && (discounts.length > 0 || freepostages.length > 0) && (
          <View className="detail-padding-13 detail-column-view">
            <View className="detail-title">促销</View>
            {discounts.length > 0 && (
              <View
                onClick={this.toshopAllGoods}
                data-storeid={storeID}
                className="detail-row-view detail-margin-bottom-15 detail-align-start"
              >
                <View className="detail-discount-title detail-discount-back-yellow">
                  满减
                </View>
                <View className="detail-dark-text detail-13-text">
                  {discounts}
                </View>
                <View style="flex:1"></View>
                <Image
                  style="margin-right: 26rpx; width: 16rpx; height:28rpx"
                  mode="widthFix"
                  src={require('../../images/icon_arrow_more.png')}
                ></Image>
              </View>
            )}
            {freepostages.length > 0 && (
              <View
                onClick={this.toshopAllGoods}
                className="detail-row-view detail-margin-bottom-15 detail-align-start"
                data-storeid={storeID}
              >
                <View className="detail-discount-title detail-discount-back-blue">
                  包邮
                </View>
                <View className="detail-dark-text detail-13-text">
                  {freepostages}
                </View>
                <View style="flex:1"></View>
                <Image
                  style="margin-right: 26rpx; width: 16rpx; height:28rpx"
                  mode="widthFix"
                  src={require('../../images/icon_arrow_more.png')}
                ></Image>
              </View>
            )}
          </View>
        )}
        {receiveingCoupon.length > 0 && (
          <View>
            <View className="modal-title">可领取优惠券</View>
            {receiveingCoupon.map((item, index) => {
              return (
                <Block key="index">
                  <View className="modal-coupon-view">
                    <View className="modal-coupon-left">
                      <View className="modal-coupon-unit">¥</View>
                      <View className="modal-coupon-amount">{item.price}</View>
                    </View>
                    <View className="modal-coupon-right">
                      <View className="modal-coupon-top-view">
                        <View className="modal-coupon-type">
                          {item.coupons_type == 1 ? '店铺' : '单品'}
                        </View>
                        <View className="modal-coupon-title">{item.title}</View>
                      </View>
                      <View className="modal-coupon-bottom-view">
                        <View className="modal-coupon-time">
                          {item.start_time + '-' + item.end_time}
                        </View>
                        <View
                          className="modal-coupon-receiveing"
                          onClick={this.receiveCoupon}
                          data-coupon={item}
                        >
                          点击领取
                        </View>
                      </View>
                    </View>
                  </View>
                </Block>
              )
            })}
          </View>
        )}
        {receivedCoupon.length > 0 && (
          <View>
            <View className="modal-title">已领取优惠券</View>
            {receivedCoupon.map((item, index) => {
              return (
                <Block key="index">
                  <View className="modal-coupon-view">
                    <View className="modal-coupon-left">
                      <View className="modal-coupon-unit">¥</View>
                      <View className="modal-coupon-amount">{item.price}</View>
                    </View>
                    <View className="modal-coupon-right">
                      <View className="modal-coupon-top-view">
                        <View className="modal-coupon-type">
                          {item.coupons_type == 1 ? '店铺' : '单品'}
                        </View>
                        <View className="modal-coupon-title">{item.title}</View>
                      </View>
                      <View className="modal-coupon-bottom-view">
                        <View className="modal-coupon-time">
                          {item.start_time + '-' + item.end_time}
                        </View>
                        <View className="modal-coupon-received">已领取</View>
                      </View>
                    </View>
                  </View>
                </Block>
              )
            })}
          </View>
        )}
      </YFWFloatLayout>
    )
  }

}

YFWCouponModal.defaultProps = {
  coupons: [],
  isOpened: false,
  isShowDiscount:false,
  discounts:'',
  freepostages:'',
  storeID:'',
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