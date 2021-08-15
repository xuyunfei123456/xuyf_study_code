import { Component } from "react";
import { View, Image, ScrollView, Text } from "@tarojs/components";
import YzcTag from "../../components/YzcTag/YzcTag";
import { pushNavigation } from "../../apis/YFWRouting";
import { HTTP } from "../../utils/http";
import Taro from "@tarojs/taro";
const httpRequest = new HTTP();
import "./sickList.less";

export default class SickList extends Component {
  constructor() {
    super();
    this.state = {
      storeList: [],
      firstRequest: false
    };
  }
  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    httpRequest.get("third_account_drug.getList", {}).then(res => {
      if (res && res.length != 0) {
        res = res.map(item => {
          let _data = [];
          _data.push({
            color: "purple",
            title: item.RelationLabel
          });
          if (item.DictBoolDefault) {
            _data.push({
              color: "orange",
              title: "默认"
            });
          }
          if (item.DictBoolCertification) {
            _data.push({
              color: "green",
              title: "已认证"
            });
          }
          item.relationArr = _data;
          return item;
        });
        this.setState({
          storeList: res,
          firstRequest: true
        });
      } else {
        this.setState({
          storeList: [],
          firstRequest: true
        });
      }
    });
  }

  componentDidHide() {}
  addSick() {
    pushNavigation("sickPerson", { sickerSort: 1 });
  }
  editSick(data) {
    Taro.setStorageSync("sickInfo", data);
    pushNavigation("sickPerson", { sickerSort: 2 });
  }
  render() {
    const that = this;
    const { firstRequest } = this.state;
    return (
      <View className="sickList">
        <View className="sick_tip rowflex">
          <Image
            className="radio"
            src={require("../../images/radio.png")}
          ></Image>
          <View className="sick_tip_text">
            请真实填写/选择，不实信息将影响医生诊断和开药！
          </View>
        </View>
        {firstRequest && renderContent(that)}
        <View className="operation rowflex">
          <View className="addSick rowflex" onClick={this.addSick.bind(this)}>
            <View className="add_pic">+</View>
            <View className="add_sick_text">添加患者</View>
          </View>
        </View>
      </View>
    );
  }
}
const renderContent = that => {
  const { storeList } = that.state;
  if (storeList.length != 0) {
    return (
      <ScrollView className="scroll" scrollY>
        {storeList.map(item => {
          return (
            <View className="list_wrapper columnflex">
              <View className="edit" onClick={that.editSick.bind(that, item)}>
                编辑
              </View>
              <View className="sick_name">{item.RealName}</View>
              <View className="sick_info">
                <Text className="age">{item.Sex == 1 ? "男" : "女"}</Text>
                <Text className="sex">{item.Age}岁</Text>
                <Text className="phone">{item.Mobile}</Text>
              </View>
              <View className="rowflex">
                {item.relationArr.map(item => {
                  return (
                    <View className="tags">
                      <YzcTag bgcolor={item.color} title={item.title} />
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }
  return (
    <View className="noContetn columnflex">
      <Image
        className="noList"
        src={require("../../images/emptyOrder.png")}
      ></Image>
      <View className="noContent_text">暂无患者信息</View>
    </View>
  );
};
