import { View, Text, Image, Button, Block } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { toDecimal } from "../../../../utils/YFWPublicFunction.js";
import { UserCenterApi } from "../../../../apis/index.js";
import "./YFWTxRecord.scss";
const userCenterApi = new UserCenterApi();

export default class YFWTxRecord extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      Cashback: "0.00",
      valid_balance: "0.00",
      dataList:[],
    };
  }
  componentWillMount() {
    let options = this.$router.params;
  }
  componentWillUnmount() {}
  componentDidShow() {
    userCenterApi.getTxRecord().then((res) => {
      let valid_balance =
        (res.balanceinfo &&
          res.balanceinfo.valid_balance &&
          toDecimal(res.balanceinfo.valid_balance)) ||
        "0.00";
      this.setState({
        dataList:
          (res.accountbalanceList && res.accountbalanceList.dataList) || [],
        Cashback: toDecimal(res.Cashback),
        valid_balance,
      });
    });
  }

  config = {
    navigationBarTitleText: "提现记录",
    navigationBarBackgroundColor: "#23D397",
    navigationBarTextStyle: "white",
  };

  render() {
    const { valid_balance, Cashback, dataList } = this.state;
    const rankbannerimg = require('../../../../images/rankbanner.png');
    const rankbanner = 'background-image:url('+rankbannerimg+')'
    return (
      <View className="wrapper">
        <View
          style={rankbanner}
          className="bg"
        >
          <View className="topcontent">
            <View className="top_money">{valid_balance}</View>
            <View className="top_title">可提现金额</View>
          </View>
          <View className="topcontent">
            <View className="top_money">{Cashback}</View>
            <View className="top_title">待奖励金额</View>
          </View>
        </View>
        <View className="explain_txt" style="color:'#333333;font-size:28rpx">
          提现记录<View className="under"></View>
        </View>
        <View className="list">
          {dataList.map((item,index) => {
            const bot = index + 1 == dataList.length ? "none" : "";
            const botStyle="border-bottom:"+bot
            return (
              <View className="listItem" style={botStyle}>
                <View className="first">
                  <View style="font-size:24rpx;color:#333333">
                    {item.dict_account_balance_status == 0
                      ? "处理中"
                      : item.dict_account_balance_status == -1
                      ? "交易失败"
                      : "交易成功"}
                  </View>
                  <View style="font-size:24rpx;color:rgb(153,153,153)">
                    <text className="tmoney">{item.total || 0}</text>元
                  </View>
                </View>
                <View className="second">
                  <View style="font-size:24rpx;color:#999999">
                    {item.apply_time}
                  </View>
                  <View style="font-size:24rpx;color:#999999">
                    {item.dict_account_balance_type == 1 ? "提现" : "积分兑换"}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }
}
