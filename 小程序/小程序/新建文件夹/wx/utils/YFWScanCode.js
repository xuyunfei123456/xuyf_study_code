import {
  SearchApi
} from '../apis/index.js'
import {
  isNotEmpty,
} from '/YFWPublicFunction.js'
import {
  pushNavigation
} from '../apis/YFWRouting.js'
const searchApi = new SearchApi()

/**
 * 扫码跳转比价页。
 **/
export function scanCode() {
  wx.scanCode({
    success: function(resCode) {
      // console.log(resCode);
      if (resCode.result != '') {
        //获取扫码结果
        searchApi.getScanResult(resCode.result).then(res => {
          // console.log(res);
          if ((JSON.stringify(res) != "{}")) {
            pushNavigation(res.name, {
              'value': res.value
            }) 
          } else {
            wx.showModal({
              //title: '提示',
              showCancel: false,
              content: '没有找到对应的药品信息',
              confirmText: '确定',
              confirmColor: '#333'
            })
          }
        }, error => {
          console.log('error');
          wx.showModal({
            //title: '提示',
            showCancel: false,
            content: error.msg,
            confirmText: '确定',
            confirmColor: '#333'
          })
        })
      }
    },
    fail: function(res) {
      if (res.errMsg != "scanCode:fail cancel") {
        wx.showModal({
          //title: '提示',
          showCancel: false,
          content: '没有识别到条码，请重试',
          confirmText: '确定',
          confirmColor: '#333'
        })
      }
    },
    complete: function() {
    }
  })
}