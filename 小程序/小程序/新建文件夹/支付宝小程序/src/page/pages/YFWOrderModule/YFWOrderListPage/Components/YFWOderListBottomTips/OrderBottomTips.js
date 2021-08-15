import Taro, { Component } from '@tarojs/taro'
import { View, im } from '@tarojs/components'
import {
    pushNavigation
} from '../../../../../../apis/YFWRouting.js'
import {
    OrderApi,
    OrderPaymentApi
} from '../../../../../../apis/index.js'
import { Payment } from '../../../../../../utils/payment'
const payment = new Payment()
const orderApi = new OrderApi()
const orderPaymentApi = new OrderPaymentApi()
import {
    isNotEmpty
} from '../../../../../../utils/YFWPublicFunction.js'
import Countdownview from '../../../../../../components/YFWCountdownView/YFWCountdownView'
const WxNotificationCenter = require("../../../../../../utils/WxNotificationCenter.js");

const ORDER_EVALUATION = "order_evaluation" //评价订单
const ORDER_APPLY_RETURN = 'order_apply_return' //申请退货/款
const ORDER_APPLY_RETURN_PAY = 'order_apply_return_pay' //申请退款
const ORDER_RECEIVED = 'order_received' //确认收货
const ORDER_LOOK_LOGISTICS = 'look_logistics' //查物流
const ORDER_CANCLE = 'order_cancel' //取消订单
const ORDER_COMPLAINT = 'order_complaint' //订单投诉
const ORDER_BUY_AGAIN = 'order_buy_again' //重新购买
const ORDER_COMPLAINT_DETAIL = 'order_complaint_detail' //投诉详情
const ORDER_APPLAY_RETURN_PAY_CANCEL = 'order_apply_return_pay_cancel' //取消申请退款
const ORDER_RETURN_DETAIL = 'order_return_detail'  //退货款详情
const DELETE ='delete' //删除订单
const ORDER_RX_SUBMIT = 'order_rx_submit' //上传处方
const ORDER_APPLY_RETURN_UPDATE = 'order_apply_return_update' //我要退货，或者只退款不退货
const GET_APPLY_RETURN_PAY_REASON = 'get_apply_return_pay_reason' //更新申请退款状态
const REMIND_ORDER_SEND_GOODS = 'remind_order_send_goods' //催发货
import './OrderBottomTips.scss'

const Click = (parm, that) => {
    switch (parm.type) {
        case ORDER_EVALUATION:
          pushNavigation('get_order_evaluation', {
            order_no: parm.item.order_no,
            shop_title: parm.item.shop_title,
            img_url: parm.item.img_url,
            order_total: parm.item.order_total
          })
          break
        case ORDER_APPLY_RETURN:
        case ORDER_APPLY_RETURN_UPDATE:
        case GET_APPLY_RETURN_PAY_REASON:
          that.onRequestApplyReturn(parm)
          break
        case ORDER_APPLY_RETURN_PAY:
          that.onRequestApplyReturn(parm)
          break
        case ORDER_RECEIVED:
          that.onOrderReceived(parm)
          break
        case ORDER_LOOK_LOGISTICS:
          pushNavigation('get_logistics_detail', {
            order_no: parm.item.order_no,
            medecine_image: parm.item.img_url
          })
          break
        case ORDER_CANCLE:
          pushNavigation('get_cancle_order', {
            order_no: parm.item.order_no,
            position: parm.item.itemIndex
          })
          break
        case ORDER_COMPLAINT:
          pushNavigation('get_complaint_order', {
            order_no: parm.item.order_no,
            shop_title: parm.item.shop_title,
            position: parm.item.itemIndex
          })
          break
        case ORDER_BUY_AGAIN:
          HandlerOrderBuyAgain(parm.item.order_no)
          break
        case ORDER_COMPLAINT_DETAIL:
          pushNavigation('get_complaint_Details', {
            order_no: parm.item.order_no
          })
          break
        case ORDER_APPLAY_RETURN_PAY_CANCEL:
          HandlerReturnPayCancel(parm.item.order_no)
          break
        case ORDER_RETURN_DETAIL:
          pushNavigation('get_detail_refund', {
            order_no: parm.item.order_no,
            order_total: parm.item.order_total,
            packaging_total: parm.item.packaging_total,
            shipping_total: parm.item.shipping_total
          })
          break
        case DELETE:
          if(that.props.onOrderDelete){
            that.props.onOrderDelete({ order_no: parm.item.order_no })
          }
          // that.triggerEvent('orderDelete', { order_no: parm.item.order_no })
          break
        case REMIND_ORDER_SEND_GOODS:
          HandlerRemindOrderSendGoods(parm.item.order_no)
          break
        case ORDER_RX_SUBMIT:
          pushNavigation('get_upload_rx_info', {
            orderID: parm.item.order_no,
            position: parm.item.itemIndex
          })
          break
    }
}

