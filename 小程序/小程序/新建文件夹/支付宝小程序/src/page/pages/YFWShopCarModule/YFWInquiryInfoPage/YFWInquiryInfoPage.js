import {
  Block,
  View,
  Text,
  ScrollView,
  Image,
  Textarea,
  Input,
} from "@tarojs/components";
import Taro, { Component } from '@tarojs/taro'
import {
  UploadImageApi,
  OrderPaymentApi,
  UseDrug,
} from "../../../../apis/index.js";
import {
  isNotEmpty,
  safeArray,
  isEmpty,
  secretPhone,
  calculateAge,
} from "../../../../utils/YFWPublicFunction.js";
import {
  EMOJIS,
  NAME,
  NEWNAME,
  IDENTITY_CODE,
  IDENTITY_VERIFY,
} from "../../../../utils/YFWRegular";
import { config } from "../../../../config.js";
import { pushNavigation } from "../../../../apis/YFWRouting.js";
import TitleView from "../../../../components/YFWTitleView/YFWTitleView";
import YfwActionModal from "../../../../components/YFWActionModal/YFWActionModal";
import {
  set as setGlobalData,
  get as getGlobalData,
} from "../../../../global_data";
import "./YFWInquiryInfoPage.scss";
const uploadImageApi = new UploadImageApi();
const orderPaymentApi = new OrderPaymentApi();
const useDrug = new UseDrug();

export default class YFWInquiryInfoPage extends Component {
  config = {
    navigationBarTitleText: "在线问诊",
  };

  constructor(props) {
    //super(props)
    this.state = {
      selectPatient: null,
      patientItems: [],
      medicineDiseaseItems: [],
      diseaseDescShow: false,
      vorcheShow: true,
      vorcheUploadShow: false,
      medicineDiseaseMaxCount: 2,
      diseaseDesc: "",
      vorcheImages: [],
      vorcheNotice: false,
      searchKey: "",
      searcheDiseaseResult: [],
      searcheModalShow: false,
      rx_mode: 1,
      cartids: "",
      packageids: "",
      isPrescrption: false,
      isCertificateUpload: false,
      prescrptionImages: [],
      certModalShow: false,
      authModalShow: false,
      authItem: { id: 0, name: "", idcard: "" },
      cerExampleAll:
        "http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_all.png",
      certExamples: [
        "http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_0.jpg",
        "http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_1.jpg",
        "http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_2.jpg",
        "http://c1.yaofangwang.net/common/images/yb-minmap-icons/img_proof_example_3.jpg",
      ],
      scrollTop: 0,
    };
  }
  /** 点击选择在线问诊、或是上传处方 */
  handleTabItem(event) {
    const dataset = event.currentTarget.dataset;
    const index = Number.parseInt(dataset.index);
    const { isPrescrption } = this.state;
    if (index == 1 && isPrescrption) {
      this.setState({ isPrescrption: false });
    } else if (index == 2 && !isPrescrption) {
      this.setState({ isPrescrption: true });
      this.showPrescNotice();
    }
  }

  showPrescNotice(event) {
    Taro.showModal({
      showCancel: false,
      confirmColor: "#1fdb9b",
      confirmText: "我知道了",
      title: "提示",
      content: "处方药需上传正规有效的处方",
    });
  }

  /** 查看处方药规定 */
  handleLookPrescRules(event) {
    let item = {
      name: "单双轨说明页",
      type: "get_h5",
      value: config.rx_url,
    };
    pushNavigation(item.type, item);
  }

  /** 选择用药人 */
  handleSelectPatient(event) {
    const dataset = event.currentTarget.dataset;
    if (dataset.item.dict_bool_certification == 0) {
      this.showAuthModal(dataset.item);
    }
    if (dataset.item.id == this.state.selectPatient.id) {
      return;
    }
    this.setState({ selectPatient: dataset.item });
  }

  /** 添加用药人 */
  handleAddPatient(event) {
    pushNavigation("add_drug", { type: 1 });
  }

  /** 编辑用药人 */
  handleEditPatient(event) {
    const dataset = event.currentTarget.dataset;
    pushNavigation("add_drug", { type: 2, id: dataset.item.id });
  }

  /** 是否显示疾病描述 */
  handleShowDiseaseInput(event) {
    const { diseaseDescShow } = this.state;
    this.setState({ diseaseDescShow: !diseaseDescShow });
  }

  /** 是否显示上传凭证 */
  handleShowVorche(event) {
    const { vorcheShow } = this.state;
    this.setState({ vorcheShow: !vorcheShow });
  }

  /** 是否显示上传凭证 */
  handleShowVorcheUpload(event) {
    const { vorcheUploadShow } = this.state;
    this.setState({ vorcheUploadShow: !vorcheUploadShow });
  }

