import {
  Block,
  View,
  Text,
  Input
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {toDecimal} from '../../../../utils/YFWPublicFunction.js'
import "./YFWExchangePoints.scss";
export default class YFWExchangePoints extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      valid_balance:0,
      invite_exchange_point:0,
      prize:0
    };
  }

  componentWillMount() {

  }
  componentWillUnmount() {}
  componentDidShow() {
    userCenterApi.getBalanceInfo().then(res=>{
      this.setState({
        valid_balance:res.valid_balance || 0,
        invite_exchange_point:res.invite_exchange_point
      })

    })
  }
  prizeChange(e) {
    let {
      value
    } = e.detail;
    value = value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    value = value.replace(/^\./g, ""); //验证第一个字符是数字而不是字符
    value = value.replace(/\.{2,}/g, "."); //只保留第一个.清除多余的
    value = value
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
    let _data = Number(value) > Number(this.state.valid_balance) ? this.state.valid_balance : value;
    this.setState({
      prize:_data,
      invite_exchange_point:_data*100
    })
  }
  submitChange(){
    if(this.state.valid_balance == 0 || this.state.valid_balance == '0.00' || !this.state.valid_balance){
      Taro.showToast({
        title: '当前无可用奖励兑换积分',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(this.state.prize == 0 || this.state.prize == '0.00' || !this.state.prize){
      Taro.showToast({
        title: '请输入兑换积分的奖励',
        icon:'none',
        duration:2000
      })
      return false;
    }
    if(Number(this.state.prize) > Number(this.state.valid_balance)){
      Taro.showToast({
        title: '您输入的奖励大于可用奖励,请重新输入',
        icon:'none',
        duration:2000
      })
      return false;
    }
    userCenterApi.balanceToPoint(this.state.prize).then(res=>{
      if(res){
        Taro.showToast({
          title: '兑换成功',
          icon:'none',
          duration:2000
        })
        setTimeout(()=>{
          Taro.navigateBack({})
        },1000)

      }else{
        Taro.showToast({
          title: res.msg ||'兑换失败',
          icon:'none',
          duration:2000
        })
      }
    })
  }
  config = {
    navigationBarTitleText: "兑换积分",
    navigationBarBackgroundColor: "#23D397",
    navigationBarTextStyle: "white",
  };

  render() {
    const { invite_exchange_point,prize} = this.state;
    return (
      <View style="height:100vh;overflow:hidden">
        <View style="margin-top:20rpx">
          <View className="row bottom">
            <View className="tip">可用奖励</View>
            <View className="value" style="display:flex;align-items:center">
              <Input className="input" type="text"  controlled={true} onInput={this.prizeChange} value={prize} />
              <Text>元</Text>
            </View>
          </View>
          <View className="row">
            <View className="tip">可兑换积分</View>
            <View className="value"><Text style="color:rgb(255,51,0)">{invite_exchange_point}</Text> 积分</View>
          </View>
        </View>
        <View className="explain">1元=100积分</View>
        <View className="explain" style="margin-top:16rpx">请确认兑换金额，兑换成功后奖励金额将不可返还。</View>
        <View className='bottom_container'>
          <View onClick={this.submitChange} className='btnBtom'>
            <View className="changepoints">确认兑换</View>
          </View>
          <View className='bottom_empty'></View>
        </View>
      </View>
    );
  }
}
