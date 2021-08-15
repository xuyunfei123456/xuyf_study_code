import { Component } from "react";
import { View, Image, ScrollView, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import OrderListCard from "../../../components/OrderListCard/OrderListCard";
import "./Order.less";
import { connect } from "react-redux";
import { changeState } from "../../../store/actions/index";
import { HTTP } from "../../../utils/http";
import { pushNavigation } from "../../../apis/YFWRouting";
import NoMore from "../../../components/noMore/noMore";
import {
  transOrderCardData,
  toDecimal
} from "../../../utils/YFWPublicFunction";
import NavBar from "../../../components/navBar/navBar";
const httpRequest = new HTTP();
import { Payment } from "../../../utils/payment";
const payMent = new Payment();
class Order extends Component {
  constructor() {
    super();
    this.state = {
      selectedTypeName: "",
      scrollTop: 1,
      refreshType: false,
      noMoreTip: "正在加载...",
      dataList: [],
      pageEnd: false,
      hasLogin: "unknown", //登录状态
      shopId: "",
      choosedFilter: [],
      showShadow_one: false,
      showShadow_two: false,
      sendTypeAni: false,
      statesAni: false,
      pageIndex: 1,
      typeArr: [],
      selectedTypeValue: "",
      statusArr: [],
      fakeStatusArr: []
    };
  }
  componentWillMount() {
    let navBarInfo = Taro.getStorageSync("navBarInfo");
    this.setState({
      ...navBarInfo
    });
    this.init(); //初始化
  }
  init() {
    let userinfo = Taro.getStorageSync("userinfo");
    this.state.userinfo = userinfo;
    this.state.shopId = userinfo.shopId;
    this.setState({
      userinfo,
      hasLogin: userinfo.mobile ? true : false,
      shopId: userinfo.shopId
    });
  }
  componentDidMount() {
    if (!this.state.shopId) return;
    this.state.fakeStatusArr = JSON.parse(JSON.stringify(this.state.statusArr));
    this.getSearch(); //获取查询条件
    this.getlist();
  }
  getSearch() {
    httpRequest.get("guest.getOrderSearchMap").then(
      res => {
        if (res) {
          let _data = res.OrderTypeList || [],
            _name = "";
          _data = _data.map((item, index) => {
            if (index == 0) {
              item.choosed = true;
              this.state.selectedTypeValue = item.value;
              this.state.selectedTypeName = item.key;
              _name = item.key;
            } else {
              item.choosed = false;
            }
            return item;
          });
          this.setState({
            typeArr: _data,
            statusArr: res.OrderSearchStatus || [],
            selectedTypeName: _name
          });
        }
      },
      error => {
        console.log("guest.getOrderSearchMap", error);
      }
    );
  }
  getlist() {
    const { shopId, thirdAccountId } = this.state.userinfo;
    let {
      pageIndex,
      pageEnd,
      dataList,
      selectedTypeValue,
      choosedFilter
    } = this.state;
    //之前状态筛选为多选 现为单选 暂不更改取值方式
    choosedFilter = choosedFilter.map(item => item.value);
    let param = {
      conditions: {
        shopId,
        thirdAccountId,
        ordersearchStatus: choosedFilter.join(),
        orderShippingMethod: selectedTypeValue
      },
      pageSize: 10,
      pageIndex
    };
    console.log("param", param);
    pageIndex == 1 && Taro.showLoading({ title: "加载中...", mask: true });
    httpRequest.get("order.getOrderList", { ...param }).then(
      res => {
        if (res.dataList && res.dataList.length != 0) {
          res.dataList = res.dataList.map(item => {
            item.MedicineList = transOrderCardData(item.MedicineList);
            return item;
          });
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
  topRefresh() {
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.setState({
      refreshType: true
    });
    this.getlist();
  }
  componentWillUnmount() {}

  componentDidShow() {
    let loginFlag = Taro.getStorageSync("loginFlag");
    if (loginFlag && loginFlag.orderFlag == 1) {
      loginFlag.orderFlag = 2;
      this.init();
      this.refreshPage();
      Taro.setStorage({
        key: "loginFlag",
        data: loginFlag
      });
    } else {
      let refresh = Taro.getStorageSync("orderRefresh");
      if (refresh && refresh == 1) {
        this.refreshPage();
        Taro.setStorage({
          key: "orderRefresh",
          data: "2"
        });
      }
    }
  }
  ScrollToLower() {
    if (this.state.pageEnd) return;
    this.state.pageEnd = true; //防止重复触发 在获取数据后 更新状态
    this.getlist();
  }
  componentDidHide() {}
  chooseType(_type) {
    if (_type == "sendType") {
      this.setState({
        sendTypeAni: !this.state.sendTypeAni,
        showShadow_one: !this.state.showShadow_one,
        statesAni: false,
        showShadow_two: false
      });
    } else if (_type == "status") {
      this.setState({
        sendTypeAni: false,
        statesAni: !this.state.statesAni,
        showShadow_two: !this.state.showShadow_two,
        showShadow_one: false
      });
    }
  }
  sendTypeClick({ value, key }) {
    if (value == this.state.selectedTypeValue) return;
    this.state.selectedTypeValue = value;
    this.state.selectedTypeName = key;
    let _data = this.state.typeArr.map(item => {
      item.choosed = value == item.value ? true : false;
      return item;
    });
    this.setState({
      typeArr: _data,
      selectedTypeValue: value,
      selectedTypeName: key,
      sendTypeAni: false,
      showShadow_one: false
    });
    this.refreshPage();
  }
  statusClick(value) {
    let _data = this.state.statusArr.map(item => {
      item.choosed = value == item.value ? true : false;
      return item;
    });
    this.state.statusArr = _data;
    this.setState({
      statusArr: _data
    });
  }
  resetStatus() {
    let statusArr = this.state.statusArr.map(item => {
      item.choosed = false;
      return item;
    });
    this.setState({
      statusArr
    });
  }
  confirmStatus() {
    let choosedFilter = this.state.statusArr.filter(item => item.choosed);
    let fakeStatusArr = JSON.parse(JSON.stringify(this.state.statusArr));
    this.setState({
      fakeStatusArr,
      statesAni: false,
      showShadow_two: false,
      choosedFilter
    });
    this.state.choosedFilter = choosedFilter;
    this.refreshPage();
  }
  shadowTwoClick() {
    let statusArr = JSON.parse(JSON.stringify(this.state.fakeStatusArr));
    this.setState({
      showShadow_two: false,
      statusArr,
      statesAni: false
    });
  }
  shadowOneClick() {
    this.setState({
      showShadow_one: false,
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
  clickDotContent({ OrderNo }) {
    Taro.showLoading({ title: "加载中...", mask: true });
    httpRequest.get("order.delete", { orderNo: OrderNo }).then(
      res => {
        Taro.hideLoading();
        Taro.showToast({
          title: "删除成功",
          icon: "success",
          duration: 2000
        });
        setTimeout(() => {
          this.refreshPage();
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
  btnClick(val, item, e) {
    e && e.stopPropagation();
    if (val == "payOrder") {
      this.pay(item);
    } else if (val == "cancelOrder") {
      this.cancelOrder(item);
    } else if (val == "applyReturn") {
      this.applyReturnMoney(item);
    } else if (val == "cancelReturn") {
      this.cancelReturn(item);
    } else if (val == "orderAgain") {
      this.orderAgain(item);
    }
  }
  orderAgain(item) {
    const { MedicineList } = item;
    let _param = { shopMedicineId: [], count: [] };
    MedicineList.map(item => {
      _param.count.push(item.count);
      _param.shopMedicineId.push(item.medicineId);
    });
    Taro.showLoading({ title: "加载中...", mask: true });
    httpRequest
      .get("sell_ordercart.editSettleCart", {
        shopMedicineId: _param.shopMedicineId.join(),
        quantity: _param.count.join()
      })
      .then(
        res => {
          Taro.hideLoading();
          let userinfo = Taro.getStorageSync("userinfo");
          pushNavigation("buyMedicine", {
            shopId: userinfo.shopId,
            openCar: true
          });
        },
        error => {
          Taro.hideLoading();
          Taro.showToast({
            title: error.msg || "创建订单异常",
            icon: "none",
            duration: 2000
          });
        }
      );
  }
  cancelReturn({ OrderNo }) {
    Taro.showLoading();
    httpRequest.get("order.cancelReturn", { orderNo: OrderNo }).then(
      res => {
        Taro.showToast({
          title: "取消申请退款成功",
          duration: 1200,
          icon: "none"
        });
        setTimeout(() => {
          this.refreshPage();
        }, 1000);
      },
      error => {
        Taro.showToast({
          title: error.msg || "取消申请退款失败",
          duration: 1200,
          icon: "none"
        });
      }
    );
  }
  pay({ OrderNo }) {
    Taro.showLoading();
    payMent.pay({ orderno: OrderNo }).then(
      res => {
        httpRequest
          .get("common_payment.updatePayStatus", {
            type: "wxpay",
            orderno: OrderNo
          })
          .then(
            res => {
              this.refreshPage();
              pushNavigation("orderDetail", { OrderNo: OrderNo });
            },
            error => {
              this.refreshPage();
              pushNavigation("orderDetail", { OrderNo: OrderNo });
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
  refreshPage() {
    this.state.pageIndex = 1;
    this.state.pageEnd = false;
    this.getlist();
  }
  applyReturnMoney({ OrderNo }) {
    pushNavigation("applyRefund", {
      orderNo: OrderNo,
      freshPage: "orderRefresh"
    });
  }
  toDetail({ OrderNo }) {
    pushNavigation("orderDetail", { OrderNo });
  }
  cancelOrder({ OrderNo }) {
    let that = this;
    Taro.showModal({
      title: "",
      content: "确定取消订单吗",
      success: function(res) {
        if (res.confirm) {
          Taro.showLoading({ title: "加载中...", mask: true });
          httpRequest.get("order.cancel", { orderNo: OrderNo }).then(
            res => {
              Taro.showToast({
                title: "取消订单成功",
                icon: "success",
                duration: 2000
              });
              setTimeout(() => {
                that.refreshPage();
                that.setState({
                  scrollTop: 0
                });
              }, 500);
            },
            error => {
              Taro.hideLoading();
              Taro.showToast({
                title: error.msg || "取消订单异常",
                icon: "none",
                duration: 2000
              });
            }
          );
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      }
    });
  }
  render() {
    const {
      choosedFilter,
      showShadow_one,
      showShadow_two,
      sendTypeAni,
      statesAni,
      typeArr,
      statusArr,
      hasLogin,
      selectedTypeName,
      navHeight
    } = this.state;
    let that = this;
    return (
      <View className="order">
        <NavBar
          data={{
            title: "我的订单",
            textColor: "#000",
            bgColor: "#fff",
            back: false
          }}
        />
        <View
          className={`filter ${sendTypeAni ? "sendTypeAni" : ""} ${
            statesAni ? "statesAni" : ""
          }`}
          style={`top:${navHeight}px`}
        >
          <View className="filter_top">
            <View
              className="filter_left choosed"
              onClick={this.chooseType.bind(this, "sendType")}
            >
              {selectedTypeName}
              <Image
                className={`trangle_down ${sendTypeAni ? "rotate" : ""}`}
                src={require("../../../images/trangle_down.png")}
              ></Image>
            </View>

            <View className="filter_right">
              <View
                className={`filter_name ${
                  choosedFilter.length != 0 ? "choosed" : ""
                }`}
                onClick={this.chooseType.bind(this, "status")}
              >
                状态筛选
              </View>
              {choosedFilter.length != 0 && (
                <View className="choosed_num">{choosedFilter.length}</View>
              )}
              <Image
                className="filter_icon"
                src={require("../../../images/filter.png")}
              ></Image>
            </View>
          </View>

          {sendTypeAni && (
            <View className={`filter_list`}>
              {typeArr.map(n => {
                return (
                  <View className="filter_list_item" key={n.key}>
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
                      onClick={this.sendTypeClick.bind(this, n)}
                    >
                      {n.key}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          {statesAni && (
            <View className="status_wrapper">
              <View className="status_list">
                {statusArr.map(q => {
                  return (
                    <View
                      className={`status_list_item ${
                        q.choosed ? "choosed" : ""
                      }`}
                      onClick={this.statusClick.bind(this, q.value)}
                    >
                      {q.key}
                    </View>
                  );
                })}
              </View>
              <View className="buttons">
                <View
                  className="btn reset"
                  onClick={this.resetStatus.bind(this)}
                >
                  重置
                </View>
                <View
                  className="btn confirm"
                  onClick={this.confirmStatus.bind(this)}
                >
                  确定
                </View>
              </View>
            </View>
          )}
        </View>
        {hasLogin != "unknown" && renderList(that, hasLogin)}
        <View
          className="shadow"
          style={`display:${showShadow_one ? "block" : "none"}`}
          onClick={this.shadowOneClick.bind(this)}
        ></View>
        <View
          className="shadow"
          style={`display:${showShadow_two ? "block" : "none"}`}
          onClick={this.shadowTwoClick.bind(this)}
        ></View>
        {/* {showShadow_one && (
          <View
            className="shadow"
            onClick={this.shadowOneClick.bind(this)}
          ></View>
        )}
        {showShadow_two && (
          <View
            className="shadow"
            onClick={this.shadowTwoClick.bind(this)}
          ></View>
        )} */}
      </View>
    );
  }
}
const renderList = (that, hasLogin) => {
  const {
    shopId,
    dataList,
    noMoreTip,
    refreshType,
    scrollTop,
    navHeight
  } = that.state;
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
        {dataList.map((item, index) => {
          let { PayMoney } = item;
          PayMoney = toDecimal(PayMoney);
          let totalarr = PayMoney.split(".");
          return (
            <View className="list" onClick={that.toDetail.bind(that, item)}>
              <View className="titleLine">
                <View className="left">
                  <View className="typePic bySelf">{item.OrderTypeName}</View>
                  <View className="storeName">{item.ShopTitle}</View>
                </View>
                <View className="right">{item.OrderStatusName}</View>
              </View>
              {item.MedicineList &&
                item.MedicineList.map(m => {
                  return (
                    <View className="listCard">
                      <OrderListCard data={m} />
                    </View>
                  );
                })}
              <View className="total">
                <View className="num size">共{item.Amount}件</View>
                <View className="sum size">实付</View>
                <View className="price_int">￥{totalarr[0]}.</View>
                <View className="price_float">{totalarr[1]}</View>
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
                          className={`button ${k.color ? "border_green" : ""}`}
                          onClick={that.btnClick.bind(that, k.value, item)}
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
        {hasLogin ? "选择门店后才能查看订单哦" : "登录后才能查看订单哦"}
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
)(Order);
