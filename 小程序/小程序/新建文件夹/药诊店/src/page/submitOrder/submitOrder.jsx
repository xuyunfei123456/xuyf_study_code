import { Component } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Block,
  Input
} from "@tarojs/components";
import OrderListCard from "../../components/OrderListCard/OrderListCard";
import YfwModal from "../../components/YfwModal/YfwModal";
import { pushNavigation } from "../../apis/YFWRouting";
import { AtFloatLayout } from "taro-ui";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { HTTP } from "../../utils/http";
import {
  accMul,
  accSubtr,
  accAdd,
  accDiv
} from "../../utils/YFWPublicFunction";
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import {
  transOrderCardData,
  transDistance,
  toDecimal
} from "../../utils/YFWPublicFunction";
const httpRequest = new HTTP();
import "./submitOrder.less";
import { Payment } from "../../utils/payment";
const payMent = new Payment();

class SubmitOrder extends Component {
  constructor() {
    super();
    this.state = {
      memberId: "",
      submitFlag: true,
      IsInquiryOrder: 0,
      otherBrandsDataFake: [], //更换厂家备份数据
      BolPreOrder: false,
      is_certificate_upload: false, //是否需要填写就诊信息
      hasSick: false,
      diseases: [],
      hasMember: false, //有无会员
      addressInfo: {},
      sendType: "byself", //配送方式
      needInvoice: false, //是否需要发票
      invoiceFlag: false, //是否显示发票弹窗
      data1: [1, 2, 3],
      showType: false,
      sendTypeModalFlag: false,
      chooseSendTypeItem: 0,
      rankModalFlag: false,
      brandFlag: false,
      elecFlag: false,
      medicineList: [],
      distance: "",
      shippingMethodList: [], //配送方式
      sendTypeForData: 0, //选择的配送方式
      customerInfo: {},
      usepoints: true, //积分弹窗中是否使用积分的标志
      usePointsFlag: true, //真正控制订单是否使用积分的标志
      invoiceSendData: {
        needInvoice: 0,
        invoiceCode: "",
        invoiceApplicant: ""
      }, //真正传给后台的 发票信息
      dicountMoneyTotal: "", //优惠总价
      orderTotal: "", //订单总价
      otherBrandsData: []
    };
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    const { cartIdArr, inquiryNo } = instance.router.params;
    let userinfo = Taro.getStorageSync("userinfo");
    const { thirdAccountId, shopId } = userinfo;
    this.state.shopId = shopId;
    this.state.thirdAccountId = thirdAccountId;
    this.state.inquiryNo = inquiryNo;
    if (cartIdArr) {
      //购物车跳转到结算页
      this.getOrderInfo(cartIdArr);
    }
    if (inquiryNo) {
      //处方详情 跳转到结算页
      this.setState({
        IsInquiryOrder: 1
      });
      this.getOrderInfoByInquiryNo(inquiryNo, shopId);
    }
  }
  getOrderInfoByInquiryNo(inquiryNo, shopId) {
    httpRequest.get("order.getSettleInfoWithInquiry", { inquiryNo }).then(
      res => {
        if (
          res.CustomerInfo != null &&
          res.CustomerInfo &&
          res.CustomerInfo.Id
        ) {
          this.state.memberId = res.CustomerInfo.Id;
        }
        this.dealData(res, shopId);
      },
      error => {
        this.state.submitFlag = false;
        Taro.showToast({
          title: error.msg || "获取订单详情异常",
          icon: "none",
          duration: 2000
        });
      }
    );
  }
  //计算订单总价  优惠价格  商品改动 配送改动 积分改动  都可以调用此方法重新计算价格
  countTotal() {
    const {
      medicineList,
      shippingMethodList,
      sendTypeForData,
      customerInfo,
      usepoints,
      hasMember
    } = this.state;
    //1.计算商品总价
    let medicinePriceArr = medicineList.map(item => item.priceTotal);
    let medicinePriceTotal = medicinePriceArr.reduce((prev, num) => {
      return accAdd(prev, num);
    });
    let sendPrice = shippingMethodList[sendTypeForData]["ShippingMoney"]; //配送方式的钱
    if (hasMember) {
      //有会员
      let hasDiscountPrice = accMul(medicinePriceTotal, customerInfo.Discount); //优惠后的总加
      hasDiscountPrice = toDecimal(hasDiscountPrice);
      let rankPrice = usepoints ? customerInfo["canUseMoney"] || "0.00" : "0.00"; //积分抵扣的钱
      let dicountMoneyTotal = accAdd(rankPrice, customerInfo.discountPrice); //优惠的总价
      dicountMoneyTotal = toDecimal(dicountMoneyTotal);
      let orderTotal = accSubtr(accAdd(hasDiscountPrice, sendPrice), rankPrice);
      if (Number(orderTotal) <= 0) {
        //如果订单价格低于 积分抵扣
        orderTotal = "0.01";
        let val1 = accAdd(hasDiscountPrice, sendPrice); //优惠的钱加上配送的钱
        let val2 = accSubtr(val1, "0.01"); //积分抵扣的钱
        customerInfo.canUseMoney = val2; //积分可以抵扣的钱
        dicountMoneyTotal = accAdd(val2, customerInfo.discountPrice); //优惠总价
        customerInfo.canUsePoint = accMul(
          val2,
          customerInfo.PointsDeductionRate
        );
        customerInfo.canUsePoint = Math.ceil(customerInfo.canUsePoint); //向上取整
      }
      this.setState({
        dicountMoneyTotal,
        orderTotal,
        customerInfo
      });
    } else {
      //无会员
      let orderTotal = accAdd(medicinePriceTotal, sendPrice);
      orderTotal = toDecimal(orderTotal);
      this.setState({
        orderTotal
      });
    }
  }
  getdistance(data, shopId) {
    const { lat, lng } = data;
    httpRequest.get("guest.getDistance", { lat, lng, shopId }).then(
      res => {
        if (res) {
          let distance = transDistance(res);
          console.log(distance);
          this.setState({
            distance
          });
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  getOtherBrandsOrFactory(medicineArr) {
    let id = medicineArr.map(item => item.medicineId);
    httpRequest
      .get("order.getChangeBrandMedicineList", {
        shopMedicineIds: id.join(),
        shopId: this.state.shopId
      })
      .then(res => {
        let newData = [];
        medicineArr.map((item, index) => {
          let _arr = [];
          item.choosed = true;
          _arr.push(item);
          if (res[item.medicineId]) {
            let transdata = res[item.medicineId];
            transdata = transdata.map(kk => {
              kk.count = item.count || 1;
              kk.CarAmount = item.count || 1;
              return kk;
            });
            let _data = transOrderCardData(transdata);
            _arr.push(..._data);
          }
          newData[index] = _arr;
        });
        this.setState({
          otherBrandsData: newData,
          otherBrandsDataFake: newData
        });
      });
  }
  getDisease(data) {
    data = data.filter(item => Number(item.prescription) > 0);
    let sendObj = {};
    data.map(item => {
      sendObj[item.idForSearch] = item.name;
    });
    if (JSON.stringify(sendObj) == "{}") return;
    httpRequest
      .get("sell_ordercart.getMedicineDiseaseList", { medicineInfo: sendObj })
      .then(res => {
        let _data = [];
        for (let key in res) {
          let namearr = [];
          if (res[key] && res[key].length != 0) {
            res[key].map(item => {
              if (item.name && item.name != null) {
                item.active = false;
                namearr.push(item);
              }
            });
          }
          _data.push({
            drugName: key,
            sickList: namearr
          });
        }
        this.setState({
          diseases: _data
        });
        console.log(_data);
      });
  }
  getOrderInfo(cartId) {
    const { thirdAccountId, shopId } = this.state;
    httpRequest
      .get("order.getSettleInfo", { shopId, cartId, thirdAccountId })
      .then(res => {
        if (
          res.CustomerInfo != null &&
          res.CustomerInfo &&
          res.CustomerInfo.Id
        ) {
          this.state.memberId = res.CustomerInfo.Id;
        }
        this.dealData(res, shopId);
      });
  }
  dealData(res, shopId) {
    if (res.MedicineList && res.MedicineList.length != 0) {
      let _res = transOrderCardData(res.MedicineList);
      this.getDisease(_res);
      this.getdistance(res.PickAddressInfo, shopId);
      this.getOtherBrandsOrFactory(_res);
      let shippingMethodList = res.ShippingMethodList.map((item, index) => {
        //处理提送方式
        item.choosed = index == 0 ? true : false;
        return item;
      });
      let hasMember, customerInfo;
      if (
        res.CustomerInfo &&
        res.CustomerInfo != null &&
        JSON.stringify(res.CustomerInfo) != "{}"
      ) {
        hasMember = true;
        customerInfo = res.CustomerInfo;
        if (
          !customerInfo.Discount ||
          (customerInfo.Discount && customerInfo.Discount) == 1
        ) {
          customerInfo.discount = "暂无折扣";
          customerInfo.discountPrice = "0.00";
        } else {
          let _count = accMul(customerInfo.Discount, 100);
          customerInfo.discount = `会员折扣率${_count}%`;
          let priceArr = _res.map(item => item.priceTotal);
          let sum = priceArr.reduce((prev, num) => {
            return accAdd(prev, num);
          });
          let _discount = accSubtr(1, customerInfo.Discount);
          customerInfo.discountPrice = accMul(sum, _discount);
        }
        const {
          CurrentPoint,
          BoolPointsDeduction,
          PointsDeductionRate
        } = customerInfo;
        if (CurrentPoint && CurrentPoint > 0) {
          //j积分大于0
          if (BoolPointsDeduction == 1) {
            //可以使用积分抵扣
            if (CurrentPoint && CurrentPoint != 0 && CurrentPoint != null) {
              let _val1 = accDiv(CurrentPoint, PointsDeductionRate); //总积分/兑换比例  的余数
              _val1 = toDecimal(_val1, "floor"); //精确到小数点后两位
              customerInfo.canUseMoney = _val1;
              customerInfo.moneyFlag = true; //积分右侧不显示抵扣多少钱 时其它文案
              customerInfo.canUsePoint = customerInfo.CurrentPoint; //可以使用的积分
            } else {
              customerInfo.moneyFlag = false; //积分右侧不显示抵扣多少钱 时其它文案
              customerInfo.rankTitle = "积分不足"; //右侧文案
              customerInfo.canUseMoney = "0.00";
            }
          } else {
            //不能使用积分抵扣
            customerInfo.moneyFlag = false; //积分右侧不显示抵扣多少钱 显示其它文案
            customerInfo.rankTitle = "暂不可用";
            customerInfo.canUseMoney = "0.00";
          }
        } else {
          customerInfo.CurrentPoint = 0;
          customerInfo.canUseMoney = '0.00';
          customerInfo.moneyFlag = false; //积分右侧不显示抵扣多少钱 显示其它文案
          customerInfo.rankTitle = "积分不足"; //右侧文案
        }
      } else {
        //没会员
        hasMember = false;
        customerInfo = {};
      }
      this.setState(
        {
          medicineList: _res,
          addressInfo: res.PickAddressInfo || {},
          shippingMethodList,
          customerInfo,
          hasMember,
          is_certificate_upload: res.is_certificate_upload,
          BolPreOrder: res.BolPreOrder
        },
        () => {
          this.countTotal();
        }
      );
    }
  }
  componentDidMount() {}

  componentWillUnmount() {
    let { changeState } = this.props;
    changeState({
      inquiryInfo: {},
      hasSickInfo: false
    });
  }

  componentDidShow() {
    const { hasSickInfo } = this.props.globalData;
    if (hasSickInfo != this.state.hasSick) {
      this.setState({
        hasSick: hasSickInfo
      });
    }
  }

  componentDidHide() {}
  showOther(flag) {
    this.setState({
      data1: flag ? [1, 2, 3, 4, 5] : [1, 2, 3],
      showType: flag
    });
  }
  cancelFn() {
    this.setState({
      yfwModalParams: {
        isOpen: false
      }
    });
  }
  confirmFn() {
    this.setState({
      yfwModalParams: {
        isOpen: false
      }
    });
  }
  infoFn() {
    this.setState({
      yfwModalParams: {
        isOpen: false
      }
    });
  }
  chooseAddress() {
    pushNavigation("addressList");
  }
  sendTypeModal(flag) {
    let {
      chooseSendTypeItem,
      sendTypeForData,
      shippingMethodList
    } = this.state;
    if (flag) {
      if (chooseSendTypeItem != sendTypeForData) {
        shippingMethodList = shippingMethodList.map((item, index) => {
          item.choosed = index == sendTypeForData ? true : false;
          return item;
        });
      }
    }
    this.setState({
      sendTypeModalFlag: flag,
      shippingMethodList
    });
  }
  chooseSendType(e) {
    let _id = e.target.dataset.id;
    const { chooseSendTypeItem, shippingMethodList } = this.state;
    if (!_id || _id == chooseSendTypeItem) return;
    shippingMethodList = shippingMethodList.map((item, index) => {
      item.choosed = chooseSendTypeItem == index ? true : False;
    });
    this.setState({
      chooseSendTypeItem: _id,
      shippingMethodList
    });
    //this.setYfwModalParams();
  }
  confirmSendType() {
    if (this.state.sendTypeForData != this.state.chooseSendTypeItem) {
      this.countTotal();
    }
    this.setState({
      sendTypeModalFlag: false,
      sendTypeForData: this.state.chooseSendTypeItem
    });
  }
  setYfwModalParams() {
    this.setState({
      yfwModalParams: {
        cancelBtn: "暂不开启",
        confirmBtn: "前往开启",
        title: "您未开启定位，请确认好自提地点，避免无法到店自提。",
        icon: "warning",
        isOpen: true,
        cancelFn: this.cancelFn.bind(this),
        confirmFn: this.confirmFn.bind(this)
      }
    });
  }
  inquiryModalConfirm(){
    this.setState({
      yfwModalParams: {
        isOpen: false
      }
    },()=>{
      Taro.setStorageSync("diseases", this.state.diseases);
      pushNavigation("inquire", { uploadFlag: this.state.is_certificate_upload });
    });
  }
  setRankModal(flag) {
    if(!this.state.customerInfo.moneyFlag){
      Taro.showToast({
        title: '无可用积分',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    this.setState({
      rankModalFlag: flag,
      usepoints: this.state.usePointsFlag
    });
  }
  choosedRank(flag) {
    if (this.state.usepoints == flag) return;
    this.setState({
      usepoints: flag
    });
  }
  chooseBrand(m, n) {
    let oldData = this.state.otherBrandsData;
    let _data = oldData[m][n];
    if (_data.choosed) return;
    let newData = oldData[m].map((item, index) => {
      item.choosed = index == n ? true : false;
      return item;
    });
    oldData[m] = newData;
    this.setState({
      otherBrandsData: oldData
    });
  }
  setbrandModal(flag) {
    let data = JSON.parse(JSON.stringify(this.state.otherBrandsDataFake));
    this.setState({
      brandFlag: flag,
      otherBrandsData: data
    });
  }
  chooseInvoice(flag) {
    const { invoiceSendData } = this.state;
    if (flag) {
      this.setState({
        needInvoice: invoiceSendData.needInvoice == 0 ? false : true,
        idcard: invoiceSendData.invoiceCode,
        invoiceHeader: invoiceSendData.invoiceApplicant,
        elecFlag:
          invoiceSendData.needInvoice == 0 || invoiceSendData.needInvoice == 1
            ? true
            : false
      });
    }
    this.setState({
      invoiceFlag: flag,
      needInvoice: invoiceSendData.needInvoice == 0 ? false : true,
      elecFlag:
        invoiceSendData.needInvoice == 0 || invoiceSendData.needInvoice == 1
          ? true
          : false
    });
  }
  invoiceClick(e) {
    if (e.target.dataset.type) {
      this.setState({
        needInvoice: e.target.dataset.type == "notneed" ? false : true
      });
    }
  }
  invoiceTypeClick(e) {
    if (e.target.dataset.type) {
      this.setState({
        elecFlag: e.target.dataset.type == "paper" ? false : true
      });
    }
  }
  invoiceHeaderInput(e) {
    let { value } = e.detail;
    this.setState({
      invoiceHeader: value
    });
  }
  idcardInput(e) {
    let { value } = e.detail;
    this.setState({
      idcard: value
    });
  }
  conFirmRank() {
    const { usepoints, usePointsFlag } = this.state;
    if (usepoints != usePointsFlag) {
      //不相等 代表点击确定的时候 更改了选择
      this.countTotal();
    }
    this.setState({
      rankModalFlag: false,
      usePointsFlag: usepoints
    });
  }
  phoneCall() {
    const { phone } = this.state;
    if (!phone) return;
    Taro.makePhoneCall({
      phoneNumber: phone
    });
  }
  confirmBrands() {
    const { otherBrandsData } = this.state;
    let newMedicineList = [];
    otherBrandsData.map(item => {
      item.map(kk => {
        if (kk.choosed) {
          newMedicineList.push(kk);
        }
      });
    });
    this.setState(
      {
        medicineList: newMedicineList,
        brandFlag: false,
        otherBrandsDataFake: otherBrandsData
      },
      () => {
        this.countTotal();
      }
    );
  }
  conFirmInvoice() {
    const {
      idcard,
      invoiceHeader,
      elecFlag,
      invoiceSendData,
      needInvoice
    } = this.state;
    let _data = invoiceSendData;
    if (needInvoice) {
      if (invoiceHeader == "" || !invoiceHeader) {
        Taro.showToast({
          title: "请填写抬头",
          icon: "none",
          duration: 2000
        });
        return false;
      }
      if (idcard == "" || !idcard) {
        Taro.showToast({
          title: "请填写身份证号",
          icon: "none",
          duration: 2000
        });
        return false;
      }
      _data.invoiceCode = idcard;
      _data.invoiceApplicant = invoiceHeader;
      _data.needInvoice = elecFlag ? 1 : 2;
    } else {
      _data.invoiceCode = "";
      _data.invoiceApplicant = "";
      _data.needInvoice = 0;
    }
    console.log("发票信息", invoiceSendData);
    this.setState({
      invoiceSendData: _data,
      invoiceFlag: false
    });
  }
  addConsulationInfo() {
    if(this.state.hasSick){
      Taro.setStorageSync("diseases", this.state.diseases);
      pushNavigation("inquire", { uploadFlag: this.state.is_certificate_upload });
    }else{
      this.setState({
        yfwModalParams: {
          cancelBtn: "取消",
          confirmBtn: "去填写",
          title: "提示",
          content:"购买处方药，需要用药人就诊信息，请填写信息",
          icon: "",
          isOpen: true,
          cancelFn: this.cancelFn.bind(this),
          confirmFn: this.inquiryModalConfirm.bind(this)
        }
      });
    }

  }
  commitOrder() {
    if (!this.state.submitFlag) return;
    const {
      shopId,
      thirdAccountId,
      shippingMethodList,
      addressInfo,
      needInvoice,
      elecFlag,
      idcard,
      invoiceHeader,
      dicountMoneyTotal,
      orderTotal,
      medicineList,
      sendTypeForData,
      BolPreOrder,
      IsInquiryOrder,
      inquiryNo,
      usePointsFlag
    } = this.state;
    const { inquiryInfo, hasSickInfo } = this.props.globalData;
    if (BolPreOrder && IsInquiryOrder != 1) {
      if (!hasSickInfo) {
        Taro.showToast({
          title: "请填写就诊信息",
          icon: "none",
          duration: 2000
        });
        return false;
      }
    }
    const { ShippingMoney, ShippingId } = shippingMethodList[sendTypeForData];
    Taro.showLoading({ title: "加载中...", mask: true });
    let _param = {
      count: [],
      shopMedicineId: []
    };
    medicineList.map(item => {
      _param.count.push(item.count);
      _param.shopMedicineId.push(item.medicineId);
    });

    httpRequest
      .get("sell_ordercart.editSettleCart", {
        shopMedicineId: _param.shopMedicineId.join(),
        quantity: _param.count.join()
      })
      .then(
        res => {
          let smInfos = [];
          if (res && res.MedicineList.length != 0) {
            res.MedicineList.map(item => {
              smInfos.push({
                cartId: item.CartId,
                amount: item.CarAmount,
                shopMedicineId: item.Id,
                nameCN: item.NameCN
              });
            });
          }
          let param = {
            memberId: this.state.memberId,
            shopId,
            thirdAccountId,
            shippingMethod: ShippingId,
            shippingMoney: ShippingMoney,
            pickAddress: addressInfo.address,
            needInvoice: needInvoice ? (elecFlag ? 2 : 1) : 0,
            invoiceCode: idcard,
            invoiceApplicant: invoiceHeader,
            discountTotal: dicountMoneyTotal,
            orderTotal,
            smInfos,
            rx_info: {
              diseaselist: inquiryInfo.diseaselist,
              drugid: inquiryInfo.drugid,
              disease_desc: inquiryInfo.disease_desc,
              case_url: inquiryInfo.case_url
            },
            inquiryNo,
            usePointsFlag
          };
          httpRequest.get("order.create_order", { ...param }).then(
            res => {
              let orderNo = res.orderNo;
              payMent.pay({ orderno: orderNo }).then(
                res => {
                  httpRequest
                    .get("common_payment.updatePayStatus", {
                      type: "wxpay",
                      orderno: orderNo
                    })
                    .then(
                      res => {
                        Taro.setStorageSync("orderRefresh", 1);
                        pushNavigation(
                          "orderDetail",
                          { OrderNo: orderNo },
                          "redirect"
                        );
                      },
                      error => {
                        Taro.setStorageSync("orderRefresh", 1);
                        pushNavigation(
                          "orderDetail",
                          { OrderNo: orderNo },
                          "redirect"
                        );
                      }
                    );
                },
                error => {
                  if (
                    error.errMsg &&
                    error.errMsg == "requestPayment:fail cancel"
                  ) {
                    Taro.showToast({
                      title: "您已取消支付",
                      icon: "none",
                      duration: 2000
                    });
                    setTimeout(() => {
                      Taro.setStorageSync("orderRefresh", 1);
                      pushNavigation(
                        "orderDetail",
                        { OrderNo: orderNo },
                        "redirect"
                      );
                    }, 500);
                  }
                }
              );
            },
            error => {
              Taro.showToast({
                title: error.msg || "提交失败,稍后重试",
                icon: "none",
                duration: 2000
              });
            }
          );
        },
        error => {
          Taro.hideLoading();
          Taro.showToast({
            title: error.msg || "提交失败,稍后重试",
            icon: "none",
            duration: 2000
          });
        }
      );
  }
  render() {
    const that = this;
    const {
      medicineList,
      sendTypeModalFlag,
      chooseSendTypeItem,
      yfwModalParams,
      rankModalFlag,
      brandFlag,
      invoiceFlag,
      needInvoice,
      shippingMethodList,
      sendTypeForData,
      customerInfo,
      usepoints,
      hasMember,
      elecFlag,
      dicountMoneyTotal,
      orderTotal,
      otherBrandsData,
      addressInfo,
      hasSick,
      BolPreOrder,
      IsInquiryOrder,
      showType
    } = this.state;
    let send_name,
      send_price = [];
    if (shippingMethodList && shippingMethodList.length != 0) {
      let { ShippingMethod, ShippingMoney } = shippingMethodList[
        sendTypeForData
      ];
      send_name = ShippingMethod;
      ShippingMoney = toDecimal(ShippingMoney);
      send_price = ShippingMoney.split(".");
    }
    let orderTotalArr = orderTotal;
    orderTotalArr = orderTotalArr.split(".");
    let _medicineList = JSON.parse(JSON.stringify(medicineList));
    if (!showType) {
      _medicineList.length = 3;
    }
    return (
      <View>
        <ScrollView className="submitOrder" scrollY>
          <YfwModal {...yfwModalParams} />
          {renderSendType(that)}
          {BolPreOrder && IsInquiryOrder != 1 && (
            <View className="rxInfo">
              <View className="rxInfo_top">
                <View className="medicine_type">处方药</View>
                <Text className="medicine_progress">
                  {"填写就诊信息 > 互联网医院开方 > 到店自提"}
                </Text>
              </View>
              <View className="rxInfo_bottom">
                <View className="rxInfo_bottom_left">
                  <View className="infoReady">
                    {hasSick ? "就诊信息已填写" : "请填写就诊信息"}
                  </View>
                  <View className="info_tip">
                    医生将根据您的就诊信息开具处方
                  </View>
                </View>
                <View
                  className="rxInfo_bottom_right"
                  onClick={this.addConsulationInfo.bind(this)}
                >
                  <Text className="rxInfo_bottom_right_text">
                    {hasSick ? "去修改" : "去填写"}
                  </Text>
                  <Image
                    className="rxInfo_bottom_right_pic"
                    src={require("../../images/right_gray.png")}
                  ></Image>
                </View>
              </View>
            </View>
          )}
          <View className="goods">
            <View className="goods_store">
              <View className="goods_store_left">{addressInfo.title}</View>
              {IsInquiryOrder == 1 && (
                <View
                  className="goods_store_right"
                  onClick={this.setbrandModal.bind(this, true)}
                >
                  <Text>更换品牌/厂家</Text>
                  <Image
                    className="goods_store_right_pic"
                    src={require("../../images/right_gray.png")}
                  ></Image>
                </View>
              )}
            </View>
            <View className="goodsList">
              {_medicineList.map((item, index) => {
                return (
                  <View className="goods_list_wrapper">
                    {<OrderListCard data={item} />}
                  </View>
                );
              })}
              {medicineList.length > 3 && (
                <View className="showOther">{renderShowOther(that)}</View>
              )}
            </View>
          </View>
          <View className="settlement">
            <View className="settlement_item">
              <View className="settlement_item_left">
                <Text className="settlement_item_left_title">配送方式</Text>
                <Text className="settlement_item_left_subtitle">
                  （{send_name}）
                </Text>
              </View>
              <View
                className="settlement_item_right"
                onClick={this.sendTypeModal.bind(this, true)}
              >
                <Text className="symbol">￥</Text>
                <Text className="settlement_item_right_int">
                  {send_price[0]}
                </Text>
                <Text className="settlement_item_right_float">
                  .{send_price[1]}
                </Text>
                <Image
                  className="settlement_item_right_icon"
                  src={require("../../images/arrow_right_small.png")}
                ></Image>
              </View>
            </View>

            {hasMember && renderMemberDiscount(that)}
            <View className="settlement_item border_bottom">
              <View className="settlement_item_left">
                <Text className="settlement_item_left_title">发票信息</Text>
                <Text className="settlement_item_left_subtitle">
                  （无需发票）
                </Text>
              </View>
              <View
                className="settlement_item_right"
                onClick={this.chooseInvoice.bind(this, true)}
              >
                <Text>
                  {needInvoice
                    ? elecFlag
                      ? "增值税电子普通发票"
                      : "增值税纸质普通发票"
                    : "去选择"}
                </Text>
                <Image
                  className="settlement_item_right_icon"
                  src={require("../../images/arrow_right_small.png")}
                ></Image>
              </View>
            </View>
            <View className="sum">
              {hasMember && (
                <Block>
                  <Text className="sum_info">已优惠</Text>
                  <Text className="sum_price">￥ {dicountMoneyTotal}</Text>
                </Block>
              )}
              <Text className="sum_text">小计</Text>
              <Text className="sum_int">￥ {orderTotalArr[0]}</Text>
              <Text className="sum_float">.{orderTotalArr[1]}</Text>
            </View>
          </View>
        </ScrollView>
        <View className="submit_bottom">
          <View className="submit_bottom_left">
            <View className="totalMoney">
              <Text className="totalMoney_title">合计</Text>
              <Text className="totalMoney_icon">￥</Text>
              <Text className="totalMoney_int">{orderTotalArr[0]}</Text>
              <Text className="totalMoney_float">.{orderTotalArr[1]}</Text>
            </View>
            {hasMember && (
              <View className="saved">已优惠￥ {dicountMoneyTotal}</View>
            )}
          </View>
          <View
            className="submit_bottom_right"
            onClick={this.commitOrder.bind(this)}
          >
            提交订单
          </View>
        </View>

        {/* 配送方式弹窗 */}
        <AtFloatLayout
          isOpened={sendTypeModalFlag}
          onClose={this.sendTypeModal.bind(this, false)}
        >
          <View className="sendModal">
            <View className="title">配送方式</View>
            <Image
              className="close"
              src={require("../../images/close_two.png")}
              onClick={this.sendTypeModal.bind(this, false)}
            ></Image>
            <View
              className="sendTypeList"
              onClick={this.chooseSendType.bind(this)}
            >
              {shippingMethodList.length != 0 &&
                shippingMethodList.map((item, index) => {
                  return (
                    <View
                      className={`sendTypeItem ${
                        item.choosed ? "choosed" : "unChoose"
                      }`}
                      data-id={index}
                    >
                      {item.ShippingMethod}
                    </View>
                  );
                })}
            </View>
            <View className="line"></View>
            {renderChooseType(that, chooseSendTypeItem)}
            <View
              className="operation"
              onClick={this.confirmSendType.bind(this)}
            >
              确定
            </View>
          </View>
        </AtFloatLayout>
        {/* 使用积分弹窗 */}
        <AtFloatLayout
          isOpened={rankModalFlag}
          onClose={this.setRankModal.bind(this, false)}
        >
          <View className="rankModal">
            <View className="title">使用积分</View>
            <Image
              className="close"
              src={require("../../images/close_two.png")}
              onClick={this.setRankModal.bind(this, false)}
            ></Image>
            <View className="ranktip">
              账户会员积分数：
              <Text className="num">{customerInfo.CurrentPoint}</Text>
            </View>
            <View className="line"></View>
            <View className="ranklist">
              <View
                className="ranklist_item"
                onClick={this.choosedRank.bind(this, true)}
              >
                <View className="ranklist_item_left">
                  使用{customerInfo.canUsePoint}积分，抵扣
                  <Text className="important">
                    ￥{customerInfo.canUseMoney}
                  </Text>
                </View>
                <View
                  className="ranklist_item_right"
                  style={`${usepoints ? "box-shadow:none" : ""}`}
                >
                  {usepoints && (
                    <Image
                      className="choosed"
                      src={require("../../images/choosed.png")}
                    ></Image>
                  )}
                </View>
              </View>
              <View
                className="ranklist_item"
                onClick={this.choosedRank.bind(this, false)}
              >
                <View className="ranklist_item_left">不使用积分</View>
                <View
                  className="ranklist_item_right"
                  style={`${!usepoints ? "box-shadow:none" : ""}`}
                >
                  {!usepoints && (
                    <Image
                      className="choosed"
                      src={require("../../images/choosed.png")}
                    ></Image>
                  )}
                </View>
              </View>
            </View>
            <View className="operation" onClick={this.conFirmRank.bind(this)}>
              确定
            </View>
          </View>
        </AtFloatLayout>
        {/* 更换品牌厂家 */}
        <AtFloatLayout
          isOpened={brandFlag}
          onClose={this.setbrandModal.bind(this, false)}
        >
          <View className="brandModal">
            <View className="title">更换品牌/厂家</View>
            <ScrollView className="list" scrollY>
              {otherBrandsData.map((item, index) => {
                return (
                  <View className="list_item">
                    <View className="list_item_title">
                      {item[0].name || ""}
                    </View>
                    {item.map((k, i) => {
                      return (
                        <View
                          className="list_item_content_wrapper"
                          onClick={this.chooseBrand.bind(this, index, i)}
                        >
                          <View className="left">
                            <View
                              className="choose"
                              style={`${k.choosed ? "box-shadow:none" : ""}`}
                            >
                              {k.choosed && (
                                <Image
                                  className="choosed"
                                  src={require("../../images/choosed.png")}
                                ></Image>
                              )}
                            </View>
                            <View className="medicine">
                              <Image
                                className="img"
                                mode="withFix"
                                src={k.intorImage}
                              ></Image>
                            </View>
                            <View className="info">
                              <View className="partOne">
                                <Image
                                  className="medicine_type"
                                  src={require("../../images/otc.png")}
                                ></Image>
                                <View className="name textover">
                                  <Text>{k.brand} </Text>
                                  <Text>{k.name}</Text>
                                </View>
                              </View>
                              <View className="standard">
                                <Text>{k.standard_name} </Text>
                                <Text>{k.standard_type}</Text>
                              </View>
                              <View className="company textover">
                                {k.companyName}
                              </View>
                            </View>
                          </View>
                          <View className="right">￥ {k.retailPrice}</View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
            <Image
              className="close"
              src={require("../../images/close_two.png")}
              onClick={this.setbrandModal.bind(this, false)}
            ></Image>
            <View className="operation" onClick={this.confirmBrands.bind(this)}>
              确定
            </View>
          </View>
        </AtFloatLayout>
        {/* 选择发票弹窗 */}
        <AtFloatLayout
          isOpened={invoiceFlag}
          onClose={this.chooseInvoice.bind(this, false)}
        >
          <View
            className={`invoiceModal ${
              needInvoice ? "hasInvoiceHeight" : "noInvoiceHeight"
            }`}
          >
            <View className="title">填写发票信息</View>
            <Image
              className="close"
              src={require("../../images/close_two.png")}
              onClick={this.chooseInvoice.bind(this, false)}
            ></Image>
            <View className="itme_title">发票选择</View>
            <View
              className="invoice_isneed"
              onClick={this.invoiceClick.bind(this)}
            >
              <View
                className={`invoice_item_content ${
                  needInvoice ? "" : "choosed_invoice"
                }`}
                data-type="notneed"
              >
                无需发票
              </View>
              <View
                className={`invoice_item_content ${
                  needInvoice ? "choosed_invoice" : ""
                }`}
                data-type="need"
              >
                需要发票
              </View>
            </View>
            {needInvoice && renderInvoiceInfo(that)}
            <View
              className="operation invoice_btn"
              onClick={this.conFirmInvoice.bind(this)}
            >
              确定
            </View>
          </View>
        </AtFloatLayout>
      </View>
    );
  }
}
export default connect(
  ({ globalData }) => ({
    globalData
  }),
  dispatch => ({
    changeState(data) {
      dispatch(changeState(data));
    }
  })
)(SubmitOrder);
//地址
const renderSendType = that => {
  const { sendType, addressInfo, distance } = that.state;
  if (sendType == "storeSend") {
    //暂无商家配送
    //商家配送
    if (0) {
      //有默认地址
      return (
        <View className="hasAddress" onClick={that.chooseAddress}>
          <View className="address_label">
            {["默认", "家"].map(item => {
              let text_color,
                bg_color = "";
              if (item == "默认") {
                text_color = "#eb3131";
                bg_color = "#ffe3e3";
              } else if (item == "家") {
                text_color = "#00b187";
                bg_color = "#e9fff8";
              }
              return (
                <View
                  className="label"
                  style={`background:${bg_color};color:${text_color}`}
                >
                  {item}
                </View>
              );
            })}
            <View className="address_city">上海市浦东新区康桥镇</View>
          </View>
          <View className="addresss_center">
            <View className="hasAddress_left">
              康弘路508弄 康桥宝邸康桥宝邸 26号202室
            </View>
            <Image
              className="hasAddress_right"
              src={require("../../images/right_gray.png")}
            ></Image>
          </View>
          <View className="nameAndPhone">
            <Text className="name">孙晓峰</Text>
            <Text className="phone">13023199150</Text>
          </View>
        </View>
      );
    }

    return (
      <View className="noAddress" onClick={that.chooseAddress}>
        <View className="noAddress_left">
          <Image
            class="noAddress_left_pic"
            src={require("../../images/write_green.png")}
          ></Image>
          <Text className="noAddress_left_text">请填写收货地址</Text>
        </View>
        <Image
          className="noAddress_right"
          src={require("../../images/right_gray.png")}
        ></Image>
      </View>
    );
  }
  //自提

  return (
    <View className="getBySelf_wrapper">
      <View className="getBySelf">
        <View className="getBySelf_left_area">
          <View className="getBySelf_text">自提地址</View>
          <View className="getBySelf_left">{addressInfo.address}</View>
          <View className="callToStore">
            <View
              onClick={that.phoneCall.bind(that, addressInfo.phone)}
              className="phonecall"
            >
              <Image
                className="callToStore_pic"
                src={require("../../images/storePhone.png")}
              ></Image>
              <Text className="callToStore_text">联系商家</Text>
            </View>
          </View>
        </View>
        <View className="getBySelf_right_area">
          <View className="getBySelf_center">
            <View className="storeDistance">
              <Image
                className="getBySelf_right"
                src={addressInfo.logo_image_url}
                mode="widthFix"
              ></Image>
              <View className="hideBtns_wrapper">
                <View className="hide_btns">{`距您${distance}`}</View>
                <View className="arrow"></View>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View className="getBySelf_tip">
        <Text className="getBySelf_tip_text">
          已选择自提，下单后可凭提货码到店取货
        </Text>
      </View>
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
      展开（共{medicineList.length}件）
      <Image
        className="showOther_icon"
        src={require("../../images/arraw_down.png")}
      ></Image>
    </View>
  );
};

//商家配送还是自提
const renderChooseType = (that, chooseSendTypeItem) => {
  const { distance, addressInfo, shippingMethodList } = that.state;
  if (shippingMethodList.length == 0) return;
  if (shippingMethodList[chooseSendTypeItem]["id"] == 1) {
    return (
      <Block>
        <View className="list_title">送货时间</View>
        <View className="list_content">
          工作日、双休日与假日均可送货工作日、双休日与假日均可送货工作日、双休日与假日均可送货工作日、双休日与假日均可送货
        </View>
      </Block>
    );
  }
  return (
    <Block>
      <View className="list_title">自提地点</View>
      <View className="list_content">{addressInfo.address}</View>
      <View className="list_title">营业时间</View>
      <View className="list_content">{addressInfo.business_hours}</View>
      <View className="list_title">自提距离</View>
      <View className={`list_content`}>{`距您${distance}`}</View>
    </Block>
  );
};

//需要发票的时候  填写发票信息
const renderInvoiceInfo = that => {
  const { elecFlag, invoiceHeader, idcard } = that.state;
  return (
    <ScrollView scrollY className="invoice_scroll">
      <View className="invoice_type_title itme_title">发票类型</View>
      <View className="invoice_type" onClick={that.invoiceTypeClick.bind(that)}>
        <View
          className={`invoice_type_content ${
            elecFlag ? "choosed_invoice" : ""
          }`}
          data-type="elec"
        >
          增值税电子普通发票
        </View>
        <View
          className={`invoice_type_content ${
            elecFlag ? "" : "choosed_invoice"
          }`}
          data-type="paper"
        >
          增值税纸质普通发票
        </View>
      </View>
      <View className="invoiceTitle">
        电子普通发票与纸质普通发票具有同等效力，可支持报销入账
      </View>
      <View className="invoiceTitle">
        电子普通发票在发货后的2日内开具，若商家未开具，可联系商家开出。
      </View>
      <View className="invoice_head itme_title">发票抬头</View>
      <View className="invoice_head_content">个人</View>
      <View className="invoice_head itme_title">开票信息</View>
      <View className="invoice_content_item">
        <View className="invoice_content_item_left">抬头内容</View>
        <View className="invoice_content_item_right">
          <Input
            type="text"
            placeholder={`请填写个人名称或“个人”`}
            value={invoiceHeader}
            onInput={that.invoiceHeaderInput.bind(that)}
          />
        </View>
      </View>
      <View className="invoice_content_item">
        <View className="invoice_content_item_left">身份证号</View>
        <View className="invoice_content_item_right">
          <Input
            type="idcard"
            placeholder="请填写个人身份证号"
            maxlength="18"
            value={idcard}
            onInput={that.idcardInput.bind(that)}
          />
        </View>
      </View>
      <View className="invoice_content_item">
        <View className="invoice_content_item_left">发票内容</View>
        <View className="invoice_content_item_right black_text">商品明细</View>
      </View>
      <View className="invoice_notice">发票须知:</View>
      <View className="invoice_notice_item">
        1.发票金额不含优惠券、满减、积分等优惠扣减金额；
      </View>
    </ScrollView>
  );
};

//会员优惠 折扣信息
const renderMemberDiscount = that => {
  const { customerInfo } = that.state;
  let { moneyFlag, rankTitle, canUseMoney, discountPrice } = customerInfo;
  canUseMoney = toDecimal(canUseMoney);
  discountPrice = toDecimal(discountPrice);
  canUseMoney = canUseMoney && canUseMoney.split(".");
  discountPrice = discountPrice && discountPrice.split(".");
  return (
    <Block>
      <View className="settlement_item">
        <View className="settlement_item_left">
          <Text className="settlement_item_left_title">会员优惠</Text>
          <Text className="settlement_item_left_subtitle">
            （{customerInfo.discount}）
          </Text>
        </View>
        <View className="settlement_item_right">
          <Text className="symbol">-￥</Text>
          <Text className="settlement_item_right_int">{discountPrice[0]}</Text>
          <Text className="settlement_item_right_float">
            .{discountPrice[1]}
          </Text>
          <Image className="settlement_item_right_icon" src={null}></Image>
        </View>
      </View>

      <View className="settlement_item">
        <View className="settlement_item_left">
          <Text className="settlement_item_left_title">会员积分</Text>
          <Text className="settlement_item_left_subtitle">
            （共{customerInfo.CurrentPoint}积分）
          </Text>
        </View>
        <View
          className="settlement_item_right"
          onClick={that.setRankModal.bind(that, true)}
        >
          {!moneyFlag && <Text className="rankTitle">{rankTitle}</Text>}
          {moneyFlag && renderUseRank(that, canUseMoney)}

          <Image
            className="settlement_item_right_icon"
            src={require("../../images/arrow_right_small.png")}
          ></Image>
        </View>
      </View>
    </Block>
  );
};

const renderUseRank = (that, canUseMoney) => {
  const { usePointsFlag } = that.state;
  if (usePointsFlag) {
    return (
      <Block>
        <Text className="symbol">-￥</Text>
        <Text className="settlement_item_right_int">{canUseMoney[0]}</Text>
        <Text className="settlement_item_right_float">.{canUseMoney[1]}</Text>
      </Block>
    );
  }
  return <Text className="rankTitle">{"不使用积分"}</Text>;
};
