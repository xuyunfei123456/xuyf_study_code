
import {
  config
} from '../config.js'

import {
  pushNavigation
} from '../apis/YFWRouting.js'

import {safeObj} from './YFWPublicFunction.js'
var event = require('../utils/event')
//let log = require('utils/log.js')

// import {
//   LOG
// } from 'log.js'
// let log = new LOG();

class HTTP {
  /*
  request({
    url,
    data = {},
    method = 'GET',
    header = {}
  }) {
    return new Promise((resolve, reject) => {
      this._request(url, resolve, reject, data, method, header)
    })
  }
  */

  //get请求
  get(cmd, param = {}, header = {}) {
    if (cmd.constructor == String) {
      return new Promise((resolve, reject) => {
        this._request(cmd, resolve, reject, param, 'GET', header)
      })
    } else if (cmd.constructor == Array) {
      return this.getBatch(cmd);
    }

    return Error('参数错误');
  }

  //post请求
  post(cmd, param = {}, header = {}) {
    return new Promise((resolve, reject) => {
      this._request(cmd, resolve, reject, param, 'POST', header)
    })
  }

  //多个get合并请求[{ name: '', cmd: '', param: '' }]
  getBatch(tasks, header = {}) {
    var cmds = '';
    var params = {};
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      cmds += task.cmd + ' as ' + task.name;
      if (i < tasks.length - 1) {
        cmds += ',';
      }

      params[task.name] = task.param;
    }

    return this.get('', {
      __cmd: cmds,
      __params: params
    }, null, 'GET', header)
  }

  //多个get请求并发
  getTask(tasks) {
    let promiseArr = [];

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      let promise = this.get(task.cmd, task.param);
      promiseArr.push(promise);
    }

    return Promise.all(promiseArr);
  }

  // 私有方法
  _request(url, resolve, reject, data, method, header) {
    data.__client = config.client;
    data.app_version = config.app_version;
    data.osVersion = config.osVersion
    try {
      var res = wx.getStorageSync("system_info");
      data.deviceName = res.model;
      data.os = res.platform;
      data.version = res.version;
      data.market = res.brand;
      data.networkType = safeObj(res.wifiEnabled);
    } catch (e) {
      throw new Error('getSystemInfoSync 异常: ', e);
    }
    var app = getApp()
    if(app){
      data.lat = app.globalData.latitude
      data.lng = app.globalData.longitude
      data.user_city_name = app.globalData.city
      data.user_region_id = app.globalData.region_id
    }

    // url, data, method
    wx.request({
      url: config.api_base_url + url,
      method: method,
      data: data,
      //header: Object.assign(config.header, header),
      header: {
        'content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded'
        , 'Cookie': wx.getStorageSync('cookieKey')
      },
      success: (res) => {
        const code = res.statusCode.toString()
        if (code.startsWith('2') || code === '304') {
          //获取cookie
          if (res.header && config.login_request){
            for (var i = 0; i < config.login_request.length; i++){
              if (url.indexOf(config.login_request[i]) != -1) {
                if (res.header['Set-Cookie']) {
                  wx.setStorageSync('cookieKey', res.header['Set-Cookie']);
                } 
                if(res.header['set-cookie']){
                  wx.setStorageSync('cookieKey', res.header['set-cookie']);
                }
              }
            }
          }

          if (res.data.code == 1) {
            resolve(res.data.result)
          } else if (res.data.code == -999) {
            //判断无权限访问的接口，是否跳转登录页
            if(res.data.msg.indexOf('已过期') != -1 || res.data.msg.indexOf('不存在') != -1){
              var app = getApp()
              wx.setStorageSync('cookieKey', '')
              var pages = getCurrentPages() //获取加载的页面
              var currentPage = pages[pages.length - 1] //获取当前页面的对象
              //var router = currentPage.route //当前页面url
              //wx.setStorageSync('login_referer', `/${router}`)
              //跳转到登录页
              if (currentPage.route.indexOf('YFWLogin') == -1) {
                console.log('app.globalData.modaltype',app.globalData.modaltype)
                if(app.globalData.modaltype==1){
                  app.globalData.modaltype=0
                  wx.showModal({
                    content: "您未登录或登录已过期,请重新登录",
                    cancelColor: "#1fdb9b",
                    cancelText: "取消",
                    confirmColor: "#1fdb9b",
                    confirmText: "确定",
                    success(res) {
                      if (res.confirm) {
                        pushNavigation('get_author_login')
                      }else{
                        if(pages.length >1)wx.navigateBack()
                        
                      }
                    },
                    comlete(){
                      app.globalData.modaltype=1
                    }
                  })
                }

              }
            }else{
              reject(res.data)
            }
          } else {
            //业务请求失败
            reject(res.data)
            //this._show_error()
          }
        } else {
          reject(res)
          let error_code = res.data.error_code
          this._show_error(error_code)
        }
      },
      fail: (err) => {
        reject(err)
        this._show_error(1)
      },
      // complete:(res)=>{
      //   wx.showModal({
      //     cancelColor: 'cancelColor',
      //     content:JSON.stringify(res)
      //   })
      // }
    })
  }

  // 私有方法
  _show_error(error_code) {
    if (!error_code) {
      error_code = 1
    }
    const tip = config.tips[error_code]
    wx.showToast({
      title: tip ? tip : config.tips[1],
      icon: 'none',
      duration: 2000
    })
  }
}

export {
  HTTP
}