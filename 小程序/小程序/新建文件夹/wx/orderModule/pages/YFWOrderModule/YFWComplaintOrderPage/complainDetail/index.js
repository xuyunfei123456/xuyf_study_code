import {
  OrderApi,
  UploadImageApi
} from '../../../../../apis/index.js'
const orderApi = new OrderApi()
const uploadImageApi = new UploadImageApi()
import {
  isEmpty,
  isNotEmpty
} from '../../../../../utils/YFWPublicFunction.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNo: '',
    shopTitle: '',
    complaintType: ['商家服务问题', '商品质量问题'],
    checkedIndex: 0,
    inputText: '',
    postPicArray: [],
    postSucMap: '',
    position: -1,
    len: 0,
    mobile: '',
    screenHeight: "",
    shadowFlag: true,
    id: '',
    typeinfo: [],
    complainData: {},
    typeName: '',
    defaultname: '',
    shadowFlag2: true,
    defaultReason: '请选择投诉原因',
    chooseReason: "",
    reasonid: '',
    jyflag: false,
    expFlag: true,
    uploadFlag: true,
    lastReasonId: "",
    _id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _data = options.params && typeof(options.params) == 'string' && JSON.parse(options.params).info;
    let screenData = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.data.position = screenData.position;
    this.gettstype('', _data.id, _data.typeinfo)
    this.setData({
      orderNo: screenData.order_no,
      shopTitle: screenData.shop_title,
      id: _data.id,
      complainData: _data.complainData
    })
    this.repeatTime = 0
    this.data.postSucMap = new Map()
  },
  setReason: function (e) {
    //chooseReason 选中的理由  但是并没有点机确定选择
    //_id 是投诉类型对应的原因的id
    let _id = e.currentTarget.dataset.id, chooseReason = '';
    if (_id == this.data.lastReasonId) { //当点击已经选择的原因时 直接return
      return false;
    }
    let _complainData = this.data.complainData;
    let _arr = this.data.complainData[this.data.id].map(item => {
      if (item.id == _id) {
        item.choosed = true;
        chooseReason = item.complaints_reason;
      } else {
        item.choosed = false;
      }
      return item;
    })
    _complainData[this.data.id] = _arr;
    this.setData({
      complainData: _complainData,
      chooseReason,
      reasonid: _id, //reasonId  是投诉原因的id
    })
  },
  gettstype: function (e, id, arr = this.data.typeinfo) {
    //_id  投诉类型id 
    let _name = '', _id = id || e.currentTarget.dataset.id;
    //id不存在表示 是后来点机投诉类型调用方法  反之是初始化调用的时候
    let _arr = arr.map(item => {
      if (item.dict_complaints_type == _id) {
        item.choosed = true;
        _name = item.complaints_name
      } else {
        item.choosed = false;
      }
      return item;
    })
    let _obj = {
      typeinfo: _arr,
      typeName: _name,
      _id,
    }
    if (id) {
      _obj.defaultname = _name
    }
    this.setData(_obj);
  },
  choosedReason: function () {
    //typeName 在弹出的投诉类型中 选择的类型名字  防止没有按确定直接关闭弹窗 点机确定后 将值直接赋给defaultname
    //defaultname 最终选中的投诉类型
    //id  用来改变投诉原因
    //uploadflag  是否必须上传凭证 仅投诉类型为发货问题或者是商品问题是 必传
    let uploadFlag = this.data._id == 3 || this.data._id == 4 ? true : false;
    let obj = {
      shadowFlag: true,
      defaultname: this.data.typeName,
      id: this.data._id,
      uploadFlag,
    }
    //在投诉类型中选中的类型与原本的不同 清空投诉原因的值defaultReason并赋值‘请选择投诉原因’ 以及 投诉原因数组还原
    let _complainData = this.data.complainData;
    if (this.data.id != this.data._id) {
      let _arr = this.data.complainData[this.data.id].map(item => {
        item.choosed = false;
        return item;
      })
      _complainData[this.data.id] = _arr;
    }
    obj.complainData = _complainData;
    obj.defaultReason = '请选择投诉原因';
    obj.lastReasonId = "";
    obj.reasonid = "";
    this.setData(obj);
  },
  choosedReason2: function () {
    //什么都没选 直接隐藏
    if (this.data.reasonid == "") {
      this.setData({
        shadowFlag2: true,
      })
      return;
    }
    let flag = false;
    if (this.data.reasonid == 12 && this.data._id == 4) { //当选择商品问题且原因是 假药时 展示一些提示
      flag = true;
    }
    this.setData({
      defaultReason: this.data.chooseReason,
      shadowFlag2: true,
      jyflag: flag,
      lastReasonId: this.data.reasonid,
    })
  },
  showShadow2: function () {
    this.setData({
      shadowFlag2: false,
    })
  },
  hideAddFlag2: function () {
    if (this.data.lastReasonId == "" && this.data.reasonid == "") {
      this.setData({
        shadowFlag2: true,
      })
      return;
    }
    var _complainData = this.data.complainData;
    if (this.data.lastReasonId != this.data.reasonid) {
      var _complainData = this.data.complainData;
      var _arr = this.data.complainData[this.data.id].map(item => {
        if (item.id == this.data.lastReasonId) {
          item.choosed = true;
        } else {
          item.choosed = false;
        }
        return item;
      })
      _complainData[this.data.id] = _arr;
    }
    let obj = {
      shadowFlag2: true,
      complainData: _complainData
    }
    this.setData(obj)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    wx.getSystemInfo({
      success(res) {
        // px转换到rpx的比例
        let pxToRpxScale = 750 / res.windowWidth;
        // window的高度
        let screenHeight = res.windowHeight * pxToRpxScale
        that.setData({
          screenHeight,
        })
      }
    })
  },
  showShadow: function () {
    this.setData({
      shadowFlag: false,
    })
  },
  hideAddFlag: function () {
    this.setData({
      shadowFlag: true,
    })
    this.gettstype('', this.data.id, this.data.typeinfo);
  },
  bindChange_mobile: function (e) {
    let { value } = e.detail;
    value = value.replace(/[^0-9]/g, '');
    this.setData({
      mobile: value,
    })
  },
  showBigPic: function (e) {
    let src = e.currentTarget.dataset.item
    wx.previewImage({
      current: src,
      urls: this.data.postPicArray
    })
  },
  chooseReason: function (e) {
    this.setData({
      checkedIndex: e.currentTarget.dataset.index,
    })
  },
  onTextInput: function (text) {
    let input = text.detail.value, len = input.length;
    this.setData({
      inputText: input,
      len,
    })
  },
  postComplaint: function () {
    if (this.data.id != 7 && this.data.reasonid == "") {
      wx.showToast({
        title: '请选择投诉原因',
        icon: 'none'
      })
      return false;
    }
    if (this.data.inputText == '') {
      wx.showToast({
        title: '请填写投诉说明',
        icon: 'none'
      })
      return false;
    }
    if ((this.data._id == 3 || this.data._id == 4) && this.data.postPicArray.length == 0) {
      wx.showToast({
        title: '请上传凭证',
        icon: 'none'
      })
      return false;
    }
    if (this.data.mobile == "") {
      wx.showToast({
        title: '请填写联系电话',
        icon: 'none'
      })
    }
    if (this.data.mobile) {
      let flag = true, flag2 = true, mobile = this.data.mobile;
      mobile.length == 11 ? flag = true : flag = false;
      mobile.substring(0, 1) == 1 ? flag2 = true : flag2 = false;
      if (!flag || !flag2) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false;
      }
    }
    wx.showLoading({
      title: '提交中...',
    })
    let uploadSuccessArray = this.letLocalMapToArray()
    if (this.data.postPicArray.length == uploadSuccessArray.length) {
      this.postiInfo()
    } else {
      this.repeatTime = 0
      this.postPic()
    }
  },
  getPostImage: function () {
    let localArray = []
    this.data.postSucMap.forEach(function (value, key, map) {
      localArray.push(value)
    });
    return localArray
  },
  choosePic: function () {
    let that = this
    ChooseImage(that)
  },
  deletePic: function (e) {
    let index = e.currentTarget.dataset.index;
    if (isNotEmpty(this.data.postSucMap.get(this.data.postPicArray[index]))) {
      this.data.postSucMap.delete(this.data.postPicArray[index])
    }
    this.data.postPicArray.splice(index, 1)
    this.setData({
      postPicArray: this.data.postPicArray
    })
  },
  letLocalMapToArray: function () {
    let localArray = []
    this.data.postSucMap.forEach(function (value, key, map) {
      localArray.push(key)
    });
    return localArray
  },
  postPic: function () {
    if (this.repeatTime >= 3) {
      wx.showToast({
        title: '上传失败，请稍后重试',
        icon: 'none'
      })
    } else {
      let uploadSuccessArray = this.letLocalMapToArray()
      let uploadFailureArray = this.data.postPicArray.concat(uploadSuccessArray).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
      });
      if (uploadFailureArray.length == 0) {
        this.postiInfo()
      }
      uploadFailureArray.forEach((item, index) => {
        uploadImageApi.upload(item).then(res => {
          this.data.postSucMap.set(item, res)
          if (index == uploadFailureArray.length - 1) {
            this.repeatTime++;
            this.postPic()
          }
        }, error => {
          if (index == uploadFailureArray.length - 1) {
            this.repeatTime++;
            this.postPic()
          }
        })
      })
    }
  },
  postiInfo: function () {
    let postImageArray = this.getPostImage();
    let obj = {
      orderno: this.data.orderNo,
      type: this.data.id,
      content: this.data.inputText,
      complaints_reason: this.data.defaultReason,
      account_mobile: this.data.mobile,
      account_name: 'name',
    }
    if (postImageArray.length != 0) {
      obj.introImage = postImageArray
    }
    orderApi.complaintsToTheBusinessman(obj).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'none'
      })
      wx.navigateBack({
        delta:2
      })
    }, error => {
      wx.hideLoading()
      if (isNotEmpty(error.msg)) {
        wx.showToast({
          title: error.msg,
          icon: 'none'
        })
      }
    })
  },
  showExp: function () {
    this.setData({
      expFlag: false,
    })
  },
  hideexp: function () {
    this.setData({
      expFlag: true,
    })
  },
      /**
     * 解决底部滑动穿透问题
     */
    myTouchMove: function () {
      return false;
    }
})

var ChooseImage = function (that) {
  wx.chooseImage({
    sizeType: ['400', '400'],
    count: 3 - that.data.postPicArray.length,
    success: function (res) {
      res.tempFiles.forEach((item, index) => {
        uploadImageApi.upload(item.path).then(file => {
          that.data.postSucMap.set(item.path, file)
        })
      })
      res.tempFiles.forEach((item, index) => {
        that.data.postPicArray.push(item.path)
      })
      that.setData({
        postPicArray: that.data.postPicArray
      })
    },
  })
}