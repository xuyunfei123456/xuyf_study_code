
import {
  config
} from '../config.js'
import Taro from "@tarojs/taro";
class UploadImage {
  uploadImageFile(filePath){
    return new Promise((resolve, reject) => {
      let _time= new Date().getTime()
      Taro.uploadFile({
        url: config.upload_url,
        filePath: filePath,
        name: _time + '.png',
        success: (result) => {
          console.log('upload success')
          console.log(result)
          const code = result.statusCode.toString()
          let data = {};
          try {
            data = result.data && typeof(result.data) == 'string' &&JSON.parse(result.data) || {};
          } catch (error) {
            console.log(error)
          }
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


    })

  }

}

export {
  UploadImage
}