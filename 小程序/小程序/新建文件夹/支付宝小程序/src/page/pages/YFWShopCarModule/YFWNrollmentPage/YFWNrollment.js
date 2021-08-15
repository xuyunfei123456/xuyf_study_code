import {
  set as setGlobalData,
  get as getGlobalData,
} from "../../../../global_data";
import { OrderPaymentApi, UserCenterApi } from "../../../../apis/index";
const userCenterApi = new UserCenterApi();
const orderPaymentApi = new OrderPaymentApi();
import "./YFWNrollment.scss";
export default class YFWNrollment extends Taro.Component {
  constructor(props) {
    super(props);
    this.state = {
      htmName: "",
      htmId: "",
      second_type: 1,
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
      jobFlag2: false,
      startDate: "",
      date: "",
      jobvalue: "",
      jobFlag: false,
      zzms: "",
      dangerarea: 0,
      outarea: 0,
      purpose: 2,
      fs: 0,
      ks: 0,
      xm: 0,
      is_fl: 0,
      other: 0,
      name: "",
      mobile: "",
      idcard: "",
      tw: "",
      zzChange: "",
      contentHeight: "",
      hasInput: 0,
      hasPatient: true,
      needenrollment_prompt: "",
      agreeFlag: 0,
      _workArr: [],
      htmArr: [],
    };
  }

