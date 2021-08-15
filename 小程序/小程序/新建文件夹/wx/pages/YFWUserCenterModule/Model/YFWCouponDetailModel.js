import {
  isNotEmpty,
  safeObj,
  toDecimal,
} from '../../../utils/YFWPublicFunction.js'
class YFWCouponDetailModel {
  setModelData(data) {
    if (isNotEmpty(data)) {
      return {
        price: data.price + '',
        use_condition_price_desc: data.use_condition_price_desc + '',
        yhhprice: toDecimal(data.yhhprice),
        use_condition_price: data.use_condition_price + '',
        dict_coupons_type: data.dict_coupons_type + '',
        description: data.description,
        store_title: data.store_title,
        namecn: data.namecn,
        dict_bool_status: data.dict_bool_status,
        btn_name: data.dict_bool_status == 0 ? '去使用' : data.dict_bool_status == 1 ? '已使用' : '已过期',
        start_time: data.start_time,
        expire_time: data.expire_time,
        storeid: data.storeid,
        store_medicineid: data.store_medicineid,
        medicineid: data.medicineid,
        id: data.id,
        expiring_soon: data.expiring_soon,     // 1即将过期
        coupon_title: data.dict_coupons_type == 3 ? data.description : (data.dict_coupons_type == 2 ? data.namecn : data.store_title),
        image_url: isNotEmpty(data.storelogourl) ? data.storelogourl : data.intro_image // 没有商家logo情况后台将返回商品图片
      }
    }
  }

  getModelArray(array) {

    let marray = [];

    if (isNotEmpty(array)) {
      array.forEach((item, index) => {
        let model = new YFWCouponDetailModel();
        marray.push(model.setModelData(item));
      });
    }

    return marray;

  }

}
export {
  YFWCouponDetailModel
}


