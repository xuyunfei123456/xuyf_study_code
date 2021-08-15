const date = new Date();
const config = {
  app_name: "YFW-APP-WX",
  app_version: '4.9.9991',
  osVersion: 'miniapp',
  api_base_url: 'https://pub.yaofangwang.com/4000/4000/0/',
  //api_base_url: 'http://192.168.2.66:18080/4000/4000/0/',
  //api_base_url: 'http://192.168.0.239:18080/4000/4000/0/',
  //api_base_url: 'http://192.168.2.252:18080/4000/4000/0/',
  api_base_url: 'http://192.168.2.68:18080/4000/4000/0/',
  //api_base_url: 'https://test-pub.yaofangwang.com:18180/4000/4000/0/',
  //api_base_url: 'https://114.116.222.136:18180/4000/4000/0/',
  upload_url: 'https://m.yaofangwang.com/common/UploadFile',
  //upload_url: 'http://admin.yfw3.com/common/UploadFile',
  cdn_url: 'https://c1.yaofangwang.net',
  client: 'app_wx',
  header: {
    'content-type': 'application/json'
  },
  tips: {
    1: '操作失败，请稍后再试',
    1111: '请求发生错误',
    9999: '未登录'
  },
  login_request: ['guest.account.login', 'getAccountInfoByOpenKey', 'guest.account.venderLogin'],
  uncheck_login_request: ['person.cart.getCart', 'getFreepostageAndActivityInfo', 'person.order.getTrafficnoList','person.message.getNotReadCount'],
  share_image_url:'/images/share_detault.png',
  share_title:'药房网商城',
  service_mobile:'400-8810-120',  //客服电话
  service_mailbox: 'service@yaofangwang.com', //客服邮箱
  current_year: date.getFullYear(),  // 当前年份
  rx_url: 'https://m.yaofangwang.com/rx_guide.html' // 处方药说明页

}

export {
  config
}