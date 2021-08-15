// pages/address/address.js
import {
  UseDrug
} from '../../../../../apis/index';
var UseDrugCom = new UseDrug()
//获取应用实例
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cerFlag:false,
    cerinfo:{
      name:"",
      idcard:""
    },
    screenHeight: '',
    tzFlag: false,
    resultFlag: false,
    resultMsg: "",
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
      name: '',
    },
    historyDiseaseData: [
    ],
    disease_searchValue: '',
    gmDiseaseData: [],
    addFlagType: "",
    familyDiseaseData: [],
    _hisdata1: '',
    _hisdata2: '',
    _hisdata3: '',
    tags: [
      {
        name: '本人',
        choose: true,
      }, {
        name: '家属',
        choose: false,
      }, {
        name: '亲戚',
        choose: false,
      }, {
        name: '朋友',
        choose: false,
      },
    ],
    choosedVal: '本人',
    id: '',
  },
  onReady: function () {
    var that = this;
    wx.getSystemInfo({
      success(res) {
        // px转换到rpx的比例
        let pxToRpxScale = 750 / res.windowWidth;
        // 状态栏的高度
        let ktxStatusHeight = res.statusBarHeight * pxToRpxScale
        // 导航栏的高度
        let navigationHeight = res.statusBarHeight * pxToRpxScale
        // window的高度
        let ktxWindowHeight = res.windowHeight * pxToRpxScale
        wx.createSelectorQuery().select('.bottom_container').boundingClientRect(function (rect) {
          rect.height; // 节点高度
        }).exec(function (res) {
          let screenHeight = ktxWindowHeight - res[0].height * pxToRpxScale - 100 + 'rpx';
          that.setData({
            screenHeight,
          })
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var options = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.setData({
      _type: options.type
    })
    if (options.type == 2) {  //编辑跳转过来
      wx.setNavigationBarTitle({
        title: '编辑用药人'
      });
      UseDrugCom.getUserDetail(options.id).then(result => {
        let birthday = result.idcard_no.substring(6, 14), sex = result.idcard_no.substring(16, 17);
        birthday = birthday.substring(0, 4) + '-' + birthday.substring(4, 6) + '-' + birthday.substring(6);
        sex = sex % 2 == 0 ? 1 : 2;
        let _tags = this.data.tags.map(item => {
          if (item.name == result.relation_label) {
            item.choose = true;
          } else {
            item.choose = false;
          }
          return item;
        })
        let _dataflag = true;
        if (result.dict_bool_allergy_history || result.dict_bool_family_history || result.dict_bool_medical_history || result.dict_bool_liver || result.dict_bool_nurse || result.dict_bool_renal) {
          _dataflag = false;
        }
        let historyDiseaseData = [], gmDiseaseData = [], familyDiseaseData = [];
        if (result.medical_history != "") {
          result.medical_history.split('|').map(item => {
            historyDiseaseData.push({
              chooseFlag: true,
              name: item,
            })
          })
        }
        if (result.allergy_history != "") {
          result.allergy_history.split('|').map(item => {
            gmDiseaseData.push({
              chooseFlag: true,
              name: item,
            })
          })
        }
        if (result.family_history != "") {
          result.family_history.split('|').map(item => {
            familyDiseaseData.push({
              chooseFlag: true,
              name: item,
            })
          })
        }

        this.setData({
          'personalInfo.idcard': result.idcard_no,
          'personalInfo.name': result.real_name,
          'personalInfo.mobile': result.mobile,
          'personalInfo.weight': result.weight || '',
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
          choosedVal: result.relation_label,
        })

      })
    } else {
      this.geDefaultDisease();//获取默认的过敏疾病
      wx.setNavigationBarTitle({
        title: '新增用药人'
      });
    }
    // if (JSON.stringify(options.info) != '{}') {
    //   let _data = options.info;
    //   let birthday = _data.idcard_no.substring(6, 14), sex = _data.idcard_no.substring(16, 17);
    //   birthday = birthday.substring(0, 4) + '-' + birthday.substring(4, 6) + '-' + birthday.substring(6);
    //   sex = sex % 2 == 0 ? 1 : 2;
    //   this.setData({
    //     'personalInfo.name': _data.real_name || '',
    //     'personalInfo.mobile': _data.mobile || '',
    //     'personalInfo.idcard': _data.idcard_no || '',
    //     'personalInfo.weight': _data.weight || '',
    //     sex,
    //     birthday,
    //   })
    // }
  },
  diseaseChange: function (e) {
    this.setData({
      [e.currentTarget.dataset.type]: true,
      [e.currentTarget.dataset.another]: false,
    })

  },
  clickRadioAction: function () {
    this.setData({
      isDefault: !this.data.isDefault
    })
  },
  showDiseaseList: function (e) {
    this.setData({
      bottomHidden: e.currentTarget.dataset.flag == 1 ? false : true,
    })
  },
  idcardChange: function (e) {
    let { value } = e.detail;
    if (!value) return;
    let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
    if (idcardReg.test(value)) {
      let birthday = value.substring(6, 14), sex = value.substring(16, 17);
      birthday = birthday.substring(0, 4) + '-' + birthday.substring(4, 6) + '-' + birthday.substring(6);
      sex = sex % 2 == 0 ? 1 : 2;
      this.setData({
        birthday,
        sex,
        'personalInfo.idcard': value,
      })
    } else {
      wx.showToast({
        title: "身份证输入有误，请重新填写",
        icon: 'none',//图标，支持"success"、"loading" 
        duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
        mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false 

      })
      this.setData({
        'personalInfo.idcard': ''
      })
    }
  },
  bindChange_weight: function (e) {
    let { value } = e.detail, _flag = false;
    value = value.replace(/[^0-9]/g, '');
    if (value > 100) {
      _flag = true;
      wx.hideKeyboard();
    }
    this.setData({
      'personalInfo.weight': value,
      tzFlag: _flag
    })
  },
  bindChange_name: function (e) {
    let { value } = e.detail;
    this.setData({
      'personalInfo.name': value,
    })
  },
  bindChange_mobile: function (e) {
    let { value } = e.detail;
    value = value.replace(/[^0-9]/g, '');
    this.setData({
      'personalInfo.mobile': value,
    })
  },
  choosedItem: function (e) {
    let _type = e.currentTarget.dataset.type, _data = this.data[_type], _name = e.currentTarget.dataset.info.name;
    _data.map(item => {
      if (item.name == _name) {
        item.chooseFlag = !item.chooseFlag;
      }
      return item;
    })
    this.setData({
      [_type]: _data
    })
  },
  addDataForDisease: function (e) {
    let addFlagType = e.currentTarget.dataset.type;
    this.setData({
      addFlag: false,
      addFlagType,
    })
  },
  hideAddFlag: function (e) {
    this.setData({
      addFlag: e.currentTarget.dataset.type == 2 ? true : false
    })

  },
  searchDisease: function (e) {
    let { value } = e.detail;
    this.setData({
      disease_searchValue: value
    })
    if (value) {
      UseDrugCom.getDiseaseAboutKeyword(value, this.data.addFlagType).then((result) => {
        if (result.length != 0) {
          let data = [];
          if (this.data.addFlagType == 'gmDiseaseData') {
            result.map(item => {
              data.push({
                disease_name: item.allergy_name
              })

            })
          } else {
            data = result
          }

          this.setData({
            searchlist: data
          })
        }
      })
    }
  },
  geDefaultDisease: function () {
    let _data = [];
    UseDrugCom.getDefaultGm().then(result => {
      if (result.length != 0) {
        _data = result.map(item => {
          item.chooseFlag = false;
          item.name = item.allergy_name;
          return item;
        })
      }
      this.setData({
        gmDiseaseData: _data
      })
    })
  },
  chooseResult: function (e) {
    let diffFlag = true, _chooseId = e.currentTarget.dataset.item.id, _chooseName = e.currentTarget.dataset.item.disease_name, _data = this.data[this.data.addFlagType];
    for (let item of _data) {
      if (item.name == _chooseName) {
        item.chooseFlag = true;
        diffFlag = false;
        break;
      }
    }
    if (diffFlag) {
      _data.push({ name: _chooseName, id: _chooseId, chooseFlag: true });
    }
    this.setData({
      searchlist: [],
      addFlag: true,
      [this.data.addFlagType]: _data,
      disease_searchValue: "",
    })
  },
  completeDisease: function () {
    //判断过往 过敏 家族 有的情况下 是否添加了疾病
    let flag1 = false, flag2 = false, flag3 = false, _dataflag = false, _hisdata1 = [], _hisdata2 = [], _hisdata3 = [];
    if (this.data.historyFlag1) {
      this.data.historyDiseaseData.map(item => {
        if (item.chooseFlag) {
          flag1 = true;
          _hisdata1.push(item.name)
        }
      })
      if (!flag1) {
        wx.showToast({
          title: "请选择过往病史",
          icon: 'none',
          duration: 2000,
          mask: true,
        })
        return false;
      }
    }
    if (this.data.gmFlag1) {
      this.data.gmDiseaseData.map(item => {
        if (item.chooseFlag) {
          flag2 = true;
          _hisdata2.push(item.name)
        }
      })
      if (!flag2) {
        wx.showToast({
          title: "请选择过敏史",
          icon: 'none',
          duration: 2000,
          mask: true,

        })
        return false;
      }
    }
    if (this.data.familyFlag1) {
      this.data.familyDiseaseData.map(item => {
        if (item.chooseFlag) {
          flag3 = true;
          _hisdata3.push(item.name)
        }
      })
      if (!flag3) {
        wx.showToast({
          title: "请选择家族病史",
          icon: 'none',
          duration: 2000,
          mask: true,

        })
        return false;
      }
    }
    if (!flag1 && !flag2 && !flag3 && !this.data.ganFlag1 && !this.data.shenFlag1 && !this.data.rcFlag1) {
      _dataflag = true;
    }
    this.setData({
      bottomHidden: true,
      nodataFlag: _dataflag,
      _hisdata1: _hisdata1.join('|'),
      _hisdata2: _hisdata2.join('|'),
      _hisdata3: _hisdata3.join('|'),
    })
  },
  tagclick: function (e) {
    let _name = e.currentTarget.dataset.name, _val = '';
    let _data = this.data.tags.map(item => {
      item.choose = item.name == _name ? true : false;
      if (item.name == _name) {
        _val = item.name;
      }
      return item;
    })
    this.setData({
      tags: _data,
      choosedVal: _val,
    })
  },
  saveData: function () {
    if (this.data.personalInfo.name == '') {
      wx.showToast({
        title: "请输入用药人姓名",
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    if (this.data.personalInfo.idcard == '') {
      wx.showToast({
        title: "请输入身份证号码",
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    if (this.data.personalInfo.mobile == '') {
      wx.showToast({
        title: "请输入手机号码",
        icon: 'none',
        duration: 2000,
        mask: true,
      })
      return false;
    }
    const { name, idcard, mobile, weight } = this.data.personalInfo;
    let _param = {
      real_name: name,
      idcard_no: idcard,
      birthday: this.data.birthday,
      dict_sex: this.data.sex == 2 ? 1 : 0,
      weight: weight,
      mobile,
      dict_bool_medical_history: this.data.historyFlag1 ? 1 : 0,
      medical_history: this.data._hisdata1,
      allergy_history: this.data._hisdata2,
      family_history: this.data._hisdata3,
      dict_bool_allergy_history: this.data.gmFlag1 ? 1 : 0,
      dict_bool_family_history: this.data.familyFlag1 ? 1 : 0,
      dict_bool_liver: this.data.ganFlag1 ? 1 : 0,
      dict_bool_renal: this.data.shenFlag1 ? 1 : 0,
      dict_bool_nurse: this.data.rcFlag1 ? 1 : 0,
      relation_label: this.data.choosedVal,
      dict_bool_default: this.data.isDefault ? 1 : 0
    }
    if (this.data._type == 2) {
      _param.id = this.data.id;
    }
    wx.showLoading({
      title: '认证中',
    })
    UseDrugCom.addUser(_param, this.data._type).then(result => {
      wx.hideLoading()
      if (result) {
        wx.showToast({
          title: "实名认证成功",
          icon: 'none',
          duration: 2000,
          mask: true,
        })
        this.setData({
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
            name: '',
          },
          historyDiseaseData: [
          ],
          disease_searchValue: '',
          gmDiseaseData: [],
          addFlagType: "",
          familyDiseaseData: [],
          _hisdata1: '',
          _hisdata2: '',
          _hisdata3: '',
          tags: [
            {
              name: '本人',
              choose: true,
            }, {
              name: '家属',
              choose: false,
            }, {
              name: '亲戚',
              choose: false,
            }, {
              name: '朋友',
              choose: false,
            },
          ],
          choosedVal: '本人',
        })

        app.globalData.inquiryInfo.isEditPatient = true
        app.globalData.inquiryInfo.editPatientId = this.data._type==2 ? this.data.id : result

        wx.navigateBack({
          delta: 1  // 返回上一级页面。
        })

      }
    }, (error) => {
      wx.hideLoading();
      let _errmsg =  error.msg || '请稍后重试';
      let _msg = _errmsg.length >= 50 ?_errmsg.substring(0, 50) + '...' : _errmsg;
      this.setData({
        resultFlag: true,
        resultMsg: _msg,
      })
    })

  },
  confirmR: function () {
    this.setData({
      resultFlag: false,
      resultMsg: "",
    })
  },
  tzclose: function () {
    this.setData({
      tzFlag: false
    })
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    UseDrugCom.getCerInfo().then(res=>{
      if(res.show == 1){
        this.setData({
          cerFlag:true,
          cerinfo:{
            name:res.realname,
            idcard:res.idcardno,
          }
        })
      }
    },err=>{
      wx.showToast({
        title: err.msg ? err.msg:'获取认证信息失败',
        icon: 'none',
      })
    })
  },
  know:function(){
    this.setData({
      'personalInfo.name':this.data.cerinfo.name,
      'personalInfo.idcard':this.data.cerinfo.idcard,
      cerFlag:false,
    })
    this.idcardChange({detail:{value:this.data.cerinfo.idcard}})
  },
  closeInfo:function(){
    this.setData({
      cerFlag:false,
    })
  }
})