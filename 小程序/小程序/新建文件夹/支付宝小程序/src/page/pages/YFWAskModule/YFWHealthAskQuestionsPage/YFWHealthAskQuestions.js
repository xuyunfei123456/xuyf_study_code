import {
  Block,
  View,
  Image,
  ScrollView,
  Form,
  Input,
  Text,
  Textarea,
  Picker,
  RadioGroup,
  Label,
  Radio,
  Button
} from '@tarojs/components'
import Taro, { Component, Config } from '@tarojs/taro'
import Yfwtitleview from '../../../../components/YFWTitleView/YFWTitleView'
var util = require('../../../../utils/util.js')
import {
  HealthAskApi,
  UploadImageApi,
  UserCenterApi,
  SafeApi
} from '../../../../apis/index.js'
import { config } from '../../../../config.js'
const alloffice = new HealthAskApi()
const uploadImageApi = new UploadImageApi()
const userCenterApi = new UserCenterApi()
const safeApi = new SafeApi()
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import YFWMoreModal from '../../../../components/YFWMoreModal/YFWMoreModal'
import './YFWHealthAskQuestions.scss'
const sourceType = [['camera'], ['album']]


class YFWHealthAskQuestions extends Taro.Component {
  config = {
    navigationBarTitleText: '提问',
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    onReachBottomDistance: 90
  }
  constructor(props){
    super(props)
    this.state = {
      sendId:"",
      chooseName:'',
      choosedId:'',
      categories:[],
      allDepartment:[],
      selectPartType:'department',
      selectDepartment:'选择科室',
      selectCategories:'分类',
      opacityAnimation: {},
      translateAnimation: {},
      departHidden:true,
      isOpenMore:false,
      arRight: '../../../../images/icon_arrow_right_gary.png',
      updateimg: '',
      formdata: '',
      sourceTypeIndex: 1,
      sourceType: ['拍照', '相册'],
      dataSouce: [],
      multiArray: [],
      multiIndex: [0, 0],
      keshiArr: [],
      sickArr: [],
      keshiID: '',
      myimageUrl: '',
      isShow: true,
      items: [
        {
          name: '男',
          value: '1'
        },
        {
          name: '女',
          value: '0'
        }
      ],
      ageval:"",
    }
  }
  privateStopNoop(e) {
    e.stopPropagation()
  }
  sourceTypeChange(e) {
    this.setState({
      sourceTypeIndex: e.detail.value
    })
    this.chooseImage()
  }
  chooseImage() {
    const that = this
    Taro.chooseImage({
      count: 1,
      sourceType: sourceType[this.state.sourceTypeIndex],
      sizeType: ['original', 'compressed'],
      success: function(res) {
        that.setState({
          updateimg: res.tempFilePaths[0]
        })
      }
    })
  }
  hideDepart = () => {
    if (!this.state.departHidden) {
      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      this.setState({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
        selectDepartment:'选择科室',
        selectCategories:'分类',
        choosedId:"",
        selectPartType:'department'
      })

      setTimeout(
        function () {
          opacityAni.opacity(0).step()
          translateAni.translateY(0).step()
          this.setState({
            translateAnimation: translateAni.export(),
            opacityAnimation: opacityAni.export(),
            departHidden: true
          })
        }.bind(this),
        300
      )
    }
  }
  selectDepartAction = () => {
    if (this.state.departHidden) {
      let opacityAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      let translateAni = Taro.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      this.setState({
        departHidden: false,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export()
      })

      setTimeout(
        function () {
          opacityAni.opacity(1).step()
          translateAni.translateY(0).step()
          this.setState({
            opacityAnimation: opacityAni.export(),
            translateAnimation: translateAni.export()
          })
        }.bind(this),
        100
      )
    }
  }
  /**
   * 生命周期函数--监听页面加载
   */
  componentWillMount() {
    alloffice.getAlloffice().then(res => {
      console.log(res, '科室')
      this.setState({
        allDepartment:res || []
      })
    })
  }

