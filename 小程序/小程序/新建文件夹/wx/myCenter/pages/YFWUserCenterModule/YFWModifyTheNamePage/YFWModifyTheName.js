// pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn.js
import {
  UserCenterApi
} from '../../../../apis/index'
import { pushNavigation } from '../../../../apis/YFWRouting'
const userCenterApi = new UserCenterApi();
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    certification:0,
    name:"",
    idcard:"",
    result:{},
    userDrugList:[],
    selfCerFlag:false,
    idcardFlag:true,
    testFlag:true,
    knowFlag:false,
    personSelfFlag:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    if(e.params){
      let _data = e.params&& typeof(e.params) == 'string' && JSON.parse(e.params) || {}
      const {certification,name,idcard} = _data;
      if(certification !=1){
        this.requestDataFromServer()
      }else{
        this.setData({
          certification,
          name,
          idcard,
        })
      }
    }else{
      this.data.from = 'other'
      userCenterApi.getUserAccountInfo().then(res=>{
        if(res){
          if(res.dict_bool_certification !=1){
            this.requestDataFromServer()
          }else{
            this.setData({
              certification:res.dict_bool_certification || '',
              name:res.real_name || '',
              idcard:res.idcard_no || '',
            })
          }

      }else{
        this.requestDataFromServer()
      }
      })
    }
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
  requestDataFromServer: function (pageIndex=0) {
    var that = this;
    userCenterApi.getUserdrug(pageIndex).then(result => {
      wx.stopPullDownRefresh();
      if (result.length == 0) { 
        this.setData({
          selfCerFlag:true,
          idcardFlag:false, //不显示  不可编辑身份证号 那一行
          personSelfFlag:false, //不显示顶上  本人认证那一行
        })
      }else{
        let _result = result.map((item,index)=>{
          item.checked = index == 0 ? true:false;
          return item;
        })
        let userDrugList = pageIndex == 0 ? [] : this.data.userDrugList;
        userDrugList = userDrugList.concat(_result)
        this.setData({
          selfCerFlag:false,   //不展示  身份证号 姓名  即展示 用药人列表
          idcardFlag:false,    //不显示  不可编辑身份证号 那一行 
          personSelfFlag:true,  //显示顶上  本人认证那一行 用于切换到本人认证
          userDrugList,
          choosedDrugPersonName:userDrugList[0].real_name,
          choosedDrugPersonIdcard:userDrugList[0].idcard_no,
        })
      }
    }, error => {
      wx.showToast({
        title: '获取用药人数据失败',
        icon: 'none',
      })
    })
  },
  idcardChange: function (e) {
    let { value } = e.detail;
    this.setData({
      idcard: value || '',
    })
  },
  nameChange:function(e){
    let { value } = e.detail;
    this.setData({
      name: value,
    })
  },
  certification:function(){
    let type = this.data.userDrugList.length == 0 ? 2:1;
    if(type == 2){
      if(!this.data.name){
        wx.showToast({
          title: "请输入姓名",
          icon: 'none',//图标，支持"success"、"loading" 
          duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
          mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false; 
      }
      let _idcard = this.data.idcard,_testflag = true;
      let idcardReg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
      if (idcardReg.test(_idcard)){
        _testflag = false;
      } 
      if(!this.data.idcard || _testflag){
        wx.showToast({
          title: "请输入正确的身份证号",
          icon: 'none',//图标，支持"success"、"loading" 
          duration: 2000,//提示的延迟时间，单位毫秒，默认：1500 
          mask: true,//是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false; 
      }
    }
    let postName = type == 2 ? this.data.name : this.data.choosedDrugPersonName, postidcard = type == 2 ? this.data.idcard : this.data.choosedDrugPersonIdcard;
    console.log(postName+'===='+postidcard)
    userCenterApi.certification({real_name:postName,idcard_no:postidcard,type,}).then(res=>{
        if(res){
          app.globalData.certification = 1;
          app.globalData.certificationFlag = true;
          if(this.data.from == 'other'){
            setTimeout(()=>{
              wx.navigateBack({})
            },2000)
          }
          this.setData({
            knowFlag:true,
            personSelfFlag:false,
            name:postName,
            idcard:postidcard
          })


        }
    },err=>{
      console.log('来自认证的错误信息:'+err.msg)
      wx.showToast({
        title: err.msg,
        icon: 'none',
      })
    })
  },
  know:function(){
    this.setData({
      knowFlag:false,
      selfCerFlag:false,
      idcardFlag:true,
      userDrugList:[],
    })
  },
  cilckCircle:function(e){
    let _id = e.currentTarget.dataset.key,_name ,_idcard;
    let _data = this.data.userDrugList.map(item=>{
      if(item.id == _id){
        _name = item.real_name;
        _idcard = item.idcard_no;
      }
      item.checked = item.id == _id ? true:false; 
      return item;
    })
    this.data.choosedDrugPersonName = _name;
    this.data.choosedDrugPersonIdcard = _idcard;
    this.setData({
      userDrugList:_data
    })
  },
  selfCer:function(){
    this.setData({
      selfCerFlag:true,
      idcardFlag:false,
      personSelfFlag:false,
      userDrugList:[],
    })
  }
})