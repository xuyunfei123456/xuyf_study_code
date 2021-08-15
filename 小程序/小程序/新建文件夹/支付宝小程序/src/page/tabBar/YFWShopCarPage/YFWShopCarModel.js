import {
  isNotEmpty, isEmpty, safe, toDecimal, tcpImage,
} from '../../../utils/YFWPublicFunction.js'

class YFWShopCarModel {
  setModelData(data) {
    let returnArray = []
    if (isNotEmpty(data)) {
      if (isEmpty(data.dataList)) {
        data.dataList = []
      }
      data.dataList.forEach((item, index) => {
        let medicine = []
        let normalMedicines = []
        if (isNotEmpty(item.medicine_list) && item.medicine_list.length > 0) {
          item.medicine_list.forEach((medicineitem, index) => {
            normalMedicines.push({
              id: medicineitem.id,
              shop_goods_id: medicineitem.store_medicineid,
              medicineid: medicineitem.medicineid,
              title: medicineitem.medicine_name,
              standard: medicineitem.standard,
              img_url: tcpImage(medicineitem.intro_image),
              prescription: medicineitem.prescription,
              price: toDecimal(medicineitem.price_real),
              price_old: toDecimal(medicineitem.price),
              discount: medicineitem.price_desc,
              quantity: medicineitem.amount,
              reserve: medicineitem.reserve,
              reserve_desc: safe(medicineitem.reserve_desc),
              lbuy_no: '0',
              order_no: '0',
              package_id: '0',
              type: 'medicine',
              isOpen: false,
              PrescriptionType: this.convertPrescriptionType(medicineitem.dict_medicine_type + ''),
              shop_id: item.storeid,
              dict_store_medicine_status: medicineitem.dict_store_medicine_status,
              limit_buy_qty:medicineitem.limit_buy_qty
            })
          })
          medicine.push({
            type: "medicines",
            medicines: normalMedicines,
            shop_id: item.storeid,
          })
        }

        if (isNotEmpty(item.packmedicine_list)) {
          item.packmedicine_list.forEach((packmedicine, index) => {
            let packmedicine1 = []
            let packageReserve = 0
            if (isNotEmpty(packmedicine.medicine_list)) {
              packmedicine.medicine_list.forEach((medicine1, index1) => {
                packageReserve = Math.max(packageReserve, medicine1.reserve)
                packmedicine1.push({
                  id: medicine1.id,
                  shop_goods_id: medicine1.store_medicineid,
                  title: medicine1.medicine_name,
                  standard: medicine1.standard,
                  img_url: tcpImage(medicine1.intro_image),
                  prescription: medicine1.prescription,
                  price: toDecimal(medicine1.price),
                  quantity: medicine1.amount,
                  reserve: medicine1.reserve,
                  lbuy_no: '0',
                  order_no: '0',
                  package_id: packmedicine.packageid,
                  PrescriptionType: this.convertPrescriptionType(medicine1.dict_medicine_type + ''),
                  limit_buy_qty:medicine1.limit_buy_qty,
                  smpd_amout:medicine1.smpd_amout
                })
              })
            }
            medicine.push({
              id: packmedicine.packageid,
              package_id: packmedicine.packageid,
              package_name: packmedicine.smp_name,
              price: toDecimal(packmedicine.medicine_total),
              price_old: toDecimal(packmedicine.smp_price),
              discount: packmedicine.price_desc,
              quantity: packmedicine.amount,
              reserve: packageReserve,
              reserve_desc: safe(packmedicine.reserve_desc),
              type: packmedicine.package_type === 1 ? "courseOfTreatment" : "package",
              isOpen: false,
              package_medicines: packmedicine1,
              shop_id: item.storeid,
            })
          })
        }

        let couponsArray = []
        if (isNotEmpty(item.coupons_list)) {
          item.coupons_list.forEach((coupons, index) => {
            couponsArray.push({
              money: coupons.price,
              title: coupons.title,
              valid_period_time: coupons.time,
              get: coupons.get,
              id: coupons.id,
              valid_period_time: coupons.valid_period_time,
              start_time: coupons.start_time,
              end_time: coupons.end_time,
              type: coupons.coupons_type,
              aleardyget: coupons.aleardyget,
              max_claim_quantity: coupons.max_claim_quantity,
              user_coupon_count: coupons.user_coupon_count,
            })
          })
        }

        returnArray.push({
          shop_id: item.storeid,
          shop_title: item.title,
          add_on: item.add_on, //满减提示
          add_on_isshow: item.add_on_isshow, //满减条件 是否满足
          freepostage: item.freepostage, //包邮提示
          freepostage_isshow: item.freepostage_isshow, //包邮条件 是否满足
          shipping_desc: '',
          shop_coupon_count: item.coupons_list.length,
          cart_items: medicine,
          coupons_list: couponsArray,
          isShowCoupon: couponsArray.length > 0, // 是否显示领券
          openCoupon: false // 是否打开优惠券弹窗
        })
      })
    }
    return returnArray
  }

  /**
   * 处方、单双轨字段转换
   * @param type
   */
  convertPrescriptionType(type) {
    if (type + '' === '3') {
      return '1' //单轨
    }
    //TCP 和HTTP 双轨都是2
    return type + ""
  }

  getModelArray(array) {
    let model = new YFWShopCarModel()
    let ModeData = model.setModelData(array)
    return ModeData

  }


}

export {
  YFWShopCarModel
}