  /** 疾病标签点击 */
  handleDiseaseTagClick(event) {
    const dataset = event.currentTarget.dataset;
    const section = dataset["section"];
    const row = dataset["row"];
    let { medicineDiseaseMaxCount } = this.state;
    let { medicineDiseaseItems } = this.state;
    let medicineItem = medicineDiseaseItems[section];
    let diseaseItem = medicineItem.diseases[row];
    if (
      !diseaseItem.active &&
      medicineItem.quantity == medicineDiseaseMaxCount
    ) {
      Taro.showToast({
        title: "确诊疾病最多选择" + medicineDiseaseMaxCount + "个",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    diseaseItem.active = !diseaseItem.active;
    medicineItem.quantity = diseaseItem.active
      ? medicineItem.quantity + 1
      : medicineItem.quantity - 1;
    medicineItem.active = medicineItem.quantity > 0;
    medicineItem.quantity =
      medicineItem.quantity < 0 ? 0 : medicineItem.quantity;
    medicineItem.quantity =
      medicineItem.quantity > medicineDiseaseMaxCount
        ? medicineDiseaseMaxCount
        : medicineItem.quantity;
    medicineDiseaseItems.map((mItem, mIndex) => {
      if (mIndex != section) {
        mItem.diseases.some((dItem) => {
          if (
            dItem.name == diseaseItem.name &&
            dItem.active != diseaseItem.active
          ) {
            dItem.active = diseaseItem.active
              ? mItem.quantity < medicineDiseaseMaxCount
                ? diseaseItem.active
                : dItem.active
              : false;
            mItem.quantity = diseaseItem.active
              ? mItem.quantity < medicineDiseaseMaxCount
                ? mItem.quantity + 1
                : medicineDiseaseMaxCount
              : mItem.quantity - 1;
            mItem.quantity = mItem.quantity < 0 ? 0 : mItem.quantity;
            mItem.quantity =
              mItem.quantity > medicineDiseaseMaxCount
                ? medicineDiseaseMaxCount
                : mItem.quantity;
            mItem.active = mItem.quantity > 0;
          }
          return dItem.name == diseaseItem.name;
        });
      }
    });
    this.setState({ medicineDiseaseItems: medicineDiseaseItems });
  }

  /** 添加疾病标签 */
  handleDiseaseTagAddClick(event) {
    const dataset = event.currentTarget.dataset;
    const section = dataset["section"];
    this.addSection = section;
    this.setState({ searcheModalShow: true });
  }

  /** 隐藏搜索疾病modal */
  handleHiddenSearchDiseaseModal(event) {
    const that = this;
    this.setState({ searcheModalShow: false });
  }

  /** 搜索疾病 */
  handleSearchInputChange(event) {
    let value = event.detail.value;
    value = value.replace(EMOJIS, "");
    this.setState({ searchKey: value });

    this.fetchDiseaseResult(value);
  }

  /** 搜索疾病 */
  fetchDiseaseResult(keyword) {
    orderPaymentApi.searchDisease(keyword).then(
      (res) => {
        this.setState({ searcheDiseaseResult: safeArray(res) });
      },
      (error) => {
        console.log("搜索疾病失败", error);
      }
    );
  }

  /** 清空搜索输入框 */
  handleClearSearchInput(event) {
    this.setState({ searchKey: "" });
  }

  /** 点击搜索结果 */
  handleSearchItemClick(event) {
    this.handleHiddenSearchDiseaseModal();

    const dataset = event.currentTarget.dataset;
    const disease = dataset["item"];
    const { medicineDiseaseMaxCount } = this.state;
    let { medicineDiseaseItems } = this.state;
    let medicineItem = medicineDiseaseItems[this.addSection];
    let repeat = false;
    repeat = medicineItem.diseases.some((item) => {
      return item.name == disease.disease_name;
    });
    if (repeat) {
      return;
    }
    let diseaseItem = {
      id: disease.id,
      name: disease.disease_name,
      active: medicineItem.quantity < medicineDiseaseMaxCount,
    };
    medicineItem.active = true;
    medicineItem.quantity =
      medicineItem.quantity < medicineDiseaseMaxCount
        ? medicineItem.quantity + 1
        : medicineDiseaseMaxCount;
    medicineItem.diseases.push(diseaseItem);
    if (diseaseItem.active) {
      medicineDiseaseItems.map((mItem, mIndex) => {
        if (
          mIndex != this.addSection &&
          mItem.quantity < medicineDiseaseMaxCount
        ) {
          mItem.diseases.some((dItem) => {
            if (dItem.name == diseaseItem.name && !dItem.active) {
              dItem.active = diseaseItem.active;
              mItem.active = true;
              mItem.quantity++;
            }
            return dItem.name == diseaseItem.name;
          });
        }
      });
    }
    this.setState({
      medicineDiseaseItems: medicineDiseaseItems,
      searchKey: "",
      searcheDiseaseResult: [],
    });
  }

  /** 疾病描述输入事件 */
  handleDiseaseDescInputChange(event) {
    let value = event.detail.value;
    value = value.replace(EMOJIS, "");
    this.setState({ diseaseDesc: value });
  }

  /** 上传凭证 */
  handleUploadVorche(event) {
    let { vorcheImages } = this.state;
    if (vorcheImages.length == 0) {
      this.setState({ certModalShow: true });
      return;
    }
    this.uploadCert();
  }

  /** 上传凭证 */
  uploadCert(event) {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        const path = res.tempFilePaths[0];
        let { vorcheImages } = this.state;
        Taro.showLoading({ title: "上传中..." });
        uploadImageApi.upload(path).then(
          (res) => {
            Taro.hideLoading();
            if (isNotEmpty(res)) {
              vorcheImages.push({
                localPath: path,
                fileId: res,
              });
              this.setState({ vorcheImages: vorcheImages });
            }
          },
          (error) => {
            Taro.hideLoading();
            Taro.showToast({ title: error.msg, icon: "none", duration: 2000 });
          }
        );
      },
    });
  }

