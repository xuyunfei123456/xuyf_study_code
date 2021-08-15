import { isEmpty, isNotEmpty, safeObj, toDecimal, safe} from "../../../../utils/YFWPublicFunction.js"

class YFWSellersShopMedicinesModel {

  setModelData(data) {

    if (isNotEmpty(data)) {

      let tagItems = []
      if (data.dict_bool_coupon == 1) {
        tagItems.push("店铺优惠券")
      }
      if (data.dict_bool_activity) {
        tagItems.push("满减送活动")
      }
      tagItems.push(data.scheduled_name)

      return {
        shop_goods_id: data.id,
        title: data.store_title,
        region: data.region_name,
        price: toDecimal(data.real_price),
        discount: data.price_desc,
        discount_is_show: false,
        shipping_price: toDecimal(data.logistics_price),//运费，有些没有
        star: data.shop_avg_level,
        shop_address: data.address,
        reserve: data.reserve,//库存，有些没有
        is_add_cart: data.is_add_cart,//是否显示加入需求单
        tag_items: tagItems,//优惠标签,
        coupons_desc: data.coupons_desc,//优惠券描述，
        activity_desc: data.activity_desc,//满减活动描述
        medicine_package_desc: data.medicine_package_desc,//多件装描述
        logistics_desc: data.free_logistics_desc,//商家包邮
        scheduled_name: data.scheduled_name,//商家发货时间
        shop_id: data.storeid,//商家id
        period_to: data.period_to,
        promotion_activity_img_url: safe(data.promotion_activity_img_url), // 活动图片链接 如双十一
      }
    }
  }

  static getModelArray(data) {
    let model = new YFWSellersShopMedicinesModel();
    let ModeData = model.setModelData(data)
    return ModeData;

  }

}


class YFWSellersShopInfoModel {

  setModelData(data) {
    let items = [];
    if (isNotEmpty(data)) {
      if (isEmpty(data.dataList)) {
        data.dataList = []
      }
      data.dataList.forEach((item, index) => {
        item.is_add_cart = data.show_buy_button//是否显示购物车
        items.push(YFWSellersShopMedicinesModel.getModelArray(item));
      })
    }
    return items;
  }

  static getModelArray(result) {
    let model = new YFWSellersShopInfoModel();
    let ModeData = model.setModelData(result)
    return ModeData;

  }
}

export {
  YFWSellersShopInfoModel
}