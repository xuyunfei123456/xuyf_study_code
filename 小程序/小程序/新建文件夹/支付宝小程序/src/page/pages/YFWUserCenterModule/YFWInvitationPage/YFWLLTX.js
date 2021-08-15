import { View, Text, Image, Button, Block } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { UserCenterApi } from "../../../../apis/index.js";
import { pushNavigation } from "../../../../apis/YFWRouting.js";
import { toDecimal } from "../../../../utils/YFWPublicFunction.js";
import "./YFWLLTX.scss";
const userCenterApi = new UserCenterApi();

export default class YFWLLTX extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      showexplain: false,
      dataList: [],
      Cashback: "0.00",
      valid_balance: "0.00",
      reward_total: "0.00",
      total_money: "0.00",
    };
  }

  componentWillMount() {
    let options = this.$router.params;
  }
  componentWillUnmount() {}
  componentDidShow() {
    userCenterApi.getMyBalance().then((res) => {
      let valid_balance =
          (res.balanceinfo &&
            res.balanceinfo.valid_balance &&
            toDecimal(res.balanceinfo.valid_balance)) ||
          "0.00",
        reward_total =
          (res.balanceinfo &&
            res.balanceinfo.reward_total &&
            toDecimal(res.balanceinfo.reward_total)) ||
          "0.00",
        total_money = toDecimal(
          Number(res.Cashback || "0.00") + Number(reward_total)
        );
      this.setState({
        dataList: (res.cashlist && res.cashlist.dataList) || [],
        Cashback: toDecimal(res.Cashback),
        valid_balance,
        reward_total,
        total_money,
      });
    });
  }
  apply() {
    Taro.showToast({
      title: "请在药房网商城APP内操作",
      duration: 2000,
      icon: "none",
    });
  }
  rank() {
    pushNavigation("exchange_points");
  }
  explainarea() {
    this.setState({
      showexplain: !this.state.showexplain,
    });
  }
  txRecord() {
    pushNavigation("txrecord");
  }

  config = {
    navigationBarTitleText: "奖励现金",
    navigationBarBackgroundColor: "#23D397",
    navigationBarTextStyle: "white",
  };

  render() {
    const {
      total_money,
      Cashback,
      valid_balance,
      dataList,
      showexplain,
    } = this.state;
    const rankbannerimg = require('../../../../images/rankbanner.png');
    const rankbanner = 'background-image:url('+rankbannerimg+')'
    return (
      <View className="wrapper">
        <View
          style={rankbanner}
          className="bg"
        >
          <View className="explainWrapper">
            <View className="explain" onClick={this.explainarea}>
              奖励说明
            </View>
            <View className="record" onClick={this.txRecord}>
              提现记录
            </View>
          </View>
          <View className="money">{total_money}</View>
          <View className="money_tip">累计奖励</View>
          <View className="prizeDetail">
            <View className="waitPrize">待奖励：{Cashback}</View>
            <View className="hasPrized">可用奖励：{valid_balance}</View>
          </View>
        </View>
        <View className="operation">
          <View className="apply" onClick={this.apply}>
            申请提现
          </View>
          <View className="rank" onClick={this.rank}>
            兑换积分
          </View>
        </View>
        <View className="explain_txt" style="color:'#333333;font-size:28rpx">
          奖励明细<View className="under"></View>
        </View>
        <View className="list">
          {dataList.map((item,index) => {
            const bot = (index + 1) == dataList.length ? "none" : "";
            const botStyle="border-bottom:"+bot
            return (
              <View className="listItem" style={botStyle}>
                <View className="first">
                  <View style="font-size:24rpx;color:#333333">
                    {item.dict_invite_settle_status == 0
                      ? "待奖励"
                      : item.dict_invite_settle_status == 1
                      ? "奖励成功"
                      : "奖励失败"}
                  </View>
                  <View style="font-size:24rpx;color:rgb(153,153,153)">
                    <Text className="tmoney">{item.tMoney || 0}</Text>元
                  </View>
                </View>
                <View className="second">
                  <View style="font-size:24rpx;color:#999999">
                    {item.create_time}
                  </View>
                  <View style="font-size:24rpx;color:#999999">
                    {item.mobile || ""}
                  </View>
                </View>
              </View>
            );
          })}

          {dataList.length == 0 && (
            <View style="color:#cccccc;font-size:30rpx;text-align:center;padding-top:66rpx">
              暂无记录
            </View>
          )}
        </View>
        {showexplain && (
          <View className="showexplain">
            <View className="explain_content">
              <View className="wexplain_title">奖励说明</View>
              <View className="explain_item">
                <View className="explain_item_content">奖励说明：</View>
                <View className="explain_item_content borderbottom">
                  好友订单支付成功后，您将获得订单支付商品金额相应比例的奖励金，待订单确认收货后，现金奖励成功，使用方式如下
                </View>
                <View className="explain_item_content">
                  1.奖励金额可直接抵扣订单金额
                </View>
                <View className="explain_item_content">
                  2.兑换平台积分（1元兑换100积分）
                </View>
                <View className="explain_item_content borderbottom">
                  3.申请提现至个人支付宝账户
                </View>
              </View>
              <View className="attention">
                <View className="explain_item_content_orange">注意</View>
                <View className="explain_item_content_orange">
                  1.提现申请每日可以申请一次，每次提现账户余额不低于20元
                </View>
                <View className="explain_item_content_orange">
                  2.提现金额将在3-5个工作日至您的提现账号
                </View>
                <View className="explain_item_content_orange">
                  3.根据国家规定结算申请将自动代扣代缴个税20%
                </View>
              </View>
              <View className="close" onClick={this.explainarea}>
                关闭
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
