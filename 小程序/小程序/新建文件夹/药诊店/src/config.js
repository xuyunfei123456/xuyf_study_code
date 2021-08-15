const getClient = ()=>{
  let type =process.env.TARO_ENV,_result = '';
  switch(type) {
    case 'weapp':
      _result = 'app_wx'
        break;
    case 'alipay':
      _result = 'app_alipay'
        break;
        case 'swan':
      _result = 'app_baidu'
        break;
        case 'tt':
      _result = 'app_toutiao'
        break;
      case 'qq':
      _result = 'app_qq'
        break;
    default:
      _result = 'app_wx'
 } 
 return _result
}
const config = {
  app_name: "YZD",
  app_version: '1.0.0',
  osVersion: 'miniapp',
  api_base_url: 'https://api-erp.yaofangwang.com/',
  api_base_url: 'https://api-erp-dev.yaofangwang.com/',
  upload_url: 'https://m.yaofangwang.com/common/UploadFile',
  //upload_url: 'http://admin.yfw3.com/common/UploadFile',

  login_request:['guest.login'],
  cdn_url: 'https://c1.yaofangwang.net',
  client: getClient(),
  header: {
    'content-type': 'application/json'
  },
  tips: {
    1: '操作失败，请稍后再试',
    1111: '请求发生错误',
    9999: '未登录'
  },
  share_image_url:'/images/share_detault.png',
  share_title:'视塔',
  service_mobile:'400-8810-120',  //客服电话
  service_mailbox: 'service@yaofangwang.com', //客服邮箱
  env_version:'develop',//小程序跳向的版本   develop => 开发版本  trial => 体验版本   release => 正式版本
}

export {
  config
}