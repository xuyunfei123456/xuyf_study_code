import { Component } from "react";
import { View, Image, Text, ScrollView, Input } from "@tarojs/components";
import Taro, { getCurrentInstance } from "@tarojs/taro";
import "./YFWInquiryInfoPage.less";
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";
import { AtTextarea, AtFloatLayout, AtImagePicker } from "taro-ui";
import { EMOJIS } from "../../utils/YFWRegular";
import { UploadImage } from "../../utils/uploadImage";
import YfwModal from "../../components/YfwModal/YfwModal";
var uploadImageFn = new UploadImage();
const httpRequest = new HTTP();
var a = 1;
class AddConsultation extends Component {
  constructor() {
    super();
    this.state = {
      firstFlag: true,
      uploadFlag: false,
      diseaseIndex: "",
      dataSourceFrom: "", //搜索的疾病类型
      sickerList: [],
      seeDoctor: [
        {
          sdTxt: "是",
          sdType: 0
        },
        {
          sdTxt: "否",
          sdType: 1
        }
      ],

      definiteSickList: [],
      medicineSickMaxCount: 2,
      symValue: "",
      symPlaceholder: "请描述确诊疾病症状",
      symStatus: false,
      proofStatus: false,
      seeDoctorStatus: false,
      isShowAddPop: false,
      searchValue: "",
      searchResult: [],
      maxCount: 5, //上传图片最大数量
      BillImgFiles: [],
      onSicker: 0
    };
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    const { uploadFlag } = instance.router.params;
    const { hasSickInfo, inquiryInfo } = this.props.globalData;
    if (hasSickInfo) {
      this.setState({
        seeDoctorStatus: true,
        definiteSickList: inquiryInfo.definiteSickList,
        symValue: inquiryInfo.disease_desc,
        BillImgFiles: inquiryInfo.BillImgFiles,
        symStatus: inquiryInfo.disease_desc ? true : false,
        uploadFlag:uploadFlag == 'true' ? true:false,
        proofStatus:(uploadFlag == 'true' || inquiryInfo.BillImgFiles.length!=0) ? true:false,
      });
    } else {
      let diseases = Taro.getStorageSync("diseases");
      this.setState({
        definiteSickList: diseases,
        uploadFlag:uploadFlag == 'true' ? true:false,
        proofStatus:uploadFlag == 'true' ? true:false,
      });
    }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    this.getUseDrug();
  }
  getUseDrug() {
    let userinfo = Taro.getStorageSync("userinfo");
    //获取用药人信息
    httpRequest
      .get("third_account_drug.getList", {
        thirdAccountId: userinfo.thirdAccountId
      })
      .then(res => {
        if (res && res.length != 0) {
          let _data = [];
          res.map(item => {
            _data.push({
              name: item.RealName,
              age: item.Age,
              sex: item.Sex,
              phone: item.Mobile_Hide,
              relationLabel: item.RelationLabel, //身份
              certification: item.DictBoolCertification, //已认证
              default: item.DictBoolDefault, //默认
              oldData: item,
              id: item.Id
            });
          });
          const { hasSickInfo, inquiryInfo } = this.props.globalData;
          let _index = 0;
          if (hasSickInfo) {
            for (let i = 0, len = _data.length; i < len; i++) {
              if (_data[i].id == inquiryInfo.drugid) {
                _index = i;
                break;
              }
            }
          }
          _index = this.state.firstFlag ? _index : this.state.onSicker;
          this.state.firstFlag = false;
          this.setState({
            sickerList: _data,
            onSicker: _index
          });
        }
      });
  }
  componentDidHide() {}
  // 点击在线下确诊的相关疾病
  handleClickDefiniteAction(index, childIndex, event) {
    let definiteSickList = this.state.definiteSickList,
      data = definiteSickList[index];
    data.sickList[childIndex].active = !data.sickList[childIndex].active;
    this.setState({
      definiteSickList
    });
  }
  //多行文本框输入
  handleSymChange(value) {
    this.setState({
      symValue: value
    });
  }
  // 选择是否已在实体医院就诊
  onChangeSeeDoctorType(event) {
    if (this.state.seeDoctorStatus) {
      this.setState({
        seeDoctorStatus: false
      });
    } else {
      this.setState({
        yfwModalParams: {
          cancelBtn: "否",
          confirmBtn: "是",
          title: "提示",
          content: "是否已在实体医院就诊，且服用过订单中药品，无不良反应",
          icon: "",
          isOpen: true,
          cancelFn: this.cancelFn.bind(this),
          confirmFn: this.inquiryModalConfirm.bind(this)
        }
      });
    }
  }
  cancelFn() {
    this.setState({
      yfwModalParams: {
        isOpen: false
      }
    });
  }
  inquiryModalConfirm() {
    this.setState({
      seeDoctorStatus: true,
      yfwModalParams: {
        isOpen: false
      }
    });
  }
  //点击显示或隐藏描述病症文本框
  onChangeSymArrowStatus() {
    let { symStatus } = this.state;
    symStatus = !symStatus;
    this.setState({
      symStatus
    });
  }
  //点击显示或隐藏上传就诊凭证
  onChangeProofArrowStatus() {
    let { proofStatus } = this.state;
    proofStatus = !proofStatus;
    this.setState({
      proofStatus
    });
  }
  //更改默认患者
  onChangeSickerItem(event) {
    let { onSicker } = this.state;
    let dataset = event.currentTarget.dataset;
    let index = dataset["sicker"];
    if (onSicker == index) {
      onSicker = index;
    }
    this.setState({
      onSicker: index
    });
  }
  onChangeBillImg(files, operationType, index) {
    if (files && files.length > this.state.maxCount) {
      Taro.showToast({
        title: "最多上传3张照片",
        duration: 1200,
        icon: "none"
      });
      return;
    }
    if (operationType == "add") {
      uploadImageFn.uploadImageFile(files[files.length - 1].file.path).then(
        res => {
          this.state.BillImgFiles[files.length - 1].sendUrl = res;
          console.log(" this.state.BillImgFiles", this.state.BillImgFiles);
        },
        error => {
          console.log(error);
        }
      );
    }
    this.setState({
      BillImgFiles: files
    });
  }
  onClickBillImg() {}
  onFailBillImg(mes) {
    console.log(mes, "mm");
  }
  //保存问诊信息
  onSaveInquiryInfo() {
    let { changeState } = this.props;
    const {
      symValue,
      sickerList,
      BillImgFiles,
      seeDoctorStatus,
      definiteSickList,
      onSicker,
      uploadFlag
    } = this.state;
    if (!seeDoctorStatus) {
      Taro.showToast({
        title: "请先在实体医院完成就诊",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    if (sickerList.length == 0) {
      Taro.showToast({
        title: "请选择患者",
        icon: "none",
        duration: 2000
      });
      return false;
    }
    let diseaselist = [];
    for (let item of definiteSickList) {
      let _arrr = [];
      item.sickList &&
        item.sickList.map(child => {
          if (child.active) {
            _arrr.push({ disease_name: child.name });
          }
        });
      if (_arrr.length == 0) {
        Taro.showToast({
          title: item.drugName + " 未选择相关疾病",
          icon: "none",
          duration: 2000
        });
        return false;
      } else {
        diseaselist.push(..._arrr);
      }
    }
    let case_url = [];
    if (uploadFlag) {
      BillImgFiles.map(item => {
        if (item.sendUrl) {
          case_url.push(item.sendUrl);
        }
      });
      if (case_url.length == 0) {
        Taro.showToast({
          title: "请上传就诊凭证",
          icon: "none",
          duration: 2000
        });
        return false;
      }
    }

    let _param = {
      diseaselist,
      drugid: sickerList[onSicker].id,
      disease_desc: symValue,
      case_url: case_url.join("|"),
      BillImgFiles,
      definiteSickList
    };
    changeState({
      inquiryInfo: _param,
      hasSickInfo: true
    });
    Taro.navigateBack();
  }
  //关闭确诊疾病搜索弹出框
  handleCloseAddPop() {
    this.setState({
      isShowAddPop: false,
      searchValue: "",
      searchResult: []
    });
  }
  //输入框输入事件
  handleSearchInputChange(event) {
    let value = event.detail.value;
    const { dataSourceFrom } = this.state;
    if (!value) {
      this.setState({
        searchResult: [],
        searchValue: ""
      });
      return;
    }
    value = value.replace(EMOJIS, "");
    httpRequest
      .get("third_account_drug.getDiseaseByKeywords", {
        keywords: value,
        dataSourceFrom: dataSourceFrom == 1 ? 1 : 0
      })
      .then(res => {
        if (dataSourceFrom == 1) {
          //过敏疾病字段名字返回不同 改成相同的
          res =
            res &&
            res.map(item => {
              item.disease_name = item.allergy_name;
              item.diseaseid = item.id;
              return item;
            });
        }
        this.setState({
          searchResult: res
        });
      });
    this.setState({ searchValue: value });
  }
  //确诊疾病添加按钮
  openAddPop(diseaseIndex) {
    this.setState({
      isShowAddPop: true,
      dataSourceFrom: 0,
      diseaseIndex
    });
  }
  //清空输入框内容
  clearSearchValue() {
    this.setState({
      searchValue: "",
      searchResult: []
    });
  }
  //点击搜索表项子元素
  handleSearchClickItem(item, event) {
    const { diseaseIndex, definiteSickList } = this.state;
    let currentData = definiteSickList[diseaseIndex]["sickList"],
      flag = false;
    let data = currentData.map(mm => {
      if (mm.diseaseid == item.diseaseid) {
        flag = true;
        mm.active = true;
      }
      return mm;
    });
    if (!flag) {
      item.active = true;
      item.name = item.disease_name;
      data.push(item);
    }
    definiteSickList[diseaseIndex]["sickList"] = data;
    this.setState({
      definiteSickList,
      searchResult: [],
      searchValue: "",
      isShowAddPop: false
    });
  }
  addSick() {
    pushNavigation("sickPerson", { sickerSort: 1 });
  }
  editSick(data) {
    Taro.setStorageSync("sickInfo", data);
    pushNavigation("sickPerson", { sickerSort: 2 });
  }
  priviewImg() {
    let urls = [
      "https://c1.yaofangwang.net/common/images/inquiry_image_one.jpg",
      "https://c1.yaofangwang.net/common/images/inquiry_image_two.jpg",
      "https://c1.yaofangwang.net/common/images/inquiry_image_three.jpg",
      "https://c1.yaofangwang.net/common/images/inquiry_image_four.jpg"
    ];
    Taro.previewImage({
      urls,
      current: "https://c1.yaofangwang.net/common/images/inquiry_image_one.jpg"
    });
  }
  render() {
    const {
      maxCount,
      sickerList,
      definiteSickList,
      symPlaceholder,
      symValue,
      symStatus,
      proofStatus,
      seeDoctorStatus,
      isShowAddPop,
      searchValue,
      searchResult,
      BillImgFiles,
      onSicker,
      uploadFlag,
      yfwModalParams
    } = this.state;
    return (
      <View className="inquiryInfo">
        <YfwModal {...yfwModalParams} />
        <View className="inquiryInfo-info">
          <Image
            src={require("../../images/radio.png")}
            className="radio"
            mode="scaleToFill"
          ></Image>
          <Text>以下信息仅用于互联网医院为您提供问诊开方服务。</Text>
        </View>
        <View className="inquiryInfo-progress">
          <Text className="inquiryInfo-progress-text">填写信息</Text>
          <Image
            className="arrow_right"
            src={require("../../images/right_gray.png")}
          ></Image>
          <Text className="inquiryInfo-progress-text">提交订单</Text>
          <Image
            className="arrow_right"
            src={require("../../images/right_gray.png")}
          ></Image>
          <Text className="inquiryInfo-progress-text">医院开方</Text>
          <Image
            className="arrow_right"
            src={require("../../images/right_gray.png")}
          ></Image>
          <Text className="inquiryInfo-progress-text">药店审方发货</Text>
        </View>
        <ScrollView className="inquiry_body" scrollY>
          <View className="inquiryInfo-list">
            <View className="head">
              <View className="head-left">
                <Text className="star">*</Text>
                <Text className="title">用药人（必填）</Text>
              </View>
              <View className="head-right" onClick={this.addSick.bind(this)}>
                <Text className="head-right-pic">+</Text>
                <Text className="txt">添加</Text>
              </View>
            </View>

            <View className="sickerList">
              <ScrollView scrollX className="sickerCard-rollArea">
                <View className="sickerCardList">
                  {sickerList.length == 0 && (
                    <View
                      className="addSickerBtn"
                      onClick={this.addSick.bind(this)}
                    >
                      <View className="centerInfo">
                        <Text>+</Text>
                        <Text className="txt">添加患者</Text>
                      </View>
                    </View>
                  )}
                  {sickerList.map((sItem, sIndex) => {
                    return (
                      <View
                        className={
                          "sickerItem " + (onSicker == sIndex ? "onSicker" : "")
                        }
                        data-sicker={sIndex}
                        onClick={this.onChangeSickerItem.bind(this)}
                      >
                        <View className="name">{sItem.name}</View>
                        <View className="sg">
                          {<View>{sItem.sex == 1 ? "男" : "女"}</View>}
                          <View className="age">{`${sItem.age}岁`}</View>
                          <View className="phone">{sItem.phone}</View>
                        </View>
                        <Image
                          src={require("../../images/write.png")}
                          className="editBtn"
                          onClick={this.editSick.bind(this, sItem.oldData)}
                        ></Image>
                      </View>
                    );
                  })}
                  <View className="zwdiv">1</View>
                </View>
              </ScrollView>
            </View>
          </View>
          <View className="inquiryInfo-checkbox">
            <Image
              src={
                seeDoctorStatus
                  ? "../../images/0icon_danxuan_xuanzhong.png"
                  : "../../images/0icon_danxuan_moren.png"
              }
              onClick={this.onChangeSeeDoctorType.bind(this)}
              className="seeimg"
            ></Image>
            <View className="seeDoctourDiv">
              确认已在实体医院就诊，且服用过订单中药品，无不良反应。
            </View>
          </View>
          <View
            style={seeDoctorStatus == true ? "display:block" : "display:none"}
          >
            <View className="inquiryInfo-definiteSick">
              <View className="head">
                <View className="head-left">
                  <Text className="star">*</Text>
                  <Text className="title">请选择确诊疾病</Text>
                </View>
              </View>
              <View className="optionDel">
                <View className="tel">请您选择在线下确诊的相关疾病</View>
                {definiteSickList &&
                  definiteSickList.map((dfItem, dfIndex) => {
                    return (
                      <View className="opArrVal">
                        <View className="drugName">
                          {"[" + dfItem.drugName + "]"}
                        </View>
                        <View className="sickTab">
                          <View
                            className="sign"
                            style={
                              dfItem.active
                                ? "background-color:#1fdb9b"
                                : "background-color:#cccccc"
                            }
                          ></View>

                          {dfItem.sickList.map((lItem, lIndex) => {
                            return (
                              <View
                                data-row={dfIndex}
                                data-sick={lIndex}
                                onClick={this.handleClickDefiniteAction.bind(
                                  this,
                                  dfIndex,
                                  lIndex
                                )}
                                className={
                                  "tab-item " + (lItem.active ? "act" : "")
                                }
                              >
                                {lItem.name}
                              </View>
                            );
                          })}
                          <View
                            className="addBtn"
                            onClick={this.openAddPop.bind(this, dfIndex)}
                          >
                            <Text className="txt">+</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
            <View className="sym-tel tel">
              <Text className="sym_des">请描述确诊疾病症状（选填）</Text>
              <View
                className="arrow_wrapper"
                onClick={this.onChangeSymArrowStatus.bind(this)}
              >
                <Image
                  src={require("../../images/arraw_down.png")}
                  className="down"
                  style={symStatus == true ? "" : "transform: rotate(180deg);"}
                ></Image>
              </View>
            </View>
            <View
              style={`${
                symStatus == true ? "display:block" : "display:none"
              };background:#fff`}
            >
              <View className="textArea_wrapper">
                <AtTextarea
                  value={symValue}
                  onChange={this.handleSymChange.bind(this)}
                  maxLength={200}
                  placeholder={symPlaceholder}
                />
              </View>
            </View>
            <View className="inquiryInfo-proof">
              <View className="head">
                <View className="head-left">
                  {uploadFlag && <Text className="star">*</Text>}
                  <Text className="title">请上传就诊凭证{uploadFlag && <Text>(必填)</Text>}</Text>
                </View>
                <View
                  className="arrow_wrapper"
                  onClick={this.onChangeProofArrowStatus.bind(this)}
                >
                  <Image
                    src={require("../../images/arraw_down.png")}
                    className="down"
                    style={
                      proofStatus == true ? "" : "transform: rotate(180deg);"
                    }
                  ></Image>
                </View>
              </View>
              <View
                className="optionDel"
                style={proofStatus == true ? "display:block" : "display:none"}
              >
                <View className="upload_tip">
                  （*请您上传用药人的[处方、病厉、住院出院记录]，仅可上传五张）
                </View>
                { BillImgFiles.length < 5 && (
                  <AtImagePicker
                    count={maxCount}
                    length={3}
                    multiple
                    files={BillImgFiles}
                    onChange={this.onChangeBillImg.bind(this)}
                    onImageClick={this.onClickBillImg.bind(this)}
                    onFail={this.onFailBillImg.bind(this)}
                  />
                )}
                <View className="inquiry_example">
                  <View className="inquiry_example_left">
                    <Image
                      className="img"
                      src={require("../../images/inquiry_example.png")}
                      onClick={this.priviewImg.bind(this)}
                    ></Image>
                  </View>
                  <View className="inquiry_example_right">
                    <View className="s">有效凭证，须包含以下信息：</View>
                    <View className="inquiry_example_right_two">
                      医疗机构名称/医生姓名/患者姓名/诊断和用药信息
                    </View>
                    <View className="inquiry_example_right_three">
                      (若一张凭证信息不全，可上传多张)
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <View
            className="inquiryInfo-noSee"
            style={seeDoctorStatus == true ? "display:none" : "display:block"}
          >
            <Text>
              根据相关法律规定，用户购买处方药，需先在实体医院完成就诊。
            </Text>
          </View>
        </ScrollView>

        <View className="inquiryInfo-bottom">
          <View className="hint">
            互联网医院问诊并成功开具处方，所需问诊费暂不收取。
          </View>
          <View className="btn" onClick={this.onSaveInquiryInfo.bind(this)}>
            保存并同意问诊
          </View>
        </View>

        <View className="layoutAddList">
          <AtFloatLayout
            isOpened={isShowAddPop}
            title="添加疾病"
            onClose={this.handleCloseAddPop.bind(this)}
          >
            <View className="searchArea">
              <Input
                value={searchValue}
                onInput={this.handleSearchInputChange.bind(this)}
                placeholder="请输入疾病名称，支持首字母，模糊搜索"
                className="input"
                placeholderStyle={"color:#999999"}
              />
              {
                <Image
                  style={`display:${
                    searchValue.length == 0 ? "none" : "block"
                  }`}
                  src={require("../../images/search_del.png")}
                  className="searchDel"
                  onClick={this.clearSearchValue.bind(this)}
                ></Image>
              }
            </View>
            <View className="searchResultList">
              {searchResult.map((item, reIndex) => {
                return (
                  <View
                    className="searchResultListItem"
                    onClick={this.handleSearchClickItem.bind(this, item)}
                  >
                    {item.disease_name}
                  </View>
                );
              })}
            </View>
          </AtFloatLayout>
        </View>
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
)(AddConsultation);
