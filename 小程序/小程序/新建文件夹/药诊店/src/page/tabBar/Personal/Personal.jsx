import { Component } from "react";
import { View, Image, Text, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./Personal.less";
import { connect } from "react-redux";
import { changeState } from "../../../store/actions/index";
import { HTTP } from "../../../utils/http";
import { pushNavigation } from "../../../apis/YFWRouting";
import YfwModal from "../../../components/YfwModal/YfwModal";
const httpRequest = new HTTP();

class Personal extends Component {
  constructor() {
    super();
    this.state = {
      hasLogin:"",
      navHeight: "", //导航栏底部到窗口顶部的距离
      navTop: "", //胶囊按钮与顶部的距离
      windowHeight: "", //页面可用高度
      ratio: 0.5, //比例
      jnHeight: "", //导航栏的高度
      mobile: "",
      sec_mobile:"",
      menu: [
        {
          name: "我的患者管理",
          icon: require("../../../images/menu_my.png"),
          key:'patient'
        },
        // {
        //   name: "我的收获地址",
        //   icon: require("../../../images/menu_address.png"),
        //   key:'address'
        // }
      ] //菜单
    };
  }
  componentWillMount() {
    let that = this;
    Taro.getSystemInfo({
      success: function(res) {
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
          jnHeight: menuButtonObject.height,
        });
      }
    });
  }
  logOut(){
    Taro.showLoading({ title: '加载中...' ,mask:true})
    Taro.removeStorageSync('cookieKey');
    Taro.setStorageSync('phoneLogin',2);
    let userinfo = Taro.getStorageSync('userinfo');
    userinfo.mobile="";
    Taro.setStorageSync('userinfo',userinfo);
    Taro.setStorageSync('loginFlag',{orderFlag:1,consulationFlag:1});
    this.setState({
      hasLogin:2,
      mobile:"",
      sec_mobile:"",
    })
    Taro.hideLoading();
    Taro.showToast({
      title: "已退出当前帐号",
      icon: "none"
    });
  }
  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    let hasLogin = Taro.getStorageSync("phoneLogin");
    if(hasLogin !=this.state.hasLogin){
      this.setState({
        hasLogin,
      })
    }
    if(!this.state.mobile){
      let userinfo = Taro.getStorageSync("userinfo");
      if (userinfo && userinfo.mobile) {
        let sec_mobile = userinfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        this.setState({
          mobile: userinfo.mobile,
          sec_mobile,
        });
      }
    }
  }

  componentDidHide() {}
  navigateToLogin() {
    pushNavigation("login");
  }
  clickMenu(key){
    if(this.state.hasLogin!=1){
      this.setState({
        yfwModalParams:{
          infoBtn:'我知道了',
          title:"登录后才可以查看哦",
          isOpen:true,
          infoFn:this.infoFn.bind(this),
        }
      })
    }else{
      pushNavigation('sickList')
    }
  }
  infoFn(){
    this.setState({
      yfwModalParams:{
        infoBtn:'我知道了',
        title:"登录后才可以查看哦",
        isOpen:false,
        infoFn:this.infoFn.bind(this),
      }
    })
  }
  render() {
    const {
      navTop,
      navHeight,
      jnHeight,
      menu,
      hasLogin,
      sec_mobile,
      yfwModalParams,
    } = this.state;
    const that = this;
    return (
      <View className="wrapper">
        <YfwModal {...yfwModalParams} />
        <Image
          src={require("../../../images/personal.png")}
          className="home_top_bg"
        />
        <View className="navigation" style={`height:${navHeight}px`}>
          <View
            className="naviTitle"
            style={`padding-top:${navTop}px;height:${jnHeight}px`}
          >
            我的
          </View>
        </View>
        <View className="lognWrapper">
          <Image
            className="avatar"
            src={require("../../../images/default_ava.png")}
          ></Image>
          {hasLogin !=1 && (
            <View className="noLogin" onClick={this.navigateToLogin.bind(this)}>
              点击登录
            </View>
          )}
          {hasLogin ==1 && <View className="hasLogin">{sec_mobile}</View>}
        </View>
        <View className="menu">
          {menu.map(item => {
            return menuItem(that,item);
          })}
        </View>
        {hasLogin ==1 && <View className="logOut" onClick={this.logOut.bind(this)}>退出当前账号</View>}
      </View>
    );
  }
}

const menuItem = (that,props) => {
  return (
    <View className="menuItem" onClick={that.clickMenu.bind(that,props.key)} key={props.key}>
      <View className="menuItem_left">
        <Image src={props.icon} className="menuItem_pic"></Image>
        <View className="menuItem_title">{props.name}</View>
      </View>
      <Image
        className="menuItem_arrow"
        src={require("../../../images/right_graypng.png")}
      ></Image>
    </View>
  );
};
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    changeState(data) {
      dispatch(changeState(data));
    }
  })
)(Personal);
