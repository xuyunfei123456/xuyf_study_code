import { Block, View, Image, Button, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/YFWLoginModule/YFWAuthorLoginPage/YFWAuthorLogin.js
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { BaseApi,AlipayApi } from '../../../../apis/base.js'
import { safeObj } from '../../../../utils/YFWPublicFunction.js'
import './YFWAuthorLogin.scss'
const baseApi = new BaseApi()
const alipayApi = new AlipayApi()

export default class YFWAuthorLogin extends Taro.Component {
  componentWillMount(){
    if(process.env.TARO_ENV == 'alipay'){
      my.setCanPullDown({
        canPullDown:false
      })
    }
        //   baseApi.userLogin('wulu', 'abc123')  //'18217433824', '123.asdf'   'wulu', 'abc123'
        // .then(
        //   res => {
        //     //判断登录成功
        //     if (res != null) {
        //       Taro.navigateBack({
        //         delta: 1
        //       })
        //     }
        //   },
        //   err => {
        //     Taro.showToast({
        //       title: err.msg,
        //       icon: 'none'
        //     })
        //   }
        // )
  }
  componentDidMount(){
    if(process.env.TARO_ENV == 'alipay'){
      my.getAuthCode({
        scopes: 'auth_base',
        success:res=>{
          console.log('进入登录'+res.authCode)
        },
        fail:res=>{
          console.log('没拿到authcode')
        }
      })
    }

  }
  getPhoneNumber = e=>{}
  bindPhoneLogin = e => {
    pushNavigation('get_bind_phone')
  }
  config = {
    navigationBarTitleText: '授权登录',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }
  //支付宝同意授权手机号
  onGetAuthorize = (res)=>{
    Taro.showLoading({
      title: '登录中...',
    })
    //获取手机号
    my.getAuthCode({
      scopes: 'auth_base',
      success:res=>{
        if(res.authCode){
          let _code = res.authCode;
          console.log('拿到手机号之后的code='+res.authCode)
          alipayApi.getOpenid(_code).then(openid=>{
            if(openid){ //拿到openid 直接掉登录接口
              var _openid = openid
              baseApi.openidLogin(openid,3).then(res=>{
                if (res != null && res.mobile) {
                  //已绑定过手机号 直接登录成功 无需再授权手机号
                  Taro.hideLoading()
                  Taro.navigateBack({
                    delta: 1
                  })
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
                              Taro.navigateBack({
                                delta: 1
                              })
                            }else{
                              Taro.hideLoading()
                              Taro.showToast({
                                title: '登录失败,请稍后重试或选择手机号登录(5)',
                                icon: 'none',
                                duration: 2000
                              })
                            }
                          },err=>{
                            Taro.hideLoading()
                            Taro.showToast({
                              title: '登录失败,请稍后重试或选择手机号登录(6)',
                              icon: 'none',
                              duration: 2000
                            })
                          })
                        }else{
                          Taro.hideLoading()
                          Taro.showToast({
                            title: '登录失败,请稍后重试或选择手机号登录(7)',
                            icon: 'none',
                            duration: 2000
                          })
                        }

                      },
                      err=>{
                        Taro.hideLoading()
                        Taro.showToast({
                          title: '登录失败,请稍后重试或选择手机号登录(1)',
                          icon: 'none',
                          duration: 2000
                        })
                      })

                    },
                    fail: (res) => {
                      Taro.hideLoading()
                      Taro.showToast({
                        title: '您可以选择重新授权登录或者手机号登录(2)',
                        icon: 'none',
                        duration: 2000
                      })
                    },
                })
                }
              },err=>{
                Taro.hideLoading()
                Taro.showToast({
                  title: '登录失败,请稍后重试或选择手机号登录(3)',
                  icon: 'none',
                  duration: 2000
                })
              })
            }else{
              Taro.hideLoading()
              Taro.showToast({
                title: '登录失败,请稍后重试或选择手机号登录(8)',
                icon: 'none',
                duration: 2000
              })
            }
          
        },err=>{
          Taro.hideLoading()
          Taro.showToast({
            title: '登录失败,请稍后重试或选择手机号登录(9)',
            icon: 'none',
            duration: 2000
          })
          
        })
        }

      },
      fail:err=>{
        Taro.hideLoading()
        Taro.showToast({
          title: '登录失败,请稍后重试或选择手机号登录(4)',
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
  //百度小程序登录
  swanLogin=(e)=>{
    swan.getLoginCode({
      success:res=>{
        console.log('百度登录凭证：'+res.code);

      },
      fail:err=>{
        console.log(`百度获取登录凭证失败:${err}`)
      }
    })

  }
  render() {
    return (
      <View className="container">
        <View className="top_view_img">
          <Image
            className="top_img"
            src="https://c1.yaofangwang.net/common/images/miniapp/logo_icon.jpg"
            mode="scaleToFill"
          ></Image>
        </View>
        <View className="bottom_view">
        {process.env.TARO_ENV=='weapp'&&(
            <Button class='view-wx-login' style="border:none;" openType="getPhoneNumber" onGetPhoneNumber={this.getPhoneNumber}>
            <Image className='img-wx-login' src={require('../../../../images/logo_wx.png')}></Image>
            <Text className="btn-wx-login">微信用户快捷登录</Text>
          </Button>
          )}
          {process.env.TARO_ENV=='alipay'&&(
              <Button  className="view-ali-login" open-type="getAuthorize" onGetAuthorize={this.onGetAuthorize} onError={this.onAuthError} scope='phoneNumber'>
              支付宝用户快捷登录

          </Button>
          )}
          {process.env.TARO_ENV=='swan'&&(
              <Button  className="view-ali-login" open-type="getPhoneNumber" bindgetphonenumber="swanLogin">
              百度用户快捷登录
            </Button>
          )}
          <View className="view-phone-login" onClick={this.bindPhoneLogin}>
          <Image class='img-phone-login'src={require('../../../../images/logo_phone.png')}></Image>
            <Text className="btn-phone-login">手机号登录/注册</Text>
          </View>
        </View>
      </View>
    )
  }
}