  componentWillMount() {
    let params = this.$router.params.params;
    if (params && typeof params == "string") {
      params = JSON.parse(params);
    }
    let systeminfo = Taro.getSystemInfoSync();
    let _height = (systeminfo.windowHeight-systeminfo.statusBarHeight-systeminfo.titleBarHeight),_w = systeminfo.windowWidth,_ration = 750/_w
    _height =_height*_ration;
    let yqfkInfo = getGlobalData("yqfkInfo");
    let _yqfkInfo = JSON.parse(JSON.stringify(yqfkInfo));
    if (_yqfkInfo.isSave) {
      this.setState({
        name: _yqfkInfo.drugname,
        idcard: _yqfkInfo.drugidcardno,
        mobile: _yqfkInfo.drugmobile,
        fs: _yqfkInfo.fs,
        ks: _yqfkInfo.ks,
        xm: _yqfkInfo.xm,
        other: _yqfkInfo.qt,
        dangerarea: _yqfkInfo.iscontact == 1 ? 1 : 2,
        outarea: _yqfkInfo.isarrivals == 1 ? 1 : 2,
        zzms: _yqfkInfo.desc_sym,
        purpose: _yqfkInfo.medicate_purpose == 1 ? 1 : 2,
        jobvalue:_yqfkInfo.work_trade,
        userAddress:_yqfkInfo.from_where,
        date:_yqfkInfo.last_come_time,
        is_fl:_yqfkInfo.is_fl,
        agreeFlag:_yqfkInfo.agreeFlag
      });
    }
    this.setState({
      contentHeight: (_height - 340) ,
      hasPatient: params.hasPatient,
      needenrollment_prompt: params.needenrollment_prompt,
    });
  }
  componentDidMount() {
    let _date = new Date();
    let work_trade_items = getGlobalData("work_trade_items");
    let _workArr = Object.values(work_trade_items);
    this.setState({
      _workArr,
      startDate:
        _date.getFullYear() + "-" + _date.getMonth() + "-" + _date.getDay(),
    });
    userCenterApi
      .getProvinceAndCityInfo(0)
      .then((result) => {
        this.setState({
          provinceArray: result,
        });
      })
      .then((error) => {});
    userCenterApi
      .getProvinceAndCityInfo(-1)
      .then((result) => {
        this.setState({
          htmArr: result,
        });
      })
      .then((error) => {});
  }
  config = {
    navigationBarBackgroundColor: "#49ddb8",
    navigationBarTitleText: "疫情防控药品登记",
    navigationBarTextStyle: "white",
  };
  dangerarea(e) {
    this.setState({
      dangerarea: e.target.targetDataset.index || this.state.dangerarea,
    });
  }
  outarea(e) {
    this.setState({
      outarea: e.target.targetDataset.index || this.state.outarea,
    });
  }
  purpose(e) {
    this.setState({
      purpose: e.target.targetDataset.index || this.state.purpose,
    });
  }
  zzClick(e) {
    let _index = e.target.targetDataset.index;
    this.setState({
      [_index]: this.state[_index] == 0 ? 1 : 0,
    });
  }
  idcardChange(e) {
    let { value } = e.detail;
    this.setState({
      idcard: value,
    });
  }
  nameChange(e) {
    let { value } = e.detail;
    this.setState({
      name: value,
    });
  }
  mobileChange(e) {
    let { value } = e.detail;
    value = value.replace(/[^\d]/g, "");
    this.setState({
      mobile: value,
    });
    return value;
  }
  zzChange(e) {
    let { value } = e.detail;
    this.setState({
      zzms: value,
      hasInput: value.length,
    });
    return value;
  }
  jobchoose() {
    this.setState({
      jobFlag: true,
    });
    setTimeout(() => {
      this.setState({
        jobFlag2: true,
      });
    }, 100);
  }
  handleConfirm() {
    if (!this.state.hasPatient) {
      let verify = [{
        id: 'name',
        toast: '请输入用药人姓名'
      }, {
        id: 'idcard',
        toast: '请输入用药人身份证号'
      }, {
        id: 'mobile',
        toast: '请输入手机号'
      }, ]
      for (let item of verify) {
        if (this.state[item.id] == "") {
          Taro.showToast({
            title: item.toast,
            duration: 2000,
            icon: 'none'
          })
          return;
        }
      }
    }
    const {
      fs,
      ks,
      xm,
      other,
      zzms,
      dangerarea,
      outarea,
      name,
      idcard,
      mobile,
      tw,
      purpose,
      jobvalue,
      userAddress,
      date,
      agreeFlag,
      is_fl,
      _workArr
    } = this.state;
    if (purpose == 1 && !fs && !ks && !xm && !is_fl && !other) {
      Taro.showToast({
        title: '请选择具体症状',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (jobvalue == "" && _workArr.length != 0) {
      Taro.showToast({
        title: '请选择从事行业',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (purpose == 1 && !fs && !ks && !xm && !other) {
      Taro.showToast({
        title: '请选择症状',
        duration: 2000,
        icon: 'none'
      })
      return;
    } else if (other && zzms == "") {
      Taro.showToast({
        title: '请输入症状描述',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (dangerarea == 0) {
      Taro.showToast({
        title: '请选择30天内是否去过中高风险地区',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (outarea == 0) {
      Taro.showToast({
        title: '请选择30天内是否有境外/接触史',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (userAddress == "") {
      Taro.showToast({
        title: '请选择来自何地',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (date == "") {
      Taro.showToast({
        title: '请选择最近一次来沪日期',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (agreeFlag == 0) {
      Taro.showToast({
        title: '请勾选 承诺填写内容真实有效',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    let _yqfkInfo = {
      drugname: name,
      drugidcardno: idcard,
      drugmobile: mobile,
      fs:purpose == 1 ? fs : 0,
      ks:purpose == 1 ? ks : 0,
      xm:purpose == 1 ? xm : 0,
      qt:purpose == 1 ? other : 0,
      isarrivals: outarea == 1 ? 1 : 0,
      iscontact: dangerarea == 1 ? 1 : 0,
      isSave: true,
      desc_sym: other == 1 ? zzms : '',
      medicate_purpose: purpose == 1 ? 1 : 0,
      work_trade:jobvalue,
      from_where:userAddress,
      last_come_time:date,
      is_fl:purpose == 1 ? is_fl : 0,
      agreeFlag,
    }
    if (this.state.hasPatient) {
      setGlobalData('yqfkInfo',_yqfkInfo)
      Taro.navigateBack();
      return;
    }
    orderPaymentApi.userverified({
      name,
      idcardno: idcard
    }).then(res => {
      if (res) {
        setGlobalData('yqfkInfo',_yqfkInfo)
        Taro.navigateBack();
      } else {
        Taro.showToast({
          title: res.msg || '实名认证失败，请稍后重试',
          duration: 2000,
          icon: 'none'
        })
      }
    }, err => {
      Taro.showToast({
        title: err.msg || '实名认证失败，请稍后重试',
        duration: 2000,
        icon: 'none'
      })
    })


  }
  closejob() {
    this.setState({
      jobFlag2: false,
    });

    setTimeout(() => {
      this.setState({
        jobFlag: false,
      });
    }, 500);
  }
  handleCatchTap() {
    return true;
  }
  listClick(e) {
    let jobvalue = e.target.targetDataset.id;
    this.setState({
      jobFlag2: false,
      jobvalue,
    });
    setTimeout(() => {
      this.setState({
        jobFlag: false,
      });
    }, 500);
  }
  closearea() {
    this.setState({
      areaFlag2: false,
    });

    setTimeout(() => {
      this.setState({
        areaFlag: false,
      });
    }, 500);
  }
  secendClick(e) {
    let _type = e.currentTarget.dataset.type;
    this.setState({
      second_type: _type,
    });
  }
  areaClick() {
    this.setState({
      areaFlag: true,
    });
    setTimeout(() => {
      this.setState({
        areaFlag2: true,
      });
    }, 100);
  }
  selectCityAction(event) {
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
        if (this.state.selectAddressType == "province") {
          this.setState({
            cityArray: result,
            districtsArray: [],
            selectProvince: title,
            selectAddressType: "city",
            selectCity: "城市",
            selectDistricts: "区县",
            selectAreaID: id,
          });
        } else if (this.state.selectAddressType == "city") {
          this.setState({
            districtsArray: result,
            selectCity: title,
            selectAddressType: result.length > 0 ? "districts" : "city",
            selectDistricts: result.length > 0 ? "区县" : "",
            selectAreaID: id,
          });
        }
      })
      .then((error) => {});
  }
  selecthtmArr(event) {
    let id = event.currentTarget.dataset.id;
    let title = event.currentTarget.dataset.name;
    this.setState({
      htmName: title,
      htmId: id,
    });
  }
  changeSelectAddressType(event) {
    let type = event.currentTarget.dataset.type;
    this.setState({
      selectAddressType: type,
    });
  }
  confirmAction() {
    if (
      this.state.second_type == 1 &&
      (this.state.selectProvince == "省份" ||
        this.state.selectCity == "城市" ||
        this.state.selectDistricts == "区县")
    ) {
      Taro.showToast({
        title: "请选择地点",
        icon: "none",
      });
      return;
    }
    if (this.state.second_type == 2 && this.state.htmName == "") {
      Taro.showToast({
        title: "请选择地点",
        icon: "none",
      });
      return;
    }
    this.closearea();
    let _userAddress =
      this.state.second_type == 1
        ? this.state.selectProvince +
          this.state.selectCity +
          this.state.selectDistricts
        : this.state.htmName;
    this.setState({
      // selectAddressType: 'province',
      // selectProvince: '省份',
      // selectCity: '城市',
      // selectDistricts: '区县',
      userAddress: _userAddress,
    });
  }
  bindDateChange(e) {
    this.setState({
      date: e.detail.value,
    });
  }
  agreeInfo(){
    this.setState({
      agreeFlag:this.state.agreeFlag == 0 ? 1 : 0
    })
  }
  render() {
    const {
      hasPatient,
      name,
      idcard,
      mobile,
      contentHeight,
      data,
      other,
      hasInput,
      zzms,
      fs,
      ks,
      xm,
      fl,
      dangerarea,
      outarea,
      purpose,
      needenrollment_prompt,
      jobvalue,
      jobFlag,
      _workArr,
      jobFlag2,
      selectAddressType,
      provinceArray,
      cityArray,
      districtsArray,
      second_type,
      htmArr,
      areaFlag2,
      areaFlag,
      userAddress,
      htmName,
      selectProvince,
      selectCity,
      selectDistricts,
      date,
      startDate,
      agreeFlag,
    } = this.state;
    const kob_content =
      (jobFlag2 ? "showloading" : "hideloading") + " kob_content";
    const kob_content2 =
      (areaFlag2 ? "showloading" : "hideloading") + " kob_content";
    const _address =
      selectAddressType == "province"
        ? provinceArray
        : selectAddressType == "city"
        ? cityArray
        : districtsArray;
    let agreePic = agreeFlag
    ? require("../../../../images/sign_square_checked.png")
    : require("../../../../images/sign_square_check.png");
    let fsimg = fs
      ? require("../../../../images/sign_square_checked.png")
      : require("../../../../images/sign_square_check.png");
    let ksimg = ks
      ? require("../../../../images/sign_square_checked.png")
      : require("../../../../images/sign_square_check.png");
    let xmimg = xm
      ? require("../../../../images/sign_square_checked.png")
      : require("../../../../images/sign_square_check.png");
    let otherimg = other
      ? require("../../../../images/sign_square_checked.png")
      : require("../../../../images/sign_square_check.png");
    let flimg = fl
      ? require("../../../../images/sign_square_checked.png")
      : require("../../../../images/sign_square_check.png");
    let dangerimg =
      dangerarea == 1
        ? require("../../../../images/sign_checked.png")
        : require("../../../../images/sign_check.png");
    let dangerImgTwo =
      dangerarea == 2
        ? require("../../../../images/sign_checked.png")
        : require("../../../../images/sign_check.png");
    let outareaImg =
      outarea == 1
        ? require("../../../../images/sign_checked.png")
        : require("../../../../images/sign_check.png");
    let outareaImageTwo =
      outarea == 2
        ? require("../../../../images/sign_checked.png")
        : require("../../../../images/sign_check.png");
    let purposeImg =
      purpose == 1
        ? require("../../../../images/sign_checked.png")
        : require("../../../../images/sign_check.png");
    let purposeImageTwo =
      purpose == 2
        ? require("../../../../images/sign_checked.png")
        : require("../../../../images/sign_check.png");
    return (
      <View className="top">
        <View className="yellowtip">
          根据《上海市公共卫生应急管理条例》，为落实疫情防控要求，需要您如实填写以下内容，如有隐瞒或虚报，将依法追究责任。
        </View>
        {needenrollment_prompt && (
          <View className="purpletip">
            <Image
              className="sign_tip"
              src={require("../../../../images/Icon_warning_Drug_Regist.png")}
            ></Image>
            {needenrollment_prompt}
          </View>
        )}

        <View className="wrapper" style={"height:" + contentHeight+'rpx'}>
          {!hasPatient && (
            <Block>
              <View className="row">
                <View className="title">用药人姓名</View>
                <Input
                  className="input"
                  type="text"
                  controlled
                  placeholder="请输入用药人真实姓名"
                  value={name}
                  onInput={this.nameChange}
                  placeholder-class="holdersize"
                />
              </View>
              <View className="row">
                <View className="title">身份证号</View>
                <Input
                  className="input"
                  type="text"
                  controlled
                  placeholder="请输入用药人身份证号"
                  maxlength="18"
                  value={idcard}
                  onInput={this.idcardChange}
                  placeholder-class="holdersize"
                />
              </View>
              <View className="row">
                <View className="title">手机号</View>
                <Input
                  className="input"
                  type="text"
                  controlled
                  placeholder="请输入手机号"
                  maxlength="11"
                  onInput={this.mobileChange}
                  placeholder-class="holdersize"
                  value={mobile}
                />
              </View>
            </Block>
          )}

          <View className="row" style="border:none">
            <View className="title">用药目的</View>
            <View onClick={this.purpose}>
              <Image
                data-index="1"
                className="sign_check"
                src={purposeImg}
              ></Image>
              治疗
              <Image
                data-index="2"
                className="sign_check"
                style="margin-left:20rpx"
                src={purposeImageTwo}
              ></Image>
              预防储备
            </View>
          </View>
          {purpose == 1 && (
            <View className="row">
              <View className="title">症状</View>
              <View onClick={this.zzClick} style="font-size:28rpx">
                <Image
                  data-index="fs"
                  className="sign_check"
                  src={fsimg}
                ></Image>
                发热
                <Image
                  data-index="ks"
                  className="sign_check"
                  src={ksimg}
                ></Image>
                咳嗽
                <Image
                  data-index="xm"
                  className="sign_check"
                  src={xmimg}
                ></Image>
                胸闷
                <Image
                  data-index="fl"
                  className="sign_check"
                  src={flimg}
                ></Image>
                乏力
                <Image
                  data-index="other"
                  className="sign_check"
                  src={otherimg}
                ></Image>
                其他
              </View>
            </View>
          )}

          {other && (
            <View style="position:relative">
              <Textarea
                className="opinion"
                controlled
                onInput={this.zzChange}
                value={zzms}
                maxlength="200"
                placeholder="请描述症状"
              ></Textarea>
              {/* <View className="hasInput">{hasInput}/200</View> */}
            </View>
          )}
          <View className="row" style="border:none" onClick={this.jobchoose}>
            <View className="title">从事行业</View>
            <View className="chooseItem">
              {jobvalue && <View>{jobvalue}</View>}
              {!jobvalue && (
                <View>
                  请选择
                  <Image
                    className="rightImage"
                    src={require("../../../../images/uc_next.png")}
                  />
                </View>
              )}
            </View>
          </View>

          <View className="row">
            <View className="title">30天内是否去过中高风险地区</View>
            <View onClick={this.dangerarea}>
              <Image
                data-index="1"
                className="sign_check"
                src={dangerimg}
              ></Image>
              是
              <Image
                data-index="2"
                className="sign_check"
                style="margin-left:20rpx"
                src={dangerImgTwo}
              ></Image>
              否
            </View>
          </View>
          <View className="row" style="border:none">
            <View className="title">30天内是否有境外/接触史</View>
            <View onClick={this.outarea}>
              <Image
                data-index="1"
                className="sign_check"
                src={outareaImg}
              ></Image>
              是
              <Image
                data-index="2"
                className="sign_check"
                style="margin-left:20rpx"
                src={outareaImageTwo}
              ></Image>
              否
            </View>
          </View>
          <View className="row">
            <View className="title">来自何地</View>
            <View onClick={this.areaClick}>
              {userAddress && <View className="picker">{userAddress}</View>}
              {!userAddress && (
                <View className="picker" style="color:#999999">
                  请选择
                  <Image
                    className="rightImage"
                    src={require("../../../../images/uc_next.png")}
                  />
                </View>
              )}
            </View>
          </View>
          <View class="row" style="border:none">
            <View class="title">最近一次来自目的地的日期</View>
            <Picker
              mode="date"
              value={date}
  
              onChange={this.bindDateChange}
            >
              <View>
                {date && <View class="picker">{date}</View>}
                {!date && (
                  <View class="picker" style="color:#999999">
                    请选择
                    <Image
                      class="rightImage"
                      src={require("../../../../images/uc_next.png")}
                    />
                  </View>
                )}
              </View>
            </Picker>
          </View>
        </View>
        <View className="bottom">
          <View className="sign_tip_wrapper" style="color:#ff3300">
            <Image
              onClick={this.agreeInfo}
              className="sign_check2"
              src={agreePic}
            ></Image>
            {"我承诺以上填写内容均真实有效，否则承担一切法律责任"}
          </View>

          <View className="action" onClick={this.handleConfirm}>
            <Text>保存</Text>
          </View>
        </View>

        {jobFlag && (
          <View className="jobWrapper" catchTap={this.closejob}>
            <View style="position:relative;height:100%;width:100%">
              <View
                className={kob_content}
                onClick={(e) => e.stopPropagation()}
              >
                <View className="jobtitle">
                  请选择从事行业
                  <View className="clickview" onClick={this.closejob}>
                    <Image
                      src={require("../../../../images/returnTips_close.png")}
                      className="close"
                    ></Image>
                  </View>
                </View>
                <View className="listWrapper" onClick={this.listClick}>
                  {_workArr &&
                    _workArr.map((item) => {
                      return (
                        <View className="jobline" data-id={item}>
                          {item}
                        </View>
                      );
                    })}
                </View>
              </View>
            </View>
          </View>
        )}

        {areaFlag && (
          <View className="jobWrapper" catchTap={this.closearea}>
            <View style="position:relative;height:100%;width:100%">
              <View
                className={kob_content2}
                onClick={(e) => e.stopPropagation()}
              >
                <View className="areatitle">
                  请选择来自何地
                  <View className="clickview" onClick={this.closearea}>
                    <Image
                      src={require("../../../../images/returnTips_close.png")}
                      className="close"
                    ></Image>
                  </View>
                </View>
                <View className="from">
                  <View data-type="1" onClick={this.secendClick}>
                    <View
                      className="second_title"
                      style={
                        "color:" + (second_type == 1 ? "#1fdb9b" : "black")
                      }
                    >
                      中国大陆
                    </View>
                    <View
                      className="border_bottom"
                      style={"opacity:" + (second_type == 1 ? "1" : "0")}
                    ></View>
                  </View>
                  <View
                    style="margin-left:80rpx"
                    data-type="2"
                    onClick={this.secendClick}
                  >
                    <View
                      className="second_title"
                      style={"color:" + (second_type == 2 ? "#1fdb9b" : "black")}
                    >
                      港澳台及海外
                    </View>
                    <View
                      className="border_bottom"
                      style={"opacity:" + (second_type == 2 ? "1" : "0")}
                    ></View>
                  </View>
                  <View className="confirm_btn">
                    <Text onClick={this.confirmAction}>确定</Text>
                  </View>
                </View>

                {second_type == 1 && (
                  <View>
                    <View className="top_menu">
                      <View
                        className="sele"
                        onClick={this.changeSelectAddressType}
                        data-type="province"
                      >
                        <View
                          style={
                            "color:" +
                            (selectAddressType == "province"
                              ? "#1fdb9b"
                              : "black")
                          }
                        >
                          {selectProvince}
                        </View>
                      </View>
                      <View
                        className="sele"
                        onClick={this.changeSelectAddressType}
                        data-type="city"
                      >
                        <View
                          style={
                            "color:" +
                            (selectAddressType == "city" ? "#1fdb9b" : "black")
                          }
                        >
                          {selectCity}
                        </View>
                      </View>
                      <View
                        className="sele"
                        onClick={this.changeSelectAddressType}
                        data-type="districts"
                      >
                        <View
                          style={
                            "color:" +
                            (selectAddressType == "districts"
                              ? "#1fdb9b"
                              : "black")
                          }
                        >
                          {selectDistricts}
                        </View>
                      </View>
                    </View>
                    <View className="areaWrapper">
                      {_address &&
                        _address.map((m) => {
                          const _color =
                            selectProvince == m.region_name ||
                            selectCity == m.region_name ||
                            selectDistricts == m.region_name
                              ? "red"
                              : "";
                          return (
                            <View
                              className="jobline listall"
                              style={"color:" + _color}
                              onClick={this.selectCityAction}
                              data-name={m.region_name}
                              data-id={m.id}
                            >
                              {m.region_name}
                            </View>
                          );
                        })}
                    </View>
                  </View>
                )}
                {second_type == 2 && (
                  <View className="areaWrapper">
                    {htmArr &&
                      htmArr.map((n) => {
                        return (
                          <View
                            className="jobline listall"
                            style={htmName == n.region_name ? "color:red;" : ""}
                            onClick={this.selecthtmArr}
                            data-name={n.region_name}
                            data-id={n.id}
                          >
                            {n.region_name}
                          </View>
                        );
                      })}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
