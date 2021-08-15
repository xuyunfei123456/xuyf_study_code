import { Component } from "react";
import { View, Image, Text, Block, ScrollView, Radio, Button } from "@tarojs/components";
import Taro,{getCurrentInstance} from "@tarojs/taro";
import "./addConsultation.less";
import { connect } from "react-redux";
import { changeState } from "../../store/actions/index";
import { HTTP } from "../../utils/http";
import { pushNavigation } from "../../apis/YFWRouting";
import { AtTextarea, AtImagePicker, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';
import { YFWPriceView } from "../../components/YFWPriceView/YFWPriceView"
const httpRequest = new HTTP();
import { UploadImage } from "../../utils/uploadImage";
var uploadImageFn = new UploadImage();
import {Payment} from '../../utils/payment'
import { isLogin } from "../../utils/YFWPublicFunction";
const payMent = new Payment()
class AddConsultation extends Component {
  constructor() {
    super();
    this.state = {
      firstEnter:true,
      scrollLeft:0,
      choosedSickId:"",//选中的患者ID
      status: 0,
      consultationFlow: [
        { flow: "提交问诊" },
        { flow: "医生接诊" },
        { flow: "视频问诊" },
        { flow: "医生提交诊断" }
      ],
      sickerList: [],
      BillImgFiles: [],
      maxCount: 9, //上传图片最大数量
      sickRuleValue: "", //患者描述病情输入框
      sickRulePlaceholder: '为了医生更好的提供服务，请尽可能详细描述病情（例如：患病时长、做过什么检查、是否正在服药、目前的症状、想要获得的帮助等）',
      inquiryMoney: "80.33", //问诊金额
      inquiryTicket: "11",//问诊券
      read: false, //切换是否已阅读同意书
      modalOpen: false, //控制同意书弹框显示隐藏
      countDown:3, //弹框底部按钮倒计时
      consulationPrice:"",
    };
  }
  componentWillMount() {
    this.getMoney()
  }
  getDetail(InquiryNo,sicklist){
    httpRequest.get('sell_inquiry.getInquiryAgainInfo',{inquiryNo:InquiryNo}).then(res=>{
      if(res){
        let _imgs = res.MedicalCertificate&&res.MedicalCertificate.split('|') ||[],
        _sendimgs = res.MedicalCertificateUrl&&res.MedicalCertificateUrl.split('|') ||[];
        _imgs = _imgs.map((item,index)=>{
          return {
            sendUrl:item,
            url:_sendimgs[index] || '',
          }
        })
        let _data = [],_index,_id;
        if(sicklist.length!=0){
          sicklist = sicklist.map((item,index)=>{
            if( item.IdcardNo == res.IDCard){
              _index = index;
              _id = item.Id;
            }
            _data.push({
              name: item.RealName,
              age: item.Age,
              sex: item.Sex,
              phone: item.Mobile_Hide,
              relationLabel: item.RelationLabel, //身份
              certification: item.DictBoolCertification, //已认证
              default: item.DictBoolDefault, //默认
              oldData: item,
              id: item.Id,
              choosed: item.IdcardNo == res.IDCard ? true:false,
            });
            return item;
          })
          if(_index&&_index>1){
            this.setState({
              scrollLeft:150*_index
            })
          }

        }
        this.setState({
          sickRuleValue:res.Description || '',
          BillImgFiles:_imgs,
          sickerList:_data,
          choosedSickId:_id,
        })
      }
    })
  }
  getMoney(){
    httpRequest.get('guest.getInquiryCost').then(res=>{
      this.setState({
        consulationPrice:res,

      })
    })
  }
  componentDidMount() {
    this.handleClickOpenModal()

  }
  getUseDrug() {
    let userinfo = Taro.getStorageSync("userinfo");
    this.state.userinfo = userinfo
    //获取用药人信息
    httpRequest
      .get("third_account_drug.getList", {
        thirdAccountId: userinfo.thirdAccountId
      })
      .then(res => {
        if(this.state.firstEnter){
          this.state.firstEnter = false;
          let instance = getCurrentInstance();
          const {InquiryNo}= instance.router.params;
          if(InquiryNo){
            this.getDetail(InquiryNo,res)
          }else{
            this.dealDrug(res)
          }
        }else{
          this.dealDrug(res)
        }
      });
  }
  dealDrug(res){
    if (res && res.length != 0) {
      let _data = [];
      const {choosedSickId} = this.state;
      res.map((item,index) => {
        _data.push({
          name: item.RealName,
          age: item.Age,
          sex: item.Sex,
          phone: item.Mobile_Hide,
          relationLabel: item.RelationLabel, //身份
          certification: item.DictBoolCertification, //已认证
          default: item.DictBoolDefault, //默认
          oldData: item,
          id: item.Id,
          choosed:choosedSickId ? choosedSickId == item.Id ? true:false:index == 0 ? true:false
        });
      });
      let _id =  choosedSickId || '' ;
      if(!_id && _data.lenght!=0){
        _id = _data[0].id
      }
      this.setState({
        sickerList: _data,
        choosedSickId:_id,
      });
    }
  }
  componentWillUnmount() { }

  componentDidShow() { 
    this.getUseDrug();
  }

  componentDidHide() { }
  //多行文本框输入
  handleSickRuleChange(value) {
    this.setState({
      sickRuleValue: value
    })
  }
  onChangeBillImg(files, operationType, index) {
    if (files && files.length > this.state.maxCount) {
      Taro.showToast({
        title: `最多上传${this.state.maxCount}张照片`,
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
    console.log(files)
    this.setState({
      BillImgFiles: files
    });
  }
  onClickBillImg() {

  }
  onFailBillImg(mes) {
    console.log(mes, 'mm')
  }
  // 切换是否同意用户协议
  onChangeReadPact() {
    let _read;
    if (this.state.read) {
      _read = false
    } else {
      _read = true
    }
    this.state.read = _read
    this.setState({
      read: _read
    })
  }
  //去支付
  handleGoSkipPay() {
    if(!isLogin()){
      pushNavigation('login');
      return false;
    }
    const { sickRuleValue, read, sickerList,BillImgFiles } = this.state;
    let _sickRuleValue = sickRuleValue.length;
    if (read == false) {
      Taro.showToast({
        title: '未阅读《互联网诊疗风险告知及知情同意书》',
        duration: 1200,
        icon: "none"
      })
      return
    } else if (_sickRuleValue > 0 && _sickRuleValue < 10) {
      Taro.showToast({
        title: '病情描述至少10个字',
        duration: 1200,
        icon: "none"
      })
      return
    } else if (_sickRuleValue == 0) {
      Taro.showToast({
        title: '请描述病情',
        duration: 1200,
        icon: "none"
      })
      return
    } else if (sickerList == 0) {
      Taro.showToast({
        title: '请添加患者',
        duration: 1200,
        icon: "none"
      })
      return
    }
    
    let case_url = [];
    BillImgFiles.map(item => {
      if (item.sendUrl) {
        case_url.push(item.sendUrl);
      }
    });
    if (case_url.length == 0) {
      Taro.showToast({
        title: '请上传病历/检查单/患处图片',
        duration: 1200,
        icon: "none"
      })
      return
    }
    Taro.showLoading({ title: '加载中...' ,mask:true})
    const {choosedSickId,userinfo,consulationPrice} = this.state;
    httpRequest.get('sell_inquiry.insert',{
      inquiryInfo:{
        drugId:choosedSickId,
        thirdAccountId:userinfo.thirdAccountId,
        description:sickRuleValue,
        medicalCertificate:case_url.join('|'),
        totalPrice:consulationPrice,
        shopId:userinfo.shopId
      }
    }).then(res=>{
      let inquiryNo = res.inquiryNo
      payMent.pay({inquiryno:inquiryNo}).then(res=>{
        httpRequest.get('common_payment.updatePayStatus',{type:'wxpay',inquiryno:inquiryNo}).then(res=>{
          Taro.setStorageSync('refreshConsulationPage',1);
           pushNavigation('consultationDetail',{inquiryNo,},'redirect')
        },error=>{
          Taro.setStorageSync('refreshConsulationPage',1);
           pushNavigation('consultationDetail',{inquiryNo,},'redirect')
        })
      },error=>{
        if(error.errMsg&&error.errMsg == 'requestPayment:fail cancel'){
          Taro.showToast({
            title: '您已取消支付',
            icon: 'none',
            duration: 2000,
          })
          setTimeout(()=>{
            Taro.setStorageSync('refreshConsulationPage',1);
            pushNavigation('consultationDetail',{inquiryNo,},'redirect')
          },500)
         
        }
      })
      Taro.hideLoading();
    },error=>{
      Taro.showLoading({ title: '加载中...' ,mask:true})
      Taro.showToast({
        title: error.msg || '创建失败',
        duration: 1200,
        icon: "none"
      })
    })
  }
  //打开同意书弹框
  handleClickOpenModal() {
    let { modalOpen, countDown } = this.state;
    let that=this;
    if (modalOpen == false) {
      modalOpen = true
      this.setState({
        modalOpen: true
      })
    }

    if (modalOpen == true) {
      if (countDown > 0) {
      this.countDownTime = setInterval(() => {
          countDown--;
          console.log(countDown,'countDown')
          that.setState({
            countDown
          })
      
          if (countDown <= 0) {
            clearInterval(that.countDownTime)
            console.log('清除定时器2')
          }
        }, 1000)
      }
    }

  }
  //弹出框确定按钮
  handleClickModalConfirm() {
    let { modalOpen, countDown } = this.state;
    if (modalOpen == true && countDown <= 0) {
      modalOpen = false
      this.setState({
        modalOpen: false,
        read:true,
      })
    }
  }
  // 触发弹出框关闭时的事件
  handleCloseModalConfirm() {
    return false
    // let { modalOpen,countDown } = this.state;
    // if (modalOpen == true) {
    //   modalOpen = false;
    //   if(countDown>0){
    //     countDown=10;
    //     clearInterval(this.countDownTime)
    //     console.log('清除定时器1')
    //   }
    //   this.setState({
    //     modalOpen: false,
    //     countDown
    //   })

    // }
  }
  addSick() {
    pushNavigation("sickPerson", { sickerSort: 1 });
  }
  editSick({oldData},e) {
    e && e.stopPropagation(); // 阻止事件冒泡
    Taro.setStorageSync("sickInfo", oldData);
    pushNavigation("sickPerson", { sickerSort: 2 });
  }
  clickSice({id}){
    let sickerList = this.state.sickerList.map(item=>{
      item.choosed = item.id == id ? true:false;
      return item;
    })
    this.state.choosedSickId = id;
    this.setState({
      sickerList,
    })
  }
  render() {
    const { scrollLeft,consulationPrice,consultationFlow, sickerList, sickRuleValue, sickRulePlaceholder, BillImgFiles, maxCount, inquiryMoney, inquiryTicket, read, modalOpen, countDown } = this.state;
    return (
      <View className='addConsultation'>
        <View className="consultation-info">
          <Image src={require("../../images/radio.png")} className="radio" mode="scaleToFill"></Image>
          <Text>急重症患者不适合网上问诊，请前往医院就诊！</Text>
        </View>
        <View className="consultation-flow">
          {consultationFlow.map((fItem, fIndex) => {
            return (<Block>
              <Text className="txt">{fItem.flow}</Text>
              {consultationFlow.length !== (fIndex + 1) && <Image src={require("../../images/right_graypng.png")} mode="scaleToFill" className="arrow"></Image>}
            </Block>)
          })}

        </View>
        <View className="consultation-sickerInfo">
          <View className="head">
            <View className="head-left">
              <Text className="star">*</Text>
              <Text className="title">患者信息</Text>
            </View>
            <View className="head-right" onClick={this.addSick.bind(this)}>
              <Text className="plus">+</Text>
              <Text className="txt">添加</Text>
            </View>
          </View>
          <View className="sickerList">
            {sickerList.length == 0 && <View className="addSickerBtn" onClick={this.addSick.bind(this)}>
              <View className="centerInfo">
                <Text>+</Text>
                <Text className='txt'>添加患者</Text>
              </View>
            </View>}
            {sickerList.length > 0 &&
              <ScrollView scrollX className="sickerCard-rollArea" scrollLeft={scrollLeft}>
                <View className="sickerCardList" >
                  {sickerList.map((sItem, sIndex) => {
                    return (
                      <View className={`sickerCardItem ${sItem.choosed ? 'sickChoose':''}`} onClick={this.clickSice.bind(this,sItem)}>
                        <Image src={require("../../images/write_gray.png")} className="edit-btn" onClick={this.editSick.bind(this,sItem)}></Image>
                        <View className="name">{sItem.name}</View>
                        <View className="case">
                          <Text>{sItem.sex == 1 ? '男':'女'}</Text>
                          <Text className="left">{sItem.age}岁</Text>
                          <Text className="leftPhone">{sItem.phone}</Text>
                        </View>
                      </View>
                    )
                  })}

                </View>
              </ScrollView>}
          </View>
        </View>
        <View className="consultation-sickerStatus">
          <View className="head">
            <View className="head-left">
              <Text className="star">*</Text>
              <Text className="title">患者病情</Text>
            </View>
          </View>
          <View className="delItem">
            <View className="title">请描述病情<Text className="txtLength">（必填，至少10个字）</Text></View>
            <AtTextarea
              className="sickRulesInput"
              value={sickRuleValue}
              onChange={this.handleSickRuleChange.bind(this)}
              maxLength={200}
              placeholder={sickRulePlaceholder}
            />
          </View>
          <View className="delItem">
            <View className="title">请上传病历/检查单/患处图片<Text className="txtLength">（必填，最多9张）</Text></View>
            <View className="imgItems">
              <AtImagePicker
                count={maxCount}
                length={3}
                multiple
                files={BillImgFiles}
                onChange={this.onChangeBillImg.bind(this)}
                onImageClick={this.onClickBillImg.bind(this)}
                onFail={this.onFailBillImg.bind(this)}
              />
            </View>
          </View>
        </View>
        <View className="consultation-money">
          <View className="mItem">
            <Text>问诊金额</Text>
            <YFWPriceView color="#333333" largeFontSize={14} smallFontSize={12} price={consulationPrice} bold={0}></YFWPriceView>
          </View>
          {/* <View className="mItem">
            <Text>问诊券</Text>
            <View className="ticketNum">
              <Text className="minus">-</Text>
              <YFWPriceView color="#333333" largeFontSize={14} smallFontSize={12} price={inquiryTicket} bold={0}></YFWPriceView>
            </View>
          </View> */}
        </View>
        <View className="consultation-settle">


          <View className="pact">
            <Radio checked={read} value="" style="display:none;"></Radio>

            <View className="circleOut" onClick={this.onChangeReadPact.bind(this)}>
              <View className="circleIn" style={read ? "visibility:inherit" : "visibility:hidden"}></View>
            </View>

            <View className="pact-txt"><Text>我已阅读并知晓</Text><View className="delBtn" onClick={this.handleClickOpenModal.bind(this)}><Text>《互联网诊疗风险告知及知情同意书》</Text></View></View>
          </View>
          <View className="pay">
            <View className="pay-left"><Text className="txt">实付金额</Text>
              <YFWPriceView color="#ff3300" largeFontSize={20} smallFontSize={16} price={consulationPrice} bold={0}></YFWPriceView>
            </View>
            <View className="pay-btn" onClick={this.handleGoSkipPay.bind(this)}>去支付</View>
          </View>
        </View>
        <View className="consultation-modal">
          <AtModal isOpened={modalOpen}
            onClose={this.handleCloseModalConfirm.bind(this)}
            closeOnClickOverlay={false}
          >
            <AtModalHeader>《互联网诊疗风险告知及知情同意书》</AtModalHeader>
            <AtModalContent>
                {renderAgree()}  
            </AtModalContent>
            <AtModalAction><Button onClick={this.handleClickModalConfirm.bind(this)} style={countDown > 0 ? "" : "background: linear-gradient(to right,#00b187,#3acb8f);box-shadow: 0px 0px 5px;"}>确定<Text style={countDown > 0 ? "" : "display: none;"}>{countDown + 's'}</Text></Button></AtModalAction>
          </AtModal>
        </View>
      </View>

    )
  }
}
const renderAgree = ()=>{
  return (
    <View>
      <View className="explain_title">特别提示：</View>
      <View className="explain_content">
      请患者在使用服务前，务必仔细阅读并透彻理解本知情同意书，特别是以粗体标识的条款，患者应重点阅读，在确认充分理解并同意后再开始确定使用服务。在任何情况下，患者的使用服务行为将被视为对本知情同意书全部内容的认可。
      </View>
      <View className="explain_title">互联网诊疗服务规范及风险告知</View>
      <View className="explain_content">根据《互联网诊疗管理办法(试行)》、《互联网医院管理办法(试行)》、《远程医疗服务管理规范(试行)》等法规的要求，患者应知晓互联网诊疗相关的执业规则并接受风险告知和签署《互联网诊疗风险告知及知情同意书》（简称“<Text className='explain_important'>知情同意书</Text>”）。</View>
      <View className="explain_content">互联网诊疗开展部分常见病、慢性病复诊和“互联网+”家庭医生签约服务。互联网医院开展部分常见病、慢性病复诊时，医师应当掌握患者病历资料，确定已有明确诊断后，针对相同诊断进行复诊并开具处方。<Text className='explain_important'>互联网医院可以提供家庭医生签约服务，可以委托符合条件的第三方机构配送药品，可以开展远程医疗服务。</Text>前述服务在本知情同意书中合称“<Text className='explain_important'>服务</Text>”。</View>
      <View className="explain_content explain_important">互联网医院不能开具麻醉药品、精神类药品处方，以及其他用药风险较高，有其他特殊管理规定的药品处方。为6岁以下的儿童开具用药处方时，应当有监护人和相关专业医师陪伴。</View>
      <View className="explain_content explain_important">互联网医院不能直接进行体格检查和实施检查、检验等诊查手段，一旦医生认为患者出现病情变化且需要医务人员亲自诊查时，或复诊疾病属于疑难杂症、出现急症等情形时，医生有权终止本次诊疗活动，患者应积极配合到实体医疗机构就诊。</View>
      <View className="explain_content"><Text className='explain_important'>互联网医院可以提供药品配送相关的服务，但实际服务提供方为合作第三方。相关的服务质量和售后保障由第三方负责。</Text>当发生不良事件时，患者应积极上报。互联网医院可以患者提供“互联网+”家庭医生签约服务或远程医疗服务。患者应遵守相关的服务流程和约定。</View>
      <View className="explain_content">患者应妥善保管信息，不得非法买卖和泄露信息，并在发现信息泄露时，积极上报。</View>
      <View className="explain_content explain_important">互联网诊疗、家庭医生签约、远程医疗服务潜在风险告知及对策</View>
      <View className="explain_content explain_important">接受互联网诊疗、家庭医生签约、远程医疗服务可能出现潜在风险，有些不常见的风险未能——列出，如果患者有疑问应与医生讨论。</View>
      <View className="explain_content">受限于互联网诊疗本身的局限性(如医生不能面诊、触诊等，无法通过相关的诊查手段及检查、检验结果准确判断病情的进展)，医生给出的本次诊疗方案健康管理方案、远程医疗方案依赖于患者所上传的资料和描述的症状，以及既往的病历资料、临床诊断。<Text className='explain_important'>如前述信息不准确或不全面，将对本次诊疗方案的合理制定产生一定的影响。</Text></View>
      <View className="explain_content">提供互联网诊疗、家庭医生服务、远程医疗服务的医生，可能来自于实体医疗机构中的不同级别、性质的医院，执业年限及经验不一。互联网医院的分诊导诊及医患匹配体系已根据患者的需求尽力匹配合适的医生为患者提供服务。<Text className='explain_important'>患者可以自行选择医生，但受限于医生的执业经验及背景，医生给诊疗方案的合理性和先进性可能存在差异。</Text></View>
      <View className="explain_content explain_important">由于疾病本身的特殊性和复杂性，患者本身的体质状况，及现有医疗水平条件的限制等，都存在可能发生各种并发症和危害自身生命健康的意外风险。</View>
      <View className="explain_content">由于疾病本身的复杂性，以及诊疗措施疗效岀现的延后性，诊疗方案、健康管理方案、远程医疗方案可能不会达到患者期许的效果，且有些疾病或并发症是不可根治的，需要患者积极配合，长期坚持治疗，才能延缓疾病的进展。<Text className='explain_important'>医生已经尽力为患者制定合理的方案，致力减少药物治疗不良反应的发生，但不可能完全避免，且不可预测，需要在患者的配合下，并根据临床情况不断调整方案。</Text></View>
      <View className="explain_content"><Text className='explain_important'>疾病的治愈需要患者谨遵医嘱、健康管理方案，并积极配合。</Text>如果患者未完全遵守和配合，则可能导致诊疗效果不理想，甚至出现病情反复、恶化等不良后果。</View>
      <View className="explain_content explain_important">配送药品可能受到物流时效的影响，导致患者延时服用药物，或患者正在用药物或者手术等治疗其他疾病，也可能存在延时用药、联合用药等风险。</View>
      <View className="explain_content explain_important">患者自采药品的品牌、规格、性状、使用方式等可能影响本次诊疗方案的效果，同时还可能出现危害生命健康的风险。</View>
      <View className="explain_content">医生主要解决本专业领域的医疗问题，非本专业的疾病需要到其它专业科室进行诊治或接受远程医疗服务。</View>
      <View className="explain_content">互联网+家庭医生签约服务对持续维护健康具有必要性，如患者难以提供全部既往的诊疗资料，则可能导致健康档案在使用时因资料收集不全而存在潜在风险。</View>
      <View className="explain_content explain_important">当患者使用服务时，需要提交的相关个人信息包括:姓名、性别、年龄、住址、手机号、身份证号码、个人头像、病历信息等相关信息，也可能会开启拍摄、录音、读取外部存储及写入外部存储的相关权限。若其中涉及儿童个人信息的，需在使用服务前取得对应儿童父母或监护人的同意。</View>
      <View className="explain_content explain_important">尽管互联网医院对患者的信息按要求采取了保密措施，但泄密的可能性依然不能完全消除。</View>
      <View className="explain_content explain_important">患者的医疗文件和诊疗数据，独属于医疗机构，可能被用于科学研究(包括但不限于大数据研究)，患者并不能从中直接受益。</View>
      <View className="explain_content explain_important">患者知情同意确认</View>
      <View className="explain_content">患者确认在互联网医院上问诊的疾病，已经在实体医疗机构明确诊断，患者已经填写或上传相关的病历资料，愿意互联网诊疗。</View>
      <View className="explain_content">患者确认既往发生过与本次发病类似的常见病、慢性病病症，并曾经在实体医院诊疗，但现在无法提供与本次病症相关的检诊资料。患者愿意接受互联网医院提供的“互联网+”家庭医生签约服务，并协助医生完善健康档案，达成互联网诊疗。</View>
      <View className="explain_content">患者确认愿意接受医生根据诊疗经验为患者安排的远程医疗服务。</View>
      <View className="explain_content explain_important">患者确认已经知晓并同意以上内容，理解相关的风险，愿意接受互联网医院的服务以及接受疾病诊疗服务，并签署知情同意书。</View>
      <View className="explain_content explain_important">患者确认未得到服务结果会百分之百成功的许诺。</View>
      <View className="explain_content">患者同意患者的诊疗内容在去除姓名、头像、出生日期等信息后将设置为默认展示，医生给患者的指导建议同时也会帮助其他相似情况的患者。<Text className='explain_important'>患者确认并授权我们将收集到的个人信息用于与患者的相关服务，同时可能也被用于科学研究(包括但不限于大数据研究)。</Text></View>
    </View>
  )
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
