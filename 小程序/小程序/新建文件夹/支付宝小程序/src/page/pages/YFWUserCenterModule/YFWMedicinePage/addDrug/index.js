import { Block, View, ScrollView, Input, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
// pages/address/address.js
import { UseDrug } from '../../../../../apis/index.js'
import { set as setGlobalData, get as getGlobalData } from '../../../../../global_data'
import './index.scss'
var UseDrugCom = new UseDrug()

class _C extends Taro.Component {
  constructor (props) {
    super(props)
    this.state = {
      cerFlag: false,
      cerinfo: {
        name: '',
        idcard: ''
      },
      screenHeight: '',
      tzFlag: false,
      resultFlag: false,
      resultMsg: '',
      nodataFlag: true,
      isDefault: false,
      bottomHidden: true,
      historyFlag2: true,
      familyFlag2: true,
      ganFlag2: true,
      shenFlag2: true,
      rcFlag2: true,
      gmFlag2: true,
      addFlag: true,
      operationName: '完成',
      personalInfo: {
        idcard: '',
        weight: '',
        mobile: '',
        name: ''
      },
      historyDiseaseData: [],
      disease_searchValue: '',
      gmDiseaseData: [],
      addFlagType: '',
      familyDiseaseData: [],
      _hisdata1: '',
      _hisdata2: '',
      _hisdata3: '',
      tags: [
        {
          name: '本人',
          choose: true
        },
        {
          name: '家属',
          choose: false
        },
        {
          name: '亲戚',
          choose: false
        },
        {
          name: '朋友',
          choose: false
        }
      ],
      choosedVal: '本人',
      id: ''
    }
}
  config = {
    navigationBarBackgroundColor: '#49ddb8',
    navigationBarTextStyle: 'white',
    disableScroll: true
  }
  componentWillMount () { 
    const _param = this.$router.params.params
    var options = (_param && JSON.parse(_param)) || {}
    this.setState({
      _type: options.type
    })
    if (options.type == 2) {
      //编辑跳转过来
      Taro.setNavigationBarTitle({
        title: '编辑用药人'
      })
      UseDrugCom.getUserDetail(options.id).then(result => {
        let birthday = result.idcard_no.substring(6, 14),
          sex = result.idcard_no.substring(16, 17)
        birthday =
          birthday.substring(0, 4) +
          '-' +
          birthday.substring(4, 6) +
          '-' +
          birthday.substring(6)
        sex = sex % 2 == 0 ? 1 : 2
        let _tags = this.state.tags.map(item => {
          if (item.name == result.relation_label) {
            item.choose = true
          } else {
            item.choose = false
          }
          return item
        })
        let _dataflag = true
        if (
          result.dict_bool_allergy_history ||
          result.dict_bool_family_history ||
          result.dict_bool_medical_history ||
          result.dict_bool_liver ||
          result.dict_bool_nurse ||
          result.dict_bool_renal
        ) {
          _dataflag = false
        }
        let historyDiseaseData = [],
          gmDiseaseData = [],
          familyDiseaseData = []
        if (result.medical_history != '') {
          result.medical_history.split('|').map(item => {
            historyDiseaseData.push({
              chooseFlag: true,
              name: item
            })
          })
        }
        if (result.allergy_history != '') {
          result.allergy_history.split('|').map(item => {
            gmDiseaseData.push({
              chooseFlag: true,
              name: item
            })
          })
        }
        if (result.family_history != '') {
          result.family_history.split('|').map(item => {
            familyDiseaseData.push({
              chooseFlag: true,
              name: item
            })
          })
        }
        let _personalInfo = this.state.personalInfo;
        _personalInfo.idcard = result.idcard_no
        _personalInfo.name = result.real_name
        _personalInfo.mobile = result.mobile
        _personalInfo.weight = result.weight || ''
        this.setState({
          personalInfo:_personalInfo,
          birthday,
          sex,
          tags: _tags,
          _hisdata1: result.medical_history || '',
          _hisdata2: result.allergy_history || '',
          _hisdata3: result.family_history || '',
          historyFlag2: result.dict_bool_medical_history == 0 ? true : false,
          familyFlag2: result.dict_bool_family_history == 0 ? true : false,
          ganFlag2: result.dict_bool_liver == 0 ? true : false,
          shenFlag2: result.dict_bool_renal == 0 ? true : false,
          rcFlag2: result.dict_bool_nurse == 0 ? true : false,
          gmFlag2: result.dict_bool_allergy_history == 0 ? true : false,
          historyFlag1: result.dict_bool_medical_history == 1 ? true : false,
          familyFlag1: result.dict_bool_family_history == 1 ? true : false,
          ganFlag1: result.dict_bool_liver == 1 ? true : false,
          shenFlag1: result.dict_bool_renal == 1 ? true : false,
          rcFlag1: result.dict_bool_nurse == 1 ? true : false,
          gmFlag1: result.dict_bool_allergy_history == 1 ? true : false,
          nodataFlag: _dataflag,
          isDefault: result.dict_bool_default == 1 ? true : false,
          historyDiseaseData,
          gmDiseaseData,
          familyDiseaseData,
          id: result.id,
          choosedVal: result.relation_label
        })
      })
    } else {
      this.geDefaultDisease() //获取默认的过敏疾病
      Taro.setNavigationBarTitle({
        title: '新增用药人'
      })
    }
  
  }
  componentDidMount () { 
    var that = this
    Taro.getSystemInfo({
      success(res) {
        console.log('设备品牌:', res.brand)
        console.log('设备型号:', res.model)
        console.log('设备像素比:', res.pixelRatio)
        console.log('窗口宽度:', res.windowWidth)
        console.log('窗口高度:', res.windowHeight)
        console.log('屏幕高度:', res.screenHeight)
        console.log('屏幕宽度:', res.screenWidth)
        console.log('状态栏的高度:', res.statusBarHeight)
        console.log('微信设置的语言:', res.language)
        console.log('微信版本号:', res.version)
        console.log('操作系统及版本:', res.system)
        console.log('客户端平台:', res.platform)
        console.log('用户字体大小:', res.fontSizeSetting)
        console.log('客户端基础库版本 :', res.SDKVersion)
        console.log('设备性能等级:', res.benchmarkLevel)
        // px转换到rpx的比例
        let pxToRpxScale = 750 / res.windowWidth
        // 状态栏的高度
        let ktxStatusHeight = res.statusBarHeight * pxToRpxScale
        // 导航栏的高度
        let navigationHeight = res.statusBarHeight * pxToRpxScale
        // window的高度
        let ktxWindowHeight = res.windowHeight * pxToRpxScale
        Taro.createSelectorQuery()
          .select('.bottom_container')
          .boundingClientRect(function(rect) {
            rect.height // 节点高度
          })
          .exec(function(res) {
            let screenHeight =
              ktxWindowHeight - res[0].height * pxToRpxScale - 100 + 'rpx'
            that.setState({
              screenHeight
            })
          })
      }
    })
  }
  diseaseChange(e) {
    this.setState({
      [e.currentTarget.dataset.type]: true,
      [e.currentTarget.dataset.another]: false
    })
  }
  clickRadioAction() {
    this.setState({
      isDefault: !this.state.isDefault
    })
  }
  showDiseaseList(e) {
    this.setState({
      bottomHidden: e.currentTarget.dataset.flag == 1 ? false : true
    })
  }
  idcardChange(e) {
    let { value } = e.detail
    if (!value) return
    let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
    if (idcardReg.test(value)) {
      let birthday = value.substring(6, 14),
        sex = value.substring(16, 17)
      birthday =
        birthday.substring(0, 4) +
        '-' +
        birthday.substring(4, 6) +
        '-' +
        birthday.substring(6)
      sex = sex % 2 == 0 ? 1 : 2
      let _personalInfo = this.state.personalInfo
      _personalInfo.idcard = value
      this.setState({
        birthday,
        sex,
        personalInfo:_personalInfo
      })
    } else {
      Taro.showToast({
        title: '身份证输入有误，请重新填写',
        icon: 'none', //图标，支持"success"、"loading"
        duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
        mask: true //是否显示透明蒙层，防止触摸穿透，默认：false
      })
      let _personalInfo = this.state.personalInfo
      _personalInfo.idcard = ''
      this.setState({
        personalInfo:_personalInfo
      })
    }
  }
  bindChange_weight(e) {
    let { value } = e.detail,
      _flag = false
    value = value.replace(/[^0-9]/g, '')
    if (value > 100) {
      _flag = true
      Taro.hideKeyboard()
    }
    let _personalInfo = this.state.personalInfo
    _personalInfo.weight = value
    this.setState({
      personalInfo:_personalInfo,
      tzFlag: _flag
    })
  }
  bindChange_name(e) {
    let { value } = e.detail
    let _personalInfo = this.state.personalInfo
    _personalInfo.name = value
    this.setState({
      personalInfo:_personalInfo
    })
  }
  bindChange_mobile(e) {
    let { value } = e.detail
    let _personalInfo = this.state.personalInfo
    _personalInfo.mobile = value
    value = value.replace(/[^0-9]/g, '')
    this.setState({
      personalInfo:_personalInfo
    })
  }
  choosedItem(e) {
    let _type = e.currentTarget.dataset.type,
      _data = this.state[_type],
      _name = e.currentTarget.dataset.info.name
    _data.map(item => {
      if (item.name == _name) {
        item.chooseFlag = !item.chooseFlag
      }
      return item
    })
    this.setState({
      [_type]: _data
    })
  }
  addDataForDisease(e) {
    let addFlagType = e.currentTarget.dataset.type
    this.setState({
      addFlag: false,
      addFlagType
    })
  }
  hideAddFlag(e) {
    this.setState({
      addFlag: e.currentTarget.dataset.type == 2 ? true : false
    })
  }
  searchDisease(e) {
    let { value } = e.detail
    this.setState({
      disease_searchValue: value
    })
    if (value) {
      UseDrugCom.getDiseaseAboutKeyword(value, this.state.addFlagType).then(
        result => {
          if (result.length != 0) {
            let data = []
            if (this.state.addFlagType == 'gmDiseaseData') {
              result.map(item => {
                data.push({
                  disease_name: item.allergy_name
                })
              })
            } else {
              data = result
            }

            this.setState({
              searchlist: data
            })
          }
        }
      )
    }
  }
  geDefaultDisease() {
    let _data = []
    UseDrugCom.getDefaultGm().then(result => {
      if (result.length != 0) {
        _data = result.map(item => {
          item.chooseFlag = false
          item.name = item.allergy_name
          return item
        })
      }
      this.setState({
        gmDiseaseData: _data
      })
    })
  }
  chooseResult(e) {
    let diffFlag = true,
      _chooseId = e.currentTarget.dataset.item.id,
      _chooseName = e.currentTarget.dataset.item.disease_name,
      _data = this.state[this.state.addFlagType]
    for (let item of _data) {
      if (item.name == _chooseName) {
        item.chooseFlag = true
        diffFlag = false
        break
      }
    }
    if (diffFlag) {
      _data.push({ name: _chooseName, id: _chooseId, chooseFlag: true })
    }
    this.setState({
      searchlist: [],
      addFlag: true,
      [this.state.addFlagType]: _data,
      disease_searchValue: ''
    })
  }
  completeDisease() {
    //判断过往 过敏 家族 有的情况下 是否添加了疾病
    let flag1 = false,
      flag2 = false,
      flag3 = false,
      _dataflag = false,
      _hisdata1 = [],
      _hisdata2 = [],
      _hisdata3 = []
    if (this.state.historyFlag1) {
      this.state.historyDiseaseData.map(item => {
        if (item.chooseFlag) {
          flag1 = true
          _hisdata1.push(item.name)
        }
      })
      if (!flag1) {
        Taro.showToast({
          title: '请选择过往病史',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false
      }
    }
    if (this.state.gmFlag1) {
      this.state.gmDiseaseData.map(item => {
        if (item.chooseFlag) {
          flag2 = true
          _hisdata2.push(item.name)
        }
      })
      if (!flag2) {
        Taro.showToast({
          title: '请选择过敏史',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false
      }
    }
    if (this.state.familyFlag1) {
      this.state.familyDiseaseData.map(item => {
        if (item.chooseFlag) {
          flag3 = true
          _hisdata3.push(item.name)
        }
      })
      if (!flag3) {
        Taro.showToast({
          title: '请选择家族病史',
          icon: 'none',
          duration: 2000,
          mask: true
        })
        return false
      }
    }
    if (
      !flag1 &&
      !flag2 &&
      !flag3 &&
      !this.state.ganFlag1 &&
      !this.state.shenFlag1 &&
      !this.state.rcFlag1
    ) {
      _dataflag = true
    }
    this.setState({
      bottomHidden: true,
      nodataFlag: _dataflag,
      _hisdata1: _hisdata1.join('|'),
      _hisdata2: _hisdata2.join('|'),
      _hisdata3: _hisdata3.join('|')
    })
  }
  tagclick(e) {
    let _name = e.currentTarget.dataset.name,
      _val = ''
    let _data = this.state.tags.map(item => {
      item.choose = item.name == _name ? true : false
      if (item.name == _name) {
        _val = item.name
      }
      return item
    })
    this.setState({
      tags: _data,
      choosedVal: _val
    })
  }
  saveData() {
    if (this.state.personalInfo.name == '') {
      Taro.showToast({
        title: '请输入用药人姓名',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return false
    }
    if (this.state.personalInfo.idcard == '') {
      Taro.showToast({
        title: '请输入身份证号码',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return false
    }
    if (this.state.personalInfo.mobile == '') {
      Taro.showToast({
        title: '请输入手机号码',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      return false
    }
    const { name, idcard, mobile, weight } = this.state.personalInfo
    let _param = {
      real_name: name,
      idcard_no: idcard,
      birthday: this.state.birthday,
      dict_sex: this.state.sex == 2 ? 1 : 0,
      weight: weight,
      mobile,
      dict_bool_medical_history: this.state.historyFlag1 ? 1 : 0,
      medical_history: this.state._hisdata1,
      allergy_history: this.state._hisdata2,
      family_history: this.state._hisdata3,
      dict_bool_allergy_history: this.state.gmFlag1 ? 1 : 0,
      dict_bool_family_history: this.state.familyFlag1 ? 1 : 0,
      dict_bool_liver: this.state.ganFlag1 ? 1 : 0,
      dict_bool_renal: this.state.shenFlag1 ? 1 : 0,
      dict_bool_nurse: this.state.rcFlag1 ? 1 : 0,
      relation_label: this.state.choosedVal,
      dict_bool_default: this.state.isDefault ? 1 : 0
    }
    if (this.state._type == 2) {
      _param.id = this.state.id
    }
    Taro.showLoading({
      title: '认证中'
    })
    UseDrugCom.addUser(JSON.stringify(_param), this.state._type).then(
      result => {
        Taro.hideLoading()
        if (result) {
          Taro.showToast({
            title: '实名认证成功',
            icon: 'none',
            duration: 2000,
            mask: true
          })
          this.setState({
            nodataFlag: true,
            isDefault: false,
            bottomHidden: true,
            historyFlag2: true,
            familyFlag2: true,
            ganFlag2: true,
            shenFlag2: true,
            rcFlag2: true,
            gmFlag2: true,
            addFlag: true,
            operationName: '完成',
            personalInfo: {
              idcard: '',
              weight: '',
              mobile: '',
              name: ''
            },
            historyDiseaseData: [],
            disease_searchValue: '',
            gmDiseaseData: [],
            addFlagType: '',
            familyDiseaseData: [],
            _hisdata1: '',
            _hisdata2: '',
            _hisdata3: '',
            tags: [
              {
                name: '本人',
                choose: true
              },
              {
                name: '家属',
                choose: false
              },
              {
                name: '亲戚',
                choose: false
              },
              {
                name: '朋友',
                choose: false
              }
            ],
            choosedVal: '本人'
          })
          let _globaldata = getGlobalData('inquiryInfo');
          _globaldata.inquiryInfo = true;
          _globaldata.editPatientId = this.state._type == 2 ? this.state.id : result
          setGlobalData(['inquiryInfo'],_globaldata)

          Taro.navigateBack({
            delta: 1 // 返回上一级页面。
          })
        }
      },
      error => {
        Taro.hideLoading()
        let _msg =
          error.msg.length >= 50
            ? error.msg.substring(0, 50) + '...'
            : error.msg
        this.setState({
          resultFlag: true,
          resultMsg: _msg
        })
      }
    )
  }
  confirmR() {
    this.setState({
      resultFlag: false,
      resultMsg: ''
    })
  }
  tzclose() {
    this.setState({
      tzFlag: false
    })
  }
  render() {
    const {
      screenHeight,
      _type,
      personalInfo,
      birthday,
      sex,
      nodataFlag,
      _hisdata1,
      _hisdata2,
      _hisdata3,
      ganFlag1,
      shenFlag1,
      rcFlag1,
      tags,
      isDefault,
      bottomHidden,
      historyFlag1,
      historyFlag2,
      historyDiseaseData,
      gmFlag1,
      gmFlag2,
      gmDiseaseData,
      familyFlag1,
      familyFlag2,
      familyDiseaseData,
      ganFlag2,
      shenFlag2,
      rcFlag2,
      operationName,
      addFlag,
      disease_searchValue,
      searchlist,
      resultFlag,
      resultMsg,
      tzFlag,
      cerinfo,
      cerFlag
    } = this.state
    return (
      <Block>
        <View className="wrapper">
          <View className="notice">
            根据国家药监局规定，购买处方药需要实名认证
          </View>
          <ScrollView
            scrollY
            className="scroll"
            style={'height:' + screenHeight}
          >
            <View className="container">
              <View className="container_name">
                <View
                  className={'customer_left ' + (_type == 2 ? 'not_input' : '')}
                >
                  用药人姓名
                </View>
                <View className="item_right">
                  <Input
                    name="name"
                    placeholderStyle="placeholdercla"
                    placeholderClass="placeholder"
                    maxlength="20"
                    disabled={_type == 2 ? true : false}
                    value={personalInfo.name}
                    onInput={this.bindChange_name}
                    placeholder="请输入用药人真实姓名"
                  ></Input>
                </View>
              </View>
              <View className="divLine"></View>
              <View className="container_name">
                <View
                  className={'customer_left ' + (_type == 2 ? 'not_input' : '')}
                >
                  身份证号码
                </View>
                <View className="item_right">
                  <Input
                    type="number"
                    name="idcard"
                    placeholderStyle="placeholdercla"
                    placeholderClass="placeholder"
                    disabled={_type == 2 ? true : false}
                    maxlength="18"
                    value={personalInfo.idcard}
                    onBlur={this.idcardChange}
                    placeholder="请输入用药人身份证号码"
                  ></Input>
                </View>
              </View>
              <View className="divLine"></View>
              <View className="container_name">
                <View className="customer_left not_input">出生年月</View>
                <View className="item_right not_input">
                  <Input
                    name="idcard"
                    value={birthday}
                    onBlur={this.idcardChange}
                    disabled
                  ></Input>
                </View>
              </View>
              <View className="divLine"></View>
              <View className="container_name">
                <View className="customer_left not_input">性别</View>
                <View className="item_right not_input sexchoose">
                  <View className="choose1">
                    <Image
                      className="icon-checkbox"
                      src={
                        sex == 2
                          ? '/images/icon_choose.png'
                          : '/images/icon_unchoose.png'
                      }
                    ></Image>
                    <Text className="has">男</Text>
                  </View>
                  <View className="choose2">
                    <Image
                      className="icon-checkbox"
                      src={
                        sex == 1
                          ? '/images/icon_choose.png'
                          : '/images/icon_unchoose.png'
                      }
                    ></Image>
                    <Text className="hasnot">女</Text>
                  </View>
                </View>
              </View>
              <View className="divLine"></View>
              <View className="container_name">
                <View className="customer_left">体重(Kg)</View>
                <View className="item_right">
                  <Input
                    type="number"
                    name="weight"
                    placeholderStyle="placeholdercla"
                    placeholderClass="placeholder"
                    maxlength="3"
                    value={personalInfo.weight}
                    onInput={this.bindChange_weight}
                    placeholder="请填写体重"
                  ></Input>
                </View>
              </View>
              <View className="divLine"></View>
              <View className="container_name">
                <View className="customer_left">手机号码</View>
                <View className="item_right">
                  <Input
                    type="number"
                    name="mobile"
                    placeholderStyle="placeholdercla"
                    placeholderClass="placeholder"
                    maxlength="11"
                    value={personalInfo.mobile}
                    onInput={this.bindChange_mobile}
                    placeholder="用于医生回复时接收短信"
                  ></Input>
                </View>
              </View>
              <View className="divLine"></View>
              <View
                className={'container_name ' + (nodataFlag ? '' : 'datasStyle')}
                onClick={this.showDiseaseList}
                data-flag="1"
              >
                <View
                  className={
                    'customer_left ' + (nodataFlag ? '' : 'hasDataFlag')
                  }
                >
                  疾病史
                </View>
                <View className="item_right">
                  {nodataFlag ? (
                    <View className="nodata">无肝肾异常、过敏史、妊娠</View>
                  ) : (
                    <View className="hasData">
                      {_hisdata1.length != 0 && (
                        <View className="listdisEase">
                          <Text className="aaa">
                            {'过往病史: ' + _hisdata1}
                          </Text>
                        </View>
                      )}
                      {_hisdata2.length != 0 && (
                        <View className="listdisEase">
                          {'过敏史: ' + _hisdata2}
                        </View>
                      )}
                      {_hisdata3.length != 0 && (
                        <View className="listdisEase">
                          {'家族病史: ' + _hisdata3}
                        </View>
                      )}
                      {ganFlag1 && (
                        <View className="listdisEase">肝功能异常</View>
                      )}
                      {shenFlag1 && (
                        <View className="listdisEase">肾功能异常</View>
                      )}
                      {rcFlag1 && (
                        <View className="listdisEase">有妊娠哺乳</View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              <View className="divLine"></View>
              <View className="container_name">
                <View className="customer_left">关系标签</View>
                <View className="item_right">
                  {tags.map((item, index) => {
                    return (
                      <Block>
                        <View
                          className={
                            'tagcla ' + (item.choose ? 'tagchoose' : '')
                          }
                          onClick={this.tagclick}
                          data-name={item.name}
                        >
                          {item.name}
                        </View>
                      </Block>
                    )
                  })}
                </View>
              </View>
            </View>
            <View className="setdrug">
              <Image
                className="icon-checkbox"
                onClick={this.clickRadioAction}
                src={
                  isDefault
                    ? '/images/icon_choose.png'
                    : '/images/icon_unchoose.png'
                }
              ></Image>
              <Text className="defualtuse" onClick={this.clickRadioAction}>
                设为默认用药人
              </Text>
            </View>
          </ScrollView>
          <View className="bottom_container">
            <View onClick={this.save} className="btnBtom">
              <View className="address-add" onClick={this.saveData}>
                保存并使用
              </View>
            </View>
          </View>
          <View
            hidden={bottomHidden}
            className="modal"
            onTouchMove={this.privateStopNoop}
          >
            <View
              className="shadowview"
              onClick={this.showDiseaseList}
              data-flag="2"
            ></View>
          </View>
        </View>
        <View className={'contentview ' + (bottomHidden ? '' : 'contentshow')}>
          <View className="nameAndclose">
            <View className="name">疾病史</View>
            <View
              className="close"
              onClick={this.showDiseaseList}
              data-flag="2"
            >
              ⅹ
            </View>
          </View>
          <ScrollView scrollY className="scrollView">
            <View className="historyDisease">
              <View className="diseaseName">过往病史</View>
              <View className="choose1">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="historyFlag1"
                  data-another="historyFlag2"
                  src={
                    historyFlag1
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="has">有</Text>
              </View>
              <View className="choose2">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="historyFlag2"
                  data-another="historyFlag1"
                  src={
                    historyFlag2
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="hasnot">无</Text>
              </View>
            </View>
            {historyFlag1 && (
              <View className="resultForChoosed">
                {historyDiseaseData.map((item, index) => {
                  return (
                    <View
                      className="diseaseItem"
                      key={item.name}
                      onClick={this.choosedItem}
                      data-info={item}
                      data-type="historyDiseaseData"
                    >
                      <Text
                        className={
                          item.chooseFlag
                            ? 'chooseitemName'
                            : 'unchooseitemname'
                        }
                      >
                        {item.name}
                      </Text>
                    </View>
                  )
                })}
                <View
                  className="diseaseItem"
                  onClick={this.addDataForDisease}
                  data-type="historyDiseaseData"
                >
                  <Text className="chooseitemName">+</Text>
                </View>
              </View>
            )}
            <View className="historyDisease">
              <View className="diseaseName">过敏史</View>
              <View className="choose1">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="gmFlag1"
                  data-another="gmFlag2"
                  src={
                    gmFlag1
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="has">有</Text>
              </View>
              <View className="choose2">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="gmFlag2"
                  data-another="gmFlag1"
                  src={
                    gmFlag2
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="hasnot">无</Text>
              </View>
            </View>
            {gmFlag1 && (
              <View className="resultForChoosed">
                {gmDiseaseData.map((item, index) => {
                  return (
                    <View
                      className="diseaseItem"
                      key={item.name}
                      onClick={this.choosedItem}
                      data-info={item}
                      data-type="gmDiseaseData"
                    >
                      <Text
                        className={
                          item.chooseFlag
                            ? 'chooseitemName'
                            : 'unchooseitemname'
                        }
                      >
                        {item.name}
                      </Text>
                    </View>
                  )
                })}
                <View
                  className="diseaseItem"
                  onClick={this.addDataForDisease}
                  data-type="gmDiseaseData"
                >
                  <Text className="chooseitemName">+</Text>
                </View>
              </View>
            )}
            <View className="historyDisease">
              <View className="diseaseName">家族病史</View>
              <View className="choose1">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="familyFlag1"
                  data-another="familyFlag2"
                  src={
                    familyFlag1
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="has">有</Text>
              </View>
              <View className="choose2">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="familyFlag2"
                  data-another="familyFlag1"
                  src={
                    familyFlag2
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="hasnot">无</Text>
              </View>
            </View>
            {familyFlag1 && (
              <View className="resultForChoosed">
                {familyDiseaseData.map((item, index) => {
                  return (
                    <View
                      className="diseaseItem"
                      key={item.name}
                      onClick={this.choosedItem}
                      data-info={item}
                      data-type="familyDiseaseData"
                    >
                      <Text
                        className={
                          item.chooseFlag
                            ? 'chooseitemName'
                            : 'unchooseitemname'
                        }
                      >
                        {item.name}
                      </Text>
                    </View>
                  )
                })}
                <View
                  className="diseaseItem"
                  onClick={this.addDataForDisease}
                  data-type="familyDiseaseData"
                >
                  <Text className="chooseitemName">+</Text>
                </View>
              </View>
            )}
            <View className="historyDisease">
              <View className="diseaseName">肝功能</View>
              <View className="choose1">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="ganFlag1"
                  data-another="ganFlag2"
                  src={
                    ganFlag1
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="has">异常</Text>
              </View>
              <View className="choose2">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="ganFlag2"
                  data-another="ganFlag1"
                  src={
                    ganFlag2
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="hasnot">正常</Text>
              </View>
            </View>
            <View className="historyDisease">
              <View className="diseaseName">肾功能</View>
              <View className="choose1">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="shenFlag1"
                  data-another="shenFlag2"
                  src={
                    shenFlag1
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="has">异常</Text>
              </View>
              <View className="choose2">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="shenFlag2"
                  data-another="shenFlag1"
                  src={
                    shenFlag2
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="hasnot">正常</Text>
              </View>
            </View>
            <View className="historyDisease">
              <View className="diseaseName">妊娠哺乳</View>
              <View className="choose1">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="rcFlag1"
                  data-another="rcFlag2"
                  src={
                    rcFlag1
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="has">有</Text>
              </View>
              <View className="choose2">
                <Image
                  className="icon-checkbox"
                  onClick={this.diseaseChange}
                  data-type="rcFlag2"
                  data-another="rcFlag1"
                  src={
                    rcFlag2
                      ? '/images/icon_choose.png'
                      : '/images/icon_unchoose.png'
                  }
                ></Image>
                <Text className="hasnot">无</Text>
              </View>
            </View>
          </ScrollView>
          <View className="operation">
            <View className="medicine-add" onClick={this.completeDisease}>
              {operationName}
            </View>
          </View>
        </View>
        <View
          hidden={addFlag}
          className="modal2"
          onTouchMove={this.privateStopNoop}
        >
          <View
            className="shadowview"
            onClick={this.hideAddFlag}
            data-type="2"
          ></View>
        </View>
        <View className={'contentview2 ' + (addFlag ? '' : 'contentshow2')}>
          <View className="nameAndclose">
            <View className="name">添加疾病</View>
            <View className="close" onClick={this.hideAddFlag} data-type="2">
              ⅹ
            </View>
          </View>
          <View className="searchDisease">
            <Input
              type="text"
              className="searchInput"
              value={disease_searchValue}
              placeholder="请输入疾病名称、支持首字母、模糊搜索"
              placeholderStyle="placeholdercla"
              placeholderClass="placeholder"
              onInput={this.searchDisease}
            ></Input>
          </View>
          <ScrollView scrollY className="scrollView2">
            <View style="display:flex;flex-direction:column;margin-left:20rpx;margin-right:20rpx;width:100%">
              {searchlist.map((item, index) => {
                return (
                  <Block>
                    <View
                      className="searchResult"
                      onClick={this.chooseResult}
                      data-item={item}
                    >
                      {item.disease_name}
                    </View>
                  </Block>
                )
              })}
            </View>
          </ScrollView>
          <View className="operation">
            <View className="medicine-add">保存并添加</View>
          </View>
        </View>
        <View className={resultFlag ? 'tip' : 'shownone'}>
          <View className="tipwrapper">
            <View className="tiptext">提示</View>
            <View className="resultmsg">
              <Text className="alignleft">{resultMsg}</Text>
            </View>
            <View className="confirmR" onClick={this.confirmR}>
              确认
            </View>
          </View>
        </View>
        <View className={tzFlag ? 'tzzz' : 'shownone'}>
          <View className="tzwrapper">
            <View className="tztext">温馨提示</View>
            <View className="tzmsg">
              请确认您的体重信息是否正确，单位公斤(Kg)
            </View>
            <View className="tztext" onClick={this.tzclose}>
              关闭
            </View>
          </View>
        </View>
        {cerFlag && (
          <View className="cer_success">
            <View className="cermodal">
              <Image
                src={require('../../../../../images/returnTips_close.png')}
                className="returnTips_close"
                onClick={this.closeInfo}
              ></Image>
              <View className="ver_tip">您已实名信息</View>
              <View className="cerinfo">
                <View className="cername">{'姓名：' + cerinfo.name}</View>
                <View className="ceridcard">
                  {'身份证号：' + cerinfo.idcard}
                </View>
              </View>
              <View className="ver_success_text">
                温馨提示：点击“确定”，实名信息自动填入。
              </View>
              <View
                onClick={this.know}
                style="width:30%;margin:15px auto"
                className="btnBtom"
              >
                <View className="cer-add">确定</View>
              </View>
            </View>
          </View>
        )}
      </Block>
    )
  }
}

export default _C
