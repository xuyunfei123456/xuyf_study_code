import { Block, View, Image, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { BaseApi } from '../../../../apis/base.js'
import './YFWLogin.scss'
const baseApi = new BaseApi()
const Uconfig = require('../../../../config');

export default class YFWLogin extends Taro.Component {
  state = {
    dataText:
      '您暂未授权药房网商城小程序获取你的信息,将无法正常使用小程序的功能。如需要正常使用,请点击"授权"按钮,打开头像,昵称等信息的授权。'
  }

  componentWillMount(options = this.$router.params || {}) {

  }
  onAuthError = ()=>{
  }
  bindGetUserInfo = (e) => {
    // Taro.getUserInfo({
    //   success: function(res) {
    //     let userInfo = res.userInfo
    //     if (userInfo) {
    //       pushNavigation('get_author_login')
    //     } else {
    //       //用户按了拒绝按钮
    //       Taro.showModal({
    //         title: '提示',
    //         content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
    //         showCancel: false,
    //         confirmText: '返回授权',
    //         success: function (res) {
    //           if (res.confirm) {
    //             console.log('用户点击了“返回授权”')
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
    if (e.detail.userInfo) {
      pushNavigation('get_author_login')
    } else {
      //用户按了拒绝按钮
      Taro.showModal({
        title: '提示',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  }
  getLogin = () => {
    // if(process.env.TARO_ENV == 'weapp'){
    //   Taro.login({
    //     success(res) {
    //       if (res.code) {
    //         //获取code换取openid进行登录   
    //         baseApi.getOpenid(res.code).then(openid => {
    //           if (openid != undefined && openid != '') {
    //             baseApi.openidLogin(openid).then(res => {          
    //               //判断登录成功
    //               if (res != null) {
    //                 Taro.navigateBack({
    //                   delta: 1
    //                 })
    //               } else {
    //                 Taro.getSetting({
    //                   success: function(res) {
    //                     if (res.authSetting['scope.userInfo']) {
    //                      pushNavigation('get_author_login')
    //                     }
    //                   }
    //                 })
    //               }
    //             })
    //           }
    //         })
    //       } else {
    //         console.log('登录失败！' + res.errMsg)
    //       }
    //     }
    //   })
    // }
    
    // if (Uconfig.config.api_base_url.startsWith('http://192.168.2'|| 'http://192.168.2.13') ) {
    //   baseApi.userLogin('wulu', 'abc123')
    //     .then(
    //       res => {
    //         //判断登录成功
    //         if (res != null) {
    //           Taro.navigateBack({
    //             delta: 3
    //           })
    //         }
    //       },
    //       err => {
    //         Taro.showToast({
    //           title: err.msg,
    //           icon: 'none'
    //         })
    //       }
    //     )
    // } else  {
    //   baseApi.userLogin('18217433824', '123.asdf')
    //     .then(
    //       res => {
    //         //判断登录成功
    //         if (res != null) {
    //           Taro.navigateBack({
    //             delta: 3
    //           })
    //         }
    //       },
    //       err => {
    //         Taro.showToast({
    //           title: err.msg,
    //           icon: 'none'
    //         })
    //       }
    //     )
    // }
    // console.log(Uconfig.config.api_base_url)
    if (process.env.TARO_ENV === 'alipay') {
      my.getAuthCode({
        scopes: 'auth_user', // 主动授权（弹框）：auth_user，静默授权（不弹框）：auth_base
        success: (res) => {
          if (res.authCode) {
            // my.getAuthUserInfo({
            //   success:res=>{
            //     debugger
            //   },
            //   fail:err=>{
            //     console.log('获取用户信息失败')
            //   }
            // })
            // // 调用后台授权登录
            // baseApi.zfblogin(res.authCode).then(res=>{
            //   debugger
            // },err=>{
            //   debugger
            // })
          }
        },
        fail: function (res) {
          pushNavigation('get_bind_phone')
        }
      })

    } else if (process.env.TARO_ENV === 'weapp') {
      my.getAuthCode({
        scopes: 'auth_user', // 主动授权（弹框）：auth_user，静默授权（不弹框）：auth_base
        success: (res) => {
          console.log(res)
          if (res.authCode) {
            // 调用后台授权登录
            pushNavigation('get_author_login')

          }
        },
        fail: function (res) {
          console.log("登录失败！" + res);
        }
      })
    } else {
      pushNavigation('get_bind_phone')
    }
  }
  config = {
    navigationBarTitleText: '授权登录',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }

  render() {
    const { dataText } = this.state
    return (
      <View className="container">
        <View className="top_view_img">
          <Image
            className="top_img"
            src="https://c1.yaofangwang.net/common/images/miniapp/logo_icon.jpg"
            mode="aspectFit"
          ></Image>
        </View>
        <View className="bottom_view">
          <Text className="text-login">{dataText}</Text>
          {/* pushNavigation('get_author_login')  */}
          {process.env.TARO_ENV == 'weapp' ? (<Button className="btn-login" openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.bindGetUserInfo}>
          授权登录
          </Button>):(<View className="view-phone-login" onClick={() => {this.getLogin()}}>
            <Text className="btn-phone-login"
              style={{
                marginTop: (process.env.TARO_ENV == 'alipay' ? 5 : 0)
              }}>授权登录</Text>
          </View>)}
        </View>
      </View>
    )
  }
}