  formSubmit(e) {
    let delValue = e.detail.value
    Taro.showLoading({
      title:'请稍等'
    })
    if (
      delValue.textarea == '' ||
      delValue.radiogp == undefined ||
      delValue.inputAge == '' ||
      this.state.sendId == ''
    ) {
      Taro.showToast({
        title: '请将信息填写完整',
        icon: 'none'
      })
      Taro.hideLoading()
    } else if (delValue.input.length < 10) {
      Taro.showToast({
        title: '标题内容不能少于10个字',
        icon: 'none'
      })
      Taro.hideLoading()
    } else if(delValue.textarea.length < 10){
      Taro.showToast({
        title: '描述不能少于10个字',
        icon: 'none'
      })
      Taro.hideLoading()
    }else {
      Promise.all([safeApi.getMsgSecCheck(delValue.input),safeApi.getMsgSecCheck(delValue.textarea)]).then(resArr=>{
        if(resArr&&resArr.length!=0){
          if(!resArr[0]){
            Taro.showToast({
              title: '请输入正确的标题',
              icon: 'none'
            })
            Taro.hideLoading()
            return;
          }else if(!resArr[1]){
            Taro.showToast({
              title: '请输入正确的描述',
              icon: 'none'
            })
            Taro.hideLoading()
            return;
          }else{
            this.checkImageAndSend(delValue)
          }
        }else{
          Taro.showToast({
            title: '验证失败,请稍后重试',
            icon: 'none'
          })
          Taro.hideLoading()
        }
  })  
    }
  }
  checkImageAndSend(delValue){
    if (this.state.updateimg) {
      uploadImageApi.upload(this.state.updateimg).then(imageUrl => {
        userCenterApi.getUserAccountInfo().then(info => {
          safeApi.getImgSecCheck(imageUrl).then(res => {
            if (res) {
              alloffice
                .commitQuestionInfo(
                  delValue.input,
                  delValue.textarea,
                  this.state.sendId,
                  delValue.radiogp,
                  delValue.inputAge,
                  info.default_mobile,
                  imageUrl
                )
                .then(res => {
                  console.log(res, '上传成功')
                  Taro.hideLoading()
                  setTimeout(() => {
                     Taro.navigateBack()
                  }, 1000)
                  Taro.showToast({
                    title: '提交成功',
                    icon: 'success'
                  })
                }).catch(err=>{
                  Taro.hideLoading()
                  Taro.showToast({
                    title: err.msg,
                    icon: 'none'
                  })
                })
            } else {
              Taro.hideLoading()
              Taro.showToast({
                title: '请上传合格的图片',
                icon: 'none'
              })
              return
            }
          }).catch(err=>{
            Taro.hideLoading()
            Taro.showToast({
              title: '检测图片失败,请稍后重试',
              icon: 'none'
            })
          })
        }).catch(err=>{
          Taro.hideLoading()
          Taro.showToast({
            title: '获取信息失败,请稍后重试',
            icon: 'none'
          })
        })
      }).catch(err=>{
        Taro.hideLoading()
        Taro.showToast({
          title: '上传图片失败,请稍后重试',
          icon: 'none'
        })
      })
    } else {
      userCenterApi.getUserAccountInfo().then(info => {
        alloffice
          .commitQuestionInfo(
            delValue.input,
            delValue.textarea,
            this.state.pitchId,
            delValue.radiogp,
            delValue.inputAge,
            info.default_mobile
          )
          .then(res => {
            Taro.hideLoading()
            setTimeout(() => {
              Taro.navigateBack()
            }, 1000)
            Taro.showToast({
              title: '提交成功',
              icon: 'success'
            })
          }).catch(err=>{
            Taro.hideLoading()
            Taro.showToast({
              title: err.msg,
              icon: 'none'
            })
          })
      }).catch(err=>{
        Taro.hideLoading()
        Taro.showToast({
          title: '获取信息失败,请稍后重试',
          icon: 'none'
        })
      })
    }
  }
  selectPart = event => {
    let id = event.currentTarget.dataset.id
    let title = event.currentTarget.dataset.name
    if (this.state.selectPartType == 'department') {
      let _item  = this.state.allDepartment.filter(item=>item.id == id)
      this.setState({
        selectDepartment:title,
        categories:_item[0]&&_item[0].items,
        selectPartType:'categories',
        selectCategories:'分类',
        choosedId:'',
      })
    }else{
      this.setState({
        selectCategories:title,
        choosedId:id
      })
    }
  }
  ageCheck(e){
    let _val = e.detail.value;
    if(_val>120)_val =120;
    this.setState({ageval:_val})
    return _val
  }
  openUtilityMenu() {
    this.setState({isOpenMore:true})
  }
  clearWenTitle() {
    this.setState({
      isShow: false
    })
  }
  radioChange(e) {
    var items = this.state.items
    for (var i = 0; i < items.length; ++i) {
      items[i].checked = items[i].value == e.detail.value
    }
    console.log(items)

    this.setState({
      items: items
    })
  }
  changeSelectCategories(){
    if(this.state.selectCategories == '分类')return;
    this.setState({
      selectPartType:'selectCategories'
    })
  }
  changeSelectDepartment(){
    if(this.state.selectCategories == '选择科室')return;
    this.setState({
      selectPartType:'department'
    })

  }
  confirmAction = () => {
    if(this.state.choosedId){
      this.setState({
        chooseName:this.state.selectCategories,
        sendId:this.state.choosedId,
      })
    }
    this.hideDepart()
  }
  render() {
    const {
      isShow,
      formdata,
      sourceType,
      sourceTypeIndex,
      items,
      multiIndex,
      multiArray,
      arRight,
      isOpenMore,
      ageval,
      allDepartment,
      categories,
      selectPartType,
      selectDepartment,
      selectCategories,
      updateimg,
      chooseName,
    } = this.state
    return (
      <Block>
        <View className="outSkip">
        <YFWMoreModal isOpened={isOpenMore} onClose={() => this.setState({ isOpenMore: false })}></YFWMoreModal>
          <View className="topViewSBotm">
            <View className="iSkip" onClick={this.openUtilityMenu}>
              <Image
                className="moreView"
                src={require('../../../../images/more_white.png')}
                mode="aspectFit"
                id="more_image"
              ></Image>
            </View>
          </View>
        </View>
        <View>
          <View>
            <ScrollView></ScrollView>
          </View>
          <Form onSubmit={this.formSubmit}>
            <View className="headline">
              <View className="head-title">
                <Input
                  name="input"
                  placeholderStyle="color:#999999"
                  placeholder="请输入标题"
                  className="topViewSearchInput"
                ></Input>
              </View>
            </View>
            {isShow && (
              <View className="descr-context">
                <View className="descr-view">
                  <View className="wen">
                    <Image
                      src={require('../../../../images/yfwsk/wenhao.png')}
                    ></Image>
                    <Text>让你的问题清晰明了</Text>
                  </View>
                  <View className="wen-view">
                    <View className="wen-view-icon"></View>
                    <Text className="wen-view-text">
                      请咨询药品名称、功能主治、药品相互作用、用法用量、不良反应，禁忌症等内容
                    </Text>
                  </View>
                  <View className="wen-view1">
                    <View className="wen-view-icon"></View>
                    <Text className="wen-view-text">
                      请不要咨询疾病的诊断和治疗方法，因为不能当面确诊，不做具体问答
                    </Text>
                  </View>
                  <View className="wen-view1">
                    <View className="wen-view-icon"></View>
                    <Text className="wen-view-text">
                      请不要提及个人姓名、电话等个人隐私信息，以免泄露
                    </Text>
                  </View>
                  <View className="show" onClick={this.clearWenTitle}>
                    <Image
                      src={require('../../../../images/returnTips_close.png')}
                    ></Image>
                  </View>
                </View>
              </View>
            )}
            <View className="txtarea">
              <Textarea
                name="textarea"
                placeholderClass="referPlace"
                placeholder="详细描述您的问题，方便医生诊断。"
                value={formdata}
              ></Textarea>
              {/*  上传图片  */}
              <View className="outupimg">
                <Picker
                  range={sourceType}
                  onChange={this.sourceTypeChange}
                  value={sourceTypeIndex}
                  mode="selector"
                >
                  <View>
                  {updateimg && (
                  <Image src={updateimg} className='uploadimg'></Image>
                )}
                {!updateimg && (
                  <View className="upimg">
                  <Image src={require('../../../../images/yfwsk/upimg.png')}></Image>
                  <View className="upimg_txt">添加图片</View>
                </View>
                )}
                  </View>


                </Picker>
              </View>

              <View className="clearBoth"></View>
            </View>
            {/*  性别  */}
            <View className="six-view">
              <View className="head-text">性别:</View>
              <RadioGroup onChange={this.radioChange} name="radiogp">
                <View className="label">
                  {items.map((item, index) => {
                    return (
                      <Label
                        className={
                          'ui-radio ' + (item.checked == true ? 'active' : '')
                        }
                      >
                        <Radio
                          value={item.value}
                          checked={item.checked}
                        ></Radio>
                        <Text className="text">{item.name}</Text>
                      </Label>
                    )
                  })}
                </View>
              </RadioGroup>
            </View>
            <View className="botmLine">
              <View></View>
            </View>
            {/*  年龄  */}
            <View className="age-view">
              <View className="head-text">年龄 :</View>
              <View className="headSection Txtage inlMidle">
                <Input
                  type="number"
                  name="inputAge"
                  placeholderStyle="color:#ccc"
                  placeholder="请输入年龄（0-120岁）"
                  onInput={this.ageCheck.bind(this)}
                  value={ageval}
                  maxLength={3}
                ></Input>
              </View>
            </View>
            <View className="botmLine">
              <View></View>
            </View>
            {/*  选择科室  */}
            <View className="choseKe" onClick={this.selectDepartAction}>
                <View className="head-text">
                  选择科室 ：<Text className="pitchId">{chooseName}</Text>
                </View>
                <Image className="imgPosr" src={arRight}></Image>
              </View>
            <Button className="postButton" formType="submit">
              <Text className="text">提交</Text>
            </Button>
          </Form>
        </View>

        <View
          hidden={departHidden}
          className="modal-back"
          onClick={this.hideDepart}
          animation={opacityAnimation}
        ></View>
        <View
          hidden={departHidden}
          className="modal-content"
          animation={translateAnimation}
          onClick={this.privateStopNoop}
        >

          <View className='bottom'>
            <View className="top_menu">
              <View
                className="sele"
                onClick={this.changeSelectDepartment}
                data-type="selectDepartment"
              >
                <Yfwtitleview
                  title={selectDepartment}
                  lineHeight="15"
                ></Yfwtitleview>
              </View>
              <View
                className="sele"
                onClick={this.changeSelectCategories}
                data-type="selectCategories"
              >
                <Yfwtitleview title={selectCategories} lineHeight="15"></Yfwtitleview>
              </View>
              <View className="confirm_btn" onClick={this.confirmAction}>
                确定
              </View>
            </View>
            <View className="top_line"></View>
            <ScrollView scrollY='true' className="scrollView">
              {(selectPartType == 'department'
                ? allDepartment
                : categories 
              ).map((item, index) => {
                return (
                  <View>
                    <View
                      className="address_content"
                      style={
                        selectDepartment == item.department_name ||
                        selectCategories == item.department_name 
                          ? 'color:red;'
                          : ''
                      }
                      onClick={this.selectPart}
                      data-name={item.department_name}
                      data-id={item.id}>
                      {item.department_name}
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Block>
    )
  }
}

export default YFWHealthAskQuestions