  /** 关闭上传凭证提示 */
  handleCertModalClose(event) {
    const that = this;
    this.setState({ certModalShow: false });
  }

  /** 上传凭证提示点击 */
  handleCertModalClick(event) {
    this.handleCertModalClose();
    this.uploadCert();
  }

  /** 删除凭证 */
  handleDeleteVorche(event) {
    let { vorcheImages } = this.state;
    const dataset = event.currentTarget.dataset;
    const index = vorcheImages.indexOf(dataset.item);
    vorcheImages.splice(index, 1);
    this.setState({ vorcheImages: vorcheImages });
  }

  /** 查看凭证大图 */
  handleLookVorcheBigPic(event) {
    let { vorcheImages } = this.state;
    const dataset = event.currentTarget.dataset;
    let urls = vorcheImages.map((item) => {
      return item.localPath;
    });
    Taro.previewImage({
      current: dataset.item.localPath,
      urls: urls,
    });
  }

  /** 查看凭证示例 */
  handleLookCertExample(event) {
    const { certExamples } = this.state;
    Taro.previewImage({
      current: certExamples[0],
      urls: certExamples,
    });
  }

  /** 显示就诊凭证不在身边弹窗 */
  handleShowVorcheModal(event) {
    this.vorcheModal && this.vorcheModal.onActionModalShow();
  }

  /** 显示就诊凭证不在身边弹窗 */
  handleHiddenVorcheModal(event) {
    this.vorcheModal && this.vorcheModal.onActionModalDismiss();
    this.setState({ vorcheUploadShow: false });
  }

