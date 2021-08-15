import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Component } from "react";
import { View, Image } from "@tarojs/components";
import { connect } from "react-redux";
import { HTTP } from "../../utils/http";
const httpRequest = new HTTP();
import "./storeDetails.less";
import { pushNavigation } from "../../apis/YFWRouting";
class StoreDetails extends Component {
  constructor() {
    super();
    this.state = {
      storeInfo: {}, //店铺信息
      navHeight: "", //导航栏底部到窗口顶部的距离
      navTop: "", //胶囊按钮与顶部的距离
      windowHeight: "", //页面可用高度
      ratio: 0.5, //比例
      jnHeight: "" //胶囊的高度
    };
  }

  componentWillMount() {
    let instance = getCurrentInstance();
    const { shopId, distance } = instance.router.params;
    this.setState({
      distance
    });
    this.getShopDetail(shopId);
    let that = this;
    Taro.getSystemInfo({
      success: res => {
        let menuButtonObject;
        try {
          menuButtonObject = wx.getMenuButtonBoundingClientRect();
          console.log(menuButtonObject, "menuButtonObject");
        } catch (error) {
          if (res.statusBarHeight && res.statusBarHeight > 44) {
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
          navTop = menuButtonObject.top, //胶囊按钮到顶部的距离
          navHeight =
            statusBarHeight +
            menuButtonObject.height +
            (navTop - statusBarHeight) * 2, //导航栏的高度
          windowHeight = res.windowHeight * ratio,
          ratio = res.windowWidth / 375;
        navTop = navTop * ratio;
        navHeight = navHeight * ratio;
        that.state.navTop = navTop;
        that.state.navHeight = navHeight;
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
  getShopDetail(shopId) {
    httpRequest.get("guest.getStoreInfo", { shopId }).then(
      res => {
        if (res) {
          this.setState({
            storeInfo: res
          });
        }
      },
      err => {
        console.log(err);
      }
    );
  }
  back() {
    Taro.navigateBack();
  }
  showBig(type, current) {
    let urls = [];
    if (type == 1) {
      urls = this.state.storeInfo.StoreImageList.map(item => item.image_url);
    } else {
      urls = this.state.storeInfo.CertImageList.map(item => item.image_url);
    }
    Taro.previewImage({
      urls,
      current
    });
  }
  toMap() {
    pushNavigation("map");
  }
  phoneCall(phone) {
    if (!phone) return;
    Taro.makePhoneCall({
      phoneNumber: phone
    });
  }
  componentDidMount() {}
  componentWillUnmount() {}
  componentDidShow() {}
  componentDidHide() {}
  componentDidCatchError() {}
  componentDidNotFound() {}
  render() {
    const { navTop, navHeight, jnHeight, storeInfo, distance } = this.state;
    return (
      <View className="wrapper">
        <Image
          src={require("../../images/home_top.png")}
          className="top_bg"
        ></Image>
        <View className="navigation" style={`height:${navHeight}px`}>
          <View
            className="naviTitle"
            style={`padding-top:${navTop}px;height:${jnHeight}px`}
          >
            <View className="backWrapper" onClick={this.back.bind(this)}>
              <Image
                className="left_white"
                src={require("../../images/left_white.png")}
              ></Image>
            </View>
            门店详情
          </View>
        </View>
        <View className="storeCard">
          <View className="storeCard_left">
            <Image
              src={storeInfo.logo_image_url}
              className="store_logo"
            ></Image>
          </View>
          <View className="storeCard_right">
            <View className="storeCard_name">{storeInfo.title}</View>
            <View className="storeCard_distance">距您{distance}</View>
            <View className="storeCard_area" onClick={this.toMap.bind(this)}>
              <Image
                src={require("../../images/addresslogo.png")}
                className="address_logo"
              ></Image>
              <View className="area">{storeInfo.address}</View>
              <Image
                src={require("../../images/right_graypng.png")}
                className="right_gray"
              ></Image>
            </View>
          </View>
        </View>
        <View className="storeDel">
          <View className="store_del_ol">
            <View className="seller_del">
              <View className="seller_name">{storeInfo.title}</View>
              <View className="seller_area">{storeInfo.address}</View>
            </View>
            <View className="store_del_line"></View>
            <Image
              src={require("../../images/storePhone.png")}
              className="storePhone"
              onClick={this.phoneCall.bind(this, storeInfo.phone)}
            ></Image>
          </View>
          <View className="do_time">
            <View className="do_dt">营业时间</View>
            <View className="time">{storeInfo.business_hours}</View>
          </View>
          <View className="do_show">
            <View className="do_dt">店铺实景</View>
            <View className="do_pic">
              {storeInfo.StoreImageList &&
                storeInfo.StoreImageList.map(item => {
                  return (
                    <Image
                      className="picItem"
                      src={item.image_url}
                      onClick={this.showBig.bind(this, 1, item.image_url)}
                    ></Image>
                  );
                })}
            </View>
          </View>
          <View className="do_show">
            <View className="do_dt">经营资质</View>
            <View className="do_pic">
              {storeInfo.CertImageList &&
                storeInfo.CertImageList.map(item => {
                  return (
                    <Image
                      className="picItem"
                      src={item.image_url}
                      onClick={this.showBig.bind(this, 2, item.image_url)}
                    ></Image>
                  );
                })}
            </View>
          </View>
        </View>
      </View>
    );
  }
}
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({})
)(StoreDetails);
