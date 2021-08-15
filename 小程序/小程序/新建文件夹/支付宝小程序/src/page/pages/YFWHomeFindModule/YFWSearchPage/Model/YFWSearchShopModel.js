import {
    isNotEmpty,
    safeObj,
    itemAddKey,
    tcpImage,
    safe
  } from '../../../../../utils/YFWPublicFunction.js'
  
  class YFWSearchShopModel {
    setModelData(data) {
      if (isNotEmpty(data)) {
        let dataArray = [];
        data.forEach((item, index) => {
          let goods_items = [];
          item.goods_items.forEach((item, index)=>{
            goods_items.push({
              aliascn: item.aliascn,
              authorized_code: item.authorized_code,
              dict_medicine_type: item.dict_medicine_type,
              dict_store_medicine_status: item.dict_store_medicine_status,
              id: item.id,
              intro_image: tcpImage(safe(item.intro_image.split('|')[0])),
              namecn: item.namecn,
              price: '' + toDecimal(safe(item.price)),
              short_title: item.short_title,
              standard: item.standard,
              store_lock_price: item.store_lock_price,
              title: item.title,
              troche_type: item.troche_type
  
            })
          })
          dataArray.push(
            {
              logo_img_url: item.logo_image,
              title: item.title,
              star: safeObj(Number.parseFloat(item.evaluation_star_sum).toFixed(1)),
              distance: item.distance + 'km',
              id: item.id,
              goods_items: goods_items,
              latitude: item.Lat,
              longitude: item.Lng
  
            }
          );
        });
        return dataArray;
      }
    }
  
    static getModelArray(array) {
      if (array == undefined) return [];
  
      let model = new YFWSearchShopModel();
      let ModeData = model.setModelData(array);
      return ModeData;
  
    }
  }
  function toDecimal(x) {
    try {
  
      if (x == undefined) {
        return '0.00';
      }
  
      if (typeof (x) == 'string' && x.indexOf('-') != -1) {
        return x;
      }
  
      var f_x = parseFloat(x + "");
      if (isNaN(f_x)) {
        return '';
      }
      var f_x = Math.round(x * 100) / 100;
      var s_x = f_x.toString();
      var pos_decimal = s_x.indexOf('.');
      if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
      }
      while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
      }
      return s_x;
    } catch (e) {
      return '0.00'
    }
  }
  export {
    YFWSearchShopModel
  }