import { View, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { pushNavigation } from '../../../../apis/YFWRouting'
import './YFWcancellation.scss'
import {OrderApi} from '../../../../apis/index'
const orderApi = new OrderApi()
export default class YFWcancellation extends Taro.Component {
constructor (props) {
    super(...arguments)

    this.state = {
        reason: '',
        cancelFlag: false,
        cancelReason:"",
    }
    }
  render() {
    const { reason,cancelFlag,cancelReason } = this.state
    return (
        <View className="wrapper">
        <View>
            <View className="notice">
                <View className="noticeTitle">您提交注销申请前，请仔细确认以下须知</View>
                <View className="list">
                    <View className="listItem">
                        1. 账号注销前，请将所有未完结订单（待付款、待发货、待收货、退货退款中）/未完结投诉，处理完成后方可申请
                    </View>
                    <View className="listItem">
                        2. 账号注销后，将清空手机号、用户名等账号信息和所有订单记录，此账户将无法再登入
                    </View>
                </View>

            </View>
            <View className="item">
                <View className='explain_txt'>注销原因<View className='under'></View>
                </View>
                <View className="textarea">
                    <Textarea controlled={true} style="width:100%;height:200rpx" value={reason} onInput={this.onTextInput} placeholder="请填写您的注销原因和意见，我们会妥善听取您的建议优化我们的产品" />
                    </View>
                </View>
                <View className="bottom">
                        <View className="applycancel" onClick={this.applycancel}>申请注销</View>
                </View>

        </View>
        {cancelFlag && (
            <View className="shadow">
            <View className="tipWrapper">
            <Image src={require('../../../../images/tip_warn.png')} className="tippic"></Image>
                <View className="tipText">{cancelReason}</View>
                <View className="tipBtn" onClick={this.hideShadow}>知道了</View>
            </View>
        </View>
        )}
        </View>
    )
  }
  applycancel(){
    var that = this;
    if(this.state.reason == ""){
      Taro.showToast({
        title: '请填写原因',
        icon: 'none',
        duration: 1500
      })
    }else{
      Taro.showModal({
        content: "账户注销后无法恢复，且不能使用该账号注册，请谨慎操作",
        cancelColor: "#1fdb9b",
        cancelText: "返回",
        confirmColor: "#1fdb9b",
        confirmText: "申请注销",
        success(res) {
          if (res.confirm) {
            // 验证是否满足注销条件
          orderApi.getcancel().then(res=>{
            if(res){
              pushNavigation('account_verify',{reason:that.state.reason})
            }
          },error=>{
            if(error.code == -100){
              that.setState({
                cancelFlag:true,
                cancelReason:error.msg,
              })
            }
          })
          }
        }
      })
    }

  }
  onTextInput (text) {
    let input = text.detail.value;
    this.setState({
      reason: input,
    })
  }
  hideShadow(){
    this.setState({
      cancelFlag:false
    })
  }
}
