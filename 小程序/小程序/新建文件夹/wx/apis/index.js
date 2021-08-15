import {
  HTTP
} from '../utils/http.js'
import {
  UploadImage
} from '../utils/uploadImage.js'
import {
  handleResponse
} from '../utils/responseHandle.js'
var app = getApp()
class SafeApi extends HTTP {
  /**
   * 对于输入文字的敏感字符处理
   */
  getMsgSecCheck(content) {
    return this.get('guest.weixin.msgSecCheck', {
      content: content
    })
  }

  /**
   * 对于上传图片，敏感图片处理
   */
  getImgSecCheck(imgPath) {
    return this.get('guest.weixin.imgSecCheck', {
      imgPath: imgPath
    })
  }

}

class UploadImageApi extends UploadImage {
  /**上传图片
   * path 图片存储路径
   * wx.chooseImage({
      success: function(res) {
        let path = res.tempFilePaths[0]
        }
      ......
   */
  upload(path) {
    return this.uploadImageFile(path)
  }
}
class HttpRequest extends HTTP {
  /**
   * 对于某些接口返回结果包含图片链接 做拼接处理
   */
  getHandle(cmd, params) {
    return new Promise((resolve, reject) => {
      this.get(cmd, params).then((result) => {
        result = handleResponse(result)
        resolve(result)
      }, error => {
        reject(error)
      })
    })

  }
}
const httpRequest = new HttpRequest()
class PublicApi extends HTTP {
  /**获取区域ID */
  getRegionID(cityName) {
    return this.get('guest.sys_region.getModelByNameCn', {
      region_name: cityName
    })
  }
  /**获取签到URL */
  getSignUrl() {
    return this.get('person.app.getShareUrl', {
      type: 'sign'
    })
  }
  /**获取邀请赢现金URL */
  getInviteUrl() {
    return this.get('person.app.getShareUrl', {
      type: 'invite'
    })
  }
  /**获取优惠券URL */
  getCouponUrl() {
    return this.get('person.app.getShareUrl', {
      type: 'coupon'
    })
  }
  /**获取邀请赢现金分享URL */
  getInviteShareUrl() {
    return this.get('guest.common.app.getAppinviteConfig')
  }

}
/**首页*/
class IndexApi extends HTTP {
  /**banner 是 receive_h5 且需要登陆的时候  直接调取接口获得带token的url */
  getTbbarBtn(){
    return this.get('guest.common.app.getapp_view_btn')
  }
  getIndexData(){
    return this.get('guest.common.app.getIndexData_2021New',{
      os: 'wx',
      deviceName: 'N',
    })
  }
  getAuthUrl(redirect_url) {
    return httpRequest.getHandle('person.app.getAuthUrl', {
      redirect_url,
    })
  }
  /**获取首页数据 */
  getHomeData() {
    return httpRequest.getHandle('guest.common.app.getIndexData', {
      os: 'wx',
      deviceName: 'N',
    })
  }

  /**获取推荐商品*/
  getLabelRecommendMedicine() {
    return httpRequest.getHandle('guest.medicine.getLabelRecommendMedicine', {
      total: 10
    })
  }
  /**获取首页所有的数据 */
  getAllHomeData(homeParams, recommendParams) {
    var tasks = new Array()
    tasks.push({
      name: homeParams.name,
      cmd: 'guest.common.app.getIndexData',
      param: {
        os: 'wx',
        deviceName: 'N',
      }
    })
    tasks.push({
      name: recommendParams.name,
      cmd: 'guest.medicine.getLabelRecommendMedicine',
      param: {
        total: 10,
      }
    })
    return httpRequest.getHandle(tasks)
  }
  /**获取首页弹框广告*/
  getIndexAds() {
    return httpRequest.getHandle('guest.common.app.getIndexPopupAds_new')
  }
  /**获取资质广告位*/
  getZizhiData() {
    return httpRequest.getHandle('guest.common.app.getAPPBannerBottom')
  }


  /**获取订单列表*/
  getOrderListData(status, index) {
    return httpRequest.getHandle('person.order.getPageData', {
      pageIndex: index,
      del_status: 0,
      order_status: status,
      pageSize: 20,
      ssid: 'bf21ad9fa4c64d2d903b206c7fe96082',
      isApp: 1
    })
  }




