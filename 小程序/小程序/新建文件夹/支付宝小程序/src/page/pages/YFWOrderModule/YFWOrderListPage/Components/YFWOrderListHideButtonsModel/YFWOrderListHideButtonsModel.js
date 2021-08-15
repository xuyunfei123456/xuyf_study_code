import Taro, { Component } from '@tarojs/taro'
import { Block, View } from '@tarojs/components'
import {
    OrderApi
  } from '../../../../../../apis/index.js'
  const orderApi = new OrderApi()
  import {
    pushNavigation
  } from '../../../../../../apis/YFWRouting.js'
  import {
    isNotEmpty
  } from '../../../../../../utils/YFWPublicFunction.js'
  import './YFWOrderListHideButtonsModel.scss'
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
  const ORDER_RETURN_DETAIL = 'order_return_detail' //退货款详情
  const DELETE = 'delete' //删除订单
  const ORDER_RX_SUBMIT = 'order_rx_submit' //上传处方
  const ORDER_APPLY_RETURN_UPDATE = 'order_apply_return_update' //我要退货，或者只退款不退货
  const GET_APPLY_RETURN_PAY_REASON = 'get_apply_return_pay_reason' //更新申请退款状态

const Click = function(parm, that) {
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
          order_no: parm.item.order_no
        })
        break
      case ORDER_COMPLAINT:
        pushNavigation('get_complaint_order', {
          order_no: parm.item.order_no,
          shop_title: parm.item.shop_title
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
          order_total: parm.item.order_total
        })
        break
      case DELETE:
        if(that.props.onOrderDelete){
          that.props.onOrderDelete({order_no: parm.item.order_no})
        }
        // that.triggerEvent('orderDelete', {
        //   order_no: parm.item.order_no
        // })
        break
      case ORDER_RX_SUBMIT:
        pushNavigation('get_upload_rx_info', {
          orderID: parm.item.order_no
        })
        break
    }
}
const HandlerOrderBuyAgain = function(orderNo) {
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

const HandlerReturnPayCancel = function(orderNo) {
    Taro.showLoading({
      title: '加载中...'
    })
    orderApi.cancelRefund(orderNo).then(
      res => {
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
class YFWOrderListHideButtonsModel extends Component {

    config = {
        component: true
    }
    static defaultProps = {
        datas: [],
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
            show: false,
            top: 0,
            left: 0,
            showDerictionTop: '',
            hideButtons: [],
            style: ''
        }
    }

  componentWillMount () { 

  }

  showView (position, fromes) {
    if (fromes == 'orderDetail') {
      this.setState({
        show: true,
        showDerictionTop: 'bottom',
        hideButtons: position.hideButtons,
        style: 'bottom:' + 80 + 'rpx' + '; left:' + position.left + 'rpx'
      })
    } else {
      this.setState({
        show: true,
        showDerictionTop: position.showDirection,
        hideButtons: position.hideButtons,
        style:
          position.showDirection == 'bottom'
            ? 'top:' +
              (position.top * 2 + 100) +
              'rpx' +
              '; left:' +
              position.left +
              'rpx'
            : 'top:' +
              position.top * 2 +
              'rpx' +
              '; left:' +
              position.left +
              'rpx'
      })
    }
  }

  setDatas (datas) {
    if(datas) {
      this.props.datas = datas
    }
  }

  closeView () {
    this.setState({
      show: false
    })
  }

  onHideButtonClick (item) {
    Click(item.currentTarget.dataset, this)
  }

  onRequestApplyReturn (parm) {
    if(this.props.onRequestApplyReturn) {
        this.props.onRequestApplyReturn({
            orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno,
            order_total: parm.item.order_total ? parm.item.order_total : parm.item.total_price,
            type: parm.type
          })
    }
    // this.triggerEvent('orderApplyReturn', {
    //   orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno,
    //   order_total: parm.item.order_total
    //     ? parm.item.order_total
    //     : parm.item.total_price,
    //   type: parm.type
    // })
  }

  onOrderReceived (parm) {
    if(this.props.onOrderReceived){
        this.props.onOrderReceived({
            orderNo: parm.item.order_no ? parm.item.order_no : parm.item.orderno
        })
    }
  }

  onLogisticsClick () {
    if(this.props.onLogisticsClick) {
        this.props.onLogisticsClick()
    }
  }

  showHideButton (e) {
    let that = this
    let targetId = e.currentTarget.dataset.id
    let itemIndex = e.currentTarget.dataset.index
    const query = Taro.createSelectorQuery()
    query.select('#' + targetId).boundingClientRect()
    query.exec(function(res) {
      let position = {
        top: isNotEmpty(res[0])?res[0].top:0,
        left: 24,
        itemIndex: itemIndex
      }
      if(that.props.onShowHideButtons){
        that.props.onShowHideButtons({
            "position": position
        })
      }
    })
  }

  orderPay (parms) {
    let orderId = parms.orderNo
    orderPaymentApi.orderPay(orderId).then(result => {
        Taro.hideLoading()
        if (result) {
          Taro.showToast({
            title: '支付成功'
          })
          pushNavigation('get_success_receipt', {
            value: orderId,
            type: 'paySuccess'
          })
        }
      }).then(error => {
        Taro.hideLoading()
        if (error.msg) {
          Taro.showToast({
            title: '支付失败'
          })
        }
      })
  }
  orderPayNot (parms) {
    let orderId = parms.orderNo
    let prompt_info = parms.prompt_info
    if(this.props.onOrderPayNot) {
        this.props.onOrderPayNot({ orderNo: orderId, prompt_info: prompt_info})
    }  
    // this.triggerEvent('onOrderPayNot', {
    //   orderNo: orderId,
    //   prompt_info: prompt_info
    // })
  }
  render() {
    const { datas } = this.props
    const { style, showDerictionTop, hideButtons, show } = this.state
    return (
      show && (
        <View className="hide_buttons_outside" onClick={this.closeView}>
          <View className="hide_buttons_parent" style={style}>
            {showDerictionTop == 'top' && (
              <View className="top_triangle"></View>
            )}
            <View className="buttons">
              {hideButtons.map((item, idx) => {
                return (
                  <Block>
                    <View
                      className="buttons_item"
                      onClick={this.onHideButtonClick}
                      data-type={item.value}
                      data-item={datas}
                    >
                      {item.text}
                    </View>
                    {idx != hideButtons.length - 1 && (
                      <View className="splite"></View>
                    )}
                  </Block>
                )
              })}
            </View>
            {showDerictionTop == 'bottom' && (
              <View className="bottom_triangle"></View>
            )}
          </View>
        </View>
      )
    )
  }
}

export default YFWOrderListHideButtonsModel