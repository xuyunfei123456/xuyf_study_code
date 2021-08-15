import Taro from '@tarojs/taro'
import Pay from '@byted-mp/pay'
import { OrderPaymentApi } from '../apis/index'
import { pushNavigation } from '../apis/YFWRouting'
const WxNotificationCenter = require("./WxNotificationCenter");
const orderPaymentApi = new OrderPaymentApi()

export class Payment {
  /** 
   * 发起支付
   * @param platform 平台
   * @param orderNo 订单号
   * @param orderIds 结算订单号
   */
  pay (platform, orderNo, orderIds) {
    if (platform === 'tt') {

      this.ttPay(orderNo, orderIds)
    } else if (platform === 'swan') {

      this.swanPay(orderNo, orderIds)
    } else if (platform === 'alipay') {

      this.aliPay(orderNo, orderIds)
    } else if (platform === 'qq') {
      this.qqPay(orderNo, orderIds)
    } else if (platform === 'weapp') {

      this.wxPay(orderNo, orderIds)
    }
  }
  /** 微信支付 */
  wxPay (orderNo, orderIds) {
    Taro.showLoading({ title: '加载中...' })
    orderPaymentApi.orderPay(orderNo).then((result) => {
      orderPaymentApi.getCurrentPayStatus(orderNo, 'wxpay').then((res) => {
        WxNotificationCenter.postNotificationName('refreshScreenNow', "refreshAll")
        if(orderIds) {
          orderPaymentApi.getNotPayOrdersList(orderIds).then(resp => {
            const orders = resp || []
            if (orders.length === 0) {
              pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' }, 'redirect')
            } else {
              pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
            }
          },error => {
            pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
          })
        } else {
          pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
        }
      }, (error) => {
        Taro.hideLoading()
        Taro.showToast({
          title: '支付失败',
        })
      })
    }, (error) => {
      Taro.hideLoading()
      if (error) {
        Taro.showToast({
          title: '支付失败',
        })
      }
    })
  }

