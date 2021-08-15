import {
  View,
  Text,
  Image,
  Button
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./YFWInvitationNewUser.scss";
import { pushNavigation } from "../../../../apis/YFWRouting";


export default class YFWInvitationNewUser extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillMount() {
    let options = this.$router.params;

  }
  componentWillUnmount() {}
  componentDidShow() {}

  goHome(){
    pushNavigation('get_home')
  }


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    return {
      // 'desc': desc, //标题
      title: '买药享低价，速领20元新人红包，药房直送有保障',
      path:  'page/tabBar/YFWHomePage/YFWHome',
      imageUrl:require('../../../../images/wxmin_share_invite.png'),
      bgImgUrl:require('../../../../images/wxmin_share_invite.png'),
      success: function (res) {
        // 转发成功

      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
  config = {
    navigationBarTitleText: "邀友赢现金",
    navigationBarBackgroundColor: "#49ddb8",
    navigationBarTextStyle: "white",
  };

  render() {
    return (
      <View style="overflow:hidden">
        <View className="invitation_page1_top">
          <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page1_top.jpg"></Image>
        </View>
        <View className="invitation_page1_middle">
          <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page3_middle.jpg"></Image>
          <Button className="invitation_button" onClick={this.goHome} >
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_button.png"></Image>
            <Text className="invitation_text">立即使用</Text>
          </Button>
          <View className="invitefriend">邀好友赚10000+现金</View>
        </View>
        <View className="invitation_page1_bottom">
          <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page1_bottom.jpg"></Image>
        </View>
      </View>
    );
  }
}
