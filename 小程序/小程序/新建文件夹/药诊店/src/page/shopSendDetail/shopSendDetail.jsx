import { Component } from "react";
import { View, Text, Image, CoverView, Block, Map } from "@tarojs/components";
import OrderListCard from "../../components/OrderListCard/OrderListCard";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import "./shopSendDetail.less";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";
import { formatSeconds } from "../../utils/YFWPublicFunction";
import { transOrderCardData, toDecimal } from "../../utils/YFWPublicFunction";
import { Payment } from "../../utils/payment";
import NavBar from "../../components/navBar/navBar";
import toPayIcon from "../../images/toPay.png";
import callPhone from "../../images/callPhone.png";
import cancelOrderIcon from "../../images/cancelOrderIcon.png";

const payMent = new Payment();
const httpRequest = new HTTP();
export default class shopSendDetail extends Component {
  constructor() {
    super();
    this.state = {
      customCalloutMarkerIds:[1],
      titleFlag: "none",
      mapShow: "block",
      navTitle: "",
      navFlag: true,
      bgColor: "transparent",
      alarmTip: "",
      remarks: "",
      phoneNumber: "", //商家电话
      payType: "", //支付方式
      orderNo: "", //订单编号
      statusArr: [{ name: "等待支付" }],
      alarmFlag: false,
      preStatusName: "", //处方状态  为空则为非处方药
      showType: false,
      statusName: "",
      title: "",
      createTime: "", //订单创建时间
      payTimeTo: "", //自提结束时间
      selfliftCode: "", //自提码
      countDown: "",
      orderStatusNameen: "", //订单状态
      buttons: [], //按钮数组
      interval: "", //定时器id
      medicineList: [], //购买商品列表
      discountMoney: "", //会员优惠
      pointsDeductionTotal: "", //会员积分优惠
      discountTotal: "", //总共优惠
      receiveMoney: "", //订单金额
      invoiceModel: null, //发票信息
      markers: [],
      latitude: "31.23035",
      longitude: "121.473717",
      btnOpations: [
        {
          title: "去支付",
          icon: toPayIcon
        },
        {
          title: "电话商家",
          icon: callPhone
        },
        {
          title: "取消订单",
          icon: cancelOrderIcon
        }
      ]
    };
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    const { OrderNo } = instance.router.params;
    this.state.orderNo = OrderNo;
    let navBarInfo = Taro.getStorageSync("navBarInfo");
    this.setState({
      orderNo: OrderNo,
      ...navBarInfo
    });
    let markers = [
      {
        id: 1,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        iconPath: require("../../images/buyMeicine.png"),
        width: 84,
        height: 60,
        customCallout: {
          anchorX: 0,
          anchorY: 0,
          display: "ALWAYS"
        },
        
      }
    ];
    this.setState({
      markers
    });
  }
  dealNavigator(res) {}
  componentDidMount() {
    this.getData();
  }
  getData() {
    const { orderNo } = this.state;
    if (!orderNo) return;
    let tips;
    httpRequest.get("order.getOrderDetail", { orderNo }).then(res => {
      let _name = res.OrderStatusNameen;
      if (_name == "notReceive" || _name == "notPay") {
        this.cacluTime(
          _name == "notPay"
            ? res.PayTimeTo
            : _name == "notReceive"
            ? res.ReceiveOrderTimeTo
            : ""
        );
        tips =
          _name == "notPay"
            ? "30分钟内未支付，订单将自动取消"
            : _name == "notReceive"
            ? "商家15分钟内未接单，订单将自动取消"
            : "";
      } else {
        this.setState({
          alarmFlag: false
        });
      }

      this.dealOrder(res);
      this.setState({
        statusName: res.OrderStatusName,
        address: res.Address,
        business_hours: res.Business_hours,
        title: res.Title,
        createTime: res.CreateTime,
        payTimeTo: res.PayTimeTo,
        selfliftCode: res.SelfliftCode,
        orderStatusNameen: res.OrderStatusNameen,
        buttons: res.Buttons,
        preStatusName: res.PreStatusName,
        remarks: res.Remarks,
        alarmTip: tips,
        SelfTimeTo: res.SelfTimeTo
      });
    });
  }
  dealOrder({
    OrderDetails,
    DiscountMoney,
    PointsDeductionTotal,
    DiscountTotal,
    ReceiveMoney,
    InvoiceModel,
    Phone
  }) {
    let data = transOrderCardData(OrderDetails),
      discountMoney = toDecimal(DiscountMoney),
      pointsDeductionTotal = toDecimal(PointsDeductionTotal),
      discountTotal = toDecimal(DiscountTotal),
      receiveMoney = toDecimal(ReceiveMoney),
      invoiceModel = InvoiceModel;
    this.setState({
      medicineList: data,
      discountMoney,
      pointsDeductionTotal,
      discountTotal,
      receiveMoney,
      invoiceModel,
      phoneNumber: Phone
    });
  }
  //计算提货倒计时
  cacluTime(endtime) {
    if (endtime) {
      let _t = new Date(endtime).getTime(),
        _n = new Date().getTime();
      let diff = _t - _n;
      if (diff < 0) {
        this.setState({
          overTime: true,
          alarmFlag: false
        });
      } else {
        diff = diff / 1000;
        let time = formatSeconds(diff);
        this.setState({
          countDown: time,
          overTime: false,
          diffTime: diff,
          alarmFlag: true
        });
        this.state.diffTime = diff;
        this.state.interval = setInterval(() => {
          let sec = this.state.diffTime - 1;
          if (sec < 1) {
            this.setState({
              overTime: true
            });
            this.state.interval && clearInterval(this.state.interval);
          } else {
            let time = formatSeconds(sec);
            this.setState({
              countDown: time,
              overTime: false,
              diffTime: sec
            });
            this.state.diffTime = sec;
          }
        }, 1000);
      }
    } else {
      this.setState({
        overTime: true
      });
    }
  }
  componentWillUnmount() {
    this.state.interval && clearInterval(this.state.interval);
  }

