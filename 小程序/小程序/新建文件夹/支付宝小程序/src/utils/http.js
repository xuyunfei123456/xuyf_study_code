import Taro from '@tarojs/taro'
import {
  config
} from '../config'

import {
  pushNavigation
} from '../apis/YFWRouting.js'
import { set as setGlobalData, get as getGlobalData } from '../global_data'

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

    params = JSON.stringify(params)

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
      var res = Taro.getSystemInfoSync()
      data.deviceName = res.model;
      data.os = res.platform;
      data.version = res.version;
      data.market = res.brand;
      data.networkType = JSON.stringify(res.wifiEnabled) == '{}' ? '':res.wifiEnabled
    } catch (e) {
      throw new Error('getSystemInfoSync 异常: ', e)
    }
    data.lat = getGlobalData('latitude')
    data.lng = getGlobalData('longitude')
    data.user_city_name = getGlobalData('city')
    data.user_region_id = getGlobalData('region_id')
    data.__ssid =  Taro.getStorageSync('_cookie') || ''
    const headers = {
      'Content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
      'Cookie': Taro.getStorageSync('cookieKey'),
    }
    // url, data, method
    Taro.request({
      url: config.api_base_url + url,
      method: method,
      data: data,
      //header: Object.assign(config.header, header),
      header: headers,
      success: (res) => {
        const code = res.statusCode.toString()
        if (code.startsWith('2') || code === '304') {
          //获取cookie
          if (res.header && config.login_request){
            for (var i = 0; i < config.login_request.length; i++){
              if (url.indexOf(config.login_request[i]) != -1) {
                if (res.header['Set-Cookie']) {
                  Taro.setStorageSync('cookieKey', res.header['Set-Cookie']);
                } else if (res.header['set-cookie']) {
                  Taro.setStorageSync('cookieKey', res.header['set-cookie']);
                }
                let setcookie =  res.header['Set-Cookie'] || res.header['set-cookie'],_ssid='';
                if(setcookie){
                  if(typeof setcookie == 'object'){
                    console.log('aaa========='+JSON.stringify(setcookie))
                    setcookie = setcookie.length!=0 && setcookie[0].split(';');
                    console.log('bbb========='+JSON.stringify(setcookie))
                  }else{
                    console.log('aaa========='+JSON.stringify(setcookie))
                    setcookie = setcookie.split(';');
                    console.log('bbb========='+JSON.stringify(setcookie))
                  }
                  for(let item of setcookie){
                    if(item.indexOf('ssid')!=-1){
                      _ssid = item;
                      break;
                    }
                  }
                  console.log('ccc========='+JSON.stringify(_ssid))
                  if(_ssid){
                    let _cookie = _ssid.split('=')[1] || '';
                    Taro.setStorageSync('_cookie',_cookie)
                  }
                }

              }
            }
          }

          if (res.data.code == 1) {
            resolve(res.data.result)
          } else if (res.data.code == -999) {
            //判断无权限访问的接口，是否跳转登录页
            Taro.removeStorageSync('cookieKey')
            var toDirect = true;
            for (var i = 0; i < config.uncheck_login_request.length; i++){
              if (url.indexOf(config.uncheck_login_request[i]) != -1){
                toDirect = false;
              }
            }
            if(toDirect){
              //记录跳转登录前的页面地址
              var pages = getCurrentPages() //获取加载的页面
              var currentPage = pages[pages.length - 1] //获取当前页面的对象
              let pageRoute = currentPage.route || currentPage.__route__
              if (pageRoute.indexOf('YFWLogin') === -1 ) {
                pushNavigation('get_author_login')
              }
            }
          } else {
            //业务请求失败
            reject(res.data)
            //this._show_error(1111)
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
      }
    })
  }

  // 私有方法
  _show_error(error_code) {
    if (!error_code) {
      error_code = 1
    }
    const tip = config.tips[error_code]
    Taro.showToast({
      title: tip ? tip : config.tips[1],
      icon: 'none',
      duration: 2000
    })
  }
}

export {
  HTTP
}