import { Component } from "react";
import { View, Image, Text, ScrollView, Slider } from "@tarojs/components";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import "./consultationDetail.less";
import { HTTP } from "../../utils/http";
import { toDecimal } from "../../utils/YFWPublicFunction";
import topWait from "../../images/wz_wait.png";
import topIng from "../../images/wz_ing.png";
import topOk from "../../images/recipeStatusIconGreen.png";
import wrong from "../../images/wrong.png";
import bg_orange from "../../images/bg_orange.png";
import bg_red from "../../images/bg_red.png";
import bg_green from "../../images/bg_green.png";
import bg_gray from "../../images/bg_gray.png";
import { pushNavigation } from "../../apis/YFWRouting";
import {config} from '../../config.js'
const httpRequest = new HTTP();
import { Payment } from "../../utils/payment";
const payMent = new Payment();
export default class ConsultationDetail extends Component {
  constructor() {
    super();
    this.state = {
      DoctorHospital: "", //医院
      inquiryId: "",
      btnArr: [],
      inquiryType: "", //问诊类型
      playSetinterval: null,
      currentMin: "00",
      currentSec: "00",
      audioValue: 0,
      playStatus: 2,
      description: "", //病情
      sexName: "", //性别
      age: "", //年龄
      name: "", //姓名
      doctorImage: "", //医师头像
      inquiryNo: "", //问诊单号
      payTime: "", //支付时间
      doctorName: "", //医生姓名
      doctorPosition: "", //医师职位
      department: "", //医生部门
      paymentName: "", //支付方式
      create_time: "", //下单时间
      totalPrice: "", //实付金额
      inquiryPrice: "", //问诊金额
      create_time: "", //下单时间
      inquiryStatusName: "", //问诊状态
      medicalCertificateUrl: [],
      topArr: {
        cancelInquiry: {
          tippic: wrong,
          tiptext: "已取消...",
          topBg: bg_gray
        },
        waitInquiry: {
          tippic: topWait,
          tiptext: "待问诊...",
          topBg: bg_orange
        },
        notPay: {
          tippic: topWait,
          tiptext: "待支付...",
          topBg: bg_orange
        },
        onInquiry: {
          tippic: topIng,
          tiptext: "诊疗中...",
          topBg: bg_red
        },
        finishInquiry: {
          tippic: topOk,
          tiptext: "已完成...",
          topBg: bg_green
        }
      },
      inquiryStatusNameen: "" //就诊类型
    };
  }
  componentWillMount() {

    let that = this;
    // if (process.env.TARO_ENV == "weapp") {
    //   let innerAudioContext = wx.createInnerAudioContext();
    //   innerAudioContext.autoplay = false;
    //   innerAudioContext.src = "http://down.kjzhan.com/soft2020/d1/4x.mp3";
    //   innerAudioContext.play();
    //   innerAudioContext.pause();
    //   innerAudioContext.onPlay(() => {
    //     console.log("innerAudioContext", innerAudioContext);
    //     clearInterval(that.state.playSetinterval);
    //     that.state.playSetinterval = setInterval(() => {
    //       let progress,
    //         innerAudioContext = that.state.innerAudioContext;
    //       console.log("e.currentTime", innerAudioContext.currentTime);
    //       let _tiem = parseInt(innerAudioContext.currentTime);
    //       if (_tiem != undefined) {
    //         progress = parseInt((100 * _tiem) / innerAudioContext.duration);
    //       } else {
    //         progress = 0;
    //       }
    //       var currentMin = parseInt(_tiem / 60),
    //         currentSec = parseInt(_tiem % 60);
    //       if (currentMin.toString().length == 1) {
    //         currentMin = `0${currentMin}`;
    //       } else {
    //         currentMin = `${currentMin}`;
    //       }
    //       if (currentSec.toString().length == 1) {
    //         currentSec = `0${currentSec}`;
    //       } else {
    //         currentSec = `${currentSec}`;
    //       }
    //       that.setState({
    //         audioValue: progress,
    //         currentMin,
    //         currentSec
    //       });
    //     }, 1000);
    //   });
    //   innerAudioContext.onPause(() => {
    //     console.log("pause");
    //   });
    //   innerAudioContext.onEnded(() => {
    //     setTimeout(() => {
    //       clearInterval(that.state.playSetinterval);
    //       this.setState({
    //         audioValue: 0,
    //         currentMin: "00",
    //         currentSec: "00",
    //         playStatus: 2
    //       });
    //     }, 3000);
    //   });
    //   innerAudioContext.onCanplay(() => {
    //     var durationInterval = setInterval(() => {
    //       if (innerAudioContext.duration) {
    //         this.state.duration = innerAudioContext.duration;
    //         let timeArr = this.transTimeToClock(innerAudioContext.duration);
    //         that.setState({
    //           minTime: timeArr[0],
    //           secTime: timeArr[1]
    //         });
    //         clearInterval(durationInterval);
    //       }
    //     }, 500);
    //   });
    //   innerAudioContext.onError(res => {
    //     console.log(res.errMsg);
    //     console.log(res.errCode);
    //   });
    //   this.state.innerAudioContext = innerAudioContext;
    // }
  }
  getData(inquiryNo) {
    httpRequest
      .get("sell_inquiry.getInquiryDetail", { inquiryNo })
      .then(res => {
        Taro.hideLoading();
        this.state.topArr[res.InquiryStatusNameen].tiptext =
          res.InquiryStatusName;
        this.setState({
          description: res.Description,
          sexName: res.SexName,
          age: res.Age,
          name: res.Name,
          doctorImage: res.DoctorImage,
          inquiryNo: res.InquiryNo,
          payTime: res.PayTime.indexOf("1900") != -1 ? "" : res.PayTime,
          doctorName: res.DoctorName,
          doctorPosition: res.DoctorPosition,
          department: res.Department,
          paymentName: res.PaymentName,
          create_time: res.create_time,
          totalPrice: res.TotalPrice,
          inquiryPrice: res.InquiryPrice,
          inquiryStatusName: res.InquiryStatusName,
          medicalCertificateUrl:
            (res.MedicalCertificateUrl &&
              res.MedicalCertificateUrl.split("|")) ||
            [],
          inquiryStatusNameen: res.InquiryStatusNameen,
          inquiryType: res.InquiryType,
          btnArr: res.Buttons,
          inquiryId: res.InquiryId,
          topArr: this.state.topArr,
          DoctorHospital: res.DoctorHospital
        });
      });
  }
  transTimeToClock(time) {
    let min = parseInt(time / 60),
      sec = parseInt(time % 60);
    //小程序无法使用padstart，采用以下方式补全时间格式
    if (min.toString().length == 1) {
      min = `0${min}`;
    } else {
      min = `${min}`;
    }
    if (sec.toString().length == 1) {
      sec = `0${sec}`;
    } else {
      sec = `${sec}`;
    }
    return [min, sec];
  }

