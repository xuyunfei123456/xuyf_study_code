import {
  config
} from '../config.js'
import Taro from '@tarojs/taro'
import { JOSN } from './YFWRuleString.js';
Date.prototype.Format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1,                 //月份 
    "d+": this.getDate(),                    //日 
    "h+": this.getHours(),                   //小时 
    "m+": this.getMinutes(),                 //分 
    "s+": this.getSeconds(),                 //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds()             //毫秒 
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
class UploadImage {

  uploadImageFile(filePath){
    return new Promise((resolve, reject) => {
      let currentDate = (new Date()).Format("yyyyMMddhhmmss")
      console.log(currentDate,config.upload_url)
      if(process.env.TARO_ENV === 'alipay' ){
        Taro.uploadFile({
          url: config.upload_url,
          filePath: filePath,
          name: currentDate + '.png',
          fileType: 'image',
          success: (result) => {
            console.log('upload success')
            console.log(result)
            const code = result.statusCode.toString()
            let data = result.data
            if (code == '200') {
              let imageUrl = data.result ? data.result : JSON.parse(data).result
              console.log(imageUrl)
              resolve(imageUrl)
            } else {
              reject(data.msg)
            }
          },
          fail: (error) => {
            console.log('uploadError')
            console.log(error)
            reject(error)
          }
        })
      }else if (process.env.TARO_ENV === 'tt'){
        Taro.uploadFile({
          url: config.upload_url,
          filePath: filePath,
          name: currentDate + '.png',
          success: (result) => {
            console.log('upload success')
            console.log(result)
            const code = result.statusCode.toString()
            let data = JSON.parse(result.data)
            if (code == '200') {
              let imageUrl = data.result
              console.log(imageUrl)
              resolve(imageUrl)
            } else {
              reject(data.msg)
            }
          },
          fail: (error) => {
            console.log('uploadError')
            console.log(error)
            reject(error)
          }
        })
      }else{
        Taro.uploadFile({
          url: config.upload_url,
          filePath: filePath,
          name: currentDate + '.png',
          success: (result) => {
            console.log('upload success')
            console.log(result)
            const code = result.statusCode.toString()
            let data = result.data
            if (code == '200') {
              let imageUrl = data.result ? data.result : JSON.parse(data).result
              console.log(imageUrl)
              resolve(imageUrl)
            } else {
              reject(data.msg)
            }
          },
          fail: (error) => {
            console.log('uploadError')
            console.log(error)
            reject(error)
          }
        })
      }
      
    })
    // Taro.chooseImage({
    //   success: function(res) {
    //     res.tempFilePaths[0]

        

        
    //   },
    // })
    
  }

}

export {
  UploadImage
}