const HandlerOrderBuyAgain = (orderNo) => {
      Taro.showLoading({
        title: '加载中...'
      })
      orderApi.buyAgain(orderNo).then(
        res => {
          Taro.hideLoading()
          pushNavigation('get_shopping_car')
        },
        error => {
          Taro.hideLoading()
          if (isNotEmpty(error.msg)) {
            Taro.showToast({
              title: error.msg,
              icon: 'none',
              duration: 2000
            })
          }
        }
    )
}

const HandlerReturnPayCancel = (orderNo) => {
      Taro.showLoading({
        title: '加载中...'
      })
      orderApi.cancelRefund(orderNo).then(
        res => {
          WxNotificationCenter.postNotificationName(
            'refreshScreenNow',
            'refreshAll'
          )
          Taro.hideLoading()
          Taro.showToast({
            title: '取消申请退款成功',
            icon: 'none',
            duration: 2000
          })
        },
        error => {
          Taro.hideLoading()
          if (isNotEmpty(error.msg)) {
            Taro.showToast({
              title: error.msg,
              icon: 'none',
              duration: 2000
            })
          }
        }
    )
}

const HandlerRemindOrderSendGoods = (orderNo) => {
  orderApi.remindOrderSend(orderNo).then(res => {
    Taro.showToast({
      title: '提醒已发出，请耐心等待',
      icon: 'none',
      duration: 2000
    })
    Taro.hideLoading()
  },
  error => {
    let errorMessaege = '';
    if (isNotEmpty(error) && isNotEmpty(error.msg)) {
        errorMessaege = error.msg;
        Taro.showToast({
          title: errorMessaege,
          icon: 'none',
          duration: 2000
        })
        Taro.hideLoading()
    }
  })
}
class OrderBottomTips extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        datas: [],
        showButtons: [],
        hideButtons: [],
        showHideButtonsTips: false,
        pageFrom: 'orderList',
        onRequestApplyReturn: null,
        onOrderReceived: null,
        onLogisticsClick: null,
        onShowHideButtons: null,
        onOrderPayNot: null,
        onOrderDelete: null


    }

    constructor (props) {
        super (props)
        this.state = {
            checkPhoneModalShow: true
        }
    }
    onBottomButonClick (parms) {
        console.log(parms.currentTarget.dataset)
        let that = this
        Click(parms.currentTarget.dataset, that)
    }

    onRequestApplyReturn (parm) {
        if(this.props.onRequestApplyReturn) {
            this.props.onRequestApplyReturn({
                orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno,
                order_total: parm.item.order_total
                  ? parm.item.order_total
                  : parm.item.total_price,
                packaging_total: parm.item.packaging_total
                  ? parm.item.packaging_total
                  : parm.item.packaging_price,
                shipping_total: parm.item.shipping_total
                  ? parm.item.shipping_total
                  : parm.item.shipping_price,
                type: parm.type
              })
        }
        // this.triggerEvent('orderApplyReturn', {
        //   orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno,
        //   order_total: parm.item.order_total
        //     ? parm.item.order_total
        //     : parm.item.total_price,
        //   packaging_total: parm.item.packaging_total
        //     ? parm.item.packaging_total
        //     : parm.item.packaging_price,
        //   shipping_total: parm.item.shipping_total
        //     ? parm.item.shipping_total
        //     : parm.item.shipping_price,
        //   type: parm.type
        // })
    }

    onOrderReceived (parm) {
        if(this.props.onOrderReceived){
            this.props.onOrderReceived({
                orderNo: parm.item.order_no,
                shop_title: parm.item.shop_title,
                img_url: parm.item.img_url,
                order_total: parm.item.order_total
            })
        }
        // this.triggerEvent('orderReceived', {
        //   orderNo: parm.item.order_no,
        //   shop_title: parm.item.shop_title,
        //   img_url: parm.item.img_url,
        //   order_total: parm.item.order_total
        // })
    }
    onLogisticsClick () {
        if(this.props.onLogisticsClick) {
            this.props.onLogisticsClick()
        }
        // this.triggerEvent('lookLogistics')
    }

    showHideButton (id,index) {
        let that = this;
        let targetId = id;
        let itemIndex = index;
        const query = Taro.createSelectorQuery()
        query.select('#hide-parent').boundingClientRect()
        query.exec(res => {
          let position = {
            top: isNotEmpty(res[0])?res[0].top:0,
            left: 24,
            itemIndex: itemIndex
          }
          if(that.props.onShowHideButtons){
            that.props.onShowHideButtons({
                "position": position,
                'hideButtons': that.state.hideButtons
            })
          }
        })
  
    }

    orderPay = (parms) => {
        let orderId = parms.orderNo
        payment.pay(process.env.TARO_ENV, orderId)
        // orderPaymentApi.orderPay(orderId).then((result) => {
        //   WxNotificationCenter.postNotificationName('refreshScreenNow', "refreshAll")
        //   Taro.hideLoading()
        //   if (result) {
        //     Taro.showToast({
        //       title: '支付成功',
        //     })
        //     pushNavigation('get_success_receipt', {
        //       orderNo: orderId,
        //       type: 'paySuccess'
        //     })
        //   }
        // }).then((error) => {
        //     Taro.hideLoading()
        //   if (error.msg) {
        //     Taro.showToast({
        //       title: '支付失败',
        //     })
        //   }
        // })
    }

    orderPayNot = (parms) => {
        let orderId = parms.orderNo
        let prompt_info = parms.prompt_info 
        if(this.props.onOrderPayNot) {
            this.props.onOrderPayNot({ orderNo: orderId, prompt_info: prompt_info})
        }  
        // this.triggerEvent('onOrderPayNot', { orderNo: orderId, prompt_info: prompt_info})
    }
    componentWillMount () { }

    componentDidMount () { }

    render() {
        const { showButtons, datas, pageFrom, showHideButtonsTips } = this.props
        return (
          <View className="button_list">
            {showButtons.map((info, index) => {
              return (
                <Block key="key">
                  {(info.value == 'order_pay' || info.value == 'order_pay_not') && (
                    <View>
                      <Countdownview
                        waitpaytime={info.waitpaytime}
                        onOrderPay={this.orderPay}
                        orderNo={datas.order_no}
                        value={info.value}
                        onOrderPayNot={this.orderPayNot}
                        promptInfo={info.prompt_info}
                      />
                    </View>
                  )}
                  {info.value != 'order_pay' && info.value != 'order_pay_not' && (
                    <View
                      className={
                        info.value == 'order_received' ||
                        info.value == 'order_evaluation' ||
                        info.value == 'order_pay_not' ||
                        info.value == 'order_buy_again'
                          ? (process.env.TARO_ENV=='alipay'?'buton_green':'buton_green button_pad')
                          : info.is_weak
                          ? (process.env.TARO_ENV=='alipay'?'weak_button':'weak_button button_pad')
                          : 'buton_dark'
                      }
                      onClick={this.onBottomButonClick}
                      data-type={info.value}
                      data-item={datas}
                    >
                      {info.text}
                    </View>
                  )}
                </Block>
              )
            })}
            <View style="flex:1"></View>
            {showHideButtonsTips && (
              <View
                className="hide_button_parent"
                onClick={this.showHideButton.bind(this,datas.order_no,datas.itemIndex)}
                id='hide-parent'
              >
                <Image
                  id={datas.order_no}
                  src={require('../../../../../../images/hide_buton_tips.png')}
                  style={
                    'margin-left:' + (pageFrom == 'orderDetail' ? 60 : 0) + 'rpx'
                  }
                  className="hide_button"
                ></Image>
              </View>
            )}
          </View>
        )
    }
}

export default OrderBottomTips