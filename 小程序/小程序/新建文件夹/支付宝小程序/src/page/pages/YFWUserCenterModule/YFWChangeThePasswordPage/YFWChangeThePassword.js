import { Block, View, Input, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import withWeapp from '@tarojs/with-weapp'
import { UserCenterApi,LoginRegisterApi } from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import './YFWChangeThePassword.scss'
const loginRegisterApi = new LoginRegisterApi()

class YFWChangeThePassword extends Taro.Component {
  config = {
    navigationBarTitleText: '修改密码',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white'
  }
  constructor(props) {
    super(props)
    this.state = {
      oldPassword: '',
      newPassword: '',
      abend: true,
      abend_new: true
    }
  }
  bindChange_oldPassword(e) {
    this.setState({ oldPassword: e.detail.value })
  }

  bindChange_newPassword(e) {
    this.setState({ newPassword: e.detail.value })
  }

  /**
   * 修改密码
   */
  save() {
    var that = this
    var oldPassword = this.state.oldPassword
    var newPassword = this.state.newPassword

    if (oldPassword == '' || newPassword == '') {
      Taro.showToast({
        title: '密码强度不符合规则(至少6位英文字符和数字组合)',
        duration: 1000
      })
    }
    loginRegisterApi.updatePassword(oldPassword, newPassword).then(
      res => {
        if (res) {
          Taro.showToast({
            title: '修改成功',
            duration: 10000
          })
          setTimeout(() => {
            Taro.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      },
      err => {
        Taro.showToast({
          title: err.msg || '修改失败',
          duration: 1000,
          icon: 'none'
        })
      }
    )
  }

  clickOn(){
    this.setState({
      abend: !this.state.abend
    })
  }

  clickOn_new(){
    this.setState({
      abend_new: !this.state.abend_new
    })
  }
  render(){
    const { abend, oldPassword, abend_new, newPassword } = this.state
    const pwd_off = require('../../../../images/pwd_off.png');
    const pwd_on= require('../../../../images/pwd_on.png');
    return (
      <View className="container">
        <View className="container-password">
          <View className="oldView">
            <Input
              onInput={this.bindChange_oldPassword}
              placeholderClass="placeholder"
              className="oldPassword"
              type={abend ? 'password' : 'text'}
              placeholder="请输入当前密码"
              value={oldPassword}
              password={abend ? true : false}
            ></Input>
            <View className="imageView" onClick={this.clickOn}>
              <Image
                className={'off_pwd ' + (abend ? '' : 'on_pwd')}
                src={abend ? pwd_off : pwd_on}
              ></Image>
            </View>
          </View>
          <View className="container">
            <View className="divLine"></View>
          </View>
          <View className="oldView">
            <Input
              onInput={this.bindChange_newPassword}
              className="newPassword"
              placeholderClass="placeholder"
              type={abend_new ? 'password' : 'text'}
              placeholder="请输入新密码"
              value={newPassword}
              password={abend ? true : false}
            ></Input>
            <View className="imageView" onClick={this.clickOn_new}>
              <Image
                className={'off_pwd  ' + (abend_new ? '' : 'on_pwd')}
                src={abend_new ? pwd_off : pwd_on}
              ></Image>
            </View>
          </View>
          <View className="clear"></View>
          <View className="container">
            <View className="divLine"></View>
          </View>
        </View>
        <View className="commit">
          <Button className="address-save" onClick={this.save}>
            保存
          </Button>
        </View>
      </View>
    )
  }
}

export default YFWChangeThePassword
