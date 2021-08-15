import {
  HTTP
} from '../utils/http.js'

//首页
class BaseApi extends HTTP {
  getOpenid(code) {
    return this.get('guest.weixin.getOpenid', {
      code: code
    })
  }
  /**获取全局配置 */
  getSystemConfig() {
    return this.get('guest.common.app.getSystemConfig')
  }
  getOpenidByPhoneNumber(code, encryptedData, iv, intro_image) {
    return this.get('guest.weixin.getOpenidByPhoneNumber', {
      code: code,
      encryptedData: encryptedData,
      iv: iv,
      intro_image: intro_image
    })
  }

  userLogin(userName, passowrd) {
    return this.post('guest.account.login', {
      userName: userName,
      password: passowrd
    })
  }

  getAccountInfo() {
    return this.get('person.account.getAccountInfo')
  }

  openidLogin(openid,type){
    return this.post('guest.account.getAccountInfoByOpenKey',{
      open_key: openid,
      type,
    })
  }
  zfblogin(code){
    return this.get('guest.alipay.getAccessToken',{
      code,
    })
  }
  thirdLogin(openid, intro_image, mobile, smsCode) {
    return this.post('guest.account.venderLogin', {
      login_type: 1,
      mobile: mobile,
      smsCode: smsCode,
      open_key: openid,
      type: 4,
      intro_image: intro_image
    })
  }
  venderLogin( mobile, smsCode) {
    return this.post('guest.account.login', {
      login_type: 1,
      mobile: mobile,
      smsCode: smsCode,
    })
  }
}
class AlipayApi extends HTTP{
  getOpenidByPhoneNumber(param){
    return this.get('guest.alipay.getOpenidByPhoneNumber', {
      ...param
    })
  }
  getOpenid(code) {
    return this.get('guest.alipay.getOpenid', {
      code: code
    })
  }
}
class SwanApi extends HTTP{
  getOpenidByPhoneNumber(param){
    return this.get('guest.alipay.getOpenidByPhoneNumber', {
      ...param
    })
  }
  getOpenid(code) {
    return this.get('guest.alipay.getOpenid', {
      code: code
    })
  }
}
export {
  BaseApi,
  AlipayApi,
  SwanApi,
}