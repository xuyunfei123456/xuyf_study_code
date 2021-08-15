import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import {
    OrderApi
  } from '../../../../apis/index.js'
  const orderApi = new OrderApi()
  import {
    isNotEmpty,
    jsonToArray
  } from '../../../../utils/YFWPublicFunction.js'
const WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
import './YFWCancleOrderPage.scss'
class YFWCancleOrderPage extends Component {

    config = {
        navigationBarTitleText: '取消订单',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }
    constructor (props) {
        super (props)
        this.state = {
            cancleReasonList: [],
            order_no: '',
            reasonListLength: 0,
            checkedIndex: 0,
            position: -1
        }
    }
    componentWillMount () { 
        let options = this.$router.params
        let screenData = JSON.parse(options.params)
        this.state.order_no = screenData.order_no
        this.state.position = screenData.position
        Taro.showLoading({
            title: '加载中...'
        })
        orderApi.getCancelOrderReason(screenData.order_no).then(res => {
            Taro.hideLoading()
            if (isNotEmpty(res)) {
                this.setState({
                    cancleReasonList: jsonToArray(res),
                    reasonListLength: jsonToArray(res).length
                })
            }
        },
        error => {
            Taro.hideLoading()
            Taro.showToast({
                title: error.msg
            })
        }
        )
    }

    chooseReason (e) {
        this.setState({
            checkedIndex: e.currentTarget.dataset.index
        })
    }
    postCancleReason () {
        Taro.showLoading({
        title: '提交中...'
        })
        orderApi .cancelOrder(this.state.order_no,this.state.cancleReasonList[this.state.checkedIndex]).then(res => {
            if (this.state.position != -1) {
                WxNotificationCenter.postNotificationName(
                'refreshScreen',
                'refreshAll'
                )
            }
            Taro.hideLoading()
            //刷新列表
            Taro.navigateBack()
            },
            error => {
            Taro.hideLoading()
            Taro.showToast({
                title: error.msg
            })
            }
        )
    }

    render() {
        const { cancleReasonList, checkedIndex, reasonListLength } = this.state
        return (
          <Block>
            <View className="top_bg">
              <View className="tips">亲为什么要取消这个订单呢？</View>
            </View>
            <View className="cancleReasonLayout">
              <View className="cancleReasonList">
                {cancleReasonList.map((item, idx) => {
                  return (
                    <Block>
                      <View
                        className="reasonItem"
                        onClick={this.chooseReason}
                        data-index={idx}
                      >
                        <View
                          className={
                            checkedIndex == idx ? 'checkedReasonText' : 'reasonText'
                          }
                        >
                          {item}
                        </View>
                        {checkedIndex == idx && (
                          <Image
                            src={require('../../../../images/check_checked.png')}
                            className="checkedIcon"
                          ></Image>
                        )}
                      </View>
                      {idx != reasonListLength - 1 && (
                        <View className="splite"></View>
                      )}
                    </Block>
                  )
                })}
              </View>
            </View>
            <View className="postButton" onClick={this.postCancleReason}>
              <View className="text">提交</View>
            </View>
          </Block>
        )
    }
}

export default YFWCancleOrderPage