  /**合并多个请求获取数据，按task的name返回json对象*/
  getTaskTest() {
    var tasks = new Array();
    tasks.push({
      name: 'aaa',
      cmd: 'guest.medicine.getLabelRecommendMedicine',
      param: {
        total: 6
      }
    })
    tasks.push({
      name: 'bbb',
      cmd: 'guest.medicine.getLabelRecommendMedicine',
      param: {
        total: 2
      }
    })
    tasks.push({
      name: 'ccc',
      cmd: 'guest.medicine.getLabelRecommendMedicine',
      param: {
        total: 5
      }
    })

    return this.get(tasks)
  }
}
/**健康汇*/
class HealthHuiApi extends HTTP{
  getHomeData(){
    return this.get('guest.common.app.getIndexData_HealthArticle')
  }
  getHotTopicArticleInfo(hotTopicObj){
    return this.get('guest.common.app.getTopicArticle',{
      article_topic_id:hotTopicObj.topicId,
      topic_name:hotTopicObj.topicName,
      pageIndex:hotTopicObj.pageIndex,
      pageSize:hotTopicObj.pageSize || 10
    })
  }
}
/**商品详情模块*/
class GoodsDetailApi extends HTTP {
  /**获取商品详情*/
  getGoodsDetailInfo(shopGoodsID) {
    return httpRequest.getHandle('guest.shopMedicine.getStoreMedicineDetail', {
      store_medicine_id: shopGoodsID,
    })
  }
  /**获取放假信息*/
  getVacationInfo() {
    return this.get('guest.sys_config.getVacationTip')
  }
  /**获取常见问题列表*/
  getQuestionList() {
    return this.get('guest.medicine.getQuestionAskList')
  }
  /**收藏商品*/
  getCollectGoods(goodsID, shopID) {
    return this.get('person.favorite.collectStoreGoods', {
      medicineid: goodsID,
      storeid: shopID
    })
  }
  /**取消收藏商品*/
  getCancleCollectGoods(goodsID, shopID) {
    return this.get('person.favorite.cancelCollectStoreGoods', {
      medicineid: goodsID,
      storeid: shopID
    })
  }
  /**领取优惠券*/
  getCoupon(couponID) {
    return this.get('person.usercoupons.acceptCoupon', {
      id: couponID
    })
  }
  /**获取商家和平台资质*/
  getShopAndPlatformQualification(shopInfos, platformInfos) {
    var tasks = new Array()
    tasks.push({
      name: shopInfos.name,
      cmd: 'guest.shop.getShopQualification',
      param: {
        storeid: shopInfos.shopID
      }
    })
    tasks.push({
      name: platformInfos.name,
      cmd: 'guest.common.app.getAPPBannerBottom',
    })

    return httpRequest.getHandle(tasks)
  }
  /**评价列表*/
  getEvaluationList(shopID, pageIndex) {
    return httpRequest.getHandle('guest.evaluation.getEvaluationByStoreId', {
      storeid: shopID,
      pageIndex: pageIndex,
      pageSize: 20,
    })
  }
  /**降价通知*/
  setPriceOffNotice(goodsID, price, expect_price) {
    return this.get('person.account.setPriceOffNotice', {
      store_medicineid: goodsID,
      price: price,
      expect_price: expect_price
    })
  }

}
/**商家模块*/
class ShopDetailApi extends HTTP {
  /**获取优惠券*/
  getCoupon(id) {
    return this.get('person.usercoupons.acceptCoupon', {
      id,
    })
  }
  /**获取商家信息*/
  getShopInfo(shopID) {
    return httpRequest.getHandle('guest.shop.getShopInfo', {
      storeid: shopID
    })
  }
  /**获取商家资质*/
  getShopQualification(shopID) {
    return httpRequest.getHandle('guest.shop.getShopQualification', {
      storeid: shopID
    })
  }
  /**获取商家推荐商品*/
  getShopRecommendGoods(shopID) {
    return httpRequest.getHandle('guest.shopMedicine.getStoreMedicineTop', {
      storeid: shopID,
      count: '6'
    })
  }
  /**收藏商家*/
  getCollectShop(shopID) {
    return this.get('person.favorite.collectStore', {
      storeid: shopID
    })
  }
  /**取消收藏商家*/
  getCancelCollectShop(shopID) {
    return this.get('person.favorite.cancelCollectStore', {
      storeid: shopID
    })
  }
  /**获取商家商品分类*/
  getCategary() {
    return this.get('guest.shopMedicine.getCategroyByParentId')
  }
  /**获取商家商品*/
  getShopGoods(shopID, categaryID, sortType, pageIndex, keyWords) {
    //keywords
    var params = {
      storeid: shopID,
      categoryid: categaryID,
      pageSize: 20,
      pageIndex: pageIndex,
      orderField: sortType, //sale_count/price asc/price desc
    }
    if (keyWords) {
      params.keywords = keyWords
    }
    return httpRequest.getHandle('guest.shopMedicine.getStoreMedicineSearch', params)
  }
}
/*商品分类*/
class GoodsCategaryApi extends HTTP {
  /**获取分类信息*/
  getCategaryInfo() {
    return httpRequest.getHandle('guest.category.getCategoryList')
  }
  /**获取分类商品列表
   * sort == '' 综合  'price' 价格 'shopcount' 报价数
   * sortType ==  'asc' 升序 'desc'降序
   *conditions == {aliascn:'',titleAbb:''}
   *aliascn  品牌 多品牌以,分割
   *titleAbb  厂家 多厂家以,分割
   */
  getCategaryGoods(categrayID, sort, sortType, pageIndex, conditions, version) {
    var params = {
      conditions: {
        categoryid: categrayID,
        sort: sort,
        sorttype: sortType,
      },
      pageIndex: pageIndex,
      pageSize: 20,
      version: version,
    }
    if (conditions) {
      params.conditions.aliascn = conditions.aliascn
      params.conditions.millid = conditions.titleAbb
      params.conditions.standard = conditions.standard
    }
    return httpRequest.getHandle('guest.medicine.getMedicines', params)
  }

  /**获取所有的品牌*/
  getAllBrands(categoryID) {
    return this.get('guest.medicine.getTopAliasCN', {
      conditions: {
        'categoryid': categoryID
      },
      limit: 1000,
    })
  }
  /**获取所有的生产厂家*/
  getAllManufacturers(categoryID) {
    return this.get('guest.store.getTopMills', {
      conditions: {
        'categoryid': categoryID
      },
      limit: 1000,
      hasprice: '1',
    })
  }

}
/**找药*/
class FindGoodsApi extends HTTP {
  getFindGoodsInfo() {
    return httpRequest.getHandle('guest.common.app.getFindYao')
  }
}
/**消息*/
class MessageApi extends HTTP {
  /**获取未读消息数 */
  getMessageUnreadCount() {
    return this.get('person.message.getNotReadCount')
  }
  /**获取消息首页数据*/
  getHomeMessage() {
    return this.get('guest.common.app.getMessageHome')
  }
  /**获取消息列表*/
  getMessageListByType(messageType, pageIndex) {
    return this.get('person.message.getMessageByType', {
      type: messageType,
      pageIndex: pageIndex,
    })
  }
  /**某类消息设为已读*/
  getMessageTypeRead(typeID) {
    return this.get('person.message.typeMarkRead', {
      msg_type_id: typeID
    })
  }
  /**某条消息设为已读*/
  getMessageRead(messageID) {
    return this.get('person.message.markRead', {
      id: messageID
    })
  }
    /**用户同意订阅消息给后台发送*/
    subScribeMessage(msg,dict_msg_type,subscribe_desc) {
      return this.get('guest.common.app.syncWxMsgSubscribe', {
        msg,
        dict_msg_type,
        subscribe_desc,
      })
    }
}
/**登录/注册、找回密码*/
class LoginRegisterApi extends HTTP {
  /**获取三方登录信息*/
  getWXLoginInfo(openPlatformKey, nickName, userIconUrl) {
    return this.get('guest.account.getAccountInfoByOpenKey', {
      type: '4', //4代表微信，其他三方平台不考虑
      open_key: openPlatformKey,
      nick_name: nickName,
      img_url: userIconUrl
    })
  }
  /**三方登录绑定手机号*/
  bindPhoneNumber(openPlatformKey, nickName, userIconUrl, phoneNumber, smsCode) {
    return this.get('guest.account.venderLogin', {
      type: '4', //4代表微信，其他三方平台不考虑
      open_key: openPlatformKey,
      name: nickName,
      intro_image: userIconUrl,
      mobile: phoneNumber,
      smsCode: smsCode,
      login_type: 1,
    })
  }

