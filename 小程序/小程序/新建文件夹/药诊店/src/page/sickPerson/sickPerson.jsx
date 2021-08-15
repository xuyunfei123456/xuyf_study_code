import Taro, { getCurrentInstance } from "@tarojs/taro";
import { Component } from "react";
import { View, Text, Input, ScrollView, Image } from "@tarojs/components";
import { AtInput, AtFloatLayout } from "taro-ui";
import { HTTP } from "../../utils/http";
const httpRequest = new HTTP();
import { is_phone_number } from "../../utils/YFWPublicFunction";
import DefaultSwitch from "../../components/defalutSwitch/defalutSwitch";
import YFWModal from "../../components/YfwModal/YfwModal";
import { EMOJIS } from "../../utils/YFWRegular";
import "./sickPerson.less";
export default class SickPerson extends Component {
  config = {
    navigationBarTextStyle: "black"
  };

  constructor() {
    super();
    this.state = {
      dataSourceFrom: "", //搜索的疾病类型
      allergyList: [], //过敏史
      familyList: [], //家族病史
      sickerSort: 2, //切换编辑患者页面和新增患者页面的状态
      name: "",
      IDCard: "",
      birthDay: "",
      allergy: 2,
      family: 2,
      liver: 2,
      renal: 2,
      lactation: 2,
      past: 2,
      gender: 0,
      weight: "",
      phone: "",
      currentTab: 0,
      isCancelBtn: "取消",
      isConfirmBtn: "确定",
      isContent: "确定删除该患者信息吗？",
      defaultData: {
        defaultVal: false,
        onColor: "#1fdb9b",
        setDefaultTitle: "设为默认",
        setDefaultContent: "（每次就诊将默认选择该患者）"
      },
      pastList: [],
      openDel: false,
      isShowAddPop: false,
      searchValue: "",
      tabAs: [
        { name: "本人" },
        { name: "家属" },
        { name: "亲戚" },
        { name: "朋友" }
      ],
      searchResult: []
    };
    this.onSave = this.onSave.bind(this);
    this.onDel = this.onDel.bind(this);
    this.onSaveAndUse = this.onSaveAndUse.bind(this);
    this.saveName = this.saveName.bind(this);
    this.saveId = this.saveId.bind(this);
    this.onPast = this.onPast.bind(this);
    this.onAllergy = this.onAllergy.bind(this);
    this.onFamily = this.onFamily.bind(this);
    this.onLiver = this.onLiver.bind(this);
    this.onRenal = this.onRenal.bind(this);
    this.onLactation = this.onLactation.bind(this);
    this.saveWeight = this.saveWeight.bind(this);
    this.savePhone = this.savePhone.bind(this);
    this.changeTabs = this.changeTabs.bind(this);
    this.defaultChange = this.defaultChange.bind(this);
    this.handleClickConfirm = this.handleClickConfirm.bind(this);
    this.handleClickCancel = this.handleClickCancel.bind(this);
  }
  // 输入名字
  saveName(value, event) {
    let { name } = this.state;
    if (!value || value == name) {
      return;
    }
    this.setState({
      name: value
    });
  }
  //输入身份证
  saveId(value, event) {
    if (!value) return;
    let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
    if (idcardReg.test(value)) {
      let birthDay = value.substring(6, 14),
        sex = value.substring(16, 17);
      birthDay =
        birthDay.substring(0, 4) +
        "-" +
        birthDay.substring(4, 6) +
        "-" +
        birthDay.substring(6);
      sex = sex % 2 == 0 ? 1 : 2;
      this.setState({
        IDCard: value,
        birthDay,
        gender: sex
      });
    } else {
      Taro.showToast({
        title: "身份证输入有误，请重新填写",
        icon: "none", //图标，支持"success"、"loading"
        duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
        mask: true //是否显示透明蒙层，防止触摸穿透，默认：false
      });
      this.state.IDCard = "";
      this.setState({
        IDCard: ""
      });
    }
  }
  //输入体重
  saveWeight(value, event) {
    const { weight } = this.state;
    if (!value || value == weight) {
      return;
    }
    this.setState({
      weight: value
    });
  }
  //输入手机号
  savePhone(value, event) {
    const { phone } = this.state;
    if (!value || value == phone) {
      return;
    }
    if (is_phone_number(value)) {
      this.setState({
        phone: value
      });
    }
  }
  changePhone(value, event) {
    if (value.length > 11) {
      let _max = value.substr(0, 11);
      this.setState({
        phone: _max
      });
    }
  }
  weightChange(value, e) {
    if (value.length > 3) {
      let _max = value.substr(0, 3);
      this.setState({
        weight: _max
      });
    }
  }
  // 过往病史
  onPast(e) {
    this.setState({
      past: e.target.dataset.index || this.state.past
    });
  }
  //过敏史
  onAllergy(e) {
    this.setState({
      allergy: e.target.dataset.index || this.state.allergy
    });
  }
  //家族病史
  onFamily(e) {
    this.setState({
      family: e.target.dataset.index || this.state.family
    });
  }
  //肝功能
  onLiver(e) {
    this.setState({
      liver: e.target.dataset.index || this.state.liver
    });
  }
  //肾功能
  onRenal(e) {
    this.setState({
      renal: e.target.dataset.index || this.state.renal
    });
  }
  //妊娠哺乳
  onLactation(e) {
    this.setState({
      lactation: e.target.dataset.index || this.state.lactation
    });
  }
  // 保存
  onSave() {
    const {
      name,
      IDCard,
      phone,
      birthDay,
      gender,
      weight,
      currentTab,
      tabAs,
      pastList,
      allergyList,
      familyList,
      past,
      allergy,
      family,
      liver,
      renal,
      lactation,
    } = this.state;
    const {defaultVal} = this.state.defaultData
    if(name==""){
        Taro.showToast({
            title:'请填写姓名',
            icon:'none'
        })
        return false;
    }
    if(IDCard==""){
        Taro.showToast({
            title:'请填写身份证号码',
            icon:'none'
        })
        return false;
    }
    if(phone==""){
        Taro.showToast({
            title:'请填写手机号码',
            icon:'none'
        })
        return false;
    }
    let RelationLabel = tabAs[currentTab].name,pastListArr=[],allergyListArr=[],familyListArr=[];
         pastList.map(item=>{
            if(item.active){
                pastListArr.push(item.disease_name)
            }
        });
        allergyList.map(item=>{
            if(item.active){
                allergyListArr.push(item.disease_name)
            }
        });
        familyList.map(item=>{
            if(item.active){
                familyListArr.push(item.disease_name)
            }
        });
    let userinfo = Taro.getStorageSync('userinfo');
    let ThirdAccountid = userinfo.thirdAccountId;
    let param={
        ThirdAccountid,
        drugModel:{
            RealName:name,
            Sex:gender == 2 ? 1:0,
            Birthday:birthDay,
            Mobile:phone,
            IdcardNo:IDCard,
            Weight:weight,
            RelationLabel,
            DictBoolDefault:defaultVal ? 1:0,
            DictBoolMedicalHistory:past == 1? 1:0,
            DictBoolAllergyHistory:allergy ==1 ? 1:0,
            DictBoolFamilyHistory:family == 1 ? 1:0,
            DictBoolLiver:liver == 1 ? 1:0,
            DictBoolRenal:renal == 1 ? 1:0,
            DictBoolNurse:lactation == 1 ? 1:0,
        }
    }
    if(past ==1 ){
        if(pastListArr.length == 0){
            Taro.showToast({
                title:'请选择过往病史',
                icon:'none'
            })
            return false;
        }
        param.drugModel.MedicalHistory = pastListArr.join();
    }else{
        param.drugModel.MedicalHistory ='';
    }
    if(allergy ==1 ){
        if(allergyListArr.length == 0){
            Taro.showToast({
                title:'请选择过敏史',
                icon:'none'
            })
            return false;
        }
        param.drugModel.AllergyHistory = allergyListArr.join();
    }else{
        param.drugModel.AllergyHistory ='';
    }
    if(family ==1 ){
        if(familyListArr.length == 0){
            Taro.showToast({
                title:'请选择家族病史',
                icon:'none'
            })
            return false;
        }
        param.drugModel.FamilyHistory = familyListArr.join();
    }else{
        param.drugModel.FamilyHistory ='';
    }
    console.log(param)
    let url
    if(this.state.sickerSort == 1){
        url='third_account_drug.insert'
    }else{
        url='third_account_drug.update'
        param.drugModel.Id = this.state.sickId;
    }
    Taro.showLoading({
        title:'认证中'
    })
    let that= this;
    httpRequest.get(url,{...param}).then(res=>{
        Taro.hideLoading();
        Taro.showToast({
            title:that.state.sickerSort == 1 ?'添加成功':'修改成功',
            icon:'success',
            duration:1000
        })
        setTimeout(()=>{
            Taro.navigateBack()
        },1000)
    },error=>{
        Taro.hideLoading();
        Taro.showToast({
            title:error.msg || '操作失败',
            icon:'none',
            duration:2000
        })
    })

  }
  //删除
  onDel() {
    this.setState({
      openDel: true
    });
  }
  onSaveAndUse() {
    this.onSave();
  }
  //模态框取消按钮事件
  handleClickCancel() {
    this.setState({
      openDel: false
    });
  }
  //模态框确定按钮事件
  handleClickConfirm() {
    this.setState({
      openDel: false
    });
    let userinfo = Taro.getStorageSync('userinfo');
    let ThirdAccountid = userinfo.thirdAccountId;
    Taro.showLoading()
    httpRequest.get('third_account_drug.delete',{id:this.state.sickId,thirdAccountId:ThirdAccountid}).then(res=>{
        Taro.hideLoading();
        Taro.navigateBack()
    },error=>{
        Taro.showToast({
            title:err.msg || '删除失败',
            icon:'none'
        })
        Taro.hideLoading();
    })
  }
  //标签切换
  changeTabs(e) {
    let index = e.currentTarget.dataset.index;
    let current = this.state.currentTab;
    if (index == current) return;
    this.state.currentTab = index;
    this.setState({
      currentTab: index
    });
  }
  //设为默认
  defaultChange() {
    const { defaultData } = this.state;
    if (defaultData.defaultVal == true) {
      this.state.defaultData.defaultVal = false;
    } else {
      this.state.defaultData.defaultVal = true;
    }
    this.setState({
      defaultData: this.state.defaultData
    });
  }
  //过敏史添加按钮
  openAddPop(type, event) {
    this.setState({
      isShowAddPop: true,
      dataSourceFrom: type
    });
  }
  //疾病按钮列表点击事件
  handleClickCutItem(item, type, event) {
    let data = this.state[type];
    data.map(mm => {
      if (mm.diseaseid == item.diseaseid) {
        mm.active = !mm.active;
      }
    });
    this.setState({
      [type]: data
    });
  }
  //关闭过敏史搜索弹出框
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
  //清空输入框内容
  clearSearchValue() {
    this.setState({
      searchValue: "",
      searchResult: []
    });
  }
  //点击搜索表项子元素
  handleSearchClickItem(item, event) {
    const { dataSourceFrom } = this.state;
    let currentData =
        dataSourceFrom == 0
          ? "pastList"
          : dataSourceFrom == 1
          ? "allergyList"
          : "familyList",
      flag = false;
    let data = this.state[currentData].map(mm => {
      if (mm.diseaseid == item.diseaseid) {
        flag = true;
        mm.active = true;
      }
      return mm;
    });
    if (!flag) {
      item.active = true;
      data.push(item);
    }
    this.setState({
      [currentData]: data,
      searchResult: [],
      searchValue: "",
      isShowAddPop: false
    });
  }
  componentWillMount() {
    let instance = getCurrentInstance();
    const { sickerSort } = instance.router.params;
    this.state.sickerSort = sickerSort;
    this.changeBarTitle();
    if(sickerSort ==2 ){
        let sickInfo = Taro.getStorageSync('sickInfo');
        let {
            RealName,
            IdcardNo,
            Birthday,
            Sex,
            Weight,
            Mobile,
            DictBoolMedicalHistory,
            DictBoolAllergyHistory,
            DictBoolFamilyHistory,
            DictBoolLiver,
            DictBoolRenal,
            DictBoolNurse,
            RelationLabel,
            DictBoolDefault,
            MedicalHistory,
            FamilyHistory,
            AllergyHistory,
            Id,
          } = sickInfo;
          let tabAs = this.state.tabAs,currentTab;
          tabAs.map((item,index)=>{
            if(item.name == RelationLabel){
                currentTab = index;
            }
            })
        MedicalHistory =MedicalHistory&&MedicalHistory.split(',') || [];
        AllergyHistory =AllergyHistory&&AllergyHistory.split(',') || [];
        FamilyHistory =FamilyHistory&&FamilyHistory.split(',') || [];
        let pastList=[],familyList=[],allergyList=[];
        MedicalHistory.map(item=>{
            pastList.push({
                active:true,
                disease_name:item
            })
        })
        FamilyHistory.map(item=>{
            familyList.push({
                active:true,
                disease_name:item
            })
        })
        AllergyHistory.map(item=>{
            allergyList.push({
                active:true,
                disease_name:item
            })
        })
        let defaultData = this.state.defaultData;
        defaultData.defaultVal = DictBoolDefault == 1 ?true:false
        this.setState({
            name: RealName,
            IDCard:IdcardNo,
            birthDay: Birthday,
            allergy: DictBoolAllergyHistory == 1 ? 1:2,
            family: DictBoolFamilyHistory == 1 ? 1:2,
            renal: DictBoolRenal == 1 ? 1:2,
            liver:DictBoolLiver == 1 ?1:2,
            lactation: DictBoolNurse == 1 ? 1:2,
            past: DictBoolMedicalHistory == 1 ? 1:2,
            gender: Sex == 1 ? 2:1,
            weight: Weight,
            phone: Mobile,
            pastList,
            familyList,
            allergyList,
            defaultData,
            sickId:Id,
            currentTab,
        })
    }
  }
  componentDidMount() {}
  componentWillUnmount() {}
  componentDidShow() {}
  componentDidHide() {}
  changeBarTitle() {
    if (this.state.sickerSort == 1) {
      Taro.setNavigationBarTitle({
        title: "新增患者"
      });
    } else {
      Taro.setNavigationBarTitle({
        title: "编辑患者"
      });
    }
  }

