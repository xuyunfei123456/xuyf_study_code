import Taro, { Component } from "@tarojs/taro";
import { View, Image, Text, Block, RichText, Button } from "@tarojs/components";
import { OrderApi } from "../../../../apis/index.js";
const orderApi = new OrderApi();
import {
  isEmpty,
  isNotEmpty,
  safe,
  toDecimal,
  sublie,
  subAfter,
} from "../../../../utils/YFWPublicFunction.js";

import { pushNavigation } from "../../../../apis/YFWRouting.js";
import { getOrderBottomTipsModel } from "../YFWOrderListPage/Components/YFWOderListBottomTips/OrderBottomsTipsModel.js";
import OrderButtons from "../YFWOrderListPage/Components/YFWOderListBottomTips/OrderBottomTips";
import OApplayReturnModal from "../../../../components/YFWOrderApplyReturnModal/YFWOrderApplyReturnModal";
import PromptBox from "../../../../components/YFWPromptBoxModal/YFWPromptBoxModal";
import HideButtons from "../YFWOrderListPage/Components/YFWOrderListHideButtonsModel/YFWOrderListHideButtonsModel";
import "./YFWOrderDetail.scss";
const WxNotificationCenter = require("../../../../utils/WxNotificationCenter.js");
const RequsetOrderDetailData = (that, orderNo) => {
  Taro.showLoading({
    title: "加载中",
  });
  orderApi.getOrderDetail(orderNo).then(
    (res) => {
      that.setState({
        dict_sckf_off: res.dict_sckf_off == 1 ? 1 : 0,
        advisory_link: res.advisory_link || "",
      });
      HanderlerOrderBottomsData(that, res);
      HandlerOrderStatusImage(that, res.dict_order_status_name);
      HandlerLogistsInfoAndAdress(that, res);
      HandlerSeninfoTps(that, res);
      HandlerOrderMedecineInfo(that, res);
      HandlerContactInfo(that, res);
      HandlerInveceiptInfo(that, res);
      HandlerOrderPriceInfo(that, res);
      HandlerOrderStatusList(that, res);
      HandlerOrderButtons(that, res);
      Taro.hideLoading();
    },
    (error) => {
      Taro.hideLoading();
      Taro.showToast({
        title: error.msg,
        icon: "none",
      });
    }
  );
};

const HanderlerOrderBottomsData = (that, res) => {
  let data = getOrderBottomTipsModel(res, "order_detail");
  if (isNotEmpty(data)) {
    that.setState({
      datas: data,
    });
  }
};

const HandlerOrderStatusImage = (that, status) => {
  let order_status_icon = require("../../../../images/order_status_icon_success.png");
  let order_status_title = status;
  if (status === "交易完成") {
    order_status_icon = require("../../../../images/order_status_icon_success.png");
  } else if (
    status === "交易失败" ||
    status === "交易取消" ||
    status === "交易关闭"
  ) {
    order_status_icon = require("../../../../images/order_status_icon_failed.png");
  } else if (
    status === "申请退货" ||
    status === "申请退款" ||
    status === "同意退货" ||
    status === "退货发出" ||
    status === "收到退货" ||
    status === "退货/款完成" ||
    status === "商家拒绝退货/款" ||
    status === "退货/款已取消" ||
    status === "退款已取消" ||
    status === "商家拒绝退款" ||
    status === "正在退款"
  ) {
    order_status_icon = require("../../../../images/order_status_icon_return.png");
  } else {
    if (status === "暂未付款") {
      order_status_title = "等待买家付款";
    } else if (status === "等待发货") {
      order_status_title = "等待商家发货";
    }
    order_status_icon = require("../../../../images/order_status_icon_wait.png");
  }
  let showLogisticsStatus = true;
  if (
    order_status_title === "交易失败" ||
    order_status_title === "交易取消" ||
    order_status_title === "交易关闭" ||
    order_status_title === "暂未付款"
  ) {
    showLogisticsStatus = false;
  }
  that.setState({
    orderStatusImage: order_status_icon,
    orderStatustText: order_status_title,
    showLogisticsStatus,
  });
};

const HandlerLogistsInfoAndAdress = (that, res) => {
  if (isEmpty(res.trafficno)) {
    that.setState({
      haveLogistsInfo: false,
      user_name: res.shopping_name,
      user_phone: res.shopping_mobile,
      order_address_detaial: res.shopping_address,
    });
  } else {
    that.setState({
      traffic_name: res.traffic_name,
      traffic_icon: res.traffic_icon,
      trafficno: res.trafficno,
      user_name: res.shopping_name,
      user_phone: res.shopping_mobile,
      order_address_detaial: res.shopping_address,
    });
  }
};