  /**发送验证码 登录/绑定手机号 type==1  找回密码type==3*/
  sendSMS(phoneNumber, type) {
    return this.get('guest.account.sendSMS', {
      mobile: phoneNumber,
      type: type,
    })
  }
  /**发送语音验证码*/
  sendVoiceSMS(phoneNumber, type) {
    return this.get('guest.account.sendSMS', {
      mobile: phoneNumber,
      type: type,
      isVoice: '1'
    })
  }
  /**验证码登录*/
  loginBySMS(phoneNumber, smsCode) {
    return this.get('guest.account.login', {
      mobile: phoneNumber,
      smsCode: smsCode,
      login_type: '1'
    })
  }
  /**账号密码登录*/
  loginByAccountAndPassword(account, password) {
    return this.get('guest.account.login', {
      userName: account,
      password: password,
      login_type: 2,
    })
  }
  /**找回密码--验证手机号*/
  findPasswordVerify(phoneNumber, smsCode) {
    return this.get('guest.account.isValidSMSCode', {
      mobile: phoneNumber,
      smsCode: smsCode,
    })
  }
  /**更改密码*/
  updatePassword(oldPassword, newPassword) {
    var params = {
      new_password: newPassword
    }
    if (oldPassword) {
      params.old_password = oldPassword
    }
    return this.get('person.account.changePwd', params)
  }
  /**重置密码*/
  resetPassword(newPassword) {
    return this.updatePassword(null, newPassword)
  }
}
/**我的/个人中心模块*/
class UserCenterApi extends HTTP {
  /**根据邀请码获取用户信息*/
  getYQAccountByCode(code) {
    return this.get('guest.account.getYQAccountByCode', {
      code,
    })
  }
  /**获取邀请码*/
  getAppinviteCode() {
    return this.get('guest.common.app.getAppinviteCode')
  }
  /**兑换积分*/
  balanceToPoint(amount) {
    return this.get('person.invite.balanceToPoint', {
      amount,
    })
  }
  /**积分详情*/
  getBalanceInfo() {
    return this.get('person.invite.getBalanceInfo')
  }
  /**提现记录*/
  getTxRecord() {
    return this.get('person.invite.getWithdrawRecord', {
      pageIndex: 1,
      pageSize: 20
    })
  }
  /**提现详情*/
  getMyBalance() {
    return this.get('person.invite.getMyBalance', {
      pageIndex: 1,
      pageSize: 20
    })
  }
  /**获取邀请的用户*/
  getInviteIndex() {
    return this.get('person.invite.getInviteIndex')
  }
  /**积分详情*/
  rankDetail(data) {
    return this.get('person.userpoint.getPageData', data)
  }
  /**获取我的保单对应的H5地址*/
  getMyPolicy() {
    return httpRequest.getHandle('person.account.getMyInsuranceUrl')
  }
  /**获取我的首页信息*/
  getAccountHeaderInfo() {
    return httpRequest.getHandle('person.account.getAccountCenterInfo')
  }
  certification(data) {
    return this.get('person.account.verified', {
      ...data
    })
  }
  /**获取我的物流列表信息*/
  getTrafficnoInfo() {
    return httpRequest.getHandle('person.order.getTrafficnoList')
  }
  /**获取用户个人账户信息*/
  getUserAccountInfo() {
    return httpRequest.getHandle('person.account.getAccountInfo')
  }
  /**更新姓名*/
  updateUserName(name) {
    return this.get('person.account.update_app', {
      data: {
        real_name: name
      },
    })
  }
  /**注销账号*/
  accountCancel(data) {
    return this.get('person.account.AccountCancel', data)
  }
  /**更新QQ*/
  updateUserQQ(qq) {
    return this.get('person.account.update_app', {
      data: {
        qq: qq
      },
    })
  }
  /**更新性别信息  sex == '1'  '0'*/
  updateUserSexInfo(sex) {
    return this.get('person.account.updateSex_app', {
      sex: sex
    })
  }
  /**更新用户头像*/
  updateUserIcon(imageUrl) {
    return this.get('person.account.updateAccountImg', {
      intro_image: imageUrl
    })
  }
  /**更新手机号--验证验证码*/
  verifySMSCode(smsCode) {
    return this.get('guest.account.isValidSMSCode', {
      smsCode: smsCode,
    })
  }
  /**
   * type '3'==旧手机号 '2' ==新手机号
   */
  getOldMobileSMSCode() {
    return this.get('guest.account.sendSMS', {
      type: '3',
    })
  }
  /**
   * type '3'==旧手机号 '2' ==新手机号
   * isNewMobile  Bool值  是否和老手机号一样
   */
  getNewMobileSMSCode(isNewMobile) {
    return this.get('guest.account.sendSMS', {
      type: '2',
      mobile: isNewMobile
    })
  }
  /**更新手机号
   * newMobileNumber 新手机号
   * smsCode 新手机号获取的验证码
   * oldMobileSmsCode  旧手机号获取的验证码
   */
  updateUserMobile(newMobileNumber, smsCode, oldMobileSmsCode) {
    return this.get('person.account.updateMobile', {
      mobile: newMobileNumber,
      mobile_smscode: smsCode,
      old_mobile_smscode: oldMobileSmsCode
    })
  }
  /**意见反馈*/
  feedBack(content, phoneNumber, qq, ssid) {
    return this.get('guest.common.app.feedback', {
      content: content,
      mobile: phoneNumber,
      qq: qq,
      accountId: ssid,
    })
  }
  /**获取地址列表*/
  getAddress(pageIndex) {
    return this.get('person.address.getReceiptAddress', {
      pageIndex: pageIndex,
      pageSize: 10,
    })
  }
  /**获取用药人*/
  getUserdrug(pageIndex) {
    return this.get('person.userdrug.GetListByAccountId', {
      pageIndex: pageIndex,
      pageSize: 10,
    })
  }
  /**获取个人信息*/
  getPersonalInfo(pageIndex) {
    return this.get('person.userdrug.GetIsFristReturnOldUser', {})
  }
  /**删除用药人*/
  deleteUser(id) {
    return this.get('person.userdrug.delete', {
      id,
    })
  }
  /**获取地址详情*/
  getAddressDetail(addressID) {
    return this.get('person.address.getAddressInfo', {
      id: addressID
    })
  }
  /**删除地址*/
  delectAddress(addressID) {
    return this.get('person.address.delete', {
      id: addressID
    })
  }
  /**新增地址 isDefault== '0' '1'*/
  addNewAddress(name, phoneNumber, regionID, addressName, isDefault) {
    let params = {
      name: name,
      mobile: phoneNumber,
      address_name: addressName,
      regionid: regionID,
      dict_bool_default: isDefault,
    }
    return this.get('person.address.insert', {
      data: JSON.stringify(params)
    })
  }
  /**更新地址 isDefault== '0' '1'*/
  updateAddress(addressID, name, phoneNumber, regionID, addressName, isDefault) {
    let params = {
      id: addressID,
      name: name,
      mobile: phoneNumber,
      address_name: addressName,
      regionid: regionID,
      dict_bool_default: isDefault,
    }
    return this.get('person.address.update', {
      data: JSON.stringify(params)
    })
  }
  /**获取省市县信息 regionID 0==省份*/
  getProvinceAndCityInfo(regionID) {
    return this.get('guest.sys_region.getListByParentId', {
      regionid: regionID
    })
  }
  /**我的评价列表*/
  getMyEvaluation(pageIndex) {
    return this.get('person.evaluation.getPageData', {
      pageIndex: pageIndex,
      pageSize: 10,
    })
  }
  /**我的投诉列表*/
  getMyComplaints(pageIndex) {
    return this.get('person.complaints.getPageData', {
      pageIndex: pageIndex,
      pageSize: 10,
      conditions: {
        type: '-1'
      },
    })
  }
  /**我的收藏--商品*/
  getMyCollectionGoods(pageIndex) {
    return httpRequest.getHandle('person.favorite.getUserCollectionStoreGoods', {
      pageIndex: pageIndex,
      pageSize: 20,
    })
  }
  /**取消收藏商品  支持批量操作 多个ID用,隔开  例如'123,234,345'*/
  cancelCollectGoods(goodsIDs, shopIDs) {
    return this.get('person.favorite.cancelCollectStoreGoods', {
      medicineid: goodsIDs,
      storeid: shopIDs,
    })
  }

