import {
  OrderPaymentApi,
  UserCenterApi
} from '../../../apis/index.js'
const userCenterApi = new UserCenterApi()
const orderPaymentApi = new OrderPaymentApi()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    htmName:"",
    htmId:"",
    second_type: 1,
    region: ['', '', ''],
    provinceArray: [],
    cityArray: [],
    districtsArray: [],
    selectProvince: '省份',
    selectCity: '城市',
    selectDistricts: '区县',
    selectAddressType: 'province',
    userAddress: '',
    selectAreaID: '',
    jobFlag2: false,
    startDate: "",
    date: "",
    jobvalue: "",
    jobFlag: false,
    zzms: '',
    dangerarea: 0,
    outarea: 0,
    purpose: 2,
    fs: 0,
    ks: 0,
    xm: 0,
    is_fl:0,
    other: 0,
    name: "",
    mobile: "",
    idcard: "",
    tw: "",
    zzChange: "",
    contentHeight: "",
    hasInput: 0,
    hasPatient: true,
    needenrollment_prompt: '',
    agreeFlag:0,
    _workArr:[],
    htmArr:[],
    is_resident:"",
    is_ownuse:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _work_trade_items = app.globalData.work_trade_items;
    // let _workArr = Object.values(_work_trade_items);//某些不兼容
    let _workArr = [];
    for(let key in _work_trade_items){
      _workArr.push(_work_trade_items[key])
    }
    let params = options.params;
    if (params && typeof (params) == 'string') {
      params = JSON.parse(params)
    }
    let systeminfo = wx.getSystemInfoSync();
    let _height = systeminfo.windowHeight,_w = systeminfo.windowWidth,_ration = 750/_w
    _height =_height*_ration;
    let _yqfkInfo = JSON.parse(JSON.stringify(app.globalData.yqfkInfo));
    if (_yqfkInfo.isSave) {
      this.setData({
        name: _yqfkInfo.drugname,
        idcard: _yqfkInfo.drugidcardno,
        mobile: _yqfkInfo.drugmobile,
        fs: _yqfkInfo.fs,
        ks: _yqfkInfo.ks,
        xm: _yqfkInfo.xm,
        other: _yqfkInfo.qt,
        dangerarea: _yqfkInfo.iscontact == 1 ? 1 : 2,
        outarea: _yqfkInfo.isarrivals == 1 ? 1 : 2,
        is_resident: _yqfkInfo.is_resident == 1 ? 1 : 2,
        is_ownuse: _yqfkInfo.is_ownuse == 1 ? 1 : 2,
        zzms: _yqfkInfo.desc_sym,
        purpose: _yqfkInfo.medicate_purpose == 1 ? 1 : 2,
        jobvalue:_yqfkInfo.work_trade,
        userAddress:_yqfkInfo.from_where,
        date:_yqfkInfo.last_come_time,
        is_fl:_yqfkInfo.is_fl,
        agreeFlag:_yqfkInfo.agreeFlag
      })
    }
    let _date = new Date();
    this.setData({
      contentHeight: (_height - 340)  + 'rpx',
      hasPatient: params.hasPatient,
      needenrollment_prompt: params.needenrollment_prompt,
      startDate: _date.getFullYear() + '-' + _date.getMonth() + '-' + _date.getDay(),
      _workArr,
    })
    userCenterApi.getProvinceAndCityInfo(0).then((result) => {
      this.setData({
        provinceArray: result
      })
    }).then((error) => {

    })
    userCenterApi.getProvinceAndCityInfo(-1).then((result) => {
      this.setData({
        htmArr: result
      })
    }).then((error) => {

    })
  },
  dangerarea(e) {
    this.setData({
      dangerarea: e.target.dataset.index
    })
  },
  agreeInfo(){
    this.setData({
      agreeFlag:this.data.agreeFlag == 0 ? 1 : 0
    })
  },
  secendClick(e) {
    let _type = e.currentTarget.dataset.type;
    this.setData({
      second_type: _type,
    })
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  outarea(e) {
    this.setData({
      outarea: e.target.dataset.index
    })
  },
  is_resident(e) {
    this.setData({
      is_resident: e.target.dataset.index
    })
  },
    is_ownuse(e) {
    this.setData({
      is_ownuse: e.target.dataset.index
    })
  },
  purpose(e) {
    this.setData({
      purpose: e.target.dataset.index
    })
  },
  zzClick(e) {
    let _index = e.target.dataset.index
    this.setData({
      [_index]: this.data[_index] == 0 ? 1 : 0
    })

  },
  selecthtmArr:function(event){
    let id = event.currentTarget.dataset.id;
    let title = event.currentTarget.dataset.name;
    this.setData({
      htmName: title,
      htmId: id
    })
  },
  selectCityAction: function (event) {
    let id = event.currentTarget.dataset.id
    let title = event.currentTarget.dataset.name
    if (this.data.selectAddressType == 'districts') {
      this.setData({
        selectDistricts: title,
        selectAreaID: id
      })
      return
    }
    userCenterApi.getProvinceAndCityInfo(id).then((result) => {
      if (this.data.selectAddressType == 'province') {
        this.setData({
          cityArray: result,
          districtsArray: [],
          selectProvince: title,
          selectAddressType: 'city',
          selectCity: '城市',
          selectDistricts: '区县',
          selectAreaID: id
        })
      } else if (this.data.selectAddressType == 'city') {
        this.setData({
          districtsArray: result,
          selectCity: title,
          selectAddressType: result.length > 0 ? 'districts' : 'city',
          selectDistricts: result.length > 0 ? '区县' : '',
          selectAreaID: id
        })
      }

    }).then((error) => {

    })
  },
  idcardChange: function (e) {
    let {
      value
    } = e.detail;
    this.setData({
      idcard: value,
    })
  },
  nameChange: function (e) {
    let {
      value
    } = e.detail;
    this.setData({
      name: value,
    })
  },
  mobileChange(e) {
    let {
      value
    } = e.detail;
    value = value.replace(/[^\d]/g, '');
    this.setData({
      mobile: value
    })
    return value
  },
  twChange(e) {
    let {
      value
    } = e.detail;
    value = value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    value = value.replace(/^\./g, ""); //验证第一个字符是数字而不是字符
    value = value.replace(/\.{2,}/g, "."); //只保留第一个.清除多余的
    value = value
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
    this.setData({
      tw: value
    })
    return value
  },
  zzChange(e) {
    let {
      value
    } = e.detail;
    this.setData({
      zzms: value,
      hasInput: value.length
    })
    return value
  },
  jobchoose() {
    this.setData({
      jobFlag: true
    })
    setTimeout(() => {
      this.setData({
        jobFlag2: true
      })
    }, 100)
  },
  closejob() {
    this.setData({
      jobFlag2: false
    })

    setTimeout(() => {
      this.setData({
        jobFlag: false
      })
    }, 500)
  },
  areaClick() {
    this.setData({
      areaFlag: true
    })
    setTimeout(() => {
      this.setData({
        areaFlag2: true
      })
    }, 100)
  },
  confirmAction: function () {
    if (this.data.second_type == 1 && (this.data.selectProvince == '省份' || this.data.selectCity == '城市' || this.data.selectDistricts == '区县')) {
      wx.showToast({
        title: '请选择地点',
        icon: 'none'
      })
      return
    }
    if(this.data.second_type == 2 && this.data.htmName == ""){
      wx.showToast({
        title: '请选择地点',
        icon: 'none'
      })
      return
    }
    this.closearea();
    let _userAddress = this.data.second_type == 1 ? this.data.selectProvince + this.data.selectCity + this.data.selectDistricts : this.data.htmName;
    this.setData({
      // selectAddressType: 'province',
      // selectProvince: '省份',
      // selectCity: '城市',
      // selectDistricts: '区县',
      userAddress: _userAddress,
    })
  },
  changeSelectAddressType: function (event) {
    let type = event.currentTarget.dataset.type
    this.setData({
      selectAddressType: type
    })
  },
  closearea() {
    this.setData({
      areaFlag2: false
    })

    setTimeout(() => {
      this.setData({
        areaFlag: false
      })
    }, 500)
  },
  listClick(e) {
    let jobvalue = e.target.dataset.id;
    this.setData({
      jobFlag2: false,
      jobvalue,
    })
    setTimeout(() => {
      this.setData({
        jobFlag: false
      })
    }, 500)
  },
  handleCatchTap() {
    return true
  },
  handleConfirm() {
    if (!this.data.hasPatient) {
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
        if (this.data[item.id] == "") {
          wx.showToast({
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
      _workArr,
      is_resident,
      is_ownuse,
    } = this.data;
    if (purpose == 1 && !fs && !ks && !xm && !is_fl && !other) {
      wx.showToast({
        title: '请选择具体症状',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (jobvalue == "" && _workArr.length != 0) {
      wx.showToast({
        title: '请选择从事行业',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (purpose == 1 && !fs && !ks && !xm && !other) {
      wx.showToast({
        title: '请选择症状',
        duration: 2000,
        icon: 'none'
      })
      return;
    } else if (other && zzms == "") {
      wx.showToast({
        title: '请输入症状描述',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (dangerarea == 0) {
      wx.showToast({
        title: '请选择30天内是否去过中高风险地区',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (outarea == 0) {
      wx.showToast({
        title: '请选择30天内是否有境外/接触史',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
     if (is_resident == 0) {
      wx.showToast({
        title: '请选择是否本市常驻人口',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (is_ownuse == 0) {
      wx.showToast({
        title: '请选择是否本人治疗使用',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (userAddress == "") {
      wx.showToast({
        title: '请选择来自何地',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (date == "") {
      wx.showToast({
        title: '请选择最近一次来沪日期',
        duration: 2000,
        icon: 'none'
      })
      return;
    }
    if (agreeFlag == 0) {
      wx.showToast({
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
      is_resident: is_resident == 1 ? 1 : 0,
      is_ownuse: is_ownuse == 1 ? 1 : 0,
    }
    if (this.data.hasPatient) {
      app.globalData.yqfkInfo = _yqfkInfo;
      wx.navigateBack();
      return;
    }
    orderPaymentApi.userverified({
      name,
      idcardno: idcard
    }).then(res => {
      if (res) {
        app.globalData.yqfkInfo = _yqfkInfo;
        wx.navigateBack();
      } else {
        wx.showToast({
          title: res.msg || '实名认证失败，请稍后重试',
          duration: 2000,
          icon: 'none'
        })
      }
    }, err => {
      wx.showToast({
        title: err.msg || '实名认证失败，请稍后重试',
        duration: 2000,
        icon: 'none'
      })
    })


  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})