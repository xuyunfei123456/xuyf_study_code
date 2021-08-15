import { Component } from "react";
import { View, Image } from "@tarojs/components";
import Taro,{getCurrentInstance} from "@tarojs/taro";
import "./invoiceShow.less";
import { HTTP } from "../../utils/http";
const httpRequest = new HTTP();

class invoiceShow extends Component {
  constructor() {
    super();
    this.state = {};
  }
  componentWillMount() {
      let instance = getCurrentInstance();
      let {url} = instance.router.params;
      url = decodeURIComponent(url);
      this.state.url = url;
  }
  copy(){
      const {url} = this.state
    Taro.setClipboardData({
        data:url ,
        success: function(res) {
          Taro.getClipboardData({
            success: function(res) {
              console.log(res.data); // data
            }
          });
        }
      });
  }
  componentDidMount() {}
  componentWillUnmount() {}
  componentDidShow() {}
  componentDidHide() {}
  componentDidCatchError() {}
  componentDidNotFound() {}
  render() {
    return (
      <View className="invoiceShow-wrap">
        <View className="invoice-pic">
          <Image
            src={this.state.url}
            className="pic"
          ></Image>
        </View>
        <View className="invoice-bottom">
          <View
            className="share-btn"
            onClick={this.copy.bind(this)}
          >
            复制链接
          </View>
          <View className="share-explain" >复制链接，电脑端打开链接下载</View>
        </View>
      </View>
    );
  }
}
export default invoiceShow;