const HandlerSeninfoTps = (that, res) => {
  if (isNotEmpty(res)) {
    if (isNotEmpty(res.scheduled_days_item)) {
      if (isNotEmpty(res.scheduled_days_item.desc)) {
        let descArray = res.scheduled_days_item.desc.split("：");
        if (descArray.length >= 2) {
          that.setState({
            scheduled_days_item: res.scheduled_days_item,
            scheduled_days_item_desc_tips: descArray[0],
            scheduled_days_item_desc_value: descArray[1],
          });
        } else {
          that.setState({
            scheduled_days_item: res.scheduled_days_item,
          });
        }
      } else {
        that.setState({
          scheduled_days_item: res.scheduled_days_item,
        });
      }
    }
  }
};
const HandlerContactInfo = (that, res) => {
  if (isNotEmpty(res)) {
    if (isNotEmpty(res.phone_show_type)) {
      that.setState({
        contactSoler: res.phone_show_type,
        store_phone: safe(res.store_phone),
        dict_advisory_notice: res.dict_advisory_notice,
      });
    }
  }
};

const HandlerOrderMedecineInfo = (that, res) => {
  let havePackage = false;
  if (isNotEmpty(res.packmedicine_list) && res.packmedicine_list.length > 0) {
    havePackage = true;
  }
  HandlerMedicineMoney(res);
  that.setState({
    shop_title: res.title,
    medicineList: res.medicineList,
    packmedicine_list: res.packmedicine_list,
    havePackage: havePackage,
    shop_id: res.storeid,
  });
};
const HandlerInveceiptInfo = (that, res) => {
  if (isNotEmpty(res.invoice_applicant)) {
    that.setState({
      needreceipt: true,
      invoice_applicant: res.invoice_applicant,
      dict_invoice_type: res.dict_invoice_type,
      invoiceShowName: res.invoice_showname,
    });
  }
};

const HandlerOrderPriceInfo = (that, res) => {
  let orderPriceInfo = [];
  if (parseFloat(res.medicine_total) != 0) {
    let medicineTotal = {
      type: "商品总价",
      price: toDecimal(res.medicine_total),
    };
    orderPriceInfo.push(medicineTotal);
  }
  if (parseFloat(res.shipping_total) != 0) {
    let shipping = {
      type: "配送费",
      price: toDecimal(res.shipping_total),
    };
    orderPriceInfo.push(shipping);
  }
  if (parseFloat(res.packaging_total) != 0) {
    let packing = {
      type: "包装费",
      price: toDecimal(res.packaging_total),
    };
    orderPriceInfo.push(packing);
  }
  if (parseFloat(res.use_point) != 0) {
    let usrPoint = {
      type: " 积分抵扣",
      price: "-" + toDecimal(res.use_point),
    };
    orderPriceInfo.push(usrPoint);
  }
  if (parseFloat(res.use_coupon_price) != 0) {
    let usrCoupon = {
      type: "商家优惠券",
      price: "-" + toDecimal(res.use_coupon_price),
    };
    orderPriceInfo.push(usrCoupon);
  }
  if (parseFloat(res.plat_coupon_price) != 0) {
    let platformYh = {
      type: "商城优惠券",
      price: "-" + toDecimal(res.plat_coupon_price),
    };
    orderPriceInfo.push(platformYh);
  }
  if (parseFloat(res.update_price) != 0) {
    let updatePrice = {
      type: "商品优惠",
      price: toDecimal(res.update_price),
    };
    orderPriceInfo.push(updatePrice);
  }
  that.setState({
    priceInfoData: orderPriceInfo,
    total_price: toDecimal(res.total_price),
  });
};

const HandlerOrderStatusList = (that, res) => {
  if (isNotEmpty(res.statusList)) {
    that.setState({
      statusList: res.statusList,
      orderno: res.orderno,
    });
  } else {
    that.setState({
      orderno: res.orderno,
    });
  }
};

const HandlerOrderButtons = (that, res) => {
  if (isNotEmpty(res.buttons)) {
    if (res.buttons.length > 3) {
      that.setState({
        showButtons: res.buttons.slice(0, 3),
        hideButtons: res.buttons.slice(3, res.buttons.length),
      });
    } else {
      that.setState({
        showButtons: res.buttons,
        hideButtons: [],
      });
    }
  }
};

