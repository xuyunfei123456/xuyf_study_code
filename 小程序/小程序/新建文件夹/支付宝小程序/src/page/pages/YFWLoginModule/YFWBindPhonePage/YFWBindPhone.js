import { Block, View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { BaseApi } from '../../../../apis/base.js'
const baseApi = new BaseApi()
import { LoginRegisterApi } from '../../../../apis/index.js'
const indexApi = new LoginRegisterApi()
import { is_phone_number, isEmpty } from '../../../../utils/YFWPublicFunction.js'
import TitleView from '../../../../components/YFWTitleView/YFWTitleView'
import './YFWBindPhone.scss'
import { NUMBERS } from '../../../../utils/YFWRuleString'

export default class LoginBindPhone extends Taro.Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneNum: '',
      yzmNum: '',
      disabled: false,
      getYZMCode: '获取验证码'
    }
  }

  phone_num = e => {
    let num = e.detail.value
    num = num.replace(NUMBERS, '')
    this.setState({
      phoneNum: num
    })
  }

  yzm_num (e) {
    let yzm = e.detail.value
    yzm = yzm.replace(NUMBERS, '')
    this.setState({
      yzmNum: yzm
    })
  }

  sendYZMCode = res => {
    if (this.state.phoneNum == '') {
      // Taro.removeStorageSync('cookieKeys')
      Taro.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 800
      })
      return
    } else if (!is_phone_number(this.state.phoneNum)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 800
      })
      return
    }
    //发请求同时 更改倒计时ui
    this._countdownTimes()
    indexApi.sendSMS(this.state.phoneNum, '1').then(res => {

      console.log(res)
    })
  }

  bindGetUserInfo = (e) => {
    if (e.detail.userInfo) {
      var intro_image = e.detail.userInfo.avatarUrl
      //获取code换取openid，加手机号、验证码进行绑定/登录
      this.getLogin(intro_image)
    }
  }

  getLogin = (intro_image) => {
    let that = this
    if(isEmpty(that.state.phoneNum )){
      Taro.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 800
      })
      return
    }
    if(process.env.TARO_ENV == 'weapp') {
      wx.login({
        success(res) {
          if (res.code) {
            //发起网络请求
            baseApi.getOpenid(res.code).then(openid => {
              if (openid != undefined && openid != '') {
                baseApi.thirdLogin(openid, intro_image, that.state.phoneNum, that.state.yzmNum).then(res => {
                  //判断登录成功
                  if (res != null) {
                    wx.navigateBack({
                      delta: 2
                    })
                  }
                }, err => {
                  wx.showToast({
                    title: err.msg,
                    icon: 'none',
                  })
                })
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }else{
      baseApi.venderLogin(that.state.phoneNum, that.state.yzmNum)
      .then(
        res => {
          //判断登录成功
          if (res != null) {
            Taro.navigateBack({
              delta: 2
            })
          }
        },
        err => {
          Taro.showToast({
            title: err.msg,
            icon: 'none'
          })
        }
      )
    }
    
  }

  _countdownTimes = () => {
    var that = this
    var times = 60
    var i = setInterval(function () {
      times--
      if (times <= 0) {
        that.setState({
          disabled: false,
          getYZMCode: '获取验证码'
        })
        clearInterval(i)
      } else {
        that.setState({
          getYZMCode: '重新获取' + times + 's',
          disabled: true
        })
      }
    }, 1000)
  }

  config = {
    navigationBarTitleText: '绑定手机号',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }

  render() {
    const { account, yzm, disabled, getYZMCode } = this.state
    return (
      <View className="container">
        <View className="view_phone">
          <Text className='bindphone-title'>绑定手机号</Text>
        </View>
        <View className="view_input_phone">
          <Input
            placeholder="请输入手机号"
            placeholderStyle = 'color:rgb(126, 126, 126)'
            data-name="account"
            value={account}
            name="account"
            type="number"
            focus="{true}"
            maxlength="11"
            onInput={this.phone_num.bind(this)}
          ></Input>
          <View className="bottom_line"></View>
        </View>
        <View className="view_input_yzm">
          <View className="input_yzm">
            <Input
              placeholder="请输入验证码"
              placeholderStyle = 'color:rgb(126, 126, 126)'
              data-name="yzm"
              value={yzm}
              name="yzm"
              type="number"
              maxlength="6"
              onInput={this.yzm_num.bind(this)}
            ></Input>
            <View className="bottom_line"></View>
          </View>
          <View
            className="btn_yzm"
            disabled={disabled}
            onClick={this.sendYZMCode}
          >
            {getYZMCode}
          </View>
        </View>
        {process.env.TARO_ENV == 'weapp'?(
          <Button className="btn_bind" openType="getUserInfo" lang="zh_CN" onGetUserInfo={this.bindGetUserInfo}>绑定</Button>
        ):(<View className="view-phone-login" onClick={() => { this.getLogin() }}>
          <Text className="btn-phone-login"
            style={{
              marginTop: (process.env.TARO_ENV == 'alipay' ? 5 : 0)
            }}>绑定</Text>
        </View>)}
      </View>
    )
  }
}