  /**我的收藏--商家*/
  getMyCollectionShops(pageIndex) {
    return httpRequest.getHandle('person.favorite.getUserCollectionStore', {
      pageIndex: pageIndex,
      pageSize: 20,
    })
  }
  /**取消收藏商家  支持批量操作 多个ID用,隔开  例如'123,234,345'*/
  cancelCollectGoods(shopIDs) {
    return this.get('person.favorite.cancelCollectStore', {
      storeid: shopIDs,
    })
  }
  /**获取用户积分*/
  getUserPoint() {
    return this.get('person.userpoint.getValidPoint')
  }
  /**获取用户优惠券 type  '0'==未使用 '1'==已使用 '2'==已过期 dict_coupons_type  ''==全部 '2'==单品 '1'==店铺 '3'==平台*/

  getMyCoupons(pageIndex, type, couponType) {
    var params = {
      pageIndex: pageIndex,
      pageSize: 20,
      status: type,
    }
    if (couponType) {
      params.dict_coupons_type = couponType + ''
    }
    return this.get('person.usercoupons.getPageData', params)
  }
  /**获取服药提醒列表*/
  couponsDelete(id) {

    return this.get('person.usercoupons.delete', {
      id: id
    })
  }
  /**获取服药提醒列表*/
  getRemindOfMedicineList() {
    return httpRequest.getHandle('guest.common.app.getUseMedicineList')
  }
  /**删除服药提醒*/
  delectRemindOfMedicine(remindID) {
    return this.get('guest.common.app.deleteUseMedicineById', {
      remindId: remindID,
    })
  }
  /**获取服药提醒设置*/
  getRemindOfMedicineDetail(remindID) {
    return httpRequest.getHandle('guest.common.app.getUseMedicineDetail', {
      remindId: remindID,
    })
  }

}
/**订单模块*/
class OrderApi extends HTTP {
  /**获取订单列表 orderStatus  ''==全部  'unpaid'==待付款 'unsent'==待发货 'unreceived'==待收货 'unevaluated'==待评价 'return_goods'==退货款*/
  getOrderListData(orderStatus, pageIndex) {
    return httpRequest.getHandle('person.order.getPageData', {
      pageIndex: pageIndex,
      del_status: 0,
      order_status: orderStatus,
      pageSize: 10,
      isApp: 1
    })
  }
  /*获取留言历史列表*/
  gethistoryMessage(orderno) {
    return this.get('person.order.getAdvisoryByOrderno', {
      orderno,
    })
  }
  /*提醒卖家发货*/
  remindSend(orderno) {
    return this.get('person.order.RemindOrderSend', {
      orderno,
    })
  }
  /*查询注销*/
  getcancel() {
    return this.get('person.account.CheckAccountCancel', {})
  }
  /*发送留言*/
  sendMessage(data) {
    return this.get('person.order.insertPersonAdvisory', data)
  }
  /**获取处方提交要求 */
  getUploadRXInfo(orderID) {
    return this.get('person.order.getUploadRXInfo', {
      orderno: orderID
    })
  }
  /**获取处方提交要求 */
  receiveData(data) {
    return this.get('person.order.SaveOrderBatchNo', {
      orderno: data.orderno,
      list: JSON.stringify(data.list)
    })
  }
  /**获取处方提交要求 */
  uploadRXInfo(orderID, imageUrl) {
    return this.get('person.order.uploadRX', {
      orderno: orderID,
      rx_image: imageUrl,
    })
  }
  /**订单搜索 */
  searchOrder(keyWords, pageIndex) {
    return httpRequest.getHandle('person.order.getPageData', {
      keywords: keyWords,
      pageIndex: pageIndex,
      pageSize: 10,
      isApp: 1
    })
  }
  /**删除订单 */
  delectOrder(orderID) {
    return this.get('person.order.delete', {
      orderno: orderID,
    })
  }
  /**取消退款申请 */
  cancelRefund(orderID) {
    return this.get('person.order.cancelApplyReturn', {
      orderno: orderID,
    })
  }
  /**确认收货 */
  confirmReceiving(orderID) {
    return this.get('person.order.receive', {
      orderno: orderID,
    })
  }
  /**再次购买 */
  buyAgain(orderID) {
    return this.get('person.order.buyAgain', {
      orderno: orderID,
    })
  }
  /**获取订单详情*/
  getOrderDetail(orderID) {
    return httpRequest.getHandle('person.order.getDetail', {
      orderno: orderID,
      isApp: 1
    })
  }
  /**协商详情 */
  getNegotiatedDetail(orderNo) {
    return httpRequest.getHandle('person.order.getNegotiatedDetail', {
      orderno: orderNo,
    })
  }
  /**物流公司 */
  getShippingUnitList(orderNo) {
    return this.get('person.order.getShippingUnitList')
  }
  /**获取订单联系客服/商家 */
  getOrderContactType() {
    return this.get('guest.common.app.getOrderDetailCallType')
  }

  /**获取投诉类型 */
  getTsList() {
    return this.get('person.order.getComplaintConfig')
  }
  /**点击商家、商店客服统计
   * shopName 商家名称
   * contactType '1'== 商城客服 '2'==商家电话
   * phoneNumber 商家电话 contactType=='2'时必传
   */
  recordContactClickInfo(orderID, shopName, contactType, phoneNumber) {
    var params = {
      orderno: orderID,
      title: shopName,
      type: contactType,
    }
    if (phoneNumber) {
      params.sellphone = phoneNumber
    }
    return this.get('person.order.insertContactRecord', params)
  }
  /**商家申请延迟发货
   * isAgree 1==同意  0==拒绝
   */
  getDelaySend(orderID, isAgree) {
    return this.get('person.order.delaySend', {
      orderno: orderID,
      isConfirm: isAgree,
    })
  }
  /**投诉商家
   * type  1==商品质量问题  2==商家服务问题
   * content 内容
   * voucherImageUrls 凭证图片URL数组  非必传
   */
  complaintsToTheBusinessman(params) {
    return this.get('person.order.complaint', {
      ...params
    })
  }
  /**投诉详情
   */
  getComplaintsDetail(orderID) {
    return this.get('person.complaints.getDetail', {
      orderno: orderID,
    })
  }
  /**取消投诉
   */
  cancelComplaints(orderID) {
    return this.get('person.complaints.cancel', {
      orderno: orderID,
    })
  }

