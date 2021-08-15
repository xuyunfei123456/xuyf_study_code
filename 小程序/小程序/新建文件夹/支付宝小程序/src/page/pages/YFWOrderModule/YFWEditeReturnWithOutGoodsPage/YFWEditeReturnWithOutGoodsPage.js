import Taro, { Component } from '@tarojs/taro'
import { Block, View, Text, Image  } from '@tarojs/components'
import { OrderApi } from '../../../../apis/index.js'
const orderApi = new OrderApi()
import {
  isNotEmpty,
  isEmpty,
  toDecimal
} from '../../../../utils/YFWPublicFunction.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import './YFWEditeReturnWithOutGoodsPage.scss'
class YFWEditeReturnWithOutGoodsPage extends Component {

    config = {
        navigationBarTitleText: '申请退款',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    constructor (props) {
        super (props)
        this.state = {
            orderNo: '',
            reasonList: [],
            checkedIndex: 0,
            reasonListLength: 0,
            havePromptinfo: 'yes',
            order_total: '',
            pageFrom: ''
        }
    }

  componentWillMount () { 
    let options = this.$router.params
    let screenData = JSON.parse(options.params)
    this.state.pageFrom = screenData.pageFrom
    this.state.orderNo = screenData.orderNo
    Taro.showLoading({
      title: '加载中...'
    })
    orderApi.getReturnReason(screenData.orderNo).then(res => {
        Taro.hideLoading()
        if (isNotEmpty(res)) {
          this.setState({
            reasonList: res,
            reasonListLength: res.length,
            havePromptinfo: isEmpty(res[0].promptinfo) ? 'no' : 'yes',
            order_total: toDecimal(res[0].total_price)
          })
        }
      },
      error => {
        Taro.hideLoading()
        Taro.showToast({
          title: error.msg,
          icon: 'none'
        })
      }
    )
  }

  chooseReason (e) {
    this.setState({
      checkedIndex: e.currentTarget.dataset.index,
      havePromptinfo: isEmpty(
        this.state.reasonList[e.currentTarget.dataset.index].promptinfo
      )
        ? 'no'
        : 'yes',
      order_total: toDecimal(
        this.state.reasonList[e.currentTarget.dataset.index].total_price
      )
    })
  }
  postReturnApplay () {
    Taro.showLoading({
      title: '提交中...'
    })
    orderApi.applyForRefund(this.state.orderNo,this.state.reasonList[this.state.checkedIndex].reason).then(res => {
          Taro.hideLoading()
          let params = {
            title: '申请退款',
            tips: '您的申请已经提交，请等待商家确认',
            orderNo: this.state.orderNo,
            pageFrom: this.state.pageFrom
          }
          // params = JSON.stringify(params)
          pushNavigation('get_check_order_status',params,'redirect')
        },
        error => {
          Taro.hideLoading()
          Taro.showToast({
            title: error.msg,
            icon: 'none'
          })
        }
      )
  }

  render() {
    const {
      reasonList,
      checkedIndex,
      reasonListLength,
      havePromptinfo,
      order_total
    } = this.state
    return (
      <Block>
        <View className="topLayout">
          <View className="topReturnTypeLayout">
            <Text className="tips">
              退货类型：<Text className="typeValue">未收到货</Text>
            </Text>
          </View>
        </View>
        <View className="returnReasonLayout">
          <View className="title">
            <View className="text">申请退款原因</View>
            <View className="bottom"></View>
          </View>
          <View className="reasonList">
            {reasonList.map((item, idx) => {
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
                      {item.reason}
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
            {havePromptinfo == 'yes' && (
              <View className="promptinfo">
                <View className="splite"></View>
                <View className="promptinfoValue">
                  <Image
                    src={require('../../../../images/icon_warning.png')}
                    className="warning_icon"
                  ></Image>
                  <View className="tips">
                    {reasonList[checkedIndex].promptinfo}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
        <View className="returnMoneyLayout">
          <Text className="tips">
            退款金额:<Text className="money">{'￥' + order_total}</Text>
          </Text>
        </View>
        <View className="postButton" onClick={this.postReturnApplay}>
          <View className="text">提交</View>
        </View>
        <View className="fillBottom"></View>
      </Block>
    )
  }
}

export default YFWEditeReturnWithOutGoodsPage