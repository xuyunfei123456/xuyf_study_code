import { View, Image, Button,Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { pushNavigation } from '../../../../apis/YFWRouting'
import './YFWAccountverify.scss'
import {LoginRegisterApi,UserCenterApi} from '../../../../apis/index'
import { set as setGlobalData, get as getGlobalData } from '../../../../global_data'
import {
    is_phone_number,
  } from '../../../../utils/YFWPublicFunction.js'
  const loginRegisterApi = new LoginRegisterApi();
  const userCenterApi = new UserCenterApi();
  var flag = true
export default class YFWAccountverify extends Taro.Component {
    constructor (props) {
        super(...arguments)

        this.state = {
            userInfoModel: {},
            mobile: '',
            phone: '',
            disabled: false,
            getYZMCode: "获取验证码",
            yzm: '',
            successFlag:false,
        }
    }
componentWillMount(options = this.$router.params || {}){
    let reason="";
    if(options.params){
        reason = JSON.parse(options.params).reason || "";
    }
    let _userinfo = getGlobalData('userInfo')
    if (_userinfo) {
      const {
        default_mobile
      } = _userinfo;
      this.setState({
        mobile: default_mobile,
        phone: default_mobile,
        reason,
      })
    } else {
      userCenterApi.getUserAccountInfo().then((response) => {
        this.setState({
          mobile: response.default_mobile || '',
          phone: response.default_mobile || '',
          reason,
        })
      })
    }  
}
  render() {
    const { successFlag ,mobile,phone,disabled,yzm,getYZMCode} = this.state
    const yzmstyle='get_Code'+(disabled? ' disableClick':'')
    return (
        <View className="top">
            <View className="wrapper">
                <View className="tip">申请注销前需进行账号验证确认</View>
                <View className="confirm">已认证手机: {mobile}</View>
                {!mobile && (
                    <View className="container-mobile">
                        <Input controlled={true} className="inputbg" value={phone} type="number" onInput={this.inputVal} data-type="phone" placeholder="请输入手机号码" maxlength="11" />
                    </View>
                )}
                <View className="container-name">
                    <Input controlled={true} className="confirm-code inputbg" value={yzm} type="number" onInput={this.inputVal} data-type="yzm" placeholder="请输入验证码" maxlength="6" />
                    <View className={yzmstyle} onClick={this.getCode} >{getYZMCode}</View>
                </View>


                <View className="row">
                    若原手机已停用，请联系商城客服修改
                </View>

                <Button className="address-commit" onClick={this.commit}>提交</Button>
            </View>
            {successFlag && (
            <View className="shadow">
                <View className="tipWrapper">
                <Image src={require('../../../../images/tip_success.png')} className="tippic"></Image>
                    <View className="tipText">您的账户注销成功</View>
                    <View className="tipBtn" onClick={this.hideShadow}>确定</View>
                </View>
            </View>
            )}
    </View>
    )
  }
  //输入框的值
  inputVal (e) {
    let _val = e.currentTarget.dataset.type;
    this.setState({
      [_val]: e.detail.value.replace(/\s+/g, ''),
    })
  }
  /**
   * 获取验证码
   */
  getCode (e) {
    if(this.state.disabled){
        return;
    }
    if (this.state.phone == "") {
      Taro.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 800
      })
      return;
    } else if (!is_phone_number(this.state.phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 800
      })
      return;
    }
    this.setState({
      disabled: true,
    })
    loginRegisterApi.sendSMS(this.state.phone, 1).then(res => {
      this._countdownTimes()
    }, (err => {
      Taro.showToast({
        title: err.msg,
        icon: 'none',
        duration: 500
      })
      this.setState({
        disabled: false,
      })
    }))
  }
  /*
     60秒倒计时
      *
      * */
  _countdownTimes() {
    var that = this;
    var times = 60
    var i = setInterval(function () {
      times--
      if (times <= 0) {
        that.setState({
          disabled: false,
          getYZMCode: "获取验证码",
        })
        clearInterval(i)
      } else {
        that.setState({
          getYZMCode: "重新获取" + times + "s",
          disabled: true
        })
      }
    }, 1000)
  }

  /**
   * 提交更改手机号
   */
  commit () {
    if (this.state.yzm == '') {
      Taro.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    userCenterApi.accountCancel({
      smsCode: this.state.yzm,
      cancel_reason: this.state.reason,
      mobile: this.state.phone
    }).then(res => {
      if (res) {
        this.setState({
          successFlag: true,
        })
        setTimeout(()=>{
          if(flag){
            Taro.setStorageSync('cookieKey','')
            Taro.reLaunch({
                url: '/page/tabBar/YFWHomePage/YFWHome'
              })
          }
        },5000)
      }
    }, error => {
      Taro.showToast({
        title: error.msg,
        icon: 'none',
        duration: 1500
      })
    })

  }
  hideShadow(){
    flag = false;
    let that = this;
    this.setState({
      successFlag:false,
    })
    Taro.setStorage({
      key: 'cookieKey',
      data: '',
    })
    Taro.reLaunch({
        url: '/page/tabBar/YFWHomePage/YFWHome'
      })
  }
}
