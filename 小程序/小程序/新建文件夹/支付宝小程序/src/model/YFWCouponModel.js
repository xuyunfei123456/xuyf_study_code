import {
  isNotEmpty,
  safe,
  isEmpty
} from '../utils/YFWPublicFunction.js'

function setModelData(data) {
  if( isNotEmpty(data) ) {

    return {
      coupons_type: isNotEmpty(data.coupons_type) ? safe(data.coupons_type) : safe(data.type), // 优惠券类型
      price: isNotEmpty(data.price) ? safe(data.price) : safe(data.money),  // 优惠金额
      start_time: timeStringReplace(safe(data.start_time)),  // 优惠券开始时间
      end_time: timeStringReplace(safe(data.end_time)),  // 优惠券截止时间
      store_medicineid: safe(data.store_medicineid),  // 优惠券商品id
      title: safe(data.title),  // 优惠券标题
      uuid: safe(data.uuid),  // 编号
      id: safe(data.id), // 编号
      use_condition_price: safe(data.use_condition_price), // 条件金额
      name: safe(data.name),  // 商品详情展示
      aleardyget: Number.parseInt(safe(data.aleardyget)),
      get: Number.parseInt(safe(data.get)),
      isReceived: isNotEmpty(data.aleardyget)||data.aleardyget == 1 ? true : false, // 是否已领取优惠券
      user_coupon_count: data.user_coupon_count, // 用户拥有的优惠券数量
      max_claim_quantity: data.max_claim_quantity // 用户最大可领取个数
    }
  }
}

function timeStringReplace(time) {
  while (time.indexOf('-') != -1) {
    time = time.replace('-','.')
  }
  return time;
}

export function getModel(data) {

  return setModelData(data)

}