const HandlerMedicineMoney = (res) => {
  if (isNotEmpty(res.medicineList)) {
    if (res.medicineList.length > 0) {
      res.medicineList.forEach((item, index) => {
        item.unit_price = toDecimal(item.unit_price);
      });
    }
  }
  if (isNotEmpty(res.packmedicine_list)) {
    if (res.packmedicine_list.length > 0) {
      res.packmedicine_list.forEach((item, index) => {
        item.medicine_list.forEach((innerItem, position) => {
          innerItem.unit_price = toDecimal(innerItem.unit_price);
        });
      });
    }
  }
};
class YFWOrderDetail extends Component {
  config = {
    navigationBarTitleText: "订单详情",
    navigationBarBackgroundColor: "#49ddb8",
    navigationBarTextStyle: "white",
  };

  constructor(props) {
    super(props);
    this.state = {
      showLogisticsStatus: true,
      invoiceShowName: "",
      orderStatusImage: require("../../../../images/order_status_icon_success.png"),
      orderStatustText: "",
      haveLogistsInfo: true,
      trafficno: "",
      traffic_icon: "",
      traffic_name: "",
      user_name: "",
      user_phone: "",
      order_address_detaial: "",
      shop_title: "",
      shop_id: "",
      medicineList: [],
      packmedicine_list: [],
      havePackage: false,
      needreceipt: false,
      priceInfoData: [],
      statusList: [],
      orderno: "",
      destHeight: 0,
      showButtons: [],
      hideButtons: [],
      datas: [],
      contactSoler: "-1",
      store_phone: "",
      scheduled_days_item: {},
      scheduled_days_item_desc_tips: "",
      scheduled_days_item_desc_value: "",
      selectBox: "",
      code: "",
    };
  }