  componentDidMount() {
    clearInterval(this.state.playSetinterval);
  }

  componentWillUnmount() {}

  componentDidShow() {
    let instance = getCurrentInstance();
    const { inquiryNo } = instance.router.params;
    if (inquiryNo) {
      Taro.showLoading({ title: '加载中...' ,mask:true})
      this.getData(inquiryNo);
    }
  }

  componentDidHide() {
    clearInterval(this.state.playSetinterval);
  }
  clickDotContent() {
    Taro.showLoading({ title: '加载中...' ,mask:true})
    httpRequest
      .get("sell_inquiry.delete", { inquiryNo: this.state.inquiryNo })
      .then(
        res => {
          Taro.showToast({
            title: "删除成功",
            icon: "success",
            duration: 2000
          });
          Taro.setStorageSync("refreshConsulationPage", 1);
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        },
        error => {
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
  dotClick() {
    this.setState({
      showDot: !this.state.showDot
    });
  }
  dragAudioSlider(e) {
    if (e.detail.value == 100) {
      console.log("拖拽到100");
      this.state.innerAudioContext.stop();
      clearInterval(this.state.playSetinterval);
      this.state.playStatus = 2;
      this.setState({
        currentMin: "00",
        currentSec: "00",
        playStatus: 2,
        audioValue: 0
      });
      return;
    }
    this.setState({
      audioValue: e.detail.value
    });
    let _seek = parseFloat((this.state.duration * e.detail.value) / 100);
    let timeArr = this.transTimeToClock(_seek);
    this.setState({
      minTime: timeArr[0],
      secTime: timeArr[1]
    });
    this.state.innerAudioContext.seek(_seek);
    this.state.innerAudioContext.play();
  }
  changeStatus() {
    const { playStatus } = this.state;
    if (playStatus == 1) {
      this.state.playStatus = 2;
      this.state.innerAudioContext.pause();
    } else {
      this.state.playStatus = 1;
      this.state.innerAudioContext.play();
    }
    this.setState({
      playStatus: playStatus == 1 ? 2 : 1
    });
  }
  audioChange() {
    clearInterval(this.state.playSetinterval);
    this.state.innerAudioContext.pause();
  }
  showBig(current) {
    const { medicalCertificateUrl } = this.state;
    Taro.previewImage({
      urls: medicalCertificateUrl,
      current
    });
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
  btnClick({ value }) {
    Taro.showLoading({ title: '加载中...' ,mask:true})
    Taro.setStorageSync("refreshConsulationPage", 1);
    if (value == "inquiryToo") {
      pushNavigation("addConsultation", { InquiryNo: this.state.inquiryNo });
    } else if (value == "cancelOrder") {
      httpRequest
        .get("sell_inquiry.cancel", { inquiryNo: this.state.inquiryNo })
        .then(
          res => {
            Taro.showToast({
              title: "已取消问诊单",
              icon: "success",
              duration: 2000
            });
            this.getData(this.state.inquiryNo);
          },
          error => {
            Taro.showToast({
              title: error.msg || "取消问诊单失败",
              icon: "none",
              duration: 2000
            });
          }
        );
    } else if (value == "payOrder") {
      this.pay(this.state.inquiryNo);
    } else if (value == "applyReturn") {
      this.applyReturn(this.state.inquiryNo);
    } else if (value == "gotoInquiry") {
      this.gotoInquiry(this.state.inquiryNo);
    } else if (value == "inquiryPre") {
      this.inquiryPre(this.state.inquiryNo);
    }
  }
  inquiryPre(inquiryNo) {
    pushNavigation("recipedetails", { inquiryNo });
  }
  gotoInquiry(inquiryNo) {
    if (this.state.inquiryId) {
      let that = this;
      wx.navigateToMiniProgram({
        appId: "wxb6f8454c1c26e2e4",
        path:
          "page/pages/YZMessageModule/YZMessageChatPage/YZMessageChatPage?caseNo=" +
          this.state.inquiryId,
        extraData: {},
        envVersion: config.env_version,
        complete(res) {
          that.getData(inquiryNo);
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
        this.getData(this.state.inquiryNo);
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
              this.getData(this.state.inquiryNo);
            },
            error => {
              this.getData(this.state.inquiryNo);
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
      showDot,
      description,
      doctorImage,
      name,
      sexName,
      age,
      inquiryNo,
      payTime,
      paymentName,
      create_time,
      totalPrice,
      inquiryPrice,
      doctorName,
      doctorPosition,
      department,
      medicalCertificateUrl,
      topArr,
      inquiryStatusNameen,
      inquiryType,
      btnArr,
      DoctorHospital,
      DoctorHospitalLevel
    } = this.state;
    let totalPriceArr = toDecimal(totalPrice);
    totalPriceArr = totalPriceArr.split(".");
    let inquiryPriceArr = toDecimal(inquiryPrice);
    inquiryPriceArr = inquiryPriceArr.split(".");
    let consulationObj = {};
    if (inquiryStatusNameen) {
      consulationObj = topArr[inquiryStatusNameen] || {};
    }
    return (
      <View className="consultationDetail">
        <View className="topContent">
          <View className="status">
            <Image className="status_img" src={consulationObj.topBg}></Image>
            <View className="status_text">
              <Image
                className="status_text_pic"
                src={consulationObj.tippic}
                mode="heightFix"
              ></Image>
              <View className="status_text_content">
                {consulationObj.tiptext}
              </View>
            </View>
          </View>
        </View>
        <ScrollView className="wrapper" scrollY>
          <View className="doctor_info">
            {inquiryType == "极速问诊" && (
              <Image
                className="jswz"
                src={require("../../images/jswz.png")}
              ></Image>
            )}

            <Image className="doctor_ava" src={doctorImage}></Image>
            <View className="doctor_job">
              <View className="doctor_name">
                {doctorName}
                <Text className="doctor_level">{doctorPosition}</Text>
              </View>
              <View className="doctor_company">
                {DoctorHospitalLevel && (
                  <View className="company_level">{DoctorHospitalLevel}</View>
                )}

                <View className="doctor_company_name">
                  {DoctorHospital}
                  <Text className="doctor_belong">{department}</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="consultation_detail">
            <View className="sick flexrow">
              <View className="consultationDetail_item_left">患者</View>
              <View className="sick_right consultationDetail_item_right">
                {`${name} ${sexName} ${age}岁`}
              </View>
            </View>
            <View className="disease flexrow">
              <View className="consultationDetail_item_left">病情</View>
              <View className="disease_right consultationDetail_item_right">
                {description}
              </View>
            </View>
            <View className="picarr flexrow">
              <View className="consultationDetail_item_left"></View>
              <View className="disease_right consultationDetail_item_right">
                {medicalCertificateUrl.map(item => {
                  return (
                    <Image
                      className="rx_pic"
                      src={item}
                      onClick={this.showBig.bind(this, item)}
                    ></Image>
                  );
                })}
              </View>
            </View>
          </View>
          <View className="order_detail">
            <View className="order_no flexrow">
              <View className="consultationDetail_item_left">问诊单号</View>
              <View className="consultationDetail_item_right">
                <Text>{inquiryNo}</Text>
                <Image
                  src={require("../../images/copy.png")}
                  className="copy"
                  onClick={this.copyText.bind(this, inquiryNo)}
                ></Image>
              </View>
            </View>
            <View className="order_time flexrow">
              <View className="consultationDetail_item_left">下单时间</View>
              <View className="consultationDetail_item_right">
                {create_time}
              </View>
            </View>
            <View className="pay_mode flexrow">
              <View className="consultationDetail_item_left">支付方式</View>
              <View className="consultationDetail_item_right">
                {paymentName}
              </View>
            </View>
            <View className="pay_time flexrow">
              <View className="consultationDetail_item_left">支付时间</View>
              <View className="consultationDetail_item_right">{payTime}</View>
            </View>
            <View className="consultation_money flexrow">
              <View className="consultationDetail_item_left">问诊金额</View>
              <View className="consultationDetail_item_right">
                <Text className="money_sumbol">￥</Text>
                <Text className="money_int">{inquiryPriceArr[0]}.</Text>
                <Text className="money_float">{inquiryPriceArr[1]}</Text>
              </View>
            </View>
            {/* <View className="consultation_coupon flexrow">
              <View className="consultationDetail_item_left">问诊券</View>
              <View className="consultationDetail_item_right">
                <Text className="money_sumbol">-￥</Text>
                <Text className="money_int">12.</Text>
                <Text className="money_float">99</Text>
              </View>
            </View> */}
            <View className="pay_money">
              <Text className="pay_title">实付金额</Text>
              <Text className="money_sumbol">￥</Text>
              <Text className="money_int">{totalPriceArr[0]}.</Text>
              <Text className="money_float">{totalPriceArr[1]}</Text>
            </View>
            {/* <View className="radio flexrow">
              <View className="radio_left">问诊录音</View>
              <View className="radio_right">正在生成，请耐心等待</View>
            </View> */}
          </View>
          {/* {[1].map(item => {
            return <View className="radio_wrapper">{renderRadio(that)}</View>;
          })} */}
        </ScrollView>
        <View className="bottom_area">
          <View className="other" onClick={this.dotClick.bind(this)}>
            <Image
              className="dot"
              src={require("../../images/dot.png")}
            ></Image>
            <View
              className="hideBtns_wrapper"
              style={`display:${showDot ? "flex" : "none"}`}
            >
              <View className="hide_btns">
                {["删除"].map(w => {
                  return (
                    <View
                      className="hide_btns_item"
                      onClick={this.clickDotContent.bind(this)}
                    >
                      {w}
                    </View>
                  );
                })}
              </View>
              <View className="arrow"></View>
            </View>
          </View>
          <View className="btns">
            {btnArr.map(item => {
              return (
                <View
                  className={`btn ${item.color ? "greenbtn" : ""}`}
                  onClick={this.btnClick.bind(this, item)}
                >
                  {item.text}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}
const renderRadio = that => {
  const {
    audioValue,
    minTime,
    secTime,
    currentMin,
    currentSec,
    playStatus
  } = that.state;
  let playpic =
    playStatus == 1
      ? require("../../images/choosed.png")
      : require("../../images/close_two.png");
  return (
    <View>
      <View className="radio_content">
        <View className="radio_top">
          <View className="radio_top_left">
            <View className="radio_name">问诊录音</View>
            <View className="radio_time">2020-11-12 18:20:56</View>
          </View>
          <Image
            className="radio_top_right"
            src={playpic}
            onClick={that.changeStatus.bind(that)}
          />
        </View>
      </View>
      <Slider
        onChange={that.dragAudioSlider.bind(that)}
        activeColor="#00b187"
        block-size="12"
        value={audioValue}
        onChanging={that.audioChange.bind(that)}
      />
      <View className="radio_tota_time">
        <View className="radio_tota_time_left">
          {`${currentMin || "00"}:${currentSec || "00"}`}
        </View>
        <View className="radio_tota_time_right">
          {`${minTime || "00"}:${secTime || "00"}`}
        </View>
      </View>
    </View>
  );
};
