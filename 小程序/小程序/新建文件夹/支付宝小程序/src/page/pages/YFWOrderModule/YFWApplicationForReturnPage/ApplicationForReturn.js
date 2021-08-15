import Taro, { Component } from '@tarojs/taro'
import { Block, View, Image, Text } from '@tarojs/components'
import { OrderApi } from '../../../../apis/index.js'
const orderApi = new OrderApi()
import { isNotEmpty, toDecimal } from '../../../../utils/YFWPublicFunction.js'
import './ApplicationForReturn.scss'
import { pushNavigation } from '../../../../apis/YFWRouting'
var WxNotificationCenter = require('../../../../utils/WxNotificationCenter.js')
class ApplicationForReturn extends Component {

    config = {
        navigationBarTitleText: '申请退款',
        navigationBarBackgroundColor: '#49ddb8',
        navigationBarTextStyle: 'white'
    }

    constructor (props) {
        super (props)
        this.state = {
            reasonList: [],
            checkedIndex: 0,
            returnMoney: 0,
            orderNo: '',
            pageFrom: ''
        }
    }
    componentWillMount () {
        let options = this.$router.params
        let screenData = JSON.parse(options.params)
        this.state.orderNo = screenData.orderNo
        this.state.pageFrom = screenData.pageFrom
        Taro.showLoading({
            title: '加载中...'
        })
        orderApi.getReturnReason(screenData.orderNo).then(res => {
            Taro.hideLoading()
            this.setState({
                reasonList: res,
                returnMoney: toDecimal(res[0].total_price)
            })
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
          checkedIndex: e.currentTarget.dataset.index,
          returnMoney: toDecimal(this.state.reasonList[e.currentTarget.dataset.index].total_price)
        })
    }

    post () {
        Taro.showLoading({
          title: '提交中....',
        })
        orderApi.applyForRefund(this.state.orderNo, this.state.reasonList[this.state.checkedIndex].reason).then(res=>{
          WxNotificationCenter.postNotificationName('refreshScreen',"refreshAll")
          Taro.hideLoading()
          let params = {
            title:'申请退款',
            tips:'您的申请已经提交，请等待商家确认',
            orderNo:this.state.orderNo,
            pageFrom: this.state.pageFrom
          }
          // params =  JSON.stringify(params)
          pushNavigation('get_check_order_status',params,'redirect')
          // Taro.redirectTo({
          //   url: "/page/pages/YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage?params=" + params,
          // })
        },error=>{
          Taro.hideLoading()
          if (isNotEmpty(error.msg)){
            Taro.showToast({
              title: error.msg,
              icon:'none'
            })
          }
        })
    }
    render() {
        const { reasonList, checkedIndex, returnMoney } = this.state
        return (
          <Block>
            <View className="top_bg"></View>
            <View className="return_reason_parent">
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
                    </Block>
                  )
                })}
              </View>
            </View>
            <View className="returnMoneyLayout">
              <Text className="tips">
                退款金额:<Text className="money">{'¥' + returnMoney}</Text>
              </Text>
            </View>
            <View className="bottomLayout">
              <View className="tipsLayout">
                <Image
                  src={require('../../../../images/icon_warning.png')}
                  className="warning_icon"
                ></Image>
                <View className="tips">{reasonList[checkedIndex].promptinfo}</View>
              </View>
              <View className="post_button" onClick={this.post}>
                <View className="text">提交</View>
              </View>
            </View>
          </Block>
        )
      }
}

export default ApplicationForReturn