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
import { pushNavigation } from "../../../../apis/YFWRouting";
import {
  isLogin,
} from "../../../../utils/YFWPublicFunction";
import { BaseApi,AlipayApi } from "../../../../apis/base.js";
import { UserCenterApi } from "../../../../apis/index.js";
import "./YFWInvitation.scss";
const baseApi = new BaseApi();
const alipayApi = new AlipayApi()
const userCenterApi = new UserCenterApi();

export default class YFWInvitation extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasLogin: 0,
      loading: false,
      loginFlag: true,
      name: "",
      avatar: "",
      invite_code: "",
    };
  }

  componentWillMount() {
    let options = this.$router.params;
    this.setState({
      hasLogin: isLogin() ? 1 : 2,
    });
    if (options.params) {
      let _param = JSON.parse(options.params);
      userCenterApi.getYQAccountByCode(decodeURI(_param.code)).then((res) => {
        this.setState({
          name: res.account_name || "",
          avatar: res.intro_image
            ? "https://c1.yaofangwang.net" + res.intro_image
            : "",
          invite_code: options.code,
        });
      });
    }
  }
  componentWillUnmount() {}
  componentDidShow() {}
  //支付宝同意授权手机号
  onGetAuthorize = (res)=>{
    Taro.showLoading({
      title:''
    })
    //获取手机号
    my.getAuthCode({
      scopes: 'auth_base',
      success:res=>{
        if(res.authCode){
          let _code = res.authCode;
          alipayApi.getOpenid(_code).then(openid=>{
            if(openid){ //拿到openid 直接掉登录接口
              var _openid = openid
              baseApi.openidLogin(openid,3).then(res=>{
                if (res != null && res.mobile) {
                  //已绑定过手机号 直接登录成功 无需再授权手机号
                  Taro.hideLoading()
                  pushNavigation('invitation_oldUser')
                }else{
                  //授权手机号
                  my.getPhoneNumber({
                    success: (res) => {
                      let encryptedData = res.response, 
                      param={
                        openid:_openid,
                        encryptedData,
                      };
                      alipayApi.getOpenidByPhoneNumber(param).then(res=>{
                        if(res){
                          baseApi.openidLogin(res,3).then(res=>{
                            if(res!=null){
                              Taro.hideLoading()
                              pushNavigation('invitation_newUser')
                            }else{
                              Taro.hideLoading()
                              Taro.showToast({
                                title: '领取异常,请稍后重试',
                                icon: 'none',
                                duration: 2000
                              })
                            }
                          },err=>{
                            Taro.hideLoading()
                            Taro.showToast({
                              title: '领取异常,请稍后重试',
                              icon: 'none',
                              duration: 2000
                            })
                          })
                        }else{
                          Taro.hideLoading()
                          Taro.showToast({
                            title: '领取异常,请稍后重试',
                            icon: 'none',
                            duration: 2000
                          })
                        }

                      },
                      err=>{
                        Taro.hideLoading()
                        Taro.showToast({
                          title: '领取异常,请稍后重试',
                          icon: 'none',
                          duration: 2000
                        })
                      })

                    },
                    fail: (res) => {
                      Taro.hideLoading()
                    },
                })
                }
              },err=>{
                Taro.hideLoading()
                Taro.showToast({
                  title: '领取异常,请稍后重试',
                  icon: 'none',
                  duration: 2000
                })
              })
            }else{
              Taro.hideLoading()
              Taro.showToast({
                title: '领取异常,请稍后重试',
                icon: 'none',
                duration: 2000
              })
            }
          
        },err=>{
          Taro.hideLoading()
          Taro.showToast({
            title: '领取异常,请稍后重试',
            icon: 'none',
            duration: 2000
          })
          
        })
        }

      },
      fail:err=>{
        Taro.hideLoading()
        Taro.showToast({
          title: '领取异常,请稍后重试',
          icon: 'none',
          duration: 2000
        })
      }
    })

}
  //支付宝小程序拒绝授权手机号
  onAuthError = (err)=>{
    console.log('拒绝授权手机号' + err)
  }

  handleCatchTap() {
    return true;
  }
  getInvitation() {
    pushNavigation("invitation_newUser");
  }
  hideloading() {
    this.setState({
      loading: false,
    });
  }
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: "买药享低价，速领20元新人红包，药房直送有保障",
      path:  'page/tabBar/YFWHomePage/YFWHome',
      imageUrl:require('../../../../images/wxmin_share_invite.png'),
      bgImgUrl:require('../../../../images/wxmin_share_invite.png'),
      success: function (res) {
        // 转发成功
        Taro.showToast({
          title: "转发成功",
          icon: "success",
          duration: 2000,
        });
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
  };

  render() {
    const { name, hasLogin, loading,avatar } = this.state;
    return (
      <Block>
        <View style="overflow:hidden">
          <View className="invitation_page1_top">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page1_top.jpg"></Image>
          </View>
          <View className="invitation_page1_middle">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page1_middle.jpg"></Image>
            <Image className="ava" src={avatar}></Image>
            <View className="invitation_name">{name}</View>
            <View className="invita_text">邀你领20元新人红包，买药更方便</View>
            {hasLogin == 2 && (
              <Button
                className="invitation_button"
                open-type="getAuthorize" onGetAuthorize={this.onGetAuthorize} onError={this.onAuthError} scope='phoneNumber'
              >
                <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_button.png"></Image>
                <Text className="invitation_text">立即领取</Text>
              </Button>
            )}
            {hasLogin == 1 && (
              <Button className="invitation_button" onClick={this.getInvitation}>
                <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_button.png"></Image>
                <Text className="invitation_text">立即领取</Text>
              </Button>
            )}
          </View>
          <View className="invitation_page1_bottom">
            <Image src="https://c1.yaofangwang.net/common/images/invitation/invitation_page1_bottom.jpg"></Image>
          </View>
        </View>
        {loading && (
          <View className="loadingbg" onTouchMove={this.handleCatchTap}>
            <Image src="/images/loading_cycle.gif" class="invitation-loading" />
          </View>
        )}
      </Block>
    );
  }
}