  /** 上传处方 */
  handleUploadPrescription(event) {
    let { prescrptionImages } = this.state;
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        const path = res.tempFilePaths[0];
        this.setState({ prescrptionImages: prescrptionImages });
        Taro.showLoading({ title: "上传中..." });
        uploadImageApi.upload(path).then(
          (res) => {
            Taro.hideLoading();
            if (isNotEmpty(res)) {
              prescrptionImages.push({
                localPath: path,
                fileId: res,
              });
              this.setState({ prescrptionImages: prescrptionImages });
            }
          },
          (error) => {
            Taro.hideLoading();
            Taro.showToast({ title: error.msg, icon: "none", duration: 2000 });
          }
        );
      },
    });
  }

  /** 提交保存 */
  handleConfirm(event) {
    const { selectPatient } = this.state;
    if (isEmpty(selectPatient)) {
      Taro.showToast({ title: "请添加用药人", icon: "none", duration: 2000 });
      // wx.pageScrollTo({ duration: 300, scrollTop: 0 })
      this.setState({ scrollTop: 0 });
      return;
    }

    const { medicineDiseaseItems } = this.state;
    let noMedicine = false;
    let medicineItem = medicineDiseaseItems[0];
    noMedicine = medicineDiseaseItems.some((mItem) => {
      if (!mItem.active) {
        medicineItem = mItem;
      }
      return !mItem.active;
    });
    if (noMedicine) {
      Taro.showToast({
        title: "【" + medicineItem.medicine_name + "】未选择确诊疾病",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    const { isCertificateUpload } = this.state;
    const { vorcheImages } = this.state;
    if (isCertificateUpload && vorcheImages.length == 0) {
      Taro.showToast({ title: "请上传就诊凭证", icon: "none", duration: 2000 });
      return;
    }

    let diseases = [];
    medicineDiseaseItems.forEach((mItem) => {
      mItem.diseases.forEach((dItem) => {
        if (dItem.active) {
          diseases.push({
            id: dItem.id,
            name: dItem.name,
            namecn: mItem.medicine_name,
          });
        }
      });
    });

    let caseurl = "";
    if (this.state.vorcheUploadShow) {
      let urls = this.state.vorcheImages.map((item) => {
        return item.fileId;
      });
      caseurl = urls.length > 0 ? urls.join("|") : "";
    }

    Taro.showLoading({ title: "提交中..." });
    orderPaymentApi
      .commitPrecriptionInfo(
        this.state.cartids,
        this.state.packageids,
        2,
        this.state.selectPatient.id,
        "",
        JSON.stringify(diseases),
        caseurl
      )
      .then(
        (res) => {
          Taro.hideLoading();
          let result = Boolean(res);
          if (result) {
            let inquiryInfo = getGlobalData("inquiryInfo");
            inquiryInfo.isSave = true;
            inquiryInfo.drug_items = this.state.patientItems;
            inquiryInfo.selectPatient = this.state.selectPatient;
            inquiryInfo.medicine_disease_items = this.state.medicineDiseaseItems;
            inquiryInfo.certificationImages = this.state.vorcheImages;
            inquiryInfo.rx_images = this.state.prescrptionImages;
            inquiryInfo.diseaseDesc = this.state.diseaseDesc;
            setGlobalData("inquiryInfo", inquiryInfo);
            Taro.navigateBack();
          }
        },
        (error) => {
          Taro.hideLoading();
          if (error.code == -3) {
            Taro.showModal({
              showCancel: false,
              confirmColor: "#1fdb9b",
              confirmText: "我知道了",
              title: "提示",
              content: error.msg,
            });
          } else {
            Taro.showToast({ title: error.msg, icon: "none", duration: 2000 });
          }
        }
      );
  }

  /** 编辑或者新增用药人后，获取用药人信息 */
  fetchPatient(event) {
    let inquiryInfo = getGlobalData("inquiryInfo");

    if (inquiryInfo.editPatientId != 0) {
      useDrug.getUserDetail(inquiryInfo.editPatientId).then(
        (res) => {
          inquiryInfo.editPatientId = 0;

          if (isNotEmpty(res)) {
            let editItem = res;
            editItem["secret_mobile"] = secretPhone(editItem.mobile);
            editItem["age"] = calculateAge(editItem.idcard_no);
            let { patientItems } = this.state;
            if (patientItems.length == 0) {
              patientItems.push(editItem);
              this.setState({
                selectPatient: editItem,
              });
            } else {
              let repeatIndex = -1;
              const editDefault = Number.parseInt(editItem.dict_bool_default);
              patientItems = patientItems.map((pItem, pIndex) => {
                if (pItem.id == editItem.id) {
                  repeatIndex = pIndex;
                }
                if (editDefault == 1) {
                  pItem.dict_bool_default = 0;
                }
                return pItem;
              });

              if (repeatIndex != -1) {
                patientItems.splice(repeatIndex, 1);
              }

              if (editDefault == 1) {
                patientItems.unshift(editItem);
              } else {
                patientItems.push(editItem);
              }
              inquiryInfo.drug_items = patientItems;
              setGlobalData("inquiryInfo", inquiryInfo);
            }
            this.setState({ patientItems: patientItems });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  /** 实名认证弹窗 */
  showAuthModal(event) {
    let { authItem } = this.state;
    authItem.name = event.real_name;
    authItem.idcard = event.idcard_no;
    authItem.id = event.id;
    this.setState({ authModalShow: true, authItem: authItem });
  }

  /** 关闭实名认证弹窗 */
  handleAuthModalClose(event) {
    const that = this;
    that.setState({ authModalShow: false });
  }

  /** 实名认证 */
  handleAuthClick(event) {
    const { authItem } = this.state;
    if (authItem.name.length == 0) {
      Taro.showToast({
        title: "请输入用药人姓名",
        icon: "none",
        duration: 2000,
      });
      return;
    } else if (authItem.idcard.length == 0) {
      Taro.showToast({
        title: "请输入身份证号码",
        icon: "none",
        duration: 2000,
      });
      return;
    } else if (!IDENTITY_VERIFY.test(authItem.idcard)) {
      Taro.showToast({
        title: "身份证号码格式不正确",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    useDrug.verfiedUser(authItem.id, authItem.name, authItem.idcard).then(
      (res) => {
        const result = Boolean(res);
        if (result) {
          this.handleAuthModalClose();
          Taro.showToast({ title: "认证成功", icon: "none", duration: 2000 });

          let { patientItems } = this.state;
          let repeat = -1;
          patientItems.some((item, index) => {
            if (item.id == authItem.id) {
              repeat = index;
            }
            return item.id == authItem.id;
          });
          if (repeat != -1) {
            patientItems[repeat].real_name = authItem.name;
            patientItems[repeat].idcard_no = authItem.idcard;
            patientItems[repeat].dict_bool_certification = 1;
            this.setState({ patientItems: patientItems });

            var _glo = getGlobalData("inquiryInfo");
            _glo.drug_items = patientItems;
            _glo.isEditPatient = true;
            setGlobalData("inquiryInfo", _glo);
          }
        }
      },
      (error) => {
        Taro.showToast({ title: error.msg, icon: "none", duration: 2000 });
      }
    );
  }

  /** 清空身份证号码 */
  handleClearAuthIdCard(event) {
    let { authItem } = this.state;
    authItem.idcard = "";
    this.setState({ authItem: authItem });
  }

  /** 姓名输入框 */
  handleRealNameInput(event) {
    let value = event.detail.value;
    value = value.replace(NEWNAME, "");
    let { authItem } = this.state;
    authItem.name = value;
    this.setState({ authItem: authItem });
  }

  /** 姓名输入框 */
  handleRealNameInputEnd(event) {
    let value = event.detail.value;
    value = value.replace(NAME, "");
    let { authItem } = this.state;
    authItem.name = value;
    this.setState({ authItem: authItem });
  }

  /** 身份证号码输入框 */
  handleIdCardNumInput(event) {
    let value = event.detail.value;
    value = value.replace(IDENTITY_CODE, "");
    let { authItem } = this.state;
    authItem.idcard = value;
    this.setState({ authItem: authItem });
  }

  /** 点击、滚动穿透 */
  handleCatchTap(event) {
    event.stopPropagation();
    return true;
  }
  componentWillMount() {
    const inquiryInfo = JSON.parse(JSON.stringify(getGlobalData("inquiryInfo")));
    if (inquiryInfo.isPrescrption) {
      this.showPrescNotice();
    }
    const patientItems = inquiryInfo.drug_items;
    this.setState({
      patientItems: patientItems,
      selectPatient: inquiryInfo.selectPatient,
      medicineDiseaseItems: inquiryInfo.medicine_disease_items,
      medicineDiseaseMaxCount: inquiryInfo.medicine_disease_xz_count,
      vorcheImages: inquiryInfo.certificationImages,
      vorcheUploadShow: inquiryInfo.certificationImages.length > 0,
      prescrptionImages: inquiryInfo.rx_images,
      packageids: inquiryInfo.packageids,
      cartids: inquiryInfo.cartids,
      diseaseDesc: inquiryInfo.diseaseDesc,
      rx_mode: inquiryInfo.rx_mode,
      isPrescrption: inquiryInfo.isPrescrption,
      isCertificateUpload: inquiryInfo.is_certificate_upload,
    });

    patientItems.some((item) => {
      if (item.dict_bool_certification == 0) {
        this.showAuthModal(item);
      }
      return item.dict_bool_certification == 0;
    });
  }

  componentDidMount() {}

  componentDidShow() {
    this.fetchPatient();
  }

  render() {
    const {
      isPrescrption,
      rx_mode,
      scrollTop,
      patientItems,
      selectPatient,
      prescrptionImages,
      medicineDiseaseItems,
      diseaseDescShow,
      diseaseDesc,
      isCertificateUpload,
      vorcheShow,
      vorcheUploadShow,
      vorcheImages,
      cerExampleAll,
      searcheModalShow,
      searchKey,
      searcheDiseaseResult,
      certModalShow,
      authModalShow,
      authItem,
    } = this.state;
    return (
      <View className="inquiry">
        {rx_mode == 3 && (
          <View className="inquiry-tab">
            <View
              className="tab-item"
              onClick={this.handleTabItem}
              data-index="1"
            >
              <TitleView
                title="在线问诊"
                showLine={!isPrescrption}
                fontSize="28"
                fontWeight="500"
              ></TitleView>
            </View>
            <View
              className="tab-item"
              onClick={this.handleTabItem}
              data-index="2"
            >
              <TitleView
                title="有处方单"
                showLine={isPrescrption}
                fontSize="28"
                fontWeight="500"
              ></TitleView>
            </View>
          </View>
        )}
        <View className="inquiry-notice" onClick={this.handleLookPrescRules}>
          <Text>
            {isPrescrption
              ? "您订单内处方药必须凭医生开具的正规处方销售    查看 >"
              : "以下信息仅用于互联网医院为您提供问诊开方业务"}
          </Text>
        </View>
        <ScrollView
          scrollY
          className="inquiry-content"
          scrollTop={scrollTop}
          scrollWithAnimation="true"
        >
          {patientItems.length > 0 ? (
            <Block>
              <View className="patient-title-view">
                <Text className="inquiry-title">
                  <Text className="red-color">*</Text>请选择用药人
                </Text>
                <View className="patient-add" onClick={this.handleAddPatient}>
                  添加
                </View>
              </View>
              <ScrollView
                className="inquiry-patient-scroll"
                scrollX="true"
                scrollY="false"
              >
                {patientItems.map((patientItem, patientIndex) => {
                  return (
                    <Block key={patientItem.id}>
                      <View
                        className="inquiry-patient-item"
                        data-index={patientIndex}
                        data-item={patientItem}
                        onClick={this.handleSelectPatient}
                      >
                        <View
                          className={
                            selectPatient.id == patientItem.id
                              ? "patient-item  patient-item-select"
                              : "patient-item "
                          }
                        >
                          <Text className="patient-name">
                            {patientItem.real_name}
                          </Text>
                          <View className="patient-tag">
                            <Text>{patientItem.relation_label}</Text>
                            {patientItem.dict_bool_default && <Text>默认</Text>}
                            {patientItem.dict_bool_certification ? (
                              <Text className="patient-tag-red">已认证</Text>
                            ) : (
                              <Text className="patient-tag-gray">未认证</Text>
                            )}
                          </View>
                          <Text className="patient-text-gray patient-sex">
                            {(patientItem.dict_sex == 1 ? "男" : "女") +
                              "  " +
                              patientItem.age +
                              "岁"}
                          </Text>
                          <Text className="patient-text-gray">
                            {patientItem.secret_mobile}
                          </Text>
                          <View
                            className="patient-edit"
                            data-item={patientItem}
                            onClick={this.handleEditPatient}
                          >
                            编辑
                          </View>
                          {selectPatient.id == patientItem.id && (
                            <Image
                              className="patient-action"
                              src={require("../../../../images/chooseBtn.png")}
                            ></Image>
                          )}
                        </View>
                      </View>
                    </Block>
                  );
                })}
              </ScrollView>
              <View className="inquiry-point">
                {patientItems.map((item, index) => {
                  return (
                    <Block key="point">
                      <View className="inquiry-point-item-ct">
                        <View
                          className={
                            selectPatient.id == item.id
                              ? "inquiry-point-item-ac"
                              : "inquiry-point-item"
                          }
                        ></View>
                      </View>
                    </Block>
                  );
                })}
              </View>
            </Block>
          ) : (
            <Block>
              <View className="patient-empty" onClick={this.handleAddPatient}>
                <Text className="patient-add-l">+</Text>
                <Text>点击添加用药人信息</Text>
              </View>
            </Block>
          )}
          {isPrescrption ? (
            <Block>
              <View className="patient-title-view">
                <Text className="inquiry-title">上传处方图片(必传)</Text>
              </View>
              <View className="inquiry-disease-content">
                <View className="inquiry-vocher-view">
                  {prescrptionImages.map((item, index) => {
                    return (
                      <Block key="prescImg">
                        <View className="position-re">
                          <Image
                            className="vocher-item"
                            src={item.localPath}
                            data-index={index}
                            data-item={item}
                            mode="aspectFill"
                          ></Image>
                          <View
                            className="inquiry-vocher-delete"
                            data-item={item}
                            onClick={this.handleUploadPrescription}
                          >
                            <Image
                              src={require("../../../../images/search_del.png")}
                            ></Image>
                          </View>
                        </View>
                      </Block>
                    );
                  })}
                  {prescrptionImages.length < 3 && (
                    <Image
                      className="vocher-item"
                      src={require("../../../../images/upload_photo2.png")}
                      onClick={this.handleUploadPrescription}
                    ></Image>
                  )}
                </View>
                <Text className="prescription-example">处方示例</Text>
              </View>
              <View
                className="inquiry-vocher-lose"
                onClick={this.handleShowVorcheModal}
              >
                药店药师审核，请上传正规处方(仅可上传3张)
              </View>
            </Block>
          ) : (
            <Block>
              <View className="patient-title-view">
                <Text className="inquiry-title">
                  <Text className="red-color">*</Text>请选择确诊疾病
                </Text>
              </View>
              <View className="inquiry-disease-content">
                <Text className="inquiry-subtitle">
                  请您选择在线下确诊的相关疾病
                </Text>
                {medicineDiseaseItems.map((medicineItem, medicineIndex) => {
                  return (
                    <Block key="medicine">
                      <Text className="inquiry-subtitle disease-medicine">
                        {"[" + medicineItem.medicine_name + "]"}
                      </Text>
                      <View
                        className="disease-tags"
                        style={
                          medicineDiseaseItems.length - 1 == medicineIndex
                            ? "border-width:0"
                            : ""
                        }
                      >
                        <View
                          className={
                            "disease-tag-point " +
                            (medicineItem.active
                              ? "disease-tag-point-active"
                              : "")
                          }
                        ></View>
                        {medicineItem.diseases.map(
                          (diseaseItem, diseaseIndex) => {
                            return (
                              <Block key="disease">
                                <View
                                  className={
                                    "disease-tag-item " +
                                    (diseaseItem.active
                                      ? "disease-tag-item-active"
                                      : "")
                                  }
                                  onClick={this.handleDiseaseTagClick}
                                  data-section={medicineIndex}
                                  data-row={diseaseIndex}
                                >
                                  {diseaseItem.name}
                                </View>
                              </Block>
                            );
                          }
                        )}
                        {medicineItem.showAdd && (
                          <View
                            className="disease-tag-item disease-tag-item-add"
                            data-section={medicineIndex}
                            onClick={this.handleDiseaseTagAddClick}
                          >
                            +
                          </View>
                        )}
                      </View>
                    </Block>
                  );
                })}
                <View
                  className="inquiry-disease-detail-title"
                  onClick={this.handleShowDiseaseInput}
                >
                  <Text className="inquiry-subtitle disease-medicine">
                    请描述确诊疾病症状（选填）
                  </Text>
                  <Image
                    className={
                      "inquiry-disease-detail-icon " +
                      (diseaseDescShow ? "inquiry-disease-detail-icon-up" : "")
                    }
                    src={require("../../../../images/around_detail_icon.png")}
                  ></Image>
                </View>
                {diseaseDescShow && (
                  <View className="inquiry-disease-desc">
                    <Textarea
                      className="disease-input"
                      value={diseaseDesc}
                      placeholder="请描述确诊疾病症状"
                      placeholderStyle="color: #ccc"
                      maxlength="200"
                      onInput={this.handleDiseaseDescInputChange}
                    ></Textarea>
                    {/* <Text className="desc-count">
                      {diseaseDesc.length + "/200"}
                    </Text> */}
                  </View>
                )}
              </View>
              <View
                className="patient-title-view"
                onClick={this.handleShowVorche}
              >
                {isCertificateUpload ? (
                  <Text className="inquiry-title">
                    <Text className="red-color">*</Text>请上传就诊凭证
                  </Text>
                ) : (
                  <Text className="inquiry-title">请上传就诊凭证</Text>
                )}
                <Image
                  className={
                    "inquiry-disease-detail-icon " +
                    (vorcheShow ? "inquiry-disease-detail-icon-up" : "")
                  }
                  src={require("../../../../images/around_detail_icon.png")}
                ></Image>
              </View>
              {vorcheShow && !vorcheUploadShow && (
                <View className="inquiry-disease-content">
                  <View className="inquiry-vocher-desc">
                    已确认在线下医院完成就诊，但此刻复诊凭证遗失或不在身边。无历史处方、病历、住院出院记录可能会影响医生对您的病情判断。
                  </View>
                  <Text
                    className="inquiry-vocher-upload"
                    onClick={this.handleShowVorcheUpload}
                  >
                    已找到历史处方、病历、住院出院记录，
                    <Text className="text-green">立即上传</Text>
                  </Text>
                </View>
              )}
              {vorcheShow && vorcheUploadShow && (
                <View className="inquiry-disease-content">
                  <Text className="inquiry-subtitle">
                    请您上传用药人的【处方/病历/住院出院记录】(仅可上传5张)
                  </Text>
                  <View className="inquiry-vocher-view">
                    {vorcheImages.map((item, index) => {
                      return (
                        <Block key="vorcheImg">
                          <View className="position-re">
                            <Image
                              className="vocher-item"
                              src={item.localPath}
                              data-index={index}
                              data-item={item}
                              mode="aspectFit"
                              onClick={this.handleLookVorcheBigPic}
                            ></Image>
                            <View
                              className="inquiry-vocher-delete"
                              data-item={item}
                              onClick={this.handleDeleteVorche}
                            >
                              <Image
                                src={require("../../../../images/search_del.png")}
                              ></Image>
                            </View>
                          </View>
                        </Block>
                      );
                    })}
                    {vorcheImages.length < 5 && (
                      <Image
                        className="vocher-item"
                        src={require("../../../../images/upload_photo2.png")}
                        onClick={this.handleUploadVorche}
                      ></Image>
                    )}
                  </View>
                  <View className="inquiry-vocher-exmaple">
                    <Image
                      src={cerExampleAll}
                      onClick={this.handleLookCertExample}
                    ></Image>
                    <Text>
                      有效凭证，须包含以下信息：\r\n·医疗机构名称；\r\n·医生姓名；\r\n·患者姓名；\r\n·诊断和用药信息；\r\n若一张凭证信息不全，可上传多张。
                    </Text>
                  </View>
                </View>
              )}
              {vorcheShow && vorcheUploadShow && (
                <View
                  className="inquiry-vocher-lose"
                  onClick={this.handleShowVorcheModal}
                >
                  就诊凭证遗失/处方不在身边
                </View>
              )}
            </Block>
          )}
          <View className="inquiry-space"></View>
        </ScrollView>
        <View className="inquiry-bottom">
          {!isPrescrption && (
            <Text className="bottom-notice">
              互联网医院问诊并成功开具处方，所需问诊费暂不收取。
            </Text>
          )}
          <View className="inquiry-action" onClick={this.handleConfirm}>
            <Text>{!isPrescrption ? "保存并同意问诊" : "完成"}</Text>
          </View>
        </View>
        <View
          id="inquiry-modal"
          hidden={!searcheModalShow}
          className={searcheModalShow?'searcheModalShowAnimation':'inquiry-modal'}
          onClick={this.handleHiddenSearchDiseaseModal}
          onTouchMove={this.handleCatchTap}
        >
          <View
            id="inquiry-modal-content"
            className={searcheModalShow?'inquiry-modal-contentAni':'inquiry-modal-content'}
            onClick={this.handleCatchTap}
          >
            <View className="inquiry-header">
              <Text>添加确诊疾病</Text>
              <View onClick={this.handleHiddenSearchDiseaseModal}>
                <Image
                  src={require("../../../../images/returnTips_close.png")}
                ></Image>
              </View>
            </View>
            <View className="inquiry-search">
              <Input
                value={searchKey}
                placeholder="请输入疾病名称，支持首字母、模糊搜索"
                placeholderStyle="color: #ccc"
                onInput={this.handleSearchInputChange}
              ></Input>
              <View
                hidden={searchKey.length == 0}
                onClick={this.handleClearSearchInput}
              >
                <Image src={require("../../../../images/search_del.png")}></Image>
              </View>
            </View>
            {searcheDiseaseResult.map((item, index) => {
              return (
                <Block key="searchDisease">
                  <View
                    className="inquiry-search-item"
                    data-item={item}
                    onClick={this.handleSearchItemClick}
                  >
                    {item.disease_name}
                  </View>
                </Block>
              );
            })}
          </View>
        </View>
        <View
          id="cert-modal"
          hidden={!certModalShow}
          className="inquiry-modal cert"
          className = {certModalShow?'searcheModalShowAnimation':'inquiry-modal cert'}
          onTouchMove={this.handleCatchTap}
        >
          <View className="cert-content">
            <View className="cert-colse" onClick={this.handleCertModalClose}>
              <Image
                src={require("../../../../images/returnTips_close.png")}
              ></Image>
            </View>
            <View className="cert-desc">
              <Image
                src={require("../../../../images/icon_warning_complaint.png")}
                className="cert-warn"
              ></Image>
              <Text className="font-bold">注意以下事项</Text>
              <Text>·用药人姓名，必须与凭证中一致；</Text>
              <Text>·所购药品，必须与凭证中一致；</Text>
              <Text className="font-bold">否则将开方失败</Text>
            </View>
            <Image
              className="cert-exp-image"
              onClick={this.handleLookCertExample}
              src={cerExampleAll}
              mode="aspectFit"
            ></Image>
            <View className="cert-action" onClick={this.handleCertModalClick}>
              立即上传
            </View>
          </View>
        </View>
        <View
          id="auth-modal"
          hidden={!authModalShow}
          className="inquiry-modal cert"
          onTouchMove={this.handleCatchTap}
        >
          <View className="cert-content">
            <View className="cert-colse" onClick={this.handleAuthModalClose}>
              <Image
                src={require("../../../../images/returnTips_close.png")}
              ></Image>
            </View>
            <Text className="autho-title">实名认证</Text>
            <Text className="autho-desc">
              根据国家药监局规定，购买处方药需要实名认证！
            </Text>
            <View className="autho-input">
              <Input
                value={authItem.name}
                maxlength="10"
                onInput={this.handleRealNameInput}
                onBlur={this.handleRealNameInputEnd}
                placeholder="请输入用药人姓名"
                placeholderStyle="color: #ccc"
              ></Input>
            </View>
            <View className="autho-input">
              <Input
                value={authItem.idcard}
                maxlength="18"
                onInput={this.handleIdCardNumInput}
                placeholder="请输入身份证号码"
                placeholderStyle="color: #ccc"
              ></Input>
              <View onClick={this.handleClearAuthIdCard}>
                <Image
                  src={require("../../../../images/returnTips_close.png")}
                ></Image>
              </View>
            </View>
            <View className="autho-action-view">
              <View
                className="autho-cancel"
                onClick={this.handleAuthModalClose}
              >
                取 消
              </View>
              <View className="autho-sure" onClick={this.handleAuthClick}>
                认 证
              </View>
            </View>
          </View>
        </View>
        <YfwActionModal
          ref={this.vorcheModalRef}
          title="就诊凭证遗失/处方不在身边"
        >
          <View className="vorche-lose">
            请确认您已在线下医院完成就诊，但此刻就诊凭证遗失或不在身边。无历史处方、病历、住院出院记录可能会影响医生对您的病情判断。
          </View>
          <View
            className="vorche-lose-sure"
            onClick={this.handleHiddenVorcheModal}
          >
            确认遗失/不在身边
          </View>
        </YfwActionModal>
      </View>
    );
  }
  vorcheModalRef = (modal) => {
    this.vorcheModal = modal;
  };
}
