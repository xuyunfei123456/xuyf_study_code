import { Component } from "react";
import { View, Image, Text, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./Home.less";
import { connect } from "react-redux";
import { changeState} from "../../../store/actions/index";
import { HTTP } from "../../../utils/http";
import { pushNavigation } from "../../../apis/YFWRouting";
import {isLogin, transDistance} from '../../../utils/YFWPublicFunction'
const httpRequest = new HTTP();
class Home extends Component {
  constructor() {
    super();
    this.state = {
      shopId:'',
      distance:"",
      navHeight: "", //导航栏底部到窗口顶部的距离
      navTop: "", //胶囊按钮与顶部的距离
      windowHeight: "", //页面可用高度
      ratio: 0.5, //比例
      jnHeight: "", //导航栏的高度
      storeInfo:{},//店铺信息
    };
  }
  componentWillMount() {
    if(process.env.TARO_ENV == 'weapp'){
      this.getWxOpenId();
    }
    let {changeState} = this.props
    this.changeState = changeState
    let that = this;
    this.getSettingInfo();
    Taro.getSystemInfo({
      success: function(res) {
        Taro.setStorageSync('sysInfo',res)
        let menuButtonObject;
        //当wx.getMenuButtonBoundingClientRect失效时  设置默认参数
        try {
          menuButtonObject = wx.getMenuButtonBoundingClientRect();
        } catch (error) {
          if (res.statusBarHeight && res.statusBarHeight >= 44) {
            menuButtonObject = {
              bottom: 80,
              height: 32,
              left: 281,
              right: 368,
              top: 48,
              width: 87
            };
          } else {
            menuButtonObject = {
              bottom: 56,
              height: 32,
              left: 320,
              right: 407,
              top: 24,
              width: 87
            };
          }
        }
        let statusBarHeight = res.statusBarHeight,
          windowHeight,
          navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
          navHeight =
            statusBarHeight +
            menuButtonObject.height +
            (menuButtonObject.top - statusBarHeight) * 2, //导航高度
          ratio = res.windowWidth / 375;
        navHeight = navHeight * ratio;
        navTop = navTop * ratio;
        windowHeight = res.windowHeight * ratio;
        that.state.navHeight = navHeight;
        that.state.navTop = navTop;
        that.state.windowHeight = windowHeight;
        that.setState({
          navHeight,
          navTop,
          windowHeight,
          ratio,
          jnHeight: menuButtonObject.height
        });
      }
    });
   
  }
  getWxOpenId(){
    wx.login({
      success:res=>{
        if(res.code){
          httpRequest.get('guest.getOpenid',{code:res.code,shopId:''}).then(res=>{
            Taro.setStorageSync('userinfo',res)
            if(JSON.stringify(res)!=='{}' && res.mobile){
              if(res.shopId){
                this.setState({
                  shopId:res.shopId,
                  mobile:res.mobile,
                })
                this.getStoreInfo(res.shopId); //获取店铺详情
                this.getLogin(res.mobile,res.shopId)
              }
            }else{
              Taro.setStorageSync('userType','newUser')
              Taro.setStorageSync('phoneLogin',2);
            }
          },error=>{
            console.log(error)
            Taro.setStorageSync('userType','newUser')
          })
        }
      }
    })
  }
  getLogin(mobile,shopId){
    httpRequest.get('guest.login',{mobile,shopId,}).then(res=>{
      if(JSON.stringify(res)!=='{}'){
        Taro.setStorageSync('userinfo',res);
        Taro.setStorageSync('phoneLogin',1);
      }
    },error=>{

    })
  }
  getStoreInfo(shopId){
    console.log('shopId',shopId)
    httpRequest.get('guest.getStoreInfo',{shopId,}).then(res=>{
      Taro.setStorage({
        key:"storeInfo",
        data:res
      })
      if(res){
        this.setState({
          storeInfo:res
        })
      }
    },err=>{
      console.log(err)
    })
  }
  getDistance(lat,lng){
    if(!this.state.shopId)return;
    httpRequest.get('guest.getDistance',{lat,lng,shopId:this.state.shopId,}).then(res=>{
      console.log('distance',res)
      if(res){
        let distance = transDistance(res);
        this.setState({
          distance,
        })
        Taro.setStorage({
          key:"storeDistance",
          data:distance
        })
      }
    },error=>{
      console.log(error)
    })
  }
  addConsultation(){
    if(!this.state.shopId)return;
    if(!isLogin()){
      pushNavigation('login');
      return false;
    }
    pushNavigation('addConsultation')
  }
  componentDidMount() {
  }

  componentWillUnmount() {}

  componentDidShow() {
    let shopInfo = Taro.getStorageSync('forHomeShopInfo');
    if(shopInfo&&JSON.stringify(shopInfo)!='{}'){
      this.setState({
        shopId:shopInfo.shopId,
        distance:shopInfo.distance
      })
      Taro.setStorageSync('storeDistance',shopInfo.distance)
      this.getStoreInfo(shopInfo.shopId); //获取店铺详情
      let userinfo = Taro.getStorageSync('userinfo');
      if(userinfo.mobile && shopInfo.shopId){
        this.getLogin(userinfo.mobile,shopInfo.shopId);
      }
      Taro.setStorage({
        key:"forHomeShopInfo",
        data:{} 
      })
    }

  }

  componentDidHide() {}
  //查看地址信息是否授权
  getSettingInfo () {
    var that = this
    Taro.getSetting({
      withSubscriptions: true,
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          Taro.showModal({
            title: '地理位置授权',
            content: '为了给您提供更好的服务，需要开启您的位置信息',
            success: function (res) {
              if (res.cancel) {

              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      that.getLocation()
                    }
                  }
                })
              }
            }
          })
        } else {
          //调用wx.getLocation的API
          that.getLocation()
        }
      }
    })
  }
  getLocation() {
    let that = this;
    Taro.getLocation({
      type: "wgs84",
      success: function (res) {
        let latitude = res.latitude,longitude = res.longitude;
        that.changeState({'latitude':latitude,'longitude':longitude})
        setTimeout(()=>{
          that.getDistance(latitude,longitude);
        },1000)
        
      },
      fail: (res) => {
        console.log(res);
      },
    }).catch((err) => {
      console.log(err);
    });
  }
  changeStore(){
    pushNavigation('visitedStore')
  }
  chooseMeicines(type){
    if(!this.state.shopId)return;
    pushNavigation('buyMedicine',{shopId:this.state.shopId});
  }
  storeDetail(shopId,distance){
    pushNavigation('storeDetail',{shopId,distance,})
  }
  chooseStore(){
    pushNavigation('changeStore')
  }
  testFn(){
    pushNavigation('shopSendDetail',{OrderNo:'XS210506151714485'})
  }
  render() {
    const { navTop, navHeight, jnHeight,shopId} = this.state;
    let _storeTop = navTop+jnHeight+23,that = this;
    return (
      <View className="wrapper">
        <View style={`position:absolute;z-index:99999;color:red;font-szie:18px;top:200px;`}
        onClick={this.testFn.bind(this)}
        >测试专用文字。。。。。。</View>
        <Image
          src={require("../../../images/home_top.png")}
          className="home_top_bg"
        />
        <View className="navigation" style={`height:${navHeight}px`}>
          <View
            className="naviTitle"
            style={`padding-top:${navTop}px;height:${jnHeight}px`}
          >
            视塔
          </View>
        </View>
        <View className="content_wrapper" style={`top:${_storeTop}px`}>
        {renderStore(that)}
        <View className="menu buyMeicine">
          <Image
            src={require("../../../images/buyMeicine.png")}
            className="menuImg"
          />
          <View className="menuInfo">
            <View className="menuInfo_name">自助购药</View>
            <View className="menuInfo_title">您的专属购药平台</View>
          </View>
          <View className={`menu_operation ${shopId?'':'noShopId_btn'}`} onclick={this.chooseMeicines.bind(this,1)}>去选药</View>
        </View>
        <View className="menu onlineHospital">
          <Image
            src={require("../../../images/onlineHospital.png")}
            className="menuImg"
          />
          <View className="menuInfo">
            <View className="menuInfo_name">在线问诊</View>
            <View className="menuInfo_title">急速 精准 您的健康守护者</View>
          </View>
          <View className={`menu_operation ${shopId?'':'noShopId_btn'}`} onClick={this.addConsultation.bind(this)}>去问诊</View>
        </View>
        </View>

      </View>
    );
  }
}
const renderStore = that=>{
  const {shopId,storeInfo,distance } = that.state;
  if(shopId){
    return (
      <View className="drugStore">
      <View className="drugStore_left">
        <Image className="storePic" src={storeInfo.logo_image_url} mode='widthFix'></Image>
        <View className="changeStore">
          <View className="changeStore_text" onClick={that.changeStore.bind(that)}>切换</View>
          <View className="change_symbol"></View>
        </View>
      </View>
      <View className="drugStore_right">
        <View className="name">{storeInfo.title}</View>
        <View className="distance">距您{distance}</View>
        <View className="openTime">
          <Image
            className="timelogo"
            src={require("../../../images/timelogo.png")}
          ></Image>
          <View className="timetitle">营业时间:</View>
          <View className="time">{storeInfo.business_hours}</View>
        </View>
        <View className="storeAddress">
          <Image
            className="addresslogo"
            src={require("../../../images/addresslogo.png")}
          ></Image>
          <View className="addresstitle">门店地址:</View>
          <View className="address">
            {storeInfo.address}
          </View>
        </View>
        <View className="storeDetail" onClick={that.storeDetail.bind(that,shopId,distance)}>
          <Text>门店详情</Text>
          <Image src={require('../../../images/right_green.png')} className="right_green"></Image>
        </View>
      </View>
    </View>
    )

  }
  return (
    <View className="noShopId">
      <Image className="noShopId_left" src={require('../../../images/default_store.png')}></Image>
      <View className="noShopId_right">
          <View className="noShopId_right_title">
          请先选择附近门店
          </View>
          <View className="noShopId_btn" onClick={that.chooseStore.bind(that)}>
            <Text>选择门店</Text>
            <Image className="white_right" src={require('../../../images/left_white.png')}></Image>
          </View>
      </View>
    </View>
  )
}
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    changeState(data) {
      dispatch(changeState(data));
    }
  })
)(Home);