  /**物流详情
   * isRefresh:bool 是否主动刷新物流信息
   */
  getLogisticsDetails(orderID, isRefresh, isInvoice, trafficno, isRefund) {
    let params = {}
    params.orderno = orderID
    if (isInvoice) {
      params.trafficno = trafficno
    }

    if (isRefresh) {
      params.is_real_query = 1
    }
    if (isRefund) {
      params.is_return = 1
    }
    return httpRequest.getHandle(isInvoice ? 'person.order.getShippingTrace_Invoice' : 'person.order.getShippingTrace', params)
  }
  /**订单评价
   * servicesScore 服务评分
   * sendScore 发货速度评分
   * logisticsScore 物流评分
   * packageScore 包装评分
   */
  evaluateOfOrder(orderID, content, servicesScore, sendScore, logisticsScore, packageScore) {
    return this.get('person.order.evaluation', {
      orderno: orderID,
      content: content,
      services_star: servicesScore,
      send_star: sendScore,
      logistics_star: logisticsScore,
      package_star: packageScore,
    })
  }
  /**
   * 评价/收货成功--获取订单
   * type  'evaluate' == 评价成功  'received' == 收货成功
   */
  getOrderStatus(orderID, type) {
    return httpRequest.getHandle('person.order.getOrderOperInfo', {
      orderno: orderID,
      type: type,
      client: 'phone',
    })
  }
  /**获取取消订单原因 */
  getCancelOrderReason(orderID) {
    return this.get('person.order.getCancelReason', {
      orderno: orderID,
    })
  }
  /**取消订单
   * reason 原因
   */
  cancelOrder(orderID, reason) {
    return this.get('person.order.cancel', {
      orderno: orderID,
      desc: reason,
    })
  }
  /**获取用户手机号 */
  getAccountMobile() {
    return this.get('person.account.getAccountMobile')
  }
  /**验证手机号
   * phoneNumber 手机号
   */
  verifyMobile(phoneNumber) {
    return this.get('person.account.verifyMobile', {
      mobile: phoneNumber
    })
  }

  getReturnTypeAfterSend(orderno) {
    return this.get('person.order.getReturnTypeAfterSend', {
      orderno
    })
  }
  /**获取申请退款原因 */
  getReturnReason(orderID) {
    return this.get('person.order.getReturnReason', {
      orderno: orderID,
    })
  }
  /**获取申请退款提示 */
  getGoodsInfoAndDesc(orderID) {
    return httpRequest.getHandle('person.order.getGoodsInfoAndDesc', {
      orderno: orderID,
    })
  }
  /**申请退款
   * reason 原因
   */
  applyForRefund(orderID, reason) {
    return this.get('person.order.applyReturn', {
      orderno: orderID,
      desc: reason,
    })
  }
  /**申请退货--获取订单里的商品信息 */
  getRefundGoodsInfo(orderID) {
    return httpRequest.getHandle('person.order.getGoodsInfo', {
      orderno: orderID,
    })
  }
  /**申请退货--获取退货原因类型 */
  getRefundGoodsReasonType(orderID) {
    return this.get('person.order.getReturnGoodsReasonType', {
      orderno: orderID,
    })
  }
  /**申请退货--获取退货原因
   * refundType 在getReturnGoodsReasonType有返回
   */
  getRefundGoodsReason(orderID, refundType) {
    return this.get('person.order.getReturnGoodsReason', {
      orderno: orderID,
      type: refundType,
    })
  }

  /** 获取退货原因 */
  getReturnGoodsReason(orderID) {
    return this.get('person.order.getReturnGoodsReasonType', {
        orderno: orderID,
      })
      .then(reasonTypes => new Promise((resolve, reject) => {
        const reasonKeys = Object.keys(reasonTypes)
        let tasks = []
        tasks = reasonKeys.map(reasonKey => {
          return {
            name: reasonKey,
            cmd: 'person.order.getReturnGoodsReason',
            param: {
              orderno: orderID,
              type: reasonTypes[reasonKey]
            }
          }
        })

        this.get(tasks).then(res => resolve({
          type: reasonTypes,
          reasons: res
        }), error => reject(error))
      }))
  }

  /**申请退货
   * reason 原因
   * returnGoodsArray 退货商品信息
   * voucherImageUrls 凭证图片URL集合 可为空数组
   * reportImageUrls 检验报告图片URL集合 可为空数组
   * money 退款金额
   */
  applyForRefundGoods(orderID, reason, returnGoodsArray, voucherImageUrls, reportImageUrls, money) {
    return this.get('person.order.applyReturnGoods', {
      orderno: orderID,
      reason: reason,
      image_voucher: voucherImageUrls,
      image_report: reportImageUrls,
      money: money,
      returnGoodsInfo: returnGoodsArray,
    })
  }
  /**申请退货--填写物流信息
   * trafficNo 物流单号
   * trafficName 物流公司名称
   */
  submitRefundGoodsTrafficInfo(orderID, trafficName, trafficNo) {
    return this.get('person.order.sendReturnGoods', {
      orderno: orderID,
      trafficName: trafficName,
      trafficNo: trafficNo,
    })
  }
  /**获取退货单详情 */
  getRefundInfo(orderID) {
    return this.get('person.order.getReturnInfo', {
      orderno: orderID,
    })
  }
  /**获取退货单--商品信息 */
  getReturnGoodsInfo(orderID) {
    return httpRequest.getHandle('person.order.getReturnGoodsInfo', {
      orderno: orderID,
    })
  }
  /**取消退货/款 */
  cancelRefundGoods(orderID) {
    return this.get('person.order.cancelReturnGoods', {
      orderno: orderID,
    })
  }

