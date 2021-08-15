import {
  Block,
  View,
  Input,
  Textarea,
  Image,
  ScrollView,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import { UserCenterApi } from "../../../../apis/index.js";
const userCenterApi = new UserCenterApi();
import { YFWAddressDetailModel } from "./YFWAddressModel.js";
import Yfwtitleview from "../../../../components/YFWTitleView/YFWTitleView";
import YfwActionModal from "../../../../components/YFWActionModal/YFWActionModal";
import "./YFWAddress.scss";
var app = Taro.getApp();

export default class YFWAddress extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      check: false,
      isDefault: false,
      addressModel: {},
      region: ["", "", ""],
      provinceArray: [],
      cityArray: [],
      districtsArray: [],
      selectProvince: "省份",
      selectCity: "城市",
      selectDistricts: "区县",
      selectAddressType: "province",
      userAddress: "",
      selectAreaID: "",
      addressHidden: true,
      opacityAnimation: {},
      translateAnimation: {},
      isIOS: true,
      customerAddress: 10,
      env_type: process.env.TARO_ENV,
      postAreaid:"",
    };
  }

  clickRadioAction = () => {
    this.setState({
      isDefault: !this.state.isDefault,
    });
  };

  selectAddressAction = () => {
    if (this.state.addressHidden) {
      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: "linear",
      });
      opacityAni.opacity(0).step();

      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: "linear",
      });
      this.setState({
        addressHidden: false,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
      });

      setTimeout(
        function () {
          opacityAni.opacity(1).step();
          translateAni.translateY(0).step();
          this.setState({
            opacityAnimation: opacityAni.export(),
            translateAnimation: translateAni.export(),
          });
        }.bind(this),
        100
      );
    }
  };

  /**获取省市信息 */
  selectCityAction = (event) => {
    let id = event.currentTarget.dataset.id;
    let title = event.currentTarget.dataset.name;
    if (this.state.selectAddressType == "districts") {
      this.setState({
        selectDistricts: title,
        selectAreaID: id,
      });
      return;
    }
    userCenterApi
      .getProvinceAndCityInfo(id)
      .then((result) => {
        console.log(result);
        let that = this;
        if (this.state.selectAddressType == "province") {
          that.setState({
            cityArray: result,
            districtsArray: [],
            selectProvince: title,
            selectAddressType: "city",
            selectCity: "城市",
            selectDistricts: "区县",
            selectAreaID: id,
          });
        } else if (this.state.selectAddressType == "city") {
          that.setState({
            districtsArray: result,
            selectCity: title,
            selectAddressType: result.length > 0 ? "districts" : "city",
            selectDistricts: result.length > 0 ? "区县" : "",
            selectAreaID: id,
          });
        }
      })
      .then((error) => {});
  };

  changeSelectAddressType = (event) => {
    let type = event.currentTarget.dataset.type;
    this.setState({
      selectAddressType: type,
    });
  };

  /**省市弹窗确定键 */
  confirmAction = () => {
    if (
      this.state.selectProvince == "省份" ||
      this.state.selectCity == "城市" ||
      this.state.selectDistricts == "区县"
    ) {
      return;
    }
    this.hideAddress();
    this.setState({
      selectAddressType: "province",
      selectProvince: "省份",
      selectCity: "",
      selectDistricts: "",
      userAddress:
        this.state.selectProvince +
        this.state.selectCity +
        this.state.selectDistricts,
      postAreaid:this.state.selectAreaID
    });
  };

  componentWillMount() {
    let options = this.$router.params;
    if (process.env.TARO_ENV === "alipay") {
      this.setState({
        customerAddress: 10,
      });
    }
    this.state.isIOS =
      Taro.getSystemInfoSync().platform == "iOS" ? true : false;
    console.log(Taro.getSystemInfoSync());
    let addressID = options.address_id;
    if (addressID > 0) {
      console.log("addressID");
      console.log(addressID);
      userCenterApi.getAddressDetail(addressID).then((result) => {
        let addressModel = YFWAddressDetailModel.getModelData(result);
        this.setState({
          addressModel: addressModel,
          isDefault: addressModel.isDefault,
          userAddress: addressModel.userAddress,
          selectAreaID: addressModel.region_id,
          isIOS: this.state.isIOS,
          postAreaid:addressModel.region_id,
        });
        console.log(addressModel);
      });
    } else {
      this.setState({
        isIOS: this.state.isIOS,
        addressModel: {
          name: "",
          address_name: "",
          mobile: "",
          regionid: "",
          isDefault: false,
          userAddressDetail: "",
        },
      });
    }
    Taro.setNavigationBarTitle({
      title: addressID > 0 ? "编辑地址" : "新增地址",
    });
    userCenterApi
      .getProvinceAndCityInfo(0)
      .then((result) => {
        console.log(result);
        this.setState({
          provinceArray: result,
        });
      })
      .then((error) => {});
  }

  /**编辑收件人姓名 */
  bindChange_name = (e) => {
    var name = e.detail.value;
    var addressModel = this.state.addressModel;
    addressModel.name = name;
    this.setState({
      addressModel: addressModel,
    });
  };

  /**编辑收件人手机号 */
  bindChange_mobile = (e) => {
    var phoneNumber = e.detail.value;
    var addressModel = this.state.addressModel;
    addressModel.mobile = phoneNumber;
    this.setState({
      addressModel: addressModel,
    });
  };

  /**编辑收货详细地址 */
  bindChange_address = (e) => {
    var addressName = e.detail.value;
    addressName = addressName.replace(/\s+/g,"");
    var addressModel = this.state.addressModel;
    addressModel.userAddressDetail = addressName;
    this.setState({
      addressModel: addressModel,
    });
  };
  addressblur = (e)=>{
    var addressName = e.detail.value;
    addressName = addressName.replace(/\s+/g,"");
    var addressModel = this.state.addressModel;
    addressModel.userAddressDetail = addressName;
    this.setState({
      addressModel: addressModel,
    });

  }
  checkStatus = () => {
    let addressModel = this.state.addressModel;
    let result = true;
    this.state.addressModel.mobile = addressModel.mobile.replace(/\s*/g, "");
    if (addressModel.name.length < 2) {
      this.infoMsg = "姓名至少2个字符，中文或英文";
      result = false;
    } else if (addressModel.mobile.length != 11) {
      this.infoMsg = "手机号码格式不正确";
      result = false;
    } else if (this.state.userAddress.length == 0) {
      this.infoMsg = "请选择所在地区";
      result = false;
    } else if (addressModel.userAddressDetail.length < 5) {
      this.infoMsg = "请填写完整收货地址";
      result = false;
    }
    if (!result) {
      Taro.showToast({
        title: this.infoMsg,
        icon: "none",
      });
    }
    return result;
  };

  save = () => {
    if (!this.checkStatus()) {
      return;
    }
    var addressModel = this.state.addressModel;
    var addressID = addressModel.id;
    var name = addressModel.name;
    var phoneNumber = addressModel.mobile;
    var addressName = this.state.userAddress + addressModel.userAddressDetail;
    let isDefault = this.state.isDefault;
    let regionID = this.state.postAreaid;
    if (addressID > 0) {
      //编辑地址
      userCenterApi
        .updateAddress(
          addressID,
          name,
          phoneNumber,
          regionID,
          addressName,
          isDefault
        )
        .then((res) => {
          console.log(res);
          Taro.navigateBack({});
        });
    } else {
      //新增地址
      userCenterApi
        .addNewAddress(name, phoneNumber, regionID, addressName, isDefault)
        .then((res) => {
          console.log(res);
          addressModel.id = res;
          addressModel.mobile =
            phoneNumber.substring(0, 3) +
            "****" +
            phoneNumber.substring(6, phoneNumber.length);
          addressModel.address_name = addressName;
          let pages = Taro.getCurrentPages();
          let prePage = pages[pages.length - 2];
          prePage.$component.setState({
            selectAddress: addressModel,
          });
          Taro.navigateBack({});
        });
    }
  };

  bindtap1 = (e) => {
    var check = this.state.check;
    check = !check;
    this.setState({
      check: check,
    });
  };

  hideAddress = () => {
    if (!this.state.addressHidden) {
      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: "linear",
      });
      translateAni.translateY(600).step();

      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: "linear",
      });
      opacityAni.opacity(0).step();

      this.setState({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
      });

      setTimeout(
        function () {
          opacityAni.opacity(0).step();
          translateAni.translateY(0).step();
          this.setState({
            translateAnimation: translateAni.export(),
            opacityAnimation: opacityAni.export(),
            addressHidden: true,
          });
        }.bind(this),
        300
      );
    }
  };

  privateStopNoop(e) {
    e.stopPropagation();
  }

  config = {
    navigationBarBackgroundColor: "#49ddb8",
    navigationBarTextStyle: "white",
    pullRefresh:false,
    allowsBounceVertical:'NO',
  };

  render() {
    const {
      addressModel,
      userAddress,
      isIOS,
      isDefault,
      addressHidden,
      opacityAnimation,
      translateAnimation,
      selectProvince,
      selectCity,
      selectDistricts,
      selectAddressType,
      provinceArray,
      cityArray,
      districtsArray,
      customerAddress,
      env_type,
    } = this.state;
    return (
      <View>
        <View className="container">
          <View className="container_name">
            <View className={isIOS ? "customer_left_ios" : "customer_left"}>
              姓名
            </View>
            <View
              className={env_type == "swan" ? "item_right_swan" : "item_right"}
            >
              <Input
                maxlength="16"
                value={addressModel.name}
                onInput={this.bindChange_name}
                placeholder="请输入姓名"
                placeholderStyle="color: #888"
              ></Input>
            </View>
          </View>
          <View className="divLine"></View>
          <View className="container_mobile">
            <View className={isIOS ? "customer_left_ios" : "customer_left"}>
              手机号码
            </View>
            <View
              className={env_type == "swan" ? "item_right_swan" : "item_right"}
            >
              <Input
                type="number"
                maxlength="11"
                value={addressModel.mobile}
                onInput={this.bindChange_mobile}
                placeholder="请输入手机号码"
                placeholderStyle="color: #888"
              ></Input>
            </View>
          </View>
          <View className="divLine"></View>
          <View className="section" onClick={this.selectAddressAction}>
            <Text
              className={isIOS ? "customer_left_ios" : "customer_left"}
              name="regionid"
              value={addressModel.regionid}
            >
              所在地区
            </Text>
            <View
              className={isIOS ? "item_right_address" : "item_right_android"}
            >
              {userAddress}
            </View>
          </View>
          <View className="divLine"></View>
          <View className="container_address">
            <View className="customer_address">详细地址</View>
            <View
              className={
                env_type == "alipay"
                  ? "detail-address_alipay"
                  : "detail-address"
              }
            >
              <Textarea
                id="addressArea"
                className={
                  env_type == "alipay"
                    ? "textarea_address_ailpay"
                    : "textarea_android"
                }
                show-count={false}
                maxlength="50"
                value={addressModel.userAddressDetail}
                
                onBlur={this.addressblur}
                placeholder="请填写详细地址，不少于5个字"
                placeholderStyle="color: #888"
              ></Textarea>
            </View>
          </View>
          <View className="default_address" onClick={this.clickRadioAction}>
            <View className="def_address" onChange={this.checkradioChange}>
              <Image
                className="icon-checkbox"
                src={
                  isDefault
                    ? require("../../../../images/icon_choose.png")
                    : require("../../../../images/icon_unchoose.png")
                }
              ></Image>
              <View
                className={
                  env_type == "alipay" || env_type == "tt"
                    ? "def_center"
                    : "def"
                }
              >
                设为默认地址
              </View>
            </View>
          </View>
        </View>
        {/*  <button bindtap="save" type="primary" class="address-save">保存</button>  */}
        <View className="bottom_container">
          <View onClick={this.save} className="btnBtom">
            <View className="address-add">保存</View>
          </View>
          <View className="bottom_empty"></View>
        </View>
        <View
          hidden={addressHidden}
          className="modal-back"
          onClick={this.hideAddress}
          animation={opacityAnimation}
        ></View>
        <View
          hidden={addressHidden}
          className="modal-content"
          animation={translateAnimation}
          onClick={this.privateStopNoop}
        >
          <View className="bottom">
            <View className="top_menu">
              <View
                className="sele"
                onClick={this.changeSelectAddressType}
                data-type="province"
              >
                <Yfwtitleview
                  title={selectProvince}
                  lineHeight="15"
                  showImage={selectProvince == "省份" ? false : true}
                ></Yfwtitleview>
              </View>
              <View
                className="sele"
                onClick={this.changeSelectAddressType}
                data-type="city"
              >
                <Yfwtitleview
                  title={selectCity}
                  lineHeight="15"
                  showImage={selectCity == "城市" ? false : true}
                ></Yfwtitleview>
              </View>
              <View
                className="sele"
                onClick={this.changeSelectAddressType}
                data-type="districts"
              >
                <Yfwtitleview
                  title={selectDistricts}
                  lineHeight="15"
                  showImage={selectDistricts == "区县" ? false : true}
                ></Yfwtitleview>
              </View>
              <View className="confirm_btn" onClick={this.confirmAction}>
                确定
              </View>
            </View>
            <View className="top_line"></View>
            <ScrollView scrollY="true" className="scrollView">
              {(selectAddressType == "province"
                ? provinceArray
                : selectAddressType == "city"
                ? cityArray
                : districtsArray
              ).map((item, index) => {
                return (
                  <View>
                    <View
                      className="address_content"
                      style={
                        selectProvince == item.region_name ||
                        selectCity == item.region_name ||
                        selectDistricts == item.region_name
                          ? "color:red;"
                          : ""
                      }
                      onClick={this.selectCityAction}
                      data-name={item.region_name}
                      data-id={item.id}
                    >
                      {item.region_name}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }
}
