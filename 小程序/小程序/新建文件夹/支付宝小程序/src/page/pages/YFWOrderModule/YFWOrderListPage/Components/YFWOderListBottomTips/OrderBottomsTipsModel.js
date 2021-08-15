import {
    isNotEmpty
  } from '../../../../../../utils/YFWPublicFunction'
  
  export function getOrderBottomTipsModel(data, froms,index) {
    if (isNotEmpty(data)) {
      return setModelDatas(data,froms,index)
    }
  }
  
  function setModelDatas(data, froms,index) {
    let order_no = ''
    let order_total = ''
    let packaging_total = ''
    let shipping_total = ''
    let shop_title = ''
    let img_url = ''
    let itemIndex = 0
    if (froms == 'order_list') {
      order_no = data.orderno
      order_total = data.total_price
      packaging_total = data.packaging_total
      shipping_total = data.shipping_total
      shop_title = data.title
      img_url = handlerMecicineImage(data)
      itemIndex = index
    }else{
      order_no = data.orderno
      order_total = data.total_price
      packaging_total = data.packaging_total
      shipping_total = data.shipping_total
      shop_title = data.title
      img_url = handlerMecicineImage(data)
    }
  
    return{
      order_no:order_no,
      order_total:order_total,
      packaging_total: data.packaging_total,
      shipping_total: data.shipping_total,
      shop_title: shop_title,
      img_url: img_url,
      itemIndex: itemIndex
    }
  }
  
  function handlerMecicineImage(data){
    if (isNotEmpty(data.medicineList)){
      if (data.medicineList.length>0){
        return data.medicineList[0].intro_image
      } else if (data.packmedicine_list.length>0){
        return data.packmedicine_list[0].medicine_list[0].intro_image
      }
    }
  }