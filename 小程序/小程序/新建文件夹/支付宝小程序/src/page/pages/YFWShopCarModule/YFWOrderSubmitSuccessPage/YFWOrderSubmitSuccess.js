import Taro, { Component } from '@tarojs/taro'
import { 
  View,
  Text,
  Image
} from '@tarojs/components'
import './YFWOrderSubmitSuccess.scss'
import { isNotEmpty, toDecimal, isEmpty, safe, safeObj } from '../../../../utils/YFWPublicFunction'
import { pushNavigation } from '../../../../apis/YFWRouting'
import { OrderPaymentApi } from '../../../../apis/index'
import { Payment } from '../../../../utils/payment'
const payment = new Payment()
const orderPaymentApi = new OrderPaymentApi()

export default class YFWOrderSubmitSuccess extends Component {

  config = {
    navigationBarTitleText: '订单提交成功'
  }

  constructor (props) {
    super(props)

    this.state = {
      addressInfo: {
        name: '',
        mobile: '',
        address: '',
        is_default: 0,
      },
      dataSource: []
    }
  }

  componentWillMount () { 
    const params = this.$router.params.params
    if (isNotEmpty(params)) {
      const value = JSON.parse(decodeURIComponent(params))
      this.setState({
        addressInfo: value.addressInfo
      })
      this.orderIds = value.orderIds.join(',')
    }
  }

  componentDidMount () { 
    // this.fetchOrderListData()
  }

  componentDidShow () {
    this.fetchOrderListData()
  }

  /** 获取订单数据 */
  fetchOrderListData () {
    if (this.orderIds) {
      orderPaymentApi.getNotPayOrdersList(this.orderIds).then(response => {
        console.log('订单提交', response)
        this.setState({
          dataSource: response
        })
      })
    }
  }

  render () {
    const { dataSource } = this.state

    return (
      <View className='settlement'>
        {this.renderAddressView()}
        {dataSource.map(orderItem => {
          return this.renderOrderShopItem(orderItem)
        })}
      </View>
    )
  }

  /** 渲染地址信息 */
  renderAddressView () {
    const { addressInfo } = this.state

    return(
      <View className='settlement-address-view settlement-column'>
        <Text className='settlement-white-text settlement-14-text settlement-margin-bottom-5 settlement-margin-left-2vw'>收货地址</Text>
        <View className='settlement-card-view settlement-column'>
          <View className='settlement-row'>
            <View className='settlement-column'>
              <View className='settlement-row settlement-algin-center settlement-margin-top-20'>
                <View className='settlement-addres-icon settlement-row settlement-algin-center settlement-content-center'>
                  <Image src={require('../../../../images/zuoB.png')} mode='widthFix' />
                </View>
                <Text className='settlement-dark-text settlement-14-text settlement-bold-text settlement-margin-right-10'>{addressInfo.name}</Text>
                <Text className='settlement-dark-text settlement-14-text settlement-bold-text settlement-margin-right-10'>{addressInfo.mobile}</Text>
                {addressInfo.is_default === 1 && <Image src={require('../../../../images/Label_moren.png')} className='settlement-addres-default' mode='widthFix' />}
              </View>
              <Text className='settlement-addres settlement-light-text settlement-12-text settlement-margin-top-20'>{'地址：'+addressInfo.address}</Text>
            </View>
          </View>
          <Image src={require('../../../../images/shouhua.png')} className='settlement-addres-line settlement-margin-top-20' mode='widthFix' />
        </View>
      </View>
    )
  }

  /** 渲染订单item */
  renderOrderShopItem (orderItem) {
    const uploadClass = orderItem.buttons[0].is_weak === 'true' ? 'settlement-upload-action-weak' : 'settlement-upload-action'
    return(
      <View className='settlement-card-view settlement-column'>
        <View className='settlement-row settlement-algin-center'>
          <View className='settlement-store-icon settlement-row settlement-algin-center settlement-content-center'>
            <Image src={require('../../../../images/shops.png')} mode='widthFix' />
          </View>
          <Text className='settlement-store-title settlement-dark-text settlement-15-text settlement-bold-text'>{orderItem.title}</Text>
        </View>
        <View className='settlement-line'></View>
        <View className='settlement-row settlement-algin-end settlement-content-between'>
          <View className='settlement-column settlement-left-view'>
            <Text className='settlement-dark-text settlement-12-text'>订单：<Text className='settlement-light-text'>{orderItem.orderno}</Text></Text>
            <Text className='settlement-dark-text settlement-12-text settlement-margin-top-5vw'>数量：<Text className='settlement-light-text'>{orderItem.medicineQty}</Text></Text>
            <Text className='settlement-dark-text settlement-12-text settlement-margin-top-5vw'>金额：<Text className='settlement-red-text settlement-bold-text'>{'¥'+toDecimal(orderItem.total_price)}</Text></Text>
          </View>
          {orderItem.buttons.length === 1 && <View className='settlement-column settlement-right-view'>
            <View className='settlement-pay-action settlement-row settlement-algin-center settlement-content-center' onClick={this.onOrderItemActionClick.bind(this, orderItem.buttons[0], orderItem)}>
              <Text>{orderItem.buttons[0].title}</Text>
            </View>
          </View>}
          {orderItem.buttons.length > 1 && <View className='settlement-column settlement-right-view'>
            <View className={uploadClass+' settlement-row settlement-algin-center settlement-content-center'}  onClick={this.onOrderItemActionClick.bind(this, orderItem.buttons[0], orderItem)}>
              <Text>{orderItem.buttons[0].title}</Text>
            </View>
            <View className='settlement-pay-action settlement-row settlement-algin-center settlement-content-center settlement-margin-top-5vw' onClick={this.onOrderItemActionClick.bind(this, orderItem.buttons[1], orderItem)}>
              <Text>{orderItem.buttons[1].title}</Text>
            </View>
          </View>}
        </View>
      </View>
    )
  }

  /** 点击按钮 */
  onOrderItemActionClick (actionItem, orderItem, event) {
    const actionType = actionItem.action
    if (actionType === 'pay_not') {
      Taro.showModal({
        title: '',
        content: actionItem.prompt_info,
        showCancel: false,
        confirmText: '立即上传',
        confirmColor: '#1fdb9b',
        success: function(res) {
          if (res.confirm) {
            pushNavigation('get_upload_rx_info',{orderID: orderItem.orderno})
          }
        }
      })
    } else if (actionType === 'rx_upload') {
      pushNavigation('get_upload_rx_info',{orderID: orderItem.orderno})
    } else if (actionType === 'pay') {
      payment.pay(process.env.TARO_ENV, orderItem.orderno, this.orderIds)
    }
  }
}