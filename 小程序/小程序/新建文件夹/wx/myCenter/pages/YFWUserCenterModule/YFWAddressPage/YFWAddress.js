// pages/address/address.js
import {
  UserCenterApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {
  YFWAddressDetailModel
} from './YFWAddressModel.js'
//获取应用实例
var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    check: false,
    isDefault: false,
    addressModel: {},
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
    addressHidden:true,
    opacityAnimation:{},
    translateAnimation:{},
    isIOS:true,
    postAreaid:"",
  },
  onReady: function() {
    
  },
  clickRadioAction: function() {
    this.setData({
      isDefault: !this.data.isDefault
    })
  },
  selectAddressAction: function() {
    if (this.data.addressHidden) {
      let that = this
      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

      that.setData({
        addressHidden: false,
        opacityAnimation: opacityAni.export(),
        translateAnimation: translateAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(1).step()
        translateAni.translateY(0).step()
        that.setData({
          opacityAnimation: opacityAni.export(),
          translateAnimation: translateAni.export(),
        })
      }.bind(this), 300)
    }
  },
  selectCityAction: function(event) {
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
      console.log(result)
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
  changeSelectAddressType: function(event) {
    let type = event.currentTarget.dataset.type
    this.setData({
      selectAddressType: type
    })
  },
  confirmAction: function() {
    if (this.data.selectProvince == '省份' || this.data.selectCity == '城市' || this.data.selectDistricts == '区县') {
      wx.showToast({
        title: "请完善地址选择",
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.hideAddress()
    this.setData({
      selectAddressType: 'province',
      selectProvince: '省份',
      selectCity: '',
      selectDistricts: '',
      userAddress: this.data.selectProvince + this.data.selectCity + this.data.selectDistricts,
      postAreaid:this.data.selectAreaID
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.isIOS = wx.getSystemInfoSync().platform=='ios'?true:false
    var that = this;
    var addressID = options.address_id;
    if (addressID > 0) {
      console.log("addressID")
      console.log(addressID)
      userCenterApi.getAddressDetail(addressID).then(result => {
        let addressModel = YFWAddressDetailModel.getModelData(result)
        that.setData({
          addressModel: addressModel,
          isDefault: addressModel.isDefault,
          userAddress: addressModel.userAddress,
          selectAreaID: addressModel.region_id,
          isIOS: this.data.isIOS,
          postAreaid:addressModel.region_id,
        })
        console.log(addressModel);
      })

    } else {
      that.setData({
        isIOS: this.data.isIOS,
        addressModel: {
          name: '',
          address_name: '',
          mobile: '',
          regionid: '',
          isDefault: false,
          userAddressDetail:'',
        }
      })

    }

    wx.setNavigationBarTitle({
      title: addressID > 0 ? '编辑地址' : '新增地址'
    })

    userCenterApi.getProvinceAndCityInfo(0).then((result) => {
      console.log(result)
      this.setData({
        provinceArray: result
      })
    }).then((error) => {

    })
  },
  bindChange_name: function(e) {
    var name = e.detail.value;
    var addressModel = this.data.addressModel;
    addressModel.name = name;
    this.setData({
      addressModel: addressModel
    });

  },
  bindChange_mobile: function(e) {
    var phoneNumber = e.detail.value;
    var addressModel = this.data.addressModel;
    addressModel.mobile = phoneNumber;
    this.setData({
      addressModel: addressModel
    });

  },
  bindChange_address: function(e) {
    var addressName = e.detail.value;
    var addressModel = this.data.addressModel;
    addressModel.userAddressDetail = addressName;
    this.setData({
      addressModel: addressModel
    });

  },

  checkStatus: function() {
    let addressModel = this.data.addressModel;
    let result = true
    this.data.addressModel.mobile = addressModel.mobile.replace(/\s*/g, '')
    if (addressModel.name.length < 2) {
      this.infoMsg = "姓名至少2个字符，中文或英文";
      result = false
    } else if (addressModel.mobile.length != 11) {
      this.infoMsg = "手机号码格式不正确";
      result = false
    } else if (this.data.userAddress.length == 0) {
      this.infoMsg = "请选择所在地区";
      result = false
    } else if (addressModel.userAddressDetail.length < 5) {
      this.infoMsg = "请填写完整收货地址";
      result = false
    }
    if (!result) {
      wx.showToast({
        title: this.infoMsg,
        icon: 'none'
      })
    }
    return result;

  },

  //保存地址
  save: function() {
    if(!this.checkStatus()) {
      return
    }
    var addressModel = this.data.addressModel;
    var addressID = addressModel.id;
    var name = addressModel.name;
    var phoneNumber = addressModel.mobile;
    var addressName = this.data.userAddress + addressModel.userAddressDetail;
    let isDefault = this.data.isDefault;
    let regionID = this.data.postAreaid;
    if (addressID > 0) {
      //编辑地址
      userCenterApi.updateAddress(addressID, name, phoneNumber, regionID, addressName, isDefault).then(res => {
        console.log(res);
        wx.navigateBack({})
      },err=>{
        wx.showModal({
          content: err.msg || '服务异常',
          showCancel:false,
        })
      })

    } else {
      //新增地址 
      userCenterApi.addNewAddress(name, phoneNumber, regionID, addressName, isDefault).then(res => {
        console.log(res)
        wx.navigateBack({})
      },err=>{
        wx.showModal({
          content: err.msg || '服务异常',
          showCancel:false,
        })
      })

    }
  },
  //设为默认地址的按钮重复点击取消
  bindtap1: function(e) {
    var check = this.data.check;
    check = !check;
    this.setData({
      check: check
    })
  },
  hideAddress(){
    if (!this.data.addressHidden) {
      let that = this
      let translateAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      translateAni.translateY(600).step()

      let opacityAni = wx.createAnimation({
        duration: 300,
        timingFunction: 'linear'
      })
      opacityAni.opacity(0).step()

      that.setData({
        translateAnimation: translateAni.export(),
        opacityAnimation: opacityAni.export(),
      })

      setTimeout(function () {
        opacityAni.opacity(0).step()
        translateAni.translateY(0).step()
        that.setData({
          translateAnimation: translateAni.export(),
          opacityAnimation: opacityAni.export(),
          addressHidden: true
        })
      }.bind(this), 300)
    }
  }



})