  render() {
    const {
      past,
      allergy,
      gender,
      name,
      IDCard,
      liver,
      renal,
      lactation,
      family,
      birthDay,
      weight,
      phone,
      currentTab,
      tabAs,
      defaultData,
      openDel,
      sickerSort,
      isCancelBtn,
      isConfirmBtn,
      isContent,
      isShowAddPop,
      searchValue,
      searchResult,
      pastList,
      familyList,
      allergyList
    } = this.state;
    let pastImg =
      past == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let pastImgTwo =
      past == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let genderImg =
      gender == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let genderImgTwo =
      gender == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let allergyImg =
      allergy == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let allergyImgTwo =
      allergy == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");

    let familyImg =
      family == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let familyImgTwo =
      family == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let liverImg =
      liver == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let liverImgTwo =
      liver == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let renalImg =
      renal == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let renalImgTwo =
      renal == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let lactationImg =
      lactation == "1"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    let lactationImgTwo =
      lactation == "2"
        ? require("../../images/0icon_danxuan_xuanzhong.png")
        : require("../../images/0icon_danxuan_moren.png");
    return (
      <View className="wrapper">
        <ScrollView className="scrollArea">
          <View className="notice">
            <Image
              src={require("../../images/radio.png")}
              className="horn_ico"
            ></Image>
            <Text className="notice_txt">
              请真实填写/选择，不实信息将影响医生诊断和开药！
            </Text>
          </View>
          <View className="sicker">
            <View className="sickItem">
              <View className="title">姓名</View>
              <AtInput
                name="name"
                type="text"
                value={name}
                placeholder="请填写真实姓名"
                className="input"
                border={false}
                onBlur={this.saveName}
                maxlength={30}
                editable={sickerSort == 1 ? true:false}
              />
            </View>
            <View className="sickItem">
              <View className="title">身份证</View>
              <AtInput
                name="IDCard"
                value={IDCard}
                type="idcard"
                placeholder="请填写身份证号码"
                className="input"
                border={false}
                onBlur={this.saveId}
                maxlength={18}
                editable={sickerSort == 1 ? true:false}
              />
            </View>
            <View className="sickItem noChange">
              <View className="title">出生年月</View>
              <View className="sign">{birthDay}</View>
            </View>
            <View className="sickItem noChange">
              <View className="title">性别</View>
              <View className="sign">
                <Image
                  data-index="1"
                  src={genderImg}
                  className="sign_check"
                ></Image>
                男
                <Image
                  data-index="2"
                  src={genderImgTwo}
                  className="sign_check sign_two"
                ></Image>
                女
              </View>
            </View>
            <View className="sickItem">
              <View className="title">体重</View>
              <AtInput
                name="weight"
                type="number"
                value={weight}
                placeholder="请填写真实体重"
                className="input"
                border={false}
                onBlur={this.saveWeight}
                maxlength={3}
                onChange={this.weightChange.bind(this)}
              />
              <View className="unit">kg</View>
            </View>
            <View className="sickItem">
              <View className="title">手机号码</View>
              <AtInput
                name="phone"
                type="number"
                value={phone}
                placeholder="请填写手机号码"
                className="input"
                border={false}
                onBlur={this.savePhone}
                onChange={this.changePhone.bind(this)}
                maxlength={11}
              />
            </View>
          </View>
          <View className="illList">
            <View className="illItem">
              <View className="title">过往病史</View>
              <View className="sign" onClick={this.onPast}>
                <Image
                  data-index="1"
                  src={pastImg}
                  className="sign_check"
                ></Image>
                有
                <Image
                  data-index="2"
                  src={pastImgTwo}
                  className="sign_check sign_two"
                ></Image>
                无
              </View>
            </View>
            {past == 1 && (
              <View className="addList">
                {pastList.map((item, index) => {
                  return (
                    <View
                      className={"type " + (item.active ? "ty_act" : "")}
                      onClick={this.handleClickCutItem.bind(
                        this,
                        item,
                        "pastList"
                      )}
                    >
                      {item.disease_name}
                    </View>
                  );
                })}
                <View
                  className="addBtn"
                  onClick={this.openAddPop.bind(this, 0)}
                >
                  <Text className="txt">+</Text>
                </View>
              </View>
            )}

            <View className="illItem">
              <View className="title">过敏史</View>
              <View className="sign" onClick={this.onAllergy}>
                <Image
                  data-index="1"
                  src={allergyImg}
                  className="sign_check"
                ></Image>
                有
                <Image
                  data-index="2"
                  src={allergyImgTwo}
                  className="sign_check sign_two"
                ></Image>
                无
              </View>
            </View>
            {allergy == 1 && (
              <View className="addList">
                {allergyList.map((item, index) => {
                  return (
                    <View
                      className={"type " + (item.active ? "ty_act" : "")}
                      onClick={this.handleClickCutItem.bind(
                        this,
                        item,
                        "allergyList"
                      )}
                    >
                      {item.disease_name}
                    </View>
                  );
                })}
                <View
                  className="addBtn"
                  onClick={this.openAddPop.bind(this, 1)}
                >
                  <Text className="txt">+</Text>
                </View>
              </View>
            )}
            <View className="illItem">
              <View className="title">家族病史</View>
              <View className="sign" onClick={this.onFamily}>
                <Image
                  data-index="1"
                  src={familyImg}
                  className="sign_check"
                ></Image>
                有
                <Image
                  data-index="2"
                  src={familyImgTwo}
                  className="sign_check sign_two"
                ></Image>
                无
              </View>
            </View>
            {family == 1 && (
              <View className="addList">
                {familyList.map((item, index) => {
                  return (
                    <View
                      className={"type " + (item.active ? "ty_act" : "")}
                      onClick={this.handleClickCutItem.bind(
                        this,
                        item,
                        "familyList"
                      )}
                    >
                      {item.disease_name}
                    </View>
                  );
                })}
                <View
                  className="addBtn"
                  onClick={this.openAddPop.bind(this, 2)}
                >
                  <Text className="txt">+</Text>
                </View>
              </View>
            )}
            <View className="illItem">
              <View className="title">肝功能</View>
              <View className="sign" onClick={this.onLiver}>
                <Image
                  data-index="1"
                  src={liverImg}
                  className="sign_check"
                ></Image>
                有
                <Image
                  data-index="2"
                  src={liverImgTwo}
                  className="sign_check sign_two"
                ></Image>
                正常
              </View>
            </View>
            <View className="illItem">
              <View className="title">肾功能</View>
              <View className="sign" onClick={this.onRenal}>
                <Image
                  data-index="1"
                  src={renalImg}
                  className="sign_check"
                ></Image>
                有
                <Image
                  data-index="2"
                  src={renalImgTwo}
                  className="sign_check sign_two"
                ></Image>
                正常
              </View>
            </View>
            <View className="illItem">
              <View className="title">妊娠哺乳</View>
              <View className="sign" onClick={this.onLactation}>
                <Image
                  data-index="1"
                  src={lactationImg}
                  className="sign_check"
                ></Image>
                有
                <Image
                  data-index="2"
                  src={lactationImgTwo}
                  className="sign_check sign_two"
                ></Image>
                无
              </View>
            </View>
          </View>
          <View className="relation">
            <View className="relationItem">
              <View className="title">关系标签</View>
              <View className="tabs">
                {tabAs.map((item, index) => {
                  return (
                    <View
                      className={
                        "tabItem " + (index == currentTab ? "onTabItem" : "")
                      }
                      data-index={index}
                      onClick={this.changeTabs}
                    >
                      {item.name}
                    </View>
                  );
                })}
              </View>
            </View>
            <DefaultSwitch
                data={defaultData}
                defaultChange={this.defaultChange}
              ></DefaultSwitch>
          </View>
          {sickerSort == 1 ? (
            <View className="bottomAreaAdd">
              <View className="saveBtn" onClick={this.onSaveAndUse}>
                保存并使用
              </View>
            </View>
          ) : (
            <View className="bottomAreaEdit">
              <View className="delBtn" onClick={this.onDel}>
                删除
              </View>
              <View className="saveBtn" onClick={this.onSave}>
                保存
              </View>
            </View>
          )}
        </ScrollView>
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
        <YFWModal
          isOpen={openDel}
          content={isContent}
          cancelBtn={isCancelBtn}
          confirmBtn={isConfirmBtn}
          cancelFn={this.handleClickCancel}
          confirmFn={this.handleClickConfirm}
        ></YFWModal>
      </View>
    );
  }
}
