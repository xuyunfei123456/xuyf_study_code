import {
  HTTP
} from '../utils/http.js'

//首页
class BaseApi extends HTTP {
  insertUnionIPLog(data){
    return this.get('guest.sitemap.insertUnionIPLog', data)
  }
  getOpenid(code) {
    return this.get('guest.weixin.getOpenid', {
      code: code
    })
  }

  getOpenidByPhoneNumber(code, encryptedData, iv, intro_image,invite_code) {
    let _param = {
      code: code,
      encryptedData: encryptedData,
      iv: iv,
      intro_image: intro_image,
    }
    if(invite_code){
      _param.invite_code = invite_code;
    }
    try {
      if(wx.getStorageSync('_expiredinfo_')){
        let nowTime = new Date().getTime(),_localdata = wx.getStorageSync('_expiredinfo_')
        if(nowTime - _localdata.expired>24*60*60*1000){
          wx.removeStorageSync('_expiredinfo_');
        }else{
          _param.from_unionid = _localdata.unionId;
        }
      }
    } catch (error) {
    }
    return this.get('guest.weixin.getOpenidByPhoneNumber',_param)
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

  openidLogin(openid){
    return this.post('guest.account.getAccountInfoByOpenKey',{
      open_key: openid,
      type: 4
    })
  }

  venderLogin(openid, intro_image, mobile, smsCode) {
    return this.post('guest.account.venderLogin', {
      login_type: 1,
      mobile: mobile,
      smsCode: smsCode,
      open_key: openid,
      type: 4,
      intro_image: ''
    })
  }
  /**获取全局配置 */
  getSystemConfig() {
    return this.get('guest.common.app.getSystemConfig')
  }
}
//拼团
class GroupApi extends HTTP{
  groupIndex(data){
    return this.get('person.group.getGroupDetail', {...data})
  }
  getGoodsDelData(group_m_Id){
    return this.get('person.group.getGroupMedicineDetail',{
      group_medicineId:group_m_Id
    })
  }
}
export {
  BaseApi,
  GroupApi
}