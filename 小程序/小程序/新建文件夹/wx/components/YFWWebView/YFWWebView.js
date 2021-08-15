// components/YFWWebView/YFWWebView.js
import {PublicApi,IndexApi} from '../../apis/index'
import { pushNavigation } from '../../apis/YFWRouting';
import {isLogin} from '../../utils/YFWPublicFunction'
var log = require('../../utils/log')
const publicApi = new PublicApi()
const indexApi = new IndexApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    path: '',
    share: '',
    loginStatus:false,
    firstFlag:true,
    name:'',
    from:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let loginStatus = isLogin()
    this.data.loginStatus =loginStatus;
    if(options.type && options.url){
      if (options.type == 'receive_h5') {
        let _url = options.url,_path="";
        if(_url.indexOf('appinvite')!=-1){
          if(!loginStatus){
            //跳转的H5页面 需要登录的时候  暂存 获取跳转页面接口 先跳登录
            setTimeout(()=>{
              wx.setStorageSync('webviewTask', {type:'appinvite',url:_url});
            },50)

            pushNavigation('get_author_login');
            return;
          }
          this.inviate();
        }else if(_url.indexOf('sign')!=-1){
          if(!loginStatus){
            //跳转的H5页面 需要登录的时候  暂存 获取跳转页面接口 先跳登录
            wx.setStorageSync('webviewTask', {type:'sign',url:_url});
            pushNavigation('get_author_login');
            return;
          }
          this.sign();
        }else if(_url.indexOf('ysjt')!=-1){
          let newurl = this.addParam(options.url || '')
          this.setData({
            path: newurl,
            share:options.url,
            name:'药师讲堂'
          })
        }else{
          let newurl = this.addParam(options.url || '')
          this.setData({
            path:newurl,
            share:options.url,
            name:''
          })
        }
        return;
      }
      return false;
    }
    if (!options.params) {
      return;
    }
    let dic="";
    try {
      dic = typeof(options.params) == 'string' && JSON.parse(options.params) || {}
    } catch (error) {
      pushNavigation('get_home');
    }
    if (dic.type == 'receive_h5') {
      try {
        //needToken 存在说明H5页面需要去调登录接口 返回一个携带token的 url
        if(dic.needToken){
          if(!isLogin()){
            this.data.ptflag = true;
            this.data.ptInfo = dic;
            pushNavigation('get_author_login');
            return false
          }
          indexApi.getAuthUrl(decodeURIComponent(dic.url)).then(res=>{
            let newurl = res.auth_url ?decodeURIComponent(decodeURIComponent(res.auth_url)):decodeURIComponent(decodeURIComponent(dic.url));
            newurl = this.addParam(newurl)
            this.setData({
              path: newurl,
              share: decodeURIComponent(dic.share),
              name:dic.name || ""
            })
          },error=>{
            let newurl = this.addParam(decodeURIComponent(dic.url))
            this.setData({
              path:newurl ,
              share: decodeURIComponent(dic.share),
              name:dic.name || ""
            })
          })
        }else{
          let newUrl = this.addParam(decodeURIComponent(decodeURIComponent(dic.url)))
          this.setData({
            path:newUrl,
            share: decodeURIComponent(dic.share),
            name:dic.name || ""
          })
        }

      } catch (error) {
        if(!wx.getStorageInfoSync('decodeinfo')){
          wx.setStorage({
            data: 'has',
            key: 'decodeinfo',
          })
          log.info('decode信息==='+JSON.stringify(dic)+'catchinfo===='+error)
        }
        
      }

      return;
    }

    if(dic.value){
      this.data.from="app";
      let newurl = this.addParam(decodeURIComponent(dic.value))
      this.setData({
        path:newurl ,
        share: decodeURIComponent(dic.value),
      })
      return;
    }
  },
  /*获取邀请有奖*/
  inviate:function(){
    publicApi.getInviteUrl().then(res=>{
      if(res){
        let newUrl = this.addParam(res.invite_win_cash_url || '');
        this.setData({
          path:newUrl,
          share:res.invite_win_cash_url_share || '',
          name:'品种丰富,药品正规,新人注册送20元专享券,买药放心更实惠'
        })
      }
    })
  },
  addParam(url){
    if(url){
      if(url.indexOf('?') !=-1){
        url = url+'&from=miniapp&_from=miniapp'
      }else{
        url = url+'?from=miniapp&_from=miniapp'
      }
    }
    return url
  },
    /*获取签到*/
    sign:function(){
      publicApi.getSignUrl().then(res=>{
        let newUrl = this.addParam( res.sign_url || '');
        if(res){
          this.setData({
            path:newUrl,
            share:'pages/YFWHomeFindModule/YFWHomePage/YFWHome',
            name:'签到'
          })
        }
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
    let task = wx.getStorageSync('webviewTask');
    if(task){
      if(isLogin()){
        if(task.type == 'appinvite'){
          this.inviate();
        }else if(task.type == 'sign'){
          this.sign();
        }
        wx.setStorageSync('webviewTask', '')
      }else{
        let newurl = this.addParam(task.url || '');
        this.setData({
          path: newurl,
          share:task.url,
        })
      }
    }
    if(this.data.firstFlag){
      this.data.firstFlag = false;
    }else{
      if(this.data.ptflag){
        this.data.ptflag = false;
        if(!isLogin()){
          pushNavigation('get_home')
        }else{
          let dic = this.data.ptInfo;
          indexApi.getAuthUrl(dic.url).then(res=>{
            let newurl = res.auth_url ?decodeURIComponent(decodeURIComponent(res.auth_url)):decodeURIComponent(decodeURIComponent(dic.url))
            newurl = this.addParam(newurl);
            this.setData({
              path: newurl,
              share: decodeURIComponent(dic.share),
              name:dic.name || ""
            })
          })
        }
      }
    }

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
  onShareAppMessage: function (options) {
    let _url  = this.data.share && this.data.share != 'undefined' ? this.data.share:this.data.path;
    let param = {
      type: 'receive_h5',
      url: encodeURIComponent(_url),
    },_path = "",_name=this.data.name,_imageUrl="";
    if(this.data.name == '签到'){
      //签到页面分享  直接跳转到首页
      _path = this.data.share
    }else if(this.data.from == 'app'){
      param={};
      param.value = encodeURIComponent(options.webViewUrl);
      _path = 'components/YFWWebView/YFWWebView?params='+JSON.stringify(param) //分享地址
    }else{
      _path = 'components/YFWWebView/YFWWebView?params='+JSON.stringify(param) //分享地址
    }
    if(_path.indexOf('rollinfo') != -1){
      _name = '拼口罩众成城， 9.9可得100只口罩，就差你了！';
      _imageUrl='../../images/kz.png'
      _path = 'components/YFWWebView/YFWWebView?params='+JSON.stringify(param) //分享地址
    }else if(_path.indexOf('appinvite')!=-1){
      _name = '买药享低价，速领20元新人红包，药房直送有保障';
      _imageUrl = '../../images/wxmin_share_invite.png';
    }
    return {
      // 'desc': desc, //标题
      title: _name,
      path: _path,
      imageUrl:_imageUrl,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: "转发成功",
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  /**
   * 接收到H5消息
   */
  onReceiveMessage: function (msg) {
    console.log(msg)
    wx.showToast({
      title: JSON.stringify(msg),
      icon: 'none',
      duration: 2000
    })
  },
  binderror: function (e) {
    console.log('进入H5失败' + e)
  },
  bindload: function (e) {
    console.log('进入H5成功' + e)
  }
})