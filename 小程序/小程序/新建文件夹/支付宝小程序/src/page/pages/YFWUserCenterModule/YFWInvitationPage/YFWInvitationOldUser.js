import {
  View,
  Text,
  Image,
  Button
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./YFWInvitationOldUser.scss";
import { pushNavigation } from "../../../../apis/YFWRouting";
import {
  UserCenterApi,PublicApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()

export default class YFWInvitationOldUser extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      code:"",
    };
  }

  componentWillMount() {
    let options = this.$router.params;

  }
  componentWillUnmount() {}
  componentDidShow() {
    userCenterApi.getAppinviteCode().then(res=>{
      if(res){
        this.setState({
          code:res
        })
      }
    })
  }

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage () {
    let _param = {
      code:this.state.code,
    }
    return {
      // 'desc': desc, //标题
      title: '买药享低价，速领20元新人红包，药房直送有保障',
      path: 'page/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitation?params='+JSON.stringify(_param),
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
  goHome(){
    pushNavigation('get_home')
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
          <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page2_middle.jpg"></Image>
          <Button className="invitation_button_green" open-type="share">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_button_green.png"></Image>
            <Text className="invitation_text" style="color:white">立即邀请</Text>
          </Button>
          <View className="invitation_tip">邀好友赚10000+现金</View>
          <Button className="invitation_button" onClick={this.goHome} >
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_button.png"></Image>
            <Text className="invitation_text">去首页</Text>
          </Button>
        </View>
        <View className="invitation_page1_bottom">
          <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page1_bottom.jpg"></Image>
        </View>
      </View>
    );
  }
}
