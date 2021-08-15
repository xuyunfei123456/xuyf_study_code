import Taro from '@tarojs/taro'
import {
  config
} from '../config'

import {
  pushNavigation
} from '../apis/YFWRouting.js'
import store from '../store/index'
class HTTP {

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
    const _store = store.getState()
    const {latitude,longitude,city,region_id} = _store.globalData
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
    data.lat = latitude
    data.lng = longitude
    data.user_city_name = city
    data.user_region_id = region_id
    let _userinfo = Taro.getStorageSync('userinfo');
    if(!data.shopId&&_userinfo.shopId){
      data.shopId = _userinfo.shopId
    }
    if(!data.thirdAccountId &&_userinfo.thirdAccountId){
      data.thirdAccountId = _userinfo.thirdAccountId
    }
    let cookie = Taro.getStorageSync('cookieKey');
    console.log('请求携带的cookie',cookie)
    const headers = {
      'Content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded',
      'Cookie': cookie,
    }
    // url, data, method
    let that=  this;
    Taro.request({
      url: config.api_base_url + url,
      method: method,
      data: data,
      header: headers,
      success: (res) => {
        const code = res.statusCode.toString()
        if (code.startsWith('2') || code === '304') {
          //获取cookie
          if (res.header){
            for (var i = 0; i < config.login_request.length; i++){
              if (url.indexOf(config.login_request[i]) != -1) {
                if (res.header['set-cookie']) {
                  if(res.header['set-cookie'].indexOf('ssid=')!=-1){
                    let ssidArr = res.header['set-cookie'].split(',');
                    for(let kk = 0,len = ssidArr.length;kk<len;kk++){
                      if(ssidArr[kk].indexOf('ssid=')!=-1){
                        console.log('设置了cookie',ssidArr[kk])
                        Taro.setStorageSync('cookieKey', ssidArr[kk]);
                      }
                    }
                  }
                }
                if (res.header['Set-Cookie']) {
                  if(res.header['Set-Cookie'].indexOf('ssid=')!=-1){
                    let ssidArr = res.header['Set-Cookie'].split(',');
                    for(let kk = 0,len = ssidArr.length;kk<len;kk++){
                      if(ssidArr[kk].indexOf('ssid=')!=-1){
                        console.log('设置了cookie',ssidArr[kk])
                        Taro.setStorageSync('cookieKey', ssidArr[kk]);
                      }
                    }
                  }
                }
              }
            }
          }

          if (res.data.code == 1) {
            resolve(res.data.result)
          } else if (res.data.code == -999) {
            //判断无权限访问的接口，是否跳转登录页
            //pushNavigation('login')
            console.log('登录过期🍺🍺🍺🍺🍺🍺🍺🍺🍺🍺🍺🍺🍺🍺🍺')
            //that._request(url, resolve, reject, data, method,)
            reject(res.data)
          } else {
            //业务请求失败
            reject(res.data)
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