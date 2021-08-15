import {
  isNotEmpty,
  safe,
  isEmpty,
  tcpImage
} from '../utils/YFWPublicFunction.js'

function setModelData(data) {
  if (isNotEmpty(data)) {
    return {
      discount: safe(data.price_desc),
      price: data.price ? data.price : data.priceMin ? data.priceMin : data.min_price ? data.min_price : data.price_min,
      name: data.medicine_name, //http 取用字段,
      home_search_tcpname: data.titleAbb ? (data.aliascn ? data.aliascn + ' ' : '') + data.namecn + ' - ' + data.titleAbb : data.mill_short_title ? data.aliascn + ' ' + data.namecn + ' - ' + data.mill_short_title : data.aliascn + ' ' + data.namecn,
      home_category_tcpname: data.titleAbb ? (data.aliascn ? data.aliascn + ' ' : '') + data.namecn + ' - ' + data.titleAbb : (data.aliascn ? data.aliascn + ' ' : '') + data.namecn,
      inshop_search_tcpname: data.short_title ? data.medicine_name + ' - ' + data.short_title : data.medicine_name,
      alias_cn: data.aliascn,
      shop_medicine_id: data.storeid,
      medicine_id: data.id,
      name_cn: data.namecn,
      standard: data.standard,
      is_prescription: data.is_prescription,
      status: '',
      intro_image: tcpImage(data.intro_image),
      title: data.namecn,
      title_abb: data.short_title,
      UpdateTime: '',
      rx_info_show: '',
      store_count: data.store_count ? data.store_count : data.store_num,

      store_title: data.store_title,
      scheduled_days: data.scheduled_days,
      free_logistics_desc: data.free_logistics_desc, //商家包邮
      coupons_desc: data.coupons_desc, //优惠券描述，
      activity_desc: data.activity_desc, //满减活动描述
      medicine_package_desc: data.medicine_package_desc, //多件装描述

      is_lingshou_buy: '',
      applicability: '',
      whole_sale_price: '',
      goods_id: data.medicineid,
      price_quantity: data.shopCount,
      shop_goods_id: data.id,
      img_url: isNotEmpty(data.intro_image) ? tcpImage(data.intro_image) : tcpImage(data.introImage),
      authorized_code: data.authorized_code ? data.authorized_code : data.authorizedCode,
      authorized_code_title: safe(data.authorizedCode_title).length>0 ? data.authorizedCode_title : '批准文号',
      SaleCount: '15',
      MillLockPrice: '0.00',
      IsPrescription: data.is_prescription,
      discount_str: safe(data.price_desc),
      discount_is_show: safe(data.price_desc).length > 0 ? 'true' : 'false',
      is_add_cart: data.is_add_cart,
      /** 暂不预约 */
      isCanSale: isEmpty(data.is_buy) ? true : data.is_buy == '1',
      dict_store_medicine_status: data.dict_store_medicine_status || '',
      originData: data,
      prescriptionType: convertPrescriptionType(data.dict_medicine_type),//单双轨标签 1=单轨, 2=双轨
      trocheType:data.trocheType || data.troche_type,
      companyName:data.title || data.mill_title,
    }
  }
}
/**
   * 处方、单双轨字段转换
   * @param type
   */
export function convertPrescriptionType(type) {
  if (type + '' === '3') {
    return '1'//单轨
  }
  //TCP 和HTTP 双轨都是2
  return type + ""
}
export function getModel(data) {

  return setModelData(data)

}

export function getName(data) {
  if (YFWUserInfoManager.defaultProps.isRequestTCP) {
    if (isEmpty(data.medicine_name)) {
      //首页搜索商品
      if (isNotEmpty(data.name)) {
        return
      } else {
        return
      }
    } else {
      //店铺内搜索商品
    }
  } else {
    return data.medicine_name;
  }

}