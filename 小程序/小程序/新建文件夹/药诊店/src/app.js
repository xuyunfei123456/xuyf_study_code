import React, { Component } from "react";
import { Provider } from "react-redux";
import Taro from "@tarojs/taro";
import store from "./store/index";
import { HTTP } from "./utils/http";
const httpRequest = new HTTP();
import "./app.less";
import "taro-ui/dist/style/index.scss";
class App extends Component {
  onLaunch() {
    console.log("launch");
    this.layoutInit();
  }
  layoutInit() {
    let res = Taro.getSystemInfoSync();
    let menuButtonObject;
    //当wx.getMenuButtonBoundingClientRect失效时  设置默认参数
    try {
      menuButtonObject = Taro.getMenuButtonBoundingClientRect();
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
      navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
      
      navHeight =
        statusBarHeight +
        menuButtonObject.height +
        (menuButtonObject.top - statusBarHeight) * 2; //导航高度
    Taro.setStorageSync("navBarInfo", {
      navHeight,
      navTop,
      jnHeight: menuButtonObject.height
    });
  }
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  componentDidCatchError() {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}
export default App;
