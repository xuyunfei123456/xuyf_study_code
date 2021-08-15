import { Component } from "react";
import { View, Text, Image, ScrollView, Block } from "@tarojs/components";
import OrderListCard from "../../components/OrderListCard/OrderListCard";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import "./buSlfOrderDetail.less";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";

import { transOrderCardData, toDecimal ,accSubtr,accDiv, formatSeconds} from "../../utils/YFWPublicFunction";
import {Payment} from '../../utils/payment'
const payMent = new Payment()
const httpRequest = new HTTP();
export default class buSlfOrderDetail extends Component {
  constructor() {
    super();
    this.state = {
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
    };
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    const { OrderNo } = instance.router.params;
    this.state.orderNo = OrderNo;
    this.setState({
      orderNo: OrderNo
    });
  }

  componentDidMount() {
    console.log("didmount");
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
        SelfTimeTo:res.SelfTimeTo,
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
    if (endtime&&endtime !=null) {
      endtime = endtime.replace(/-/g,'/')
      let _t = new Date(endtime).getTime(),
        _n = new Date().getTime();
      let diff =accSubtr(_t,_n);
      if (diff < 0) {
        this.setState({
          overTime: true,
          alarmFlag: false
        });
      } else {
        diff = accDiv(diff,1000);
        let time = formatSeconds(diff);
        this.setState({
          countDown: time,
          overTime: false,
          diffTime: diff,
          alarmFlag: true,
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
    let refresh = Taro.getStorageSync('orderdetailRefresh');
    if(refresh && refresh == 1){
      this.getData()
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
    if (e.scrollTop > 30) {
      const { statusName } = this.state;
      Taro.setNavigationBarTitle({
        title: statusName
      });
    } else {
      Taro.setNavigationBarTitle({
        title: ""
      });
    }
  }
  btnClick({ value }) {
    Taro.showLoading({ title: '加载中...' ,mask:true})
    Taro.setStorageSync('orderRefresh',1);
    if (value == "cancelOrder") {
      let that = this;
      Taro.hideLoading();
      Taro.showModal({
        title: '',
        content: '确定取消订单吗',
        success: function (res) {
          if (res.confirm) {
            Taro.showLoading({ title: '加载中...' ,mask:true})
            httpRequest.get("order.cancel", { orderNo: that.state.orderNo }).then(
              res => {
                Taro.hideLoading();
                that.state.interval && clearInterval(that.state.interval);
                that.getData();
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
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
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
              Taro.setStorageSync('orderRefresh',1);
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
    Taro.showLoading({ title: '加载中...' ,mask:true})
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
    if (!phoneNumber){
      Taro.showToast({
        title: '暂无商家电话',
        icon: 'none',
        duration: 2000
      })
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
      payTimeTo,
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
      SelfTimeTo,
    } = this.state;
    let { title, medicineList } = this.state;
    title = title + "";
    title = title.length > 12 ? title.substring(0, 12) + "..." : title;
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
      <ScrollView className="buSlfOrderDetail" scrollY>
        <View className="buSlfOrderDetail_title">
          <Text className="title_text">{statusName}</Text>
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
        <View className="shopInfo part">
          {renderShopTitle(that)}
          <Block>
            <View className="shopName">
              <View>
                <Image
                  className="shop_pic"
                  src={require("../../images/store_icon.png")}
                ></Image>
                <Text>{title}</Text>
              </View>
              {selfliftCode && (
                <View className="codeWrapper">
                  自提码<Text className="goodCode">{selfliftCode}</Text>
                </View>
              )}
            </View>
            <View className="shop_item">
              <View className="shop_item_title">商家营业时间</View>
              <View className="shop_item_content">每日{business_hours}</View>
            </View>
            <View className="shop_item">
              <View className="shop_item_title">商家地址</View>
              <View className="shop_item_content">
                <View className="shop_item_content_text">{address}</View>
                <Image
                  className="copy"
                  src={require("../../images/copy.png")}
                  onClick={this.copyText.bind(this, address)}
                ></Image>
              </View>
            </View>
            <View className="shop_item">
              <View className="shop_item_title">自提时间</View>
              <View className="shop_item_content">
                {SelfTimeTo}
              </View>
            </View>
            <View className="btn_wrapper">
              {buttons.map(item => {
                return (
                  <View
                    className={`shop_btn ${item.color ? "greenbtn" : ""}`}
                    onClick={this.btnClick.bind(this, item)}
                  >
                    {item.text}
                  </View>
                );
              })}
            </View>
          </Block>
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
            <View
              className="payment_title_right"
              onClick={this.buyAgain.bind(this)}
            >
              <Image
                className="buy_pic"
                src={require("../../images/order_pic.png")}
              ></Image>
              <Text className="buy_text">{"再来一单"}</Text>
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
                <Text className="pay_money_int">￥ {receiveMoneyArr[0]}.</Text>
                <Text className="pay_money_float">{receiveMoneyArr[1]}</Text>
              </View>
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
      </ScrollView>
    );
  }
}
const renderShopTitle = that => {
  const { countDown, overTime, orderStatusNameen, remarks} = that.state;
  if (orderStatusNameen == "notPay") {
    //未支付
    return (
      <View className="shop_title">
        {overTime && <View className="over_time">超时未支付</View>}
        {!overTime && (
          <Block>
            {" "}
            剩余时间 <Text className="red">{countDown}</Text> 请尽快支付
          </Block>
        )}
      </View>
    );
  } else if (orderStatusNameen == "cancelOrder") {
    return (
      <View className="shop_title">
        <View className="over_time">超时取消</View>
      </View>
    );
  } else if (orderStatusNameen == "notReceive") {
    return (
      <View className="shop_title">
        {overTime && <View className="over_time">超时未接单</View>}
        {!overTime && (
          <Block>
            {" "}
            预计 <Text className="red">{countDown}</Text>{" "}
            后接单，接单后可到店取货
          </Block>
        )}
      </View>
    );
  }
  return <View className="shop_title">{remarks}</View>;
};
const renderRxInfo = that => {
  const { preStatusName } = that.state;
  return (
    <View className="rxInfo part">
      <View className="rx_title">
        <Image
          className="rx_red"
          src={require("../../images/rx_red.png")}
        ></Image>
        <Text>{"填写就诊信息 > 医院开方 > 商家接单备货 > 到店自提"}</Text>
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