  componentWillMount() {
    this.isDefalutLoad = true;
    let that = this;
    Taro.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        let height = clientHeight * ratio;
        that.setState({
          destHeight: height - 100,
        });
      },
    });
    let options = this.$router.params;
    let screenData = JSON.parse(options.params);
    this.state.orderno = screenData.order_no;
    RequsetOrderDetailData(this, screenData.order_no);
    // this.applayReturnModal = this.selectComponent("#applyReturnOrderModal");
    // this.orderReceivedModal = this.selectComponent('#orderReceived');
    // this.orderDeleteModal = this.selectComponent("#orderDelete");
    // this.orderPayNot = this.selectComponent('#orderPayNot');
    // this.hideButtonsModel = this.selectComponent('#hideButtons');
    that.applayRefReturnModal;
    WxNotificationCenter.addNotification(
      "refreshScreenNow",
      that.refreshScreenNow,
      that
    );
  }

  refreshScreenNow = () => {
    Taro.showLoading({
      title: "加载...",
    });
    Taro.hideLoading();
    RequsetOrderDetailData(this, this.state.orderno);
  };

  componentDidMount() {}
  componentDidShow() {
    if (this.isDefalutLoad) {
      this.isDefalutLoad = false;
      return;
    }
    RequsetOrderDetailData(this, this.state.orderno);
  }

  checkLogstics() {
    if (!this.state.haveLogistsInfo) {
      return;
    }
    pushNavigation("get_logistics_detail", {
      order_no: this.state.orderno,
      medecine_image: this.state.medicineList[0].intro_image,
    });
  }
  onHideButtonsClick = (e) => {
    e.position.hideButtons = this.state.hideButtons;
    let hideButtonsModel = this.hideButtonsModal.$component
      ? this.hideButtonsModal.$component
      : this.hideButtonsModal;
    this.hideButtonsModal &&
      hideButtonsModel.showView(e.position, "orderDetail");
  };
  scheduledButtonClick(e) {
    let index = e.currentTarget.dataset.position;
    let isAgree =
      this.state.scheduled_days_item.buttons[index].text == "同意" ? 1 : 0;
    Taro.showLoading({
      title: "提交中...",
    });
    orderApi.getDelaySend(this.state.orderno, isAgree).then(
      (res) => {
        WxNotificationCenter.postNotificationName(
          "refreshScreen",
          "refreshAll"
        );
        Taro.hideLoading();
        RequsetOrderDetailData(this, this.state.orderno);
      },
      (error) => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg,
          icon: "none",
        });
      }
    );
  }

  checkPhoneNum = (parm) => {
    let arrary = parm.phone.split("****");
    let pheone = safe(arrary[0]) + this.state.code + safe(arrary[1]);
    Taro.showLoading({
      title: "加载中...",
    });
    orderApi.verifyMobile(pheone).then(
      (res) => {
        Taro.hideLoading();
        if (res == 1) {
          this.applayRefReturnModal &&
            (this.applayRefReturnModal.$component
              ? this.applayRefReturnModal.$component.closeView()
              : this.applayRefReturnModal.closeView());
          if (parm.type == "order_apply_return_pay") {
            pushNavigation("get_application_return", {
              orderNo: parm.orderNo,
              order_total: parm.order_total,
              pageFrom: "orderDetail",
            });
          } else {
            pushNavigation("get_choose_return_type", {
              orderNo: parm.orderNo,
              order_total: parm.order_total,
              packaging_total: parm.packaging_total,
              shipping_total: parm.shipping_total,
              pageFrom: "orderDetail",
              status: "areGoodsReceived",
            });
          }
        } else {
          this.applayRefReturnModal &&
            (this.applayRefReturnModal.$component
              ? this.applayRefReturnModal.$component.closeView()
              : this.applayRefReturnModal.closeView());
          Taro.showToast({
            title: "手机号验证失败",
            icon: "none",
          });
        }
      },
      (error) => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg,
          icon: "none",
        });
      }
    );
  };
  jumpToH5() {
    pushNavigation("get_h5", {
      value: "https://m.yaofangwang.com/app/check.html?os=miniapp",
    });
  }
  contactCustomerServi() {
    pushNavigation("get_h5", {
      value: "https://m.yaofangwang.com/chat.html",
    });
  }
  jumpToGoodsDetail(e) {
    let shopGoodsId = e + "";
    pushNavigation("get_shop_goods_detail", {
      value: shopGoodsId,
    });
  }
  jumpToShopDetail() {
    pushNavigation("get_shop_detail", {
      value: this.state.shop_id,
    });
  }
  call() {
    Taro.makePhoneCall({
      phoneNumber: this.state.store_phone,
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    });
  }
  copyOderNo() {
    Taro.setClipboardData({
      data: this.state.orderno,
      success: function () {
        Taro.showToast({
          title: "订单编号复制成功",
          icon: "none",
        });
      },
    });
  }
  applyReturn = (parm) => {
    let that = this;
    Taro.showLoading({
      title: "加载中...",
    });
    orderApi.getAccountMobile().then(
      (res) => {
        Taro.hideLoading();
        let parmms = {
          phone: res.value,
          orderNo: parm.orderNo,
          orderTotal: parm.order_total,
          packagingTotal: parm.packaging_total,
          shippingTotal: parm.shipping_total,
          type: parm.type,
          inputSuccess: function (phoneCode) {
            that.state.code = phoneCode;
            that.setState({
              code: phoneCode,
            });
          },
        };
        that.applayRefReturnModal &&
          (that.applayRefReturnModal.$component
            ? that.applayRefReturnModal.$component.showView(parmms)
            : that.applayRefReturnModal.showView(parmms));
        // that.applayRefReturnModal&& that.applayRefReturnModal.$component.showView({
        //   phone: res.value,
        //   orderNo: parm.orderNo,
        //   orderTotal: parm.order_total,
        //   packagingTotal: parm.packaging_total,
        //   shippingTotal: parm.shipping_total,
        //   type: parm.type,
        //   inputSuccess: function(phoneCode) {
        //     that.setState({
        //       code:phoneCode
        //     })
        //   },
        // });
      },
      (error) => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg,
          icon: "none",
        });
      }
    );
  };
  onOrderPayNot = (parms) => {
    let orderNo = parms.orderNo;
    let prompt_info = parms.prompt_info;
    this.state.selectBox = "orderPayNot";
    let promptOrderModal = this.promptOrderModal.$component
      ? this.promptOrderModal.$component
      : this.promptOrderModal;
    this.promptOrderModal && promptOrderModal.showView(prompt_info, orderNo);
    this.setState({});
  };
  orderReceived = (parm) => {
    var that = this;
    that.state.selectBox = "orderReceived";

    that.promptOrderModal &&
      (that.promptOrderModal.$component
        ? that.promptOrderModal.$component.showViewTypeTwo(
            "请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。",
            parm
          )
        : that.promptOrderModal.showViewTypeTwo(
            "请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。",
            parm
          ));
    // that.orderReceivedModal.showViewTypeTwo("请确认您已经收到与订单记录相符的商品，确认收货后将无法发起退换货申请。", parm)
    that.setState({});
  };
  onOrderDelete = () => {
    this.state.selectBox = "orderDelete";

    this.promptOrderModal &&
      (this.promptOrderModal.$component
        ? this.promptOrderModal.$component.showView(
            "是否删除该订单？\n删除后可以从电脑端订单回收站恢复"
          )
        : this.promptOrderModal.showView(
            "是否删除该订单？\n删除后可以从电脑端订单回收站恢复"
          ));
    // this.orderDeleteModal.showView("是否删除该订单？\n删除后可以从电脑端订单回收站恢复")
    this.setState({});
  };

  onDeleteRightButtonClick = () => {
    Taro.showLoading({
      title: "加载中...",
    });
    orderApi.delectOrder(this.state.orderno).then(
      (rex) => {
        WxNotificationCenter.postNotificationName(
          "refreshScreen",
          "refreshAll"
        );
        Taro.hideLoading();
        // this.orderDeleteModal.closeView()
        Taro.showToast({
          title: "删除成功",
          icon: "none",
        });
        RequsetOrderDetailData(this, this.state.orderno);
      },
      (error) => {
        Taro.hideLoading();
        Taro.showToast({
          title: error.msg,
          icon: "none",
        });
      }
    );
  };
  onBaseModalRightButtonClick = (parm) => {
    console.log("确认收货");
    this.promptOrderModal &&
      (this.promptOrderModal.$component
        ? this.promptOrderModal.$component.closeView()
        : this.promptOrderModal.closeView());
    let orderNo = parm.orderNo;
    let img_url = parm.img_url;
    let order_total = parm.order_total;
    let shop_title = parm.shop_title;
    Taro.showLoading({
      title: "加载中...",
    });
    orderApi.confirmReceiving(orderNo).then((res) => {
      WxNotificationCenter.postNotificationName("refreshScreen", "refreshAll");
      Taro.hideLoading();
      pushNavigation(
        "get_success_receipt",
        {
          title: "收货成功",
          orderNo: orderNo,
          type: "received",
          img_url: img_url,
          order_total: order_total,
          shop_title: shop_title,
        },
        (error) => {
          Taro.hideLoading();
          Taro.showToast({
            title: error.msg,
          });
        }
      );
    });
  };
  onOrderPayNotMpdelRightButtonClick = (parm) => {
    this.promptOrderModal &&
      (this.promptOrderModal.$component
        ? this.promptOrderModal.$component.closeView()
        : this.promptOrderModal.closeView());
    pushNavigation("get_upload_rx_info", {
      orderID: parm.orderNo,
    });
  };
  message() {
    pushNavigation("get_h5", { value: this.state.advisory_link });
  }
  contactButton() {
    const concatItem = {
      name: "咨询客服",
      type: "get_h5",
      value: "https://m.yaofangwang.com/chat.html",
    };
    pushNavigation(concatItem.type, concatItem);
  }
  render() {
    const { shop_title } = this.state;
    const { store_phone } = this.state;
    const { contactSoler } = this.state;
    const { needreceipt } = this.state;
    const { dict_invoice_type } = this.state;
    const { invoice_applicant } = this.state;
    const { orderno } = this.state;
    const { statusList } = this.state;
    const { datas } = this.state;
    const { showButtons } = this.state;
    const { hideButtons } = this.state;
    const {
      selectBox,
      dict_advisory_notice,
      dict_sckf_off,
      invoiceShowName,
      orderStatustText,
    } = this.state;
    return (
      <View>
        {this.renderTopStatusView()}
        {this.renderAddressView()}
        <View className="shop_title" onClick={this.jumpToShopDetail}>
          <Image
            className="shop_icon"
            src={require("../../../../images/bottom_icon_dianpu.png")}
          />
          <Text
            className={
              process.env.TARO_ENV == "alipay"
                ? "shop_name shop-line-height"
                : "shop_name"
            }
          >
            {shop_title}
          </Text>
        </View>
        {this.renderMedicineView()}
        {contactSoler != "-1" && dict_advisory_notice != 0 && (
          <View className="contactCustomerServic" onClick={this.message}>
            <Image
              className="icon"
              src={require("../../../../images/message.png")}
            ></Image>
            <View className="tip">联系商家</View>
            <View style="flex:1"></View>
            <Image
              src={require("../../../../images/uc_next.png")}
              className="next"
              mode="aspectFit"
            ></Image>
          </View>
        )}
        {contactSoler != "-1" &&
          store_phone.length > 0 &&
          dict_advisory_notice == 0 && (
            <View className="contactCustomerServic" onClick={this.call}>
              <Image
                className="icon"
                src={require("../../../../images/order_detail_store_phone.png")}
              />
              <View className="tip">拨打商家电话</View>
              <View style="flex:1"></View>
              <Image
                src={require("../../../../images/uc_next.png")}
                className="next"
                mode="aspectFit"
              />
            </View>
          )}
        <View className="heightSplite_view"></View>
        <View className="receiptInfo">
          <View className="receiptype">
            <View className="receiptTypeValue">
              发票类型：{invoiceShowName}
            </View>
            <Image
              src={require("../../../../images/uc_next.png")}
              class="next"
              mode="aspectFit"
            />
          </View>

          {/* <View className='receipheader'>
                        发票抬头：
                        <View className='receiptTypeValue'>{invoice_applicant}</View>
                        </View> */}
        </View>
        {needreceipt && <View className="heightSplite_view"></View>}
        {this.renderAllPrice()}
        <View className="heightSplite_view"></View>
        <View className="orderStatus">
          <View className="priceInfoItem">
            <View className="left">订单编号</View>
            <View style="flex:1"></View>
            <View className="right" style="margin-right: 10rpx;">
              {orderno}
            </View>
            <View className="copyButton" onClick={this.copyOderNo}>
              复制
            </View>
          </View>
          {statusList.map((item, index) => {
            return (
              <Block key={item.dict_order_status}>
                <View className="priceInfoItem">
                  <View className="left">{item.dict_order_status_name}</View>
                  <View style="flex:1"></View>
                  <View className="right">
                    <View>{item.create_time}</View>
                    <View>{item.description}</View>
                  </View>
                </View>
              </Block>
            );
          })}
        </View>
        {dict_sckf_off && <View className="heightSplite_view"></View>}
        {dict_sckf_off && (
          <View
            className="contactCustomerServic"
            onClick={this.contactButton.bind(this)}
          >
            <Image
              className="icon"
              src={require("../../../../images/order_detail_service.png")}
            />
            <View className="tip">联系商城客服</View>
            <View style="flex:1"></View>
            <Image
              src={require("../../../../images/uc_next.png")}
              className="next"
              mode="aspectFit"
            />
            <View
              openType="contact"
              sessionFrom="wx_app"
              className="tansButton"
            >
              微信客服
            </View>
          </View>
        )}

        <View className="heightSplite_view"></View>
        <View className="acceptanceCriteria" onClick={this.jumpToH5}>
          <Text className="dark">
            请按照<Text className="light_text">《药房网商城商品验收标准》</Text>
            对货品进行签收
          </Text>
        </View>
        <View className="heightSplite_view"></View>
        <View className="FillView"></View>
        <View className="bottomLayout">
          <View className="buttonListLayout">
            <OrderButtons
              datas={datas}
              showButtons={showButtons}
              onRequestApplyReturn={this.applyReturn}
              hideButtons={hideButtons}
              onOrderReceived={this.orderReceived}
              onOrderDelete={this.onOrderDelete}
              onOrderPayNot={this.onOrderPayNot}
              showHideButtonsTips={hideButtons.length > 0}
              onShowHideButtons={this.onHideButtonsClick}
              pageFrom="orderDetail"
            />
          </View>
          <View style="width:20rpx;height:110rpx;"></View>
        </View>
        <OApplayReturnModal
          ref={this.reffApplayReturnModal}
          onCheckPhone={this.checkPhoneNum}
        />
        <PromptBox
          ref={this.refPromptOrder}
          onTest={
            selectBox == "orderReceived"
              ? this.onBaseModalRightButtonClick
              : selectBox == "orderDelete"
              ? this.onDeleteRightButtonClick
              : this.onOrderPayNotMpdelRightButtonClick
          }
          needLeftButton={selectBox == "orderPayNot" ? false : true}
        />
        <HideButtons
          ref={this.refHideButtons}
          datas={datas}
          onRequestApplyReturn={this.applyReturn}
          onOrderReceived={this.orderReceived}
          onOrderDelete={this.onOrderDelete}
          onOrderPayNot={this.onOrderPayNot}
        />
      </View>
    );
  }
  reffApplayReturnModal = (modal) => (this.applayRefReturnModal = modal);
  refPromptOrder = (modal) => (this.promptOrderModal = modal);
  refHideButtons = (modal) => (this.hideButtonsModal = modal);
  renderTopStatusView() {
    const { orderStatusImage } = this.state;
    const { orderStatustText } = this.state;
    return (
      <View className="top_status_parent">
        <View className="order_status">
          <Image src={orderStatusImage} className="icon" mode="aspectFit" />
          <Text className="text">{orderStatustText}</Text>
        </View>
      </View>
    );
  }
  renderAddressView() {
    const { traffic_name } = this.state;
    const { traffic_icon } = this.state;
    const { trafficno } = this.state;
    const { user_name } = this.state;
    const { user_phone } = this.state;
    const { order_address_detaial } = this.state;
    const { scheduled_days_item } = this.state;
    const { scheduled_days_item_desc_tips } = this.state;
    const { scheduled_days_item_desc_value } = this.state;
    const {
      haveLogistsInfo,
      orderStatustText,
      showLogisticsStatus,
    } = this.state;

    return (
      <View className="address_info_parent">
        {showLogisticsStatus && (
          <View className="logistics" onClick={this.checkLogstics}>
            <Text className="text">暂无快递信息</Text>
            <Image src={traffic_icon} className="traffic_icon"></Image>
            {haveLogistsInfo && (
              <View className="traffic_name">
                {traffic_name + " 单号:" + trafficno}
              </View>
            )}
            <View style="flex:1"></View>
            {haveLogistsInfo && (
              <Image
                src={require("../../../../images/uc_next.png")}
                className="next"
              />
            )}
          </View>
        )}

        <View className="user_info">
          <View className="address_detail">
            <View className="top">
              <Image
                className="address_icon"
                src={require("../../../../images/order_detail_location.png")}
                mode="aspectFit"
              />
              <View>{user_name}</View>
              <View className="phone">{user_phone}</View>
            </View>
            <View className="bottom">{order_address_detaial}</View>
          </View>
        </View>
        <View className="scheduled_days_itemLayout">
          {scheduled_days_item_desc_tips &&
            scheduled_days_item_desc_value &&
            showLogisticsStatus && (
              <View className="tipsLayout">
                <View className="tips">
                  {scheduled_days_item_desc_tips + "："}
                </View>
                <View className="value">{scheduled_days_item_desc_value}</View>
              </View>
            )}
          <View className="scheduledButtonLayout">
            <View style="flex:1"></View>
            {scheduled_days_item.buttons.map((item, idx) => {
              return (
                <Block>
                  <View
                    className={idx == 0 ? "light" : "darkbutton"}
                    onClick={this.scheduledButtonClick}
                    data-position={idx}
                  >
                    {item.text}
                  </View>
                </Block>
              );
            })}
          </View>
        </View>
        <Image
          src={require("../../../../images/shouhua.png")}
          className="bottom_image"
        />
      </View>
    );
  }
  renderMedicineView() {
    const { medicineList } = this.state;
    const { havePackage } = this.state;
    const { packmedicine_list } = this.state;
    return (
      <View className="medicine_list">
        {medicineList.map((info, index) => {
          return (
            <Block key={info.shop_goods_id}>
              <View
                className="medicineList_item"
                onClick={this.jumpToGoodsDetail.bind(
                  this,
                  info.store_medicineid
                )}
              >
                <Image
                  src={info.intro_image + "_300x300.jpg"}
                  className="medecine_image"
                  mode="aspectFit"
                />
                <View className="medicine_info">
                  <View className="top">
                    <View className="medicien_name">
                      {(info.dict_medicine_type == 1 ||
                        info.dict_medicine_type == 3) && (
                        <Image
                          src={require("../../../../images/ic_drug_track_label.png")}
                          className="medicine_type_icon"
                        />
                      )}
                      {info.dict_medicine_type == 2 && (
                        <Image
                          src={require("../../../../images/ic_drug_track_label.png")}
                          className="medicine_type_icon"
                        />
                      )}
                      {info.dict_medicine_type == 0 && (
                        <Image
                          src={require("../../../../images/ic_OTC.png")}
                          className="medicine_type_icon"
                        />
                      )}
                      {info.medicine_name}
                    </View>
                    <View style="flex:1"></View>
                    <Text className="smallPrice">
                      ¥
                      <Text className="Goodsprice">
                        {sublie(info.unit_price) + "."}
                      </Text>
                      <Text className="smallPrice">
                        {subAfter(info.unit_price)}
                      </Text>
                    </Text>
                  </View>
                  <View className="bottom">
                    <View className="medecine_standard">{info.standard}</View>
                    <View style="flex:1"></View>
                    <View className="medecine_qty">{"x" + info.qty}</View>
                  </View>
                  {info.periodto && (
                    <View className="periodOfValidity">
                      {"有效期至：" + info.periodto}
                    </View>
                  )}
                </View>
              </View>
            </Block>
          );
        })}
        {/* {havePackage && <View className="splite_view"></View>} */}
        {packmedicine_list.map((packinfo, index) => {
          return (
            <Block key={packinfo.packageid}>
              <View className="packgeParent">
                <View className="packageName">
                  <View
                    className={
                      packinfo.package_type == 0
                        ? "packageType"
                        : "course_costume"
                    }
                  >
                    {packinfo.package_type == 0 ? "套餐" : "疗程装"}
                  </View>
                  <View className="packageName_text">{packinfo.smp_name}</View>
                </View>
                {packinfo.medicine_list.map((item, index) => {
                  return (
                    <Block key={item.shop_goods_id}>
                      <View
                        className="medicineList_item"
                        onClick={this.jumpToGoodsDetail.bind(
                          this,
                          item.store_medicineid
                        )}
                      >
                        <Image
                          src={item.intro_image + "_300x300.jpg"}
                          className="medecine_image"
                          mode="aspectFit"
                        ></Image>
                        <View className="medicine_info">
                          <View className="top">
                            <View className="medicien_name">
                              {item.dict_medicine_type == 1 && (
                                <Image
                                  src={require("../../../../images/ic_drug_track_label.png")}
                                  className="medicine_type_icon"
                                ></Image>
                              )}
                              {item.dict_medicine_type == 2 && (
                                <Image
                                  src={require("../../../../images/ic_drug_track_label.png")}
                                  className="medicine_type_icon"
                                ></Image>
                              )}
                              {item.dict_medicine_type == 0 && (
                                <Image
                                  src={require("../../../../images/ic_OTC.png")}
                                  className="medicine_type_icon"
                                ></Image>
                              )}
                              {item.medicine_name}
                            </View>
                            <View style="flex:1"></View>
                            <Text className="Goodsprice">
                              {"¥" + item.unit_price}
                            </Text>
                          </View>
                          <View className="bottom">
                            <View className="medecine_standard">
                              {item.standard}
                            </View>
                            <View style="flex:1"></View>
                            <View className="medecine_qty">
                              {"x" + item.qty}
                            </View>
                          </View>
                          {item.periodto && (
                            <View className="periodOfValidity">
                              {"有效期至：" + item.periodto}
                            </View>
                          )}
                        </View>
                      </View>
                    </Block>
                  );
                })}
              </View>
            </Block>
          );
        })}
      </View>
    );
  }
  renderAllPrice() {
    const { priceInfoData } = this.state;
    const { total_price } = this.state;
    return (
      <View className="priceInfoParent">
        {priceInfoData.map((item, index) => {
          return (
            <Block>
              <View className="priceInfoItem">
                <View
                  className={
                    item.type == "商品总价" ? "priceTypeBold" : "priceType"
                  }
                >
                  {item.type}
                </View>
                <View style="flex:1"></View>
                <Text
                  className={
                    item.type == "商品总价"
                      ? "priceSmallPriceBold"
                      : "priceSmallPrice"
                  }
                >
                  ¥
                  <Text
                    className={item.type == "商品总价" ? "priceBold" : "price"}
                  >
                    {sublie(item.price) + "."}
                  </Text>
                  <Text
                    className={
                      item.type == "商品总价"
                        ? "priceSmallPriceBold"
                        : "priceSmallPrice"
                    }
                  >
                    {subAfter(item.price)}
                  </Text>
                </Text>
              </View>
            </Block>
          );
        })}
        <View className="splite"></View>
        <View className="orderToatal">
          <View style="flex:1"></View>
          <View className="tips">订单总金额：</View>
          <Text className="smallPrice">
            ¥<Text className="price">{sublie(total_price) + "."}</Text>
            <Text className="smallPrice">{subAfter(total_price)}</Text>
          </Text>
        </View>
      </View>
    );
  }
}

export default YFWOrderDetail;