  componentDidShow() {
    let refresh = Taro.getStorageSync("orderdetailRefresh");
    if (refresh && refresh == 1) {
      this.getData();
    }
  }

  componentDidHide() {}
  closeAlarm() {
    this.setState({
      alarmFlag: false
    });
  }
  showOther(flag) {
    this.setState({
      showType: flag
    });
  }
  onPageScroll(e) {
    const { navFlag } = this.state;
    if (e.scrollTop >= 330 && navFlag) {
      this.state.navFlag = false;
      const { statusName } = this.state;
      Taro.setNavigationBarTitle({
        title: statusName
      });
      this.setState({
        bgColor: "#fff",
        navTitle: statusName,
        mapShow: "none",
        titleFlag: "block"
      });
    } else if (e.scrollTop < 330 && !navFlag) {
      this.state.navFlag = true;
      Taro.setNavigationBarTitle({
        title: ""
      });
      this.setState({
        bgColor: "transparent",
        navTitle: "",
        mapShow: "block",
        titleFlag: "none"
      });
    }
  }
  btnClick({ value }) {
    Taro.showLoading({ title: "加载中...", mask: true });
    Taro.setStorageSync("orderRefresh", 1);
    if (value == "cancelOrder") {
      httpRequest.get("order.cancel", { orderNo: this.state.orderNo }).then(
        res => {
          Taro.hideLoading();
          this.state.interval && clearInterval(this.state.interval);
          this.getData();
        },
        error => {
          Taro.hideLoading();
          Taro.showToast({
            title: error.msg || "操作失败",
            duration: 1200,
            icon: "none"
          });
        }
      );
    } else if (value == "applyReturn") {
      this.applyReturnMoney(this.state.orderNo);
    } else if (value == "cancelReturn") {
      this.cancelReturn(this.state.orderNo);
    } else if (value == "payOrder") {
      this.pay(this.state.orderNo);
    }
  }
  pay(OrderNo) {
    payMent.pay({ orderno: OrderNo }).then(
      res => {
        httpRequest
          .get("common_payment.updatePayStatus", {
            type: "wxpay",
            orderno: OrderNo
          })
          .then(
            res => {
              Taro.setStorageSync("orderRefresh", 1);
              this.getData();
            },
            error => {
              this.getData();
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
  cancelReturn(orderNo) {
    httpRequest.get("order.cancelReturn", { orderNo }).then(
      res => {
        Taro.showToast({
          title: "取消申请退款成功",
          duration: 1200,
          icon: "none"
        });
        setTimeout(() => {
          this.getData();
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
  applyReturnMoney(orderNo) {
    Taro.hideLoading();
    pushNavigation("applyRefund", {
      orderNo: orderNo,
      freshPage: "orderdetailRefresh"
    });
  }
  buyAgain(e) {
    e && e.stopPropagation(); // 阻止事件冒泡
    const { medicineList } = this.state;
    let _param = { shopMedicineId: [], count: [] };
    medicineList.map(item => {
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
  copyText(text) {
    Taro.setClipboardData({
      data: text,
      success: function(res) {
        Taro.getClipboardData({
          success: function(res) {
            console.log(res.data); // data
          }
        });
      }
    });
  }
  toShop() {
    let userinfo = Taro.getStorageSync("userinfo");
    pushNavigation("buyMedicine", { shopId: userinfo.shopId });
  }
  phoneCall() {
    const { phoneNumber } = this.state;
    if (!phoneNumber) {
      Taro.showToast({
        title: "暂无商家电话",
        icon: "none",
        duration: 2000
      });
      return;
    }
    Taro.makePhoneCall({
      phoneNumber
    });
  }
  toInvoice(orderNo) {
    const { invoiceModel } = this.state;
    if (invoiceModel == null) return;
    Taro.setStorageSync("invoiceModel", invoiceModel);
    pushNavigation("invoiceDetail", { orderNo });
  }
  render() {
    const that = this;
    const {
      alarmFlag,
      preStatusName,
      statusName,
      address,
      business_hours,
      createTime,
      selfliftCode,
      buttons,
      discountMoney,
      pointsDeductionTotal,
      discountTotal,
      receiveMoney,
      alarmTip,
      orderNo,
      payType,
      showType,
      invoiceModel,
      countDown,
      latitude,
      longitude,
      markers,
      bgColor,
      navTitle,
      mapShow,
      titleFlag,
      btnOpations,
      customCalloutMarkerIds,
    } = this.state;
    let { title, medicineList } = this.state;
    title = title + "";
    title = title.length > 12 ? title.subString(0, 12) + "..." : title;
    let receiveMoneyArr = receiveMoney.split(".");
    if (!showType) {
      medicineList.length = 3;
    }
    let invoiceTitle = "无需发票";
    if (invoiceModel != null && invoiceModel) {
      invoiceTitle =
        invoiceModel.InvoiceType == 1
          ? "增值税电子普通发票"
          : "增值税纸质普通发票";
    }
    return (
      <CoverView className="shopSendDetail" scrollY>
        <NavBar
          data={{
            title: navTitle,
            textColor: "#000",
            bgColor
          }}
        />
        <View class="map" style={`display:${mapShow}`}>
          <Map
            id="myMap"
            style="width: 100%; height: 100%;"
            latitude={latitude}
            longitude={longitude}
            markers={markers}
            showLocation
          >
      <cover-view slot="callout">
        {customCalloutMarkerIds.map(item=>{
          return (
            <cover-view  className="customCallout" marker-id={item} >
            <cover-view className="content"> 
              {`1111-2222-3333`}
            </cover-view>
          </cover-view>
          )
        })}
      </cover-view>
          </Map>
        </View>
        <View className="content-wrapper">
          <View
            className="refreshMap"
            style={`visibility:${mapShow == "block" ? "visible" : "hidden"}`}
          >
            <Image
              className="refreshIcon"
              src={require("../../images/refresh.png")}
            ></Image>
          </View>
          <View className="shopSendDetail_title" style={`display:${titleFlag}`}>
            <Text className="title_text">
              {statusName},剩余
              <Text style={`color:rgb(255,51,0)`}>{countDown}</Text>
            </Text>
            <Image
              src={require("../../images/right_graypng.png")}
              className="right_graypng"
            ></Image>
          </View>
          {alarmFlag && (
            <View className="alarmClock part">
              <View className="left">
                <Image
                  className="alarmPic"
                  src={require("../../images/radio.png")}
                ></Image>
                <Text>{alarmTip}</Text>
              </View>
              <Image
                className="right closeAlarm"
                src={require("../../images/close_two.png")}
                onClick={this.closeAlarm.bind(this)}
              ></Image>
            </View>
          )}
          <View className="operation-area part">
            <View className="operation-title">{`请尽快支付`}</View>
            <View className="operation-btn">
              {btnOpations.map(item => {
                return (
                  <View className="operation-btn-item">
                    <Image
                      src={item.icon}
                      className="operation-btn-item-icon"
                      mode="heightFix"
                    ></Image>
                    <Text className="operation-btn-item-text">
                      {item.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          {preStatusName && renderRxInfo(that)}
          <View className="payment part">
            <View className="payment_title" onClick={this.toShop.bind(this)}>
              <View className="payment_title_left">
                <Text>{title}</Text>
                <Image
                  className="arrow_right_small"
                  src={require("../../images/arrow_right_small.png")}
                ></Image>
              </View>
            </View>
            <View className="listWrapper">
              {medicineList.map(item => {
                return (
                  <View className="list_item">
                    <OrderListCard data={item} />
                  </View>
                );
              })}
              {medicineList.length > 3 && (
                <View className="showOther">{renderShowOther(that)}</View>
              )}
            </View>
            <View className="coupon payment_list">
              <View className="payment_list_left">会员优惠</View>
              <View className="payment_list_right">-￥ {discountMoney}</View>
            </View>
            <View className="coupon payment_list">
              <View className="payment_list_left">会员积分</View>
              <View className="payment_list_right">
                -￥ {pointsDeductionTotal}
              </View>
            </View>
            <View className="coupon payment_list">
              <View className="payment_list_left">发票</View>
              <View
                className="payment_list_right"
                onClick={this.toInvoice.bind(this, orderNo)}
              >
                {invoiceTitle}
              </View>
            </View>
            <View className="orderDetail_line"></View>
            <View className="payment_bottom">
              <View
                className="payment_bottom_left"
                onClick={this.phoneCall.bind(this)}
              >
                <Image
                  className="phone"
                  src={require("../../images/storePhone.png")}
                ></Image>
                <Text className="phone_text">电话商家</Text>
              </View>
              <View className="payment_bottom_right">
                <View>
                  已优惠 <Text className="coupon_money">￥{discountTotal}</Text>{" "}
                  实付{" "}
                  <Text className="pay_money_int">
                    ￥ {receiveMoneyArr[0]}.
                  </Text>
                  <Text className="pay_money_float">{receiveMoneyArr[1]}</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="orderInfo part">
            <View className="orderInfo_title">配送信息</View>
            <View className="orderDetail_line"></View>
            <View className="orderInfo_list">
              <View className="orderInfo_listItem">
                <View className="orderInfo_listItem_left">期望时间</View>
                <View className="orderInfo_listItem_right">
                  {`2020-01-01 00:00:00`}
                </View>
              </View>
              <View className="orderInfo_listItem">
                <View className="orderInfo_listItem_left">配送地址</View>
                <View className="orderInfo_listItem_right">{`123123123123`}</View>
              </View>
              <View className="orderInfo_listItem">
                <View className="orderInfo_listItem_left">配送方式</View>
                <View className="orderInfo_listItem_right">{`商家自配送`}</View>
              </View>
            </View>
          </View>
          <View className="orderInfo part">
            <View className="orderInfo_title">订单信息</View>
            <View className="orderDetail_line"></View>
            <View className="orderInfo_list">
              <View className="orderInfo_listItem">
                <View className="orderInfo_listItem_left">订单号</View>
                <View className="orderInfo_listItem_right">
                  <Text>{orderNo}</Text>
                  <Image
                    className="copy"
                    src={require("../../images/copy.png")}
                    onClick={this.copyText.bind(this, orderNo)}
                  ></Image>
                </View>
              </View>
              {payType && (
                <View className="orderInfo_listItem">
                  <View className="orderInfo_listItem_left">支付方式</View>
                  <View className="orderInfo_listItem_right">{payType}</View>
                </View>
              )}

              <View className="orderInfo_listItem">
                <View className="orderInfo_listItem_left">下单时间</View>
                <View className="orderInfo_listItem_right">{createTime}</View>
              </View>
              {/* <View className="orderInfo_listItem">
              <View className="orderInfo_listItem_left">下单备注</View>
              <View className="orderInfo_listItem_right">
                123下单备注下单备注下单备注下单备注下单备注下单备注下单备注
              </View>
            </View> */}
            </View>
          </View>
        </View>
      </CoverView>
    );
  }
}
const renderRxInfo = that => {
  const { preStatusName } = that.state;
  return (
    <View className="rxInfo part">
      <View className="rx_title">
        <Image
          className="rx_red"
          src={require("../../images/rx_red.png")}
        ></Image>
        <Text className="rx_progress">
          {"填写就诊信息 > 医院开方 > 商家审方 > 商家接单 > 骑手配送"}
        </Text>
      </View>
      <View className="rx_center">
        <View className="left">就诊信息已填写</View>
        <View className="right">
          <Text>{preStatusName}</Text>
          {/* <Image
            className="arrow_right_small"
            src={require("../../images/arrow_right_small.png")}
          ></Image> */}
        </View>
      </View>
      <View className="rx_bottom">医生将根据您的就诊信息开具处方</View>
    </View>
  );
};

//显示 展开还是收起
const renderShowOther = that => {
  const { showType, medicineList } = that.state;
  if (showType) {
    return (
      <View onClick={that.showOther.bind(that, false)}>
        收起
        <Image
          className="showOther_icon_close"
          src={require("../../images/arraw_down.png")}
        ></Image>
      </View>
    );
  }
  return (
    <View onClick={that.showOther.bind(that, true)}>
      展开（共{medicineList.length - 3}件）
      <Image
        className="showOther_icon"
        src={require("../../images/arraw_down.png")}
      ></Image>
    </View>
  );
};