  /** 获取处方信息 */
  getPrescriptionDetail(orderID) {
    return httpRequest.getHandle('person.order.getPreDetailInfo', {
      orderno: orderID
    })
  }

}
/**搜索模块*/
class SearchApi extends HTTP {
  /**热门搜索关键词 */
  getHotSearchKeywords() {
    return this.get('guest.sitemap.getHotKeywords', {
      limit: 10
    })
  }
  // 热门搜索
  getHotHealthHuiKeyWords(){
    return this.get('guest.common.app.getHealthTopicHot')
  }
  // 搜索文章
  getHealthHuiArticle(keyWord,pageIndex){
    return this.get('guest.common.app.searchHealthArticle',{
      keyword: keyWord,
      pageIndex:pageIndex,
      pageSize:5
    })
  }
  // 推荐文章
  getRecommendArticle(){
    return this.get('guest.common.app.recommendHealthArticle')
  }
  /**联想搜索 */
  getAssociateKeywords(keyWord) {
    return this.get('guest.medicine.getAssociateKeywords', {
      keyword: keyWord,
      limit: 20,
      type: 'medicine',
    })
  }
  /*搜索商品
  sort 价格升降 'price asc' 'price desc' 报价数升降 'shopCount asc' 'shopCount desc'  默认 ''
  brands 品牌 多品牌以,分割
  manufacturer  厂家 多厂家以,分割
  */
  searchGoods(keywords, pageIndex, shopID, sort, brands, manufacturers, standard) {
    var params = {
      pageIndex: pageIndex,
      pageSize: 10,
      keywords: keywords,
      orderBy: sort,
      storeid: shopID,
    }
    if (brands) {
      params.aliascn = brands
    }
    if (manufacturers) {
      params.titleAbb = manufacturers
    }
    if (standard) {
      params.standard = standard
    }
    return httpRequest.getHandle('guest.medicine.getSearchPageData', params)
  }
  /**搜索商家*/
  searchShops(keywords, pageIndex) {
    return httpRequest.getHandle('guest.common.app.getSearchShop', {
      pageIndex: pageIndex,
      keywords: keywords,
      shoptype: 0,
      regionid: 0,
    })
  }
  /**扫码*/
  getScanResult(code) {
    return this.get('guest.common.app.getScanResult', {
      scan_code: code,
    })
  }
  /**获取关联商家*/
  getAssociationShop() {
    return httpRequest.getHandle('guest.common.app.getNearShop', {
      lat: app.globalData.latitude,
      lon: app.globalData.longitude,
      pageSize: 10,
      pageIndex: 1,
    })
  }
  /**获取热门商品*/
  getAssociationGoods() {
    return httpRequest.getHandle('guest.medicine.getTopVisitMedicine', {
      limit: 6,
    })
  }
  /*商家内搜索
  sort 价格升降 'price asc' 'price desc' 报价数升降 'shopCount asc' 'shopCount desc'  默认 ''
  */
  searchGoodsInShop(keywords, pageIndex, shopID, sort) {
    return httpRequest.getHandle('guest.shopMedicine.getStoreMedicineSearch', {
      pageIndex: pageIndex,
      pageSize: 10,
      keywords: keywords,
      orderField: sort,
      storeid: shopID,
    })
  }
  /**获取所有的品牌*/
  getAllBrands(keywords) {
    return this.get('guest.medicine.getSearchAliascn', {
      keywords: keywords,
    })
  }
  /**获取所有规格*/
  getAllSpecifications(keywords) {
    return this.get('guest.medicine.getSearchStandard', {
      keywords: keywords,
    })
  }
  /**获取所有的生产厂家*/
  getAllManufacturers(keywords) {
    return this.get('guest.medicine.getSearchTitleAbb', {
      keywords: keywords,
    })
  }
}
/**健康问答模块*/
class HealthAskApi extends HTTP {
  /** 健康问答首页和健康问答回答个数*/
  getAnsDetal() {
    return httpRequest.getHandle('guest.ask.getIndex_APP', {
      get_reply: '1'
    })
  }
  /**获取健康问答数量*/
  getAskCount() {
    return this.get('guest.ask.getCount')
  }
  /** 全部科室*/
  getAlloffice() {
    return this.get('guest.ask.getAllDepartment')
  }
  /**获取科室子分类和科室下的问题*/
  getDepartmentAndQuestions(departmentParams, questionParams) {
    var tasks = new Array()
    tasks.push({
      name: departmentParams.name,
      cmd: 'guest.ask.getDepartment',
      param: {
        py: departmentParams.departmentNamePy
      },
    })

    tasks.push({
      name: questionParams.name,
      cmd: 'guest.ask.getPageData',
      param: {
        pageSize: 20,
        pageIndex: questionParams.pageIndex,
        py: questionParams.departmentNamePy,
      },
    })

    return this.get(tasks)
  }
  /**获取某科室下的子分类 departmentNamePy 比如 内科==nk*/
  getClassdpart(departmentNamePy) {
    return this.get('guest.ask.getDepartment', {
      py: departmentNamePy
    })
  }
  /**问答列表 departmentNamePy 全部问题=='' 内科=='nk'
  所有departmentNamePy可选值 在 getAllDepartment接口里返回*/
  getListofask(pageIndex, pageSize, departmentNamePy) {
    return this.get('guest.ask.getPageData', {
      pageSize: pageSize,
      pageIndex: pageIndex,
      py: departmentNamePy,
      get_reply: '1'
    })
  }
  /**获取问答详情*/
  getAskDetail(questionID) {
    return httpRequest.getHandle('guest.ask.getDetail', {
      id: questionID
    })
  }
  /**插入回复*/
  insertReplay(replyID, content) {
    return this.get('person.ask.insertAppend', {
      replyid: replyID,
      content: content,
    })
  }
  /**采纳回答*/
  acceptReplay(replyID) {
    return this.get('person.ask.accept', {
      replyid: replyID
    })
  }
  /**获取关联商品*/
  getRecommendGoods(questionID) {
    return httpRequest.getHandle('guest.ask.getStoreMedicineTop', {
      id: questionID
    })
  }
  /**获取药师信息*/
  getPharmacistInfo(pharmacistID) {
    return httpRequest.getHandle('guest.ask.getPharmacistInfo', {
      pharmacistid: pharmacistID
    })
  }
  /**获取药师回答列表*/
  getPharmacistAnswerList(pharmacistID, pageIndex) {
    return this.get('guest.ask.getDoctorDetailPageData', {
      conditions: {
        pharmacistid: pharmacistID
      },
      pageIndex: pageIndex,
      pageSize: 20,

    })
  }
  /**获取我的问答*/
  getMyAskInfo(pageSize, pageIndex, pageType) {
    return httpRequest.getHandle('person.ask.getMyQuestionPageData', {
      type: pageType,
      pageSize: pageSize,
      pageIndex: pageIndex
    })
  }
  /**搜索问题/联想搜索*/
  getSearchAsk(keywords, pageIndex) {
    return this.get('guest.ask.getPageData', {
      pageIndex: pageIndex,
      keywords: keywords,
      pageSize: 18,
    })
  }
  /**提交问题*/
  commitQuestionInfo(title, content, categoryID, sex, age, phoneNumber, imageUrl) {
    return this.get('person.ask.insert', {
      model: {
        title: title, //标题
        description: content, //描述
        departmentid: categoryID, //ID
        dict_sex: sex, //性别
        age: age, //年龄
        phone: phoneNumber, //电话
        intro_image: imageUrl, //图片
      },
    })
  }
}
/**比价模块*/
class SaleComparePricesApi extends HTTP {

