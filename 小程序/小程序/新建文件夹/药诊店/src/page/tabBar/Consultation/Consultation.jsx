import { Component } from "react";
import { View, Image, ScrollView, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./Consultation.less";
import { connect } from "react-redux";
import { changeState } from "../../../store/actions/index";
import { HTTP } from "../../../utils/http";
import { pushNavigation } from "../../../apis/YFWRouting";
import NoMore from "../../../components/noMore/noMore";
import { toDecimal } from "../../../utils/YFWPublicFunction";
import { Payment } from "../../../utils/payment";
import { config } from "../../../config.js";
import NavBar from "../../../components/navBar/navBar";
const payMent = new Payment();
const httpRequest = new HTTP();
class Consultation extends Component {
  constructor() {
    super();

    this.state = {
      firstSearch: false,
      scrollTop: 1,
      noMoreTip: "没有更多了",
      selectedFilter: "",
      hasLogin: "unknown", //登录状态
      shopId: "",
      showShadow: false,
      sendTypeAni: false,
      typeArr: [],
      selectedTypeName: "全部状态",
      selectedTypeValue: "",
      sickList: [],
      selectedSickName: "全部患者",
      selectedSickValue: "",
      showDot: false,
      selectedData: [],
      pageSize: 10,
      pageIndex: 1,
      pageEnd: false
    };
  }
  componentWillMount() {
    let navBarInfo = Taro.getStorageSync("navBarInfo");
    this.setState({
      ...navBarInfo
    });
    this.init();
  }
  init() {
    let userinfo = Taro.getStorageSync("userinfo");
    this.state.userinfo = userinfo;
    this.setState({
      userinfo,
      hasLogin: userinfo.mobile ? true : false,
      shopId: userinfo.shopId
    });
  }
  componentDidMount() {
    this.state.firstSearch = true;
    Taro.showLoading({ title: "加载中...", mask: true });
    this.getData();
    this.getSearch();
  }

  componentWillUnmount() {}

  componentDidShow() {
    let loginFlag = Taro.getStorageSync("loginFlag");
    if (loginFlag && loginFlag.consulationFlag == 1) {
      loginFlag.consulationFlag = 2;
      this.init();
      this.refreshData();
      Taro.setStorage({
        key: "loginFlag",
        data: loginFlag
      });
    } else {
      const { firstSearch } = this.state;
      let refresh = Taro.getStorageSync("refreshConsulationPage");
      if (refresh && firstSearch == 1) {
        this.refreshData();
        this.setState({
          scrollTop: 2
        });
        Taro.setStorage({
          key: "refreshConsulationPage",
          data: 0
        });
      }
    }
  }
  getData() {
    let {
      pageSize,
      pageIndex,
      userinfo,
      selectedTypeValue,
      selectedSickValue,
      dataList
    } = this.state;
    pageIndex == 1 && Taro.showLoading({ title: "加载中...", mask: true });
    httpRequest
      .get("sell_inquiry.getInquiryList", {
        conditions: {
          thirdAccountId: userinfo.thirdAccountId,
          shopId: userinfo.shopId,
          inquirySearchStatus: selectedTypeValue,
          name: selectedSickValue
        },
        pageSize,
        pageIndex
      })
      .then(
        res => {
          if (res.dataList && res.dataList.length != 0) {
            dataList = pageIndex == 1 ? [] : dataList;
            dataList = dataList.concat(res.dataList);
            this.setState({
              dataList: dataList,
              pageEnd: dataList.length == res.rowCount ? true : false,
              pageIndex: ++pageIndex,
              refreshType: false,
              noMoreTip:
                dataList.length == res.rowCount ? "没有更多了" : "正在加载..."
            });
          } else {
            this.setState({
              dataList: [],
              pageEnd: true,
              pageIndex: 1,
              refreshType: false,
              noMoreTip: "没有更多了"
            });
          }
          Taro.hideLoading();
        },
        error => {
          Taro.hideLoading();
        }
      );
  }
  getSearch() {
    httpRequest.get("guest.getInquirySearchMap").then(res => {
      if (res) {
        let sickList = res.InquirySearchDrugList || [],
          typeArr = res.InquirySearchStatusList || [];
        sickList.unshift({
          key: "全部患者",
          value: "",
          choosed: true
        });
        typeArr.unshift({
          key: "全部状态",
          value: "",
          choosed: true
        });
        this.setState({
          sickList,
          typeArr
        });
      }
    });
  }
  componentDidHide() {}
  chooseType(_type) {
    const { selectedFilter, sendTypeAni, typeArr, sickList } = this.state;
    if (sendTypeAni) {
      if (selectedFilter == _type) {
        this.setState({
          sendTypeAni: false,
          showShadow: false,
          selectedFilter: _type
        });
      } else {
        this.setState({
          selectedData: _type == "sendType" ? typeArr : sickList,
          selectedFilter: _type
        });
      }
    } else {
      this.setState({
        sendTypeAni: true,
        showShadow: true,
        selectedFilter: _type,
        selectedData: _type == "sendType" ? typeArr : sickList
      });
    }
  }
  sendTypeClick(value) {
    let {
      selectedFilter,
      selectedTypeName,
      typeArr,
      selectedSickName,
      sickList,
      selectedSickValue,
      selectedTypeValue
    } = this.state;
    if (selectedFilter == "sendType") {
      if (value == selectedTypeValue) {
        this.setState({
          sendTypeAni: false,
          showShadow: false
        });
        return;
      }
      let _data = typeArr.map(item => {
        if (value == item.value) {
          item.choosed = true;
          selectedTypeValue = item.value;
          selectedTypeName = item.key;
        } else {
          item.choosed = false;
        }
        return item;
      });
      this.setState(
        {
          typeArr: _data,
          selectedTypeName,
          selectedTypeValue,
          sendTypeAni: false,
          showShadow: false
        },
        () => {
          this.refreshData();
        }
      );
    } else {
      if (value == selectedSickValue) {
        this.setState({
          sendTypeAni: false,
          showShadow: false
        });
        return;
      }
      let _data = sickList.map(item => {
        if (value == item.value) {
          item.choosed = true;
          selectedSickValue = item.value;
          selectedSickName = item.key;
        } else {
          item.choosed = false;
        }
        return item;
      });
      this.setState(
        {
          sickList: _data,
          selectedSickValue,
          selectedSickName,
          sendTypeAni: false,
          showShadow: false
        },
        () => {
          this.refreshData();
        }
      );
    }
  }
  shadowOneClick() {
    this.setState({
      showShadow: false,
      sendTypeAni: false
    });
  }
  dotClick(index, e) {
    e && e.stopPropagation(); // 阻止事件冒泡
    let data = this.state.dataList;
    data[index].showDot = !data[index].showDot;
    this.setState({
      dataList: data
    });
  }
  clickDotContent({ InquiryNo }) {
    Taro.showLoading({ title: "加载中...", mask: true });
    httpRequest.get("sell_inquiry.delete", { inquiryNo: InquiryNo }).then(
      res => {
        Taro.hideLoading();
        Taro.showToast({
          title: "删除成功",
          icon: "success",
          duration: 2000
        });
        setTimeout(() => {
          this.refreshData();
        }, 1000);
      },
      error => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg || "删除失败",
          icon: "none",
          duration: 2000
        });
      }
    );
    this.setState({
      showDot: false
    });
  }
  premession(hasLogin) {
    pushNavigation(hasLogin ? "changeStore" : "login");
  }
  cardClick({ InquiryNo }) {
    pushNavigation("consultationDetail", { inquiryNo: InquiryNo });
  }
  ScrollToLower() {
    if (this.state.pageEnd) return;
    this.getData();
  }
  topRefresh() {
    this.setState({
      refreshType: true
    });
    this.refreshData();
  }
  btnClick({ value }, { InquiryNo, InquiryId }, e) {
    e && e.stopPropagation(); // 阻止事件冒泡
    Taro.showLoading({ title: "加载中...", mask: true });
    if (value == "cancelOrder") {
      httpRequest.get("sell_inquiry.cancel", { inquiryNo: InquiryNo }).then(
        res => {
          Taro.hideLoading();
          Taro.showToast({
            title: "已取消问诊单",
            icon: "success",
            duration: 2000
          });
          setTimeout(() => {
            this.refreshData();
          }, 1000);
        },
        error => {
          Taro.showToast({
            title: error.msg || "取消问诊单失败",
            icon: "none",
            duration: 2000
          });
        }
      );
    } else if (value == "inquiryToo") {
      pushNavigation("addConsultation", { InquiryNo });
    } else if (value == "payOrder") {
      this.pay(InquiryNo);
    } else if (value == "applyReturn") {
      this.applyReturn(InquiryNo);
    } else if (value == "gotoInquiry") {
      this.gotoInquiry(InquiryNo, InquiryId);
    } else if (value == "inquiryPre") {
      pushNavigation("recipedetails", { inquiryNo: InquiryNo });
    }
  }
  gotoInquiry(inquiryNo, InquiryId) {
    if (InquiryId) {
      let that = this;
      wx.navigateToMiniProgram({
        appId: "wxb6f8454c1c26e2e4",
        path:
          "page/pages/YZMessageModule/YZMessageChatPage/YZMessageChatPage?caseNo=" +
          InquiryId,
        extraData: {},
        envVersion: config.env_version,
        complete(res) {
          that.refreshData();
        }
      });
      return;
    }
    httpRequest.get("sell_inquiry.inquiryForCaseNo", { inquiryNo }).then(
      res => {
        wx.navigateToMiniProgram({
          appId: "wxb6f8454c1c26e2e4",
          path:
            "page/pages/YZMessageModule/YZMessageChatPage/YZMessageChatPage?caseNo=" +
            res,
          extraData: {},
          envVersion: config.env_version,
          complete(res) {
            this.getData(inquiryNo);
          }
        });
      },
      error => {
        Taro.showToast({
          title: error.msg || "问诊异常",
          icon: "none",
          duration: 2000
        });
      }
    );
  }
  applyReturn(InquiryNo) {
    httpRequest.get("sell_inquiry.applyReturn", { inquiryNo: InquiryNo }).then(
      res => {
        Taro.showToast({
          title: "取消成功",
          icon: "success",
          duration: 2000
        });
        setTimeout(() => {
          this.refreshData();
        }, 500);
      },
      error => {
        Taro.showToast({
          title: "取消失败",
          icon: "none",
          duration: 2000
        });
      }
    );
  }
  pay(inquiryNo) {
    payMent.pay({ inquiryno: inquiryNo }).then(
      res => {
        httpRequest
          .get("common_payment.updatePayStatus", {
            type: "wxpay",
            inquiryno: inquiryNo
          })
          .then(
            res => {
              Taro.setStorageSync("refreshConsulationPage", 1);
              pushNavigation("consultationDetail", { inquiryNo });
            },
            error => {
              Taro.setStorageSync("refreshConsulationPage", 1);
              pushNavigation("consultationDetail", { inquiryNo });
            }
          );
      },
      error => {
        if (error.errMsg && error.errMsg == "requestPayment:fail cancel") {
          Taro.showToast({
            title: "您已取消支付",
            icon: "none",
            duration: 2000
          });
        }
      }
    );
  }
  render() {
    const {
      selectedTypeName,
      showShadow,
      sendTypeAni,
      selectedData,
      hasLogin,
      selectedSickName,
      selectedFilter,
      navHeight
    } = this.state;
    let that = this;
    return (
      <View className="consultation">
        <NavBar
          data={{
            title: "问诊单",
            textColor: "#000",
            bgColor: "#fff",
            back:false
          }}
        />
        {showShadow && (
          <View
            className="shadow showShadow"
            onClick={this.shadowOneClick.bind(this)}
          ></View>
        )}
        <View className={`filter ${sendTypeAni ? "sendTypeAni" : ""}`} style={`top:${navHeight}px`}>
          <View className="filter_top">
            <View
              className="filter_left choosed"
              onClick={this.chooseType.bind(this, "sendType")}
            >
              {selectedTypeName}
              <Image
                className={`trangle_down ${
                  sendTypeAni && selectedFilter == "sendType" ? "rotate" : ""
                }`}
                src={require("../../../images/trangle_down.png")}
              ></Image>
            </View>

            <View
              className="filter_right choosed"
              onClick={this.chooseType.bind(this, "sick")}
            >
              {selectedSickName}
              <Image
                className={`trangle_down ${
                  sendTypeAni && selectedFilter == "sick" ? "rotate" : ""
                }`}
                src={require("../../../images/trangle_down.png")}
              ></Image>
            </View>
          </View>

          {sendTypeAni && (
            <ScrollView className={`filter_list`} scrollY>
              {selectedData.map(n => {
                return (
                  <View className="filter_list_item" key={n.value}>
                    {n.choosed && (
                      <Image
                        src={require("../../../images/correct.png")}
                        className="correct"
                      ></Image>
                    )}
                    <View
                      className={`filter_list_item_text ${
                        n.choosed ? "choosed" : ""
                      }`}
                      onClick={this.sendTypeClick.bind(this, n.value)}
                    >
                      {n.key}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
        {hasLogin != "unknown" && renderList(that, hasLogin)}
      </View>
    );
  }
  refreshData() {
    this.state.pageEnd = false;
    this.state.pageIndex = 1;
    this.getData();
  }
}

const renderList = (that, hasLogin) => {
  const { shopId, noMoreTip, dataList, scrollTop, refreshType ,navHeight} = that.state;
  if (hasLogin && shopId) {
    return (
      <ScrollView
        className="scroll"
        lowerThreshold={100}
        onScrollToLower={that.ScrollToLower.bind(that)}
        scrollY
        refresherEnabled={true}
        enableBackToTop={true}
        refresherTriggered={refreshType}
        onRefresherRefresh={that.topRefresh.bind(that)}
        scrollTop={scrollTop}
        style={`top:${navHeight}px`}
      >
        {dataList &&
          dataList.map((item, index) => {
            let TotalPrice = toDecimal(item.TotalPrice);
            TotalPrice = TotalPrice.split(".");
            return (
              <View className="list" onClick={that.cardClick.bind(that, item)}>
                <View className="list_header">
                  <View className="list_header_left">
                    <Image className="list_ava" src={item.DoctorImage}></Image>
                    <Text className="doctor_name">{item.DoctorName}</Text>
                    <Text className="doctor_level">{item.DoctorPosition}</Text>
                    <Text className="doctor_subject">{item.Department}</Text>
                    <View className="symbol_img">{item.InquiryType}</View>
                  </View>
                  <View className="list_header_right">
                    {item.InquiryStatusName}
                  </View>
                </View>
                <View className="sick_person flexrow">
                  <View className="sick_person_left">患者</View>
                  <View className="symbol_mh">:</View>
                  <View className="sick_person_right">
                    {item.Name + " " + item.SexName + " " + item.Age}
                  </View>
                </View>
                <View className="sick_money flexrow">
                  <View className="sick_person_left">问诊金额</View>
                  <View className="symbol_mh">:</View>
                  <View className="sick_person_right flexrow price_modal">
                    <View className="price_symbol">￥</View>
                    <View className="price_int">{TotalPrice[0]}</View>
                    <View className="price_float">{`.${TotalPrice[1]}`}</View>
                  </View>
                </View>
                <View className="operation">
                  <View
                    className="left"
                    onClick={that.dotClick.bind(that, index)}
                  >
                    <Image
                      className="dot"
                      src={require("../../../images/dot.png")}
                    ></Image>
                    <View
                      className="hideBtns_wrapper"
                      style={`display:${item.showDot ? "flex" : "none"}`}
                    >
                      <View className="hide_btns">
                        {["删除"].map(w => {
                          return (
                            <View
                              className="hide_btns_item"
                              onClick={that.clickDotContent.bind(that, item)}
                            >
                              {w}
                            </View>
                          );
                        })}
                      </View>
                      <View className="arrow"></View>
                    </View>
                  </View>
                  <View className="right">
                    {item.Buttons &&
                      item.Buttons.map(k => {
                        return (
                          <View
                            className={`button ${k.color ? "greenbtn" : ""}`}
                            onClick={that.btnClick.bind(that, k, item)}
                          >
                            {k.text}
                          </View>
                        );
                      })}
                  </View>
                </View>
              </View>
            );
          })}
        <View className="bottom_tip">
          <NoMore tip={noMoreTip} />
        </View>
      </ScrollView>
    );
  }
  return (
    <View className="noList">
      <Image
        className="nolist_bg"
        src={require("../../../images/noData.png")}
      ></Image>
      <Text className="nodata_tips">
        {hasLogin ? "选择门店后才能查看问诊单哦" : "登录后才能查看问诊单哦"}
      </Text>
      <View
        className="nolistBtn"
        onClick={that.premession.bind(that, hasLogin)}
      >
        {hasLogin ? "选择门店" : "去登录"}
      </View>
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
)(Consultation);
