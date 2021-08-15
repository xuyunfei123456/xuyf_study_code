import {
  isNotEmpty,
  safeObj,
  tcpImage
} from '../../../../utils/YFWPublicFunction.js'

class YFWFindYaoShopModel{
  getModelData(data) {
    if (isNotEmpty(data)) {
      let returnData = [];
      data.forEach((item,index)=>{
        let logo_img_url = ''
        let title = '';
        let distance = '';
        let star = '';
        let shop_id = '';
        returnData.push(
          {
            logo_img_url: safeObj(item.logo_image),
            title: item.title,
            distance: safeObj(Number.parseFloat(item.distance).toFixed(1)) + 'km',
            star: safeObj(Number.parseFloat(item.evaluation_star_sum).toFixed(1)),
            id: item.id,
          }
        )
      })
      return returnData;
    }
  }

  static getModelArray(array) {
    let model = new YFWFindYaoShopModel();
    let ModeData = model.setModelData(array)
    return ModeData;

  }

}
export {
  YFWFindYaoShopModel
}