  /** 头条支付 */
  ttPay (orderNo, orderIds) {
    Taro.showLoading({ title: '加载中...' })
    orderPaymentApi.ttOrderPay(orderNo).then(orderInfo => {
      Taro.hideLoading()
      Pay({
        '2.0': JSON.stringify(orderInfo)
      }).then(res => {
          orderPaymentApi.getCurrentPayStatus(orderNo, 'alipay').then(response => {
            if (orderIds) {
              orderPaymentApi.getNotPayOrdersList(orderIds).then(resp => {
                const orders = resp || []
                if (orders.length === 0) {
                  pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' }, 'redirect')
                } else {
                  pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                }
              },error => {
                pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
              })
            } else {
              pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
            }
          }, error => {
            Taro.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          })
        })
        .catch(err => {
          
        })
        .catch(err => {
          Taro.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000
          })
        }),
        ({ out_order_no }) => {
          return new Promise((resolve, reject) => {
            orderPaymentApi.getCurrentPayStatus(out_order_no, 'wxpay').then(response => {
              if (response.success) {
                resolve({ code: 0 })
              } else {
                resolve({ code: 2 })
              }
            }, error => {
              resolve({ code: 9})
            })
          })
        }
      /*tt.pay({
        orderInfo: orderInfo,
        service: 1,
        _debug: 1,
        success(res) {
          console.log('支付结果',res)
          if (res.code == 0) {
            // 支付成功处理逻辑，只有res.code=0时，才表示支付成功
            // 但是最终状态要以商户后端结果为准
            orderPaymentApi.getCurrentPayStatus(orderNo, 'alipay').then(response => {
              if (orderIds) {
                orderPaymentApi.getNotPayOrdersList(orderIds).then(resp => {
                  const orders = resp || []
                  if (orders.length === 0) {
                    pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' }, 'redirect')
                  } else {
                    pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                  }
                },error => {
                  pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                })
              } else {
                pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
              }
            }, error => {
              console.log('支付失败: ', error)
              Taro.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 2000
              })
            })
          } else {
            Taro.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail(res) {
          // 调起收银台失败处理逻辑
          console.log('调起收银台失败: ', res)
          Taro.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000
          })
        },
        getOrderStatus(res) {
          const { out_order_no } = res
          return new Promise((resolve, reject) => {

            orderPaymentApi.getCurrentPayStatus(out_order_no, 'wxpay').then(response => {
              if (response.success) {
                resolve({ code: 0 })
              } else {
                resolve({ code: 2 })
              }
            }, error => {
              resolve({ code: 9})
            })
          })
        }
      });*/
    }, error => {
      Taro.hideLoading()
      Taro.showToast({
        title: '支付失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  /** 百度支付 */
  swanPay (orderNo, orderIds) {
    swan.requestPolymerPayment({
      orderInfo: {
          'dealId': '470193086',
          'appKey': 'MMMabc',
          'totalAmount': '1',
          'tpOrderId': '3028903626',
          'dealTitle': '智能小程序Demo支付测试',
          'signFieldsRange': '1',
          'rsaSign': '',
          'bizInfo': ''
      },
      success: res => {
          swan.showToast({
              title: '支付成功',
              icon: 'success'
          });
      },
      fail: err => {
          swan.showToast({
              title: JSON.stringify(err)
          });
          console.log('pay fail', err);
      }
  })
  }

  /** 支付宝支付 */
  aliPay (orderNo, orderIds) {
    Taro.showLoading({ title: '加载中...' })
    orderPaymentApi.alipayOrderPay(orderNo).then(res => {
      my.tradePay({
        tradeNO: res.trade_no,
        success: function (res) {
          if(res.resultCode == 9000){
            orderPaymentApi.getCurrentPayStatus(orderNo, 'alipay').then(response => {
              if (orderIds) {
                orderPaymentApi.getNotPayOrdersList(orderIds).then(resp => {
                  Taro.hideLoading()
                  const orders = resp || []
                  if (orders.length === 0) {
                    pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' }, 'redirect')
                  } else {
                    pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                  }
                },error => {
                  pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                })
              } else {
                Taro.hideLoading()
                pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
              }
            }, error => {
             Taro.hideLoading()
            })
          }else{
            Taro.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: function (res) {
          Taro.hideLoading()
          Taro.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000
          })
        },
      });
    },err=>{
      Taro.showToast({
        title: '支付失败',
        icon: 'none',
        duration: 2000
      })
    }).catch(err=>{
      console.log(err);
      Taro.showToast({
        title: '支付失败',
        icon: 'none',
        duration: 2000
      }) 
    })
  }

  /** qq支付 */
  qqPay (orderNo, orderIds) {
    orderPaymentApi.qqOrderPay(orderNo).then(orderInfo => {
      console.log('qq下单成功', orderInfo)
      qq.requestPayment({
        package: 'prepay_id=' + orderInfo.package,
        bargainor_id: orderInfo.bargainor_id,
        success(res) {
          if (res.resultCode == 0) {
            orderPaymentApi.getCurrentPayStatus(orderNo, 'qqpay').then(response => {
              if (orderIds) {
                orderPaymentApi.getNotPayOrdersList(orderIds).then(resp => {
                  console.log('qq支付成功 getNotPayOrdersList', resp)
                  const orders = resp || []
                  if (orders.length === 0) {
                    pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' }, 'redirect')
                  } else {
                    pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                  }
                },error => {
                  pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
                })
              } else {
                pushNavigation('get_success_receipt', { orderNo: orderNo, title:'付款成功', type: 'paySuccess' })
              }
            }, error => {
              Taro.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 2000
              })
            })
          } else {
            Taro.showToast({
              title: '支付失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail(res) {
          Taro.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }, error => {
      Taro.showToast({
        title: '支付失败',
        icon: 'none',
        duration: 2000
      })
    })
  }
}