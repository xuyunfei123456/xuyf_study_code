import {
  Block,
  View,
  Text,
  ScrollView,
  Image,
  Swiper,
  SwiperItem,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./YFWInvitatioReappearance.scss";
import { UserCenterApi } from "../../../../apis/index.js";
import { pushNavigation } from "../../../../apis/YFWRouting.js";
const userCenterApi = new UserCenterApi();
export default class YFWInvitatioReappearance extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      showbottom: false,
      scrollheight: null,
      showrule: true,
      top20: [],
      priceTotal: "",
      toView: "",
      connt_invite: 0,
      total_money: 0,
      invite_record: [],
      code: "",
      _index:0,
    };
  }

  componentWillMount() {
    let options = this.$router.params;
  }
  componentWillUnmount() {}
  componentDidShow() {
    userCenterApi.getInviteIndex().then((res) => {
      if (res) {
        this.setState({
          priceTotal: res.priceTotal,
          top20: res.top20,
          connt_invite: res.connt_invite || 0,
          total_money: res.total_money,
          invite_record: res.invite_record || [],
        });
      }
    });
    let that = this;
    Taro.getSystemInfo({
      success: function (res) {
        that.setState({
          scrollheight: res.windowHeight,
        });
      },
    });
    userCenterApi.getAppinviteCode().then((res) => {
      this.setState({
        code: res,
      });
    });
  }
  turnToTx() {
    pushNavigation("lltx");
  }
  hiderule() {
    this.setState({
      showrule: true,
    });
  }
  ruletip(e) {
    e.preventDefault()
    e.stopPropagation()
    return;
  }
  /** 点击穿透 */
  handleCatchTap(event) {
    return false;
  }
  rule() {
    this.setState({
      showrule: false,
    });
  }
  mainscroll(e) {
    let scrollTop = e.detail.scrollTop;
    this.setState({
      showbottom: scrollTop > 340 ? true : false,
    });
  }
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    let _param = {
      code: this.state.code,
    };
    return {
      // 'desc': desc, //标题
      title: "买药享低价，速领20元新人红包，药房直送有保障",
      path:
        "/page/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitation?params=" +
        JSON.stringify(_param),
      imageUrl:require('../../../../images/wxmin_share_invite.png'),
      bgImgUrl:require('../../../../images/wxmin_share_invite.png'),
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {
        // 转发失败
      },
    };
  }
  config = {
    navigationBarTitleText: "邀友赢现金",
    navigationBarBackgroundColor: "#49ddb8",
    navigationBarTextStyle: "white",
    pullRefresh:false,
  };

  render() {
    const {
      showbottom,
      scrollheight,
      priceTotal,
      top20,
      total_money,
      connt_invite,
      showrule,
    } = this.state;
    const scrolStyle =
      "margin-bottom:" +
      (showbottom ? "208" : "0") +
      "rpx;height:" +
      scrollheight +
      "px;background-color:#cc104d";
    return (
      <Block>
        <ScrollView scrollY style={scrolStyle} onScroll={this.mainscroll}>
          <View className="invitation_page1_top">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page2_top.jpg"></Image>
            <Button className="invitation_button_green" open-type="share">
              <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_button_green.png"></Image>
              <Text className="invitation_text" style="color:white">
                立即邀请
              </Text>
            </Button>
            <View className="rule" onClick={this.rule}></View>
          </View>
          <View className="invitation_page1_middle">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page4_middle.jpg"></Image>
            <View className="sendTotal">
              <Text className="tip_text">已累计送出</Text>
              <Text className="tip_text_money">{priceTotal}</Text>
              <Text className="tip_text">元现金</Text>
            </View>
            <View className="toView">
              <Swiper
                className="swiper_container"
                easing-function="linear"
                vertical={true}
                autoplay={true}
                circular={true}
                duration={2000}
                interval={100}
                disableTouch={true}
                touchAngle={0}
                display-multiple-items={3}
              >
                {top20.map((item,index) => {
                    if(this.state._index<5){
                      this.state._index++;
                    }else{
                      this.state._index = 0;
                    }
                    let _index = this.state._index;
                    const data1 = top20[_index*2+_index];
                    const data2 = top20[_index*2+_index+1];
                    const data3= top20[_index*2+_index+2];
                    const pic1 = "https://c1.yaofangwang.net" +data1.intro_image;
                    const pic2 = "https://c1.yaofangwang.net" +data2.intro_image;
                    const pic3 = "https://c1.yaofangwang.net" +data3.intro_image;
                  return (
                    <SwiperItem>
                      <View style="display:flex;align-items:center;height:100rpx;line-height:100rpx">
                        <View style="height:60rpx;width:60rpx;margin:0 5%">
                          <Image src={pic1}></Image>
                        </View>
                        <View className="username">用户{data1.Mobile}</View>
                        <View className="username" style="margin-left:8%">
                          已提现
                          <Text className="TotalMoney">{data1.TotalMoney}</Text>
                          元奖励
                        </View>
                      </View>
                      <View style="display:flex;align-items:center;height:100rpx;line-height:100rpx">
                        <View style="height:60rpx;width:60rpx;margin:0 5%">
                          <Image src={pic2}></Image>
                        </View>
                        <View className="username">用户{data2.Mobile}</View>
                        <View className="username" style="margin-left:8%">
                          已提现
                          <Text className="TotalMoney">{data2.TotalMoney}</Text>
                          元奖励
                        </View>
                      </View>
                      <View style="display:flex;align-items:center;height:100rpx;line-height:100rpx">
                        <View style="height:60rpx;width:60rpx;margin:0 5%">
                          <Image src={pic3}></Image>
                        </View>
                        <View className="username">用户{data3.Mobile}</View>
                        <View className="username" style="margin-left:8%">
                          已提现
                          <Text className="TotalMoney">{data3.TotalMoney}</Text>
                          元奖励
                        </View>
                      </View>
                    </SwiperItem>
                  );
                })}
              </Swiper>
            </View>
          </View>
          <View className="invitation_page4_down">
            <Image
              src="https://c1.yaofangwang.net/common/images/invitation/invitation_page4_down.jpg"
              alt=""
            />
          </View>
          <View className="invitation_page4_bottom">
            <Text className="tipTextTop">我的邀请记录</Text>
            <View style="color:#666666;font-size:32rpx;text-align:center;margin-top:20rpx">
              累计奖励：
              <Text style="font-size:40rpx;color:#d92b5b;font-weight:bolder">
                {total_money}
              </Text>
              元
            </View>
            <View
              onClick={this.turnToTx}
              style="color:#cc104d;text-align:center;text-decoration:underline;margin-top:22rpx"
            >
              立即提现
            </View>
            <View className="hasinvita">
              <View>邀请的好友数：{connt_invite}</View>
            </View>
            {invite_record.map((item) => {
              return (
                <View className="inviterow">
                  <View className="mobile">{item.phone}</View>
                  <View className="date">{item.create_time}</View>
                  {item.money > 0 ? (
                    <View className="prize">
                      奖励
                      <Text style="color:#d92b5b;font-size:24rpx;font-weight:bolder">
                        {item.money}
                      </Text>
                      元
                    </View>
                  ) : (
                    <View className="prize2">
                      <Text style="color:rgb(75,200,159);font-size:24rpx">
                        {item.status}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
        {showbottom && (
          <View className="invitation_page1_bottom">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page4_bottom.jpg"></Image>
            <Button className="bottom_button" open-type="share"></Button>
          </View>
        )}

        <View hidden={showrule} className="rulebg" onClick={this.hiderule}>
          <View className="ruletip" onClick={this.ruletip}>
            <Text className="tipTextTop">活动规则</Text>
            <Text className="tipText">
              1、点击“立即邀请”按钮，通过微信、QQ、海报等方式发送邀请链接给好友。
            </Text>
            <Text className="tipText">
              2、若该好友为药房网商城新用户，好友可领取20元新人红包，授权注册登录后即可使用。
            </Text>
            <Text className="tipText">
              3、每成功邀请一位好友，发起人可以享受该好友长期持续2%现金返现，单人累计可获最高返现500元，邀请人数不限。
            </Text>
            <Text className="tipText">
              4、现金奖励将在好友订单收货完成后自动发放至个人中心账户，奖励金额可直接提现或抵扣订单金额。
            </Text>
            <Text className="tipText">
              5、各类药房网商城判定为同一用户的情形，仅被计算为一个有效邀请。药房网商城有权对判定为违规套取奖励的行为视情节进行不予发放奖励
              、停用邀请奖励功能、冻结所有通过邀请有奖渠道获得的奖励等方式处理。
            </Text>
            <Text className="tipText">
              6、活动长期有效，如有其他疑问请咨询药房网商城客服
              400-8810-120（9:00-18:00）。
            </Text>
            <Text className="tipText">
              7、本公司拥有对本活动条款法律许可范围内的解释权
            </Text>
          </View>
        </View>
      </Block>
    );
  }
}
