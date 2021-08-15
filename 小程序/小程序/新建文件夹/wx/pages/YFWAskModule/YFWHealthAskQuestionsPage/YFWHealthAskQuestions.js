// pages/healthy/myQuesion/myQuesion.js

var util = require('../../../utils/util.js')

import {
  HealthAskApi,
  UploadImageApi,
  UserCenterApi,
  SafeApi
} from '../../../apis/index.js'
import { config } from '../../../config.js'
const alloffice = new HealthAskApi()
const uploadImageApi = new UploadImageApi()
const userCenterApi = new UserCenterApi()
const safeApi = new SafeApi()
import {
  pushNavigation
} from '../../../apis/YFWRouting.js'
// var app = getApp()
const sourceType = [['camera'], ['album']]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pitchName:"",
    arRight: '../../../images/icon_arrow_right_gary.png',
    uploadimg: '',
    formdata: '',
    upimg: '../../../images/yfwsk/upimg.png',
    sourceTypeIndex: 1,
    sourceType: ['拍照', '相册'],
    dataSouce: [],
    multiArray: [],
    multiIndex: [0, 0],
    keshiArr: [],
    sickArr: [],
    pitchId: '',
    myimageUrl: '',
    isShow:true,
    items: [{
      name: '男',
      value: '1'
    },
    {
      name: '女',
      value: '0'
    }]
  },

  sourceTypeChange(e) {
    this.setData({
      sourceTypeIndex: e.detail.value
    })
    this.chooseImage()
  
  },
  chooseImage(){
    const that = this
      wx.chooseImage({
        count: 1,
        sourceType: sourceType[this.data.sourceTypeIndex],
        // sizeType: sizeType[this.data.sizeTypeIndex],
        sizeType: ['original', 'compressed'],
        success: function(res) {
          that.setData({
            uploadimg:res.tempFilePaths[0]
          })
        }
      })
     
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var that = this;
    alloffice.getAlloffice().then(res => {
      console.log(res, '科室')
      let multiArray = res;
      multiArray.unshift({
        "department_name": "选择科室",
        "id": 0,
        "items": []
      })
      let keshiArr = []
      for (let i = 0; i < multiArray.length; i++) {
        let keshiModel = multiArray[i]
        keshiModel.items.unshift({
          "department_name": "分类",
          "id": 0
        })
        keshiArr.push(keshiModel.department_name)
      }

      let keshiMdoel = multiArray[0];
      let sickArr = []
      for (let i = 0; i < keshiMdoel.items.length; i++) {
        let sickModel = keshiMdoel.items[i]
        sickArr.push(sickModel.department_name)
      }

      this.setData({
        dataSouce: multiArray,
        multiArray: [keshiArr, sickArr],
        keshiArr: keshiArr,
        sickArr: sickArr
      })

    })
  },
  bindMultiPickerColumnChange(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var that = this;
    let data = {
      multiArray: that.data.multiArray,
      multiIndex: that.data.multiIndex
    }
    // console.log(that.data.sickArr,'ooooo')
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        let sickModel = this.data.dataSouce[e.detail.value]
        let sickArray = sickModel.items

        let sicks = []
        for (let i = 0; i < sickArray.length; i++) {
          let model = sickArray[i];
          sicks.push(model.department_name)
        }
        console.log(data.multiIndex[1], 'data.multiIndex[1]')
        data.multiIndex[1] = 0;
        data.multiArray[0] = this.data.keshiArr
        data.multiArray[1] = sicks
        this.setData(data)
        break;
    }
    // that.setData(data)
  },
  bindMultiPickerChange(e) {
    let keshIndex = e.detail.value[0];
    let sickIndex = e.detail.value[1];
    if (keshIndex == 0) {
      // 提示选择科室
      console.log('提示选择科室')
    } else if (sickIndex == 0) {
      // 提示选择分类
      console.log('提示选择分类')
    } else {
      // 可以提交
      console.log('可以提交')
      let keshiModel = this.data.dataSouce[keshIndex];
      let sickModle = keshiModel.items[sickIndex];
      this.setData({
        pitchId: sickModle.id,
        pitchName:sickModle.department_name
      })
    }

  },
  bindChange_age: function(e) {
    let sendage = e.detail.value;
    if(sendage>120)sendage =120;
    this.setData({
      sendage,
    });
    return sendage

  },
  formSubmit: function(e) {
    let delValue = e.detail.value
    wx.showLoading({
      title:'请稍等'
    })
    if (delValue.textarea == '' || delValue.radiogp == undefined || delValue.inputAge == '' || this.data.pitchId == '') {
      wx.showToast({
        title: '请将信息填写完整',
        icon: 'none'
      })
      wx.hideLoading({})
    } else if (delValue.input.length < 10) {
      wx.showToast({
        title: '标题内容不能少于10个字',
        icon: 'none'
      })
      wx.hideLoading({})
    } else {
      Promise.all([safeApi.getMsgSecCheck(delValue.input),safeApi.getMsgSecCheck(delValue.textarea)]).then(resArr=>{
            if(resArr&&resArr.length!=0){
              if(!resArr[0]){
                wx.showToast({
                  title: '请输入正确的标题',
                  icon: 'none'
                })
                wx.hideLoading({})
                return;
              }else if(!resArr[1]){
                wx.showToast({
                  title: '请输入正确的描述',
                  icon: 'none'
                })
                wx.hideLoading({})
                return;
              }else{
                this.checkImageAndSend(delValue)
              }
            }else{
              wx.showToast({
                title: '验证失败,请稍后重试',
                icon: 'none'
              })
              wx.hideLoading({}) 
            }
      })     
    }
  },
  checkImageAndSend(delValue){
    if (this.data.uploadimg) {
      uploadImageApi.upload(this.data.uploadimg).then((imageUrl) => {
        userCenterApi.getUserAccountInfo().then((info) => {
          safeApi.getImgSecCheck(imageUrl).then(res => {
            if(res){
              alloffice.commitQuestionInfo(delValue.input, delValue.textarea, this.data.pitchId, delValue.radiogp, delValue.inputAge, info.default_mobile, imageUrl).then(res => {
                console.log(res, '上传成功')
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 0,
                  })
                }, 1000)
                wx.showToast({
                  title: '提交成功',
                  icon: 'success'
                })
              }).catch(err=>{
                wx.showToast({
                  title: err.msg,
                  icon: 'none'
                })
              })
            }else{
              wx.showToast({
                title: '请上传合格的图片',
                icon: 'none'
              })
              wx.hideLoading({}) 
              return;
            }
          }).catch(err=>{
            wx.showToast({
              title: '检测图片失败,请稍后重试',
              icon: 'none'
            })
          })
        }).catch(err=>{
          wx.showToast({
            title: '获取信息失败,请稍后重试',
            icon: 'none'
          })
        })
      }).catch(err=>{
        wx.showToast({
          title: '上传照片失败',
          icon: 'none'
        })
      })
    } else {
      userCenterApi.getUserAccountInfo().then((info) => {
        console.log(info)
        alloffice.commitQuestionInfo(delValue.input, delValue.textarea, this.data.pitchId, delValue.radiogp, delValue.inputAge, info.default_mobile).then(res => {
          console.log(res, '上传成功')
          setTimeout(() => {
            wx.navigateBack({
              delta: 0,
            })
          }, 1000)
          wx.showToast({
            title: '提交成功',
            icon: 'success'
          })
        }).catch(err=>{
          wx.showToast({
            title: err.msg,
            icon: 'none'
          })
        })
      }).catch(err=>{
        wx.showToast({
          title: '获取信息失败,请稍后重试',
          icon: 'none'
        })
      })
    }
  },
  openUtilityMenu: function () {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent('#onSkip').showModal(bottom)
    })

  },
  clearWenTitle: function () {
    this.setData({
      isShow:false
    })
  },
  radioChange: function (e) {
    var items = this.data.items;
    for (var i = 0; i < items.length; ++i) {
      items[i].checked = items[i].value == e.detail.value
    }
    console.log(items)

    this.setData({
      items: items
    });
  },
})