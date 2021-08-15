import { Component } from 'react'
import { View, Image,Text,Button } from '@tarojs/components'
import { HTTP } from "../../utils/http";
import Taro from "@tarojs/taro";
const httpRequest = new HTTP();
import './login.less'

export default class Index extends Component {
  constructor() {
    super();
    this.state = {
      code:'',
      timeInterval:null,
    };
  }
  componentWillMount () {
   }

  componentDidMount () {
    this.getCode()
  }

  componentWillUnmount () {
    console.log('clearInterval')
    clearInterval(this.state.timeInterval)
  }

  componentDidShow () {
    this.state.timeInterval = setInterval(()=>{
      this.getCode()
    },1000*240)


  }
  getCode(){
    wx.login({
      success:res=>{
        if(res.code){
          console.log(res.code)
          this.state.code = res.code
        }
      }
    })
  }
  componentDidHide () {
    clearInterval(this.state.timeInterval)
  }
  getPhoneNumber(e){
    Taro.showLoading({ title: '加载中...' ,mask:true})
    if (e.detail.encryptedData && e.detail.iv) {
      const { code } = this.state
      httpRequest.get('guest.getPhoneNumber',{code,iv:e.detail.iv,encryptedData:e.detail.encryptedData,intro_image:'',shopId:""}).then(res=>{
        Taro.setStorageSync('phoneLogin',1);
        Taro.setStorageSync('loginFlag',{orderFlag:1,consulationFlag:1});
        if(res.mobile && res.shopId){
          httpRequest.get('guest.login',{mobile:res.mobile,shopId:res.shopId}).then(res=>{
            if(JSON.stringify(res)!=='{}'){
              Taro.setStorageSync('userinfo',res);
              Taro.hideLoading()
              Taro.navigateBack()
            }
          },error=>{
      
          })
        }else{
          Taro.setStorageSync('userinfo',res);
          Taro.hideLoading()
          Taro.navigateBack()
        }
      },error=>{
        Taro.hideLoading()
        Taro.showToast({
          title: '登录异常，请稍后重试',
          duration: 2000,
          icon: 'none'
        })
      })
    } else {
      //拒绝授权
      Taro.hideLoading()
      Taro.showToast({
        title: '您已拒绝授权手机号登录',
        duration: 2000,
        icon: 'none'
      })
    }
  }
  render () {
    return (
      <View className='login_wrapper'>
        <View className="welcome">欢迎使用<Text className="name">视塔</Text></View>
        <View className="tip">请使用手机号登录视塔</View>
        <Image className="login_logo" src={require('../../images/login_logo.png')}></Image>
        <Button className="loginBtn" openType="getPhoneNumber" onGetPhoneNumber={this.getPhoneNumber.bind(this)}>微信登录</Button>
        
      </View>
    )
  }
}
