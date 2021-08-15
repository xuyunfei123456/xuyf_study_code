import { Component } from "react";
import {
  View,
  Text,
  Image,
  Button,
  ScrollView,
  Block
} from "@tarojs/components";
import "./recipeDetails.less";
import { HTTP } from "../../utils/http";
import topIng from "../../images/recipeStatusIconPending.png";
import topOk from "../../images/recipeStatusIconGreen.png";
import topOkWhite from '../../images/recipeStatusIconWhite.png';
import wrong from "../../images/wrong.png";
import bg_orange from "../../images/bg_orange.png";
import bg_green from "../../images/bg_green.png";
import bg_gray from "../../images/bg_gray.png";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import { pushNavigation } from "../../apis/YFWRouting";
const httpRequest = new HTTP();
export default class PrescriptionDetails extends Component {
  constructor() {
    super();
    this.state = {
      medicineList: [],
      topArr: {
        isExpired: {
          tippic: wrong,
          tiptext: "已过期",
          topBg: bg_gray,
          des: ""
        },
        alreadyUsed: {
          tippic: topOkWhite,
          tiptext: "已使用",
          topBg: bg_gray
        },
        auditPass: {
          tippic: topOk,
          tiptext: "审核通过",
          topBg: bg_green
        },
        audit: {
          tippic: topIng,
          tiptext: "审核中...",
          topBg: bg_orange
        }
      }
    };
  }
  componentWillMount() {
    const instance = getCurrentInstance();
    const { inquiryNo } = instance.router.params;
    if (inquiryNo) {
      Taro.showLoading({ title: '加载中...' ,mask:true})
      this.getData(inquiryNo);
    }
  }
  bigImage() {
    Taro.previewImage({
      urls: [this.state.InquiryUrl],
      current: 1
    });
  }
  getData(inquiryNo) {
    httpRequest
      .get("sell_inquiry.getInquiryPreInfo", { inquiryNo })
      .then(res => {
        const {
          InquiryNo,
          DiagnosticResult,
          Age,
          Name,
          Department,
          DoctorName,
          SexName,
          PrescriptionTime,
          PharmacistName,
          PrescriptionType,
          DoctorHospital,
          PrescriptionEndTime,
          PrescriptionNo,
          InquiryUrl,
          InquiryStatusNameen
        } = res;
        this.state.topArr[res.InquiryStatusNameen].tiptext =
          res.InquiryStatusName;
        this.state.topArr[res.InquiryStatusNameen].des = res.InquiryStatusDesc;
        let medicineList = res.MedicineList;
        this.setState(
          {
            InquiryUrl,
            InquiryNo,
            DiagnosticResult,
            Age,
            Name,
            Department,
            DoctorName,
            SexName,
            PrescriptionTime,
            PharmacistName,
            topArr: this.state.topArr,
            InquiryStatusNameen,
            medicineList,
            PrescriptionType,
            DoctorHospital,
            PrescriptionEndTime,
            PrescriptionNo
          },
          () => {
            const query = Taro.createSelectorQuery()
              .select("#auditWrapper")
              .boundingClientRect();
            query.exec(res => {
              console.log(res);
            });
          }
        );
        Taro.hideLoading();
      });
  }
  componentDidMount() {}
  componentWillUnmount() {}
  componentDidShow() {}
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
  buyMedicine() {
    pushNavigation("submitOrder", { inquiryNo: this.state.InquiryNo });
  }
  componentDidHide() {}
  render() {
    const {
      DiagnosticResult,
      Age,
      Name,
      Department,
      DoctorName,
      SexName,
      PrescriptionTime,
      PharmacistName,
      topArr,
      medicineList,
      PrescriptionType,
      DoctorHospital,
      PrescriptionEndTime,
      PrescriptionNo,
      InquiryUrl,
      InquiryStatusNameen
    } = this.state;
    let topObj = topArr[InquiryStatusNameen] || {};
    return (
      <View className="wrapper">
        <View className="recipeStatus">
          <Image className="status_img" src={topObj.topBg}></Image>
          <View className="recipeStatusTxt">
            <Image
              mode="heightFix"
              src={topObj.tippic}
              className="recipeStatusIcon"
            ></Image>
            <View>
              <View className="recipeStatusBig">{topObj.tiptext}</View>
              <View className="recipeStatusSmall">{topObj.des}</View>
            </View>
          </View>
        </View>
        <ScrollView
          className={`center-view ${
            InquiryStatusNameen == "auditPass" ? "" : "bottommone"
          }`}
          scrollY
        >
          <View className="sort-cont">
            <View className="recipeId">
              <View>
                处方ID:<Text>{PrescriptionNo}</Text>
                <Image
                  className="copy"
                  src={require("../../images/copy.png")}
                  onClick={this.copyText.bind(this, PrescriptionNo)}
                ></Image>
              </View>
            </View>
            {InquiryUrl && InquiryStatusNameen!=audit&& (
              <Button className="orgBtn" onClick={this.bigImage.bind(this)}>
                原始处方
              </Button>
            )}
          </View>
          <View className="center_view_wrapper">
            <View className="line"></View>
            <View className="recipeList-head">
              <View className="recipeList-title">
                <View className="title-bold">电子处方笺</View>
                <View className="recipeList-hospital">{DoctorHospital}</View>
              </View>
              <View className="recipeList-drug-type">{PrescriptionType}</View>
            </View>
            <View
              className={`grayWrapper ${
                ['isExpired','alreadyUsed'].includes(InquiryStatusNameen) ?  "opacityCss" : ""
              }`}
            >
              <View className="recipeList-user">
                <View className="userItem">
                  <View>
                    姓名:<Text className="text">{Name}</Text>
                  </View>
                  <View>
                    性别:<Text className="text">{SexName}</Text>
                  </View>
                  <View>
                    年龄:<Text className="text">{Age}</Text>
                  </View>
                </View>
                <View className="userItem">
                  <View>
                    科室:<Text className="text">{Department}</Text>
                  </View>
                  <View>
                    开具时间:<Text className="text">{PrescriptionTime}</Text>
                  </View>
                </View>
              </View>
              <View className="recipeList-result">
                <View className="result-title">诊断结果</View>
                <View className="result-del">{DiagnosticResult}</View>
              </View>
              <View className="recipeList-usage">
                <View className="usage-title">
                  <Image
                    mode="widthFix"
                    className="usage-ro"
                    src={require("../../images/rp.png")}
                  ></Image>
                  <Text className="text">普通药品处方</Text>
                </View>
                <View className="auditWrapper" id="auditWrapper">
                  {InquiryStatusNameen == "audit" && (
                    <View className="audit-shadow">审核中...</View>
                  )}

                  {medicineList.map(item => {
                    return (
                      <View className="usageItem">
                        <View className="goodsDel">
                          <View
                            className={`${
                              InquiryStatusNameen == "audit"
                                ? "textShadow"
                                : "goods"
                            }`}
                          >{`${item.NameCN + item.Standard}`}</View>
                          <View
                            className={`${
                              InquiryStatusNameen == "audit"
                                ? "textShadow"
                                : "num"
                            }`}
                          >
                            X{item.PrescriptionQty}
                          </View>
                        </View>
                        <View
                          className={`${
                            InquiryStatusNameen == "audit"
                              ? "textShadow"
                              : "us-do"
                          }`}
                        >
                          用法用量：{item.Dosage}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
              <View className="recipeList-doctor">
                <View>
                  医师:<Text className="name">{DoctorName}</Text>
                </View>
                <View className="senior">
                  药师:<Text className="name">{PharmacistName}</Text>
                </View>
              </View>
              <View className="recipeList-remark">
                <View className="remarkItem">备注:</View>
                <View className="remarkItem">
                  ▪本处方过期时间：{PrescriptionEndTime}
                </View>
                <View className="remarkItem">
                  ▪本处方开具前，就诊人已在医院初步确诊
                </View>
              </View>
            </View>

            {InquiryStatusNameen == "auditPass" && (
              <View className="recipeList-hint">
                可直接到店出示手机号线下购买
              </View>
            )}
          </View>
        </ScrollView>
        {InquiryStatusNameen == "auditPass" && (
          <View className="btn_wrapper">
            <Button className="goShopBtn" onClick={this.buyMedicine.bind(this)}>
              去购药
            </Button>
          </View>
        )}
      </View>
    );
  }
}