  getGoodsAndShopData(data, pageIndex) {
    const {
      medicineid
    } = data
    var tasks = new Array()
    tasks.push({
      name: 'goodsInfo',
      cmd: 'guest.medicine.getMedicineDetail',
      param: {
        mid: medicineid,
      }
    })
    tasks.push({
      name: 'shopsInfo',
      cmd: 'guest.medicine.getShopMedicines',
      param: {
        conditions: data,
        pageSize: 10,
        pageIndex: pageIndex,
      }
    })
    return httpRequest.getHandle(tasks)
  }
  /**获取商品信息*/
  getGoodsDetailtInfo(goodsID) {
    return httpRequest.getHandle('guest.medicine.getMedicineDetail', {
      mid: goodsID,
    })
  }

  getSaleShopsList(conditions, pageIndex) {
    return this.get('guest.medicine.getShopMedicines', {
      conditions,
      pageSize: 10,
      pageIndex,
    })
  }
  /**获取价格趋势信息*/
  getPriceTrendInfo(goodsID) {
    return this.get('guest.repAvgpriceWeek.get_medicine_price_trend_info', {
      medicineid: goodsID,
    })
  }
  /**获取价格趋势图表数据*/
  getPriceTrendChart(goodsID, dayCount) {
    return this.get('guest.repAvgpriceWeek.get_medicine_price_trend_chart', {
      dayCount: dayCount,
      medicineid: goodsID,
    })
  }
  /**获取同店购数量*/
  getSameShopCount(goodsID) {
    return this.get('person.sameStore.getSameStoreCount', {
      mid: goodsID
    })
  }
  /**获取同店购商品列表*/
  getSameShopGoodsList() {
    return httpRequest.getHandle('person.sameStore.getSameStoreList', {
      pageSize: '5',
      pageIndex: '1'
    })
  }
  /**添加商品到同店购*/
  addGoodsToSameShop(goodsID) {
    return this.get('person.sameStore.addSameStore', {
      medicineid: goodsID,
      qty: '1',
    })
  }
  /**删除商品从同店购*/
  delectGoodsFromSameShop(goodsID) {
    return this.get('person.sameStore.deleteSameStore', {
      sid: goodsID
    })
  }
  /**获取同店购商家列表*/
  getSameShopList(goodsIDs, pageIndex) {
    return this.get('guest.medicine.getShopMedicinesByMids', {
      pageIndex: pageIndex,
      pageSize: 10,
      mids: goodsIDs,
    })
  }

}
/**购物车 */
class ShopCarApi extends HTTP {

  /**添加到购物车/立即购买
   * storeMedicineId  商品ID，多个用,分割
   * packageId  套餐/多件装ID，多个用,分割
   * isBuy  是否是立即购买
   */
  addGoodsToShopCar(quantity, storeMedicineId = null, packageId = null, isBuy = false) {
    let params = {
      quantity: quantity,
    }
    if (storeMedicineId) {
      params.storeMedicineId = storeMedicineId
    }
    if (packageId) {
      params.packageId = packageId
    }
    if (isBuy) {
      params.type = 'buy'
    }
    return this.get('person.cart.addCart', params)
  }
  /**
   * 获取购物车信息
   */
  getShopCarInfo() {
    return httpRequest.getHandle('person.cart.getCart')
  }
  /**获取购物车数量 */
  getShopCarCount() {
    return new Promise((resolve, reject) => {
      this.get('person.cart.getCartCount').then(result => {
        wx.setStorageSync('shopCarCount',result.cartCount)
        resolve(result)
      }, error => {
        reject(error)
      })
    })
  }

  /**
   * 更改购物车商品数量
   * goodsCartID 商品在购物车里的ID
   * quantity 数量
   */
  changeCarGoodsQuantity(goodsCartID, quantity) {
    return this.get('person.cart.editCart', {
      cartId: goodsCartID,
      quantity: quantity,
    })
  }

  /**
   * 获取商品详情的广告
   */
  getactivity() {
    return this.get('person.cart.editCart', {

    })
  }
  /**
   * 更改购物车套餐/多件装数量
   * packageID 套餐/多件装在购物车里的ID
   * quantity 数量
   */
  changeCarPackageQuantity(packageID, quantity) {
    return this.get('person.cart.editCart', {
      packageId: packageID,
      quantity: quantity,
    })
  }
  /**
   * 获取店家包邮和活动信息
   * shopID 商店ID
   * price  当前已选中商品总价
   */
  getFreepostageAndActivityInfo(shopID, price) {
    return this.get('person.cart.getFreepostageAndActivityInfo', {
      storeid: shopID,
      price: price
    })
  }
  /**
   * 移动到收藏
   * goodsIDs 商品在购物车里的ID数组集合
   */
  moveGoodsToFavorite(goodsIDs) {
    return this.get('person.cart.moveCartGoodsToFavorite', {
      cartidList: goodsIDs
    })
  }
  /**购物车--删除商品
   * goodsIds 商品在购物车里的ID 多个用,分割
   * packageIds 套餐或多件装在购物车里的ID 多个用,分割
   */
  delectGoodsFromShopCar(goodsIds = '', packageIds = '') {
    let params = {}
    if (packageIds.length > 0) {
      params.packageId = packageIds
    }
    if (goodsIds.length > 0) {
      params.cartId = goodsIds
    }
    return this.get('person.cart.deleteCartGoodsById', params)
  }
}
/**结算 */
class OrderPaymentApi extends HTTP {
  /**
   * 疫情防控实名认证
   */
  userverified(data) {
    return this.get('person.order.userverified', data)
  }
  /**
   * 搜索疾病
   * @param {*} keywords 
   */
  searchDisease(keywords) {
    return this.get('guest.disease.getListByKeywords', {
      keywords: keywords,
      top: 10
    })
  }

  /**
   * 提交处方信息
   * @param {*} cartids 
   * @param {*} packageids 
   * @param {*} rx_upload_type 
   * @param {*} drugid 
   * @param {*} rx_image 
   * @param {*} diseaselist 
   * @param {*} case_url 
   */
  commitPrecriptionInfo(cartids, packageids, rx_upload_type, drugid, rx_image, diseaselist, case_url) {
    return this.get('person.order.verificationInquiry', {
      data_info: {
        cartids: cartids,
        packageids: packageids,
        rx_upload_type: rx_upload_type,
        drugid: drugid,
        rx_image: rx_image,
        diseaselist: diseaselist,
        case_url: case_url
      }
    })
  }

  /**获取地址列表 */
  getAddress() {
    return this.get('person.address.getReceiptAddress', {
      pageSize: 50,
      pageIndex: 1,
    })
  }
  /**获取结算信息
   * addressID 地址ID
   * goodsIds 商品在购物车里的ID 多个用,分割
   * packageIds 套餐或多件装在购物车里的ID 多个用,分割
   */
  getBuyInfo(addressID, goodsIds = '', packageIds = '') {
    let params = {
      addressid: addressID
    }
    if (packageIds.length > 0) {
      params.packageids = packageIds
    }
    if (goodsIds.length > 0) {
      params.cartids = goodsIds
    }
    return httpRequest.getHandle('person.cart.getBuy', params)
  }
  /**
   * 提价订单
   * info = {
            invoice_type:invoice_type, //发票类型 0==无需发票  1==需要发票
            invoice_name:invoice_title,//发票抬头 可为空字符串
            invoice_idcard:invoice_code,//发票号  可为空字符串
            cartids:tcpCardsIds, //商品在购物车里的ID  多个用,分割
            packageids:tcpPackageIds,//套餐或多件装在购物车里的ID  多个用,分割
            use_point:safe(this.state.selectPoint.toString()),//使用积分
            platform_coupon_id:safe(this.state.selectPlatformCoupons.id),//平台优惠券ID
            use_balance:safe(use_balance),//使用余额
            addressid:safe(this.state.defaultAddress.id),//地址信息
            all_order_price_total:String(Number.parseFloat(price).toFixed(2)),//订单总金额
            shop_list:strMapToObj(listMap),//
            medicate_name:medicateInfo.medicate_name,//用药人姓名
            medicate_idcard:medicateInfo.medicate_idcard,//用药人身份证号
            medicate_sex:medicateInfo.medicate_sex === '男' ? "1" : "0",//用药人性别
        }
    

    shop_list 商店内商品信息集合 {shopID:shopGoodsInfo} 
    shopGoodsInfo = {
                packageid:,//
                logisticsid://物流选项ID
                couponsid:,//优惠券ID
                rx_image:"",
                rx_content:"",
                no_rx_reason:""
            }
   */
  submitOrder(info) {
    return this.get('person.order.createOrder', {
      data_info: info,
    })
  }

  /**
   * 订单付款
   */
  orderPay(orderno) {
    wx.showLoading({
      title: '加载中...',
    })
    return new Promise((resolve, reject) => {
        wx.login({
          success(res) {
            if (res.code) {
              resolve(res.code)
            } else {
              reject({
                errMsg: "获取授权信息失败"
              })
            }
          }
        })
      })
      .then(code => this.get('guest.weixin.getOpenid', {
        code: code
      }))
      .then(openid => this.get('guest.order.getPayInfo', {
        type: 'wxpay',
        client: 'h5_wx',
        openid: openid,
        orderno: orderno
      }))
      .then(payInfo => new Promise((resolve, reject) => {
        wx.requestPayment({
          'timeStamp': payInfo.timeStamp,
          'nonceStr': payInfo.nonceStr,
          'package': payInfo.package,
          'signType': payInfo.signType,
          'paySign': payInfo.paySign,
          'success': function (res) {
            resolve(res);
            wx.hideLoading()
          },
          'fail': function (res) {
            wx.hideLoading()
            reject(res);
          },
        })
      }))
  }
  otherPay(openid,orderno){
    return new Promise((resolve, reject) => {
      resolve(openid)
      })
      .then(openid => this.get('guest.order.getPayInfo', {
        type: 'wxpay',
        client: 'h5_wx',
        openid: openid,
        orderno: orderno
      }))
      .then(payInfo => new Promise((resolve, reject) => {
        wx.requestPayment({
          'timeStamp': payInfo.timeStamp,
          'nonceStr': payInfo.nonceStr,
          'package': payInfo.package,
          'signType': payInfo.signType,
          'paySign': payInfo.paySign,
          'success': function (res) {
            resolve(res);
            wx.hideLoading()
          },
          'fail': function (res) {
            wx.hideLoading()
            reject(res);
          },
        })
      }))
  }
  /**获取未付款订单列表
   * orderIDs 订单ID  多个用,分割
   */
  getNotPayOrdersList(orderIDs) {
    return this.get('person.order.getNotPayOrders', {
      ordernos: orderIDs
    })
  }
  /**获取支付状态
   * orderID 订单ID
   * payType 支付方式 alipay==支付宝  wxpay==微信支付
   */
  getCurrentPayStatus(orderID, payType) {
    return this.get('guest.order.updatePayStatus', {
      orderno: orderID,
      type: payType,
    })
  }
  /**
   * 支付成功--获取订单详情
   */
  getPayInfo(orderID) {
    return httpRequest.getHandle('person.order.getOrderOperInfo', {
      orderno: orderID,
      type: 'payment',
      client: 'phone',
    })
  }
}
/**多接口合一*/
class MultiRequestTaskApi extends HTTP {
  /***
   * params 数组里的元素 {
   * name:自定义名字,
   * cmd:接口名,
   * param:参数
   * }
   */
  mutiRequest(params) {
    return this.get(params)
  }
}

/**购物车 */
class UseDrug extends HTTP {
  //根据关键字获取疾病名称
  getDiseaseAboutKeyword(keywords, type) {
    let params = {
        keywords,
        top: 8,
      },
      url = type == 'gmDiseaseData' ? 'guest.allergy.getListByKeywords' : 'guest.disease.getListByKeywords';
    return this.get(url, params)
  }
  getDefaultGm() {
    return this.get('guest.allergy.getHotTop', {})
  }
  getCerInfo() {
    return this.get('person.account.getCertInfoForDrug', {})
  }
  addUser(params, type) {
    let url = type == 1 ? 'person.userdrug.insert' : 'person.userdrug.update';
    return this.get(url, {
      data: {
        ...params
      }
    })
  }
  getUserDetail(id) {
    return this.get('person.userdrug.GetById', {
      id,
    })
  }

  verfiedUser(id, real_name, idcard_no) {
    return this.get('person.userdrug.verified', {
      id: id,
      real_name: real_name,
      idcard_no: idcard_no
    })
  }

}

//拼团
class GroupApi extends HTTP {
  groupIndex(data) {
    return httpRequest.getHandle('person.group.getGroupDetail', { ...data })
  }
  userGroupList() {
    return httpRequest.getHandle('person.group.getUserGroupList')
  }

  userGroupDetail(data) {
    return httpRequest.getHandle('person.group.getUserGroupDetail', {...data})
  }
}

export {
  HealthHuiApi,
  SafeApi,
  PublicApi,
  IndexApi,
  GoodsDetailApi,
  ShopDetailApi,
  FindGoodsApi,
  MessageApi,
  LoginRegisterApi,
  UserCenterApi,
  OrderApi,
  HealthAskApi,
  SearchApi,
  GoodsCategaryApi,
  SaleComparePricesApi,
  MultiRequestTaskApi,
  UploadImageApi,
  ShopCarApi,
  OrderPaymentApi,
  UseDrug,
  GroupApi,
}