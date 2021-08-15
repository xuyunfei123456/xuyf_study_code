
import { isNotEmpty, safe, safeObj, toDecimal, tcpImage, secretPhone, calculateAge, isEmpty } from '../../../utils/YFWPublicFunction.js';

class YFWOrderSettlementModel {
  setModelData(data) {
    let shopmedicine = [];
    let medicate_item = {}
    let orderTotalPrice = 0
    let invoiceMap = data.invoiceMap
    let singleCount = [],all_total="";
    if (isNotEmpty(data)) {
      data.list.forEach((item, index) => {
        let medicine = [];
        //count 一共有多少件商品
        if(item.store_medicine_count_total)singleCount.push(item.store_medicine_count_total)
        if (isNotEmpty(item.medicine_list)) {
          item.medicine_list.forEach((medicineitem, index) => {
            medicine.push(
              {
                id: medicineitem.id,
                shop_goods_id: medicineitem.store_medicineid,
                title: medicineitem.medicine_name,
                standard: medicineitem.standard,
                img_url: tcpImage(medicineitem.intro_image),
                prescription: medicineitem.prescription,
                price: medicineitem.price_real,
                price_old: toDecimal(medicineitem.price),
                discount: medicineitem.price_desc,
                quantity: medicineitem.amount,
                medicine_total:toDecimal(medicineitem.medicine_total),
                package_id: '0',
                type: 'medicine',
                prescriptionType: this.convertPrescriptionType(medicineitem.dict_medicine_type),//单双轨 '1'='单轨' '2'=双轨
                drugType: this.convertDrugTypeDescription(medicineitem.dict_medicine_type + ''),
                drugImage: this.convertDrugTypeImage(medicineitem.dict_medicine_type + ''),

              });
          });
        }

        if (isNotEmpty(item.packmedicine_list)) {
          item.packmedicine_list.forEach((packmedicine, index) => {
            let packmedicine1 = [];
            if (isNotEmpty(packmedicine.medicine_list)) {

              packmedicine.medicine_list.forEach((medicine1, index1) => {
                packmedicine1.push(
                  {
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
                    package_id: '0',
                    prescriptionType: this.convertPrescriptionType(medicine1.dict_medicine_type + ''),
                    drugType: this.convertDrugTypeDescription(medicine1.dict_medicine_type+ ''),
                    drugImage: this.convertDrugTypeImage(medicine1.dict_medicine_type + ''),
                  }
                );
              })
              medicine.push(
                {
                  package_id: packmedicine.packageid,
                  package_name: packmedicine.smp_name,
                  price: packmedicine.smp_price,
                  price_old: packmedicine.smp_price,
                  discount: packmedicine.price_desc,
                  count: packmedicine.amount,
                  type: "package",
                  package_medicines: packmedicine1,
                  package_type: packmedicine.package_type,
                  medicine_total: toDecimal(packmedicine.medicine_total),
                  smp_medicine_packmedicine_count:packmedicine.smp_medicine_packmedicine_count,
                  smp_medicine_packmedicine_total:toDecimal(packmedicine.smp_medicine_packmedicine_total)
                }
              );

            }

          });
        }

        let logistic = [];
        if (isNotEmpty(item.logistcs_list)) {
          item.logistcs_list.forEach((item, index) => {
            logistic.push({
              id: item.id,
              name: item.name,
              cod: "0",
              price: toDecimal(item.price),
              desc: item.show_name,
              isSelect: index == 0,
              lname:item.lname,
              dict_shipping_type:item.dict_shipping_type,
            })
          });
        }

        let packagelist = [];
        if (isNotEmpty(item.package_list)) {
          item.package_list.forEach((item, index) => {
            packagelist.push({
              id: item.id,
              name: item.name,
              desc: item.show_name,
              price: toDecimal(item.price),
              isSelect:index==0,
            })
          });
        }


        let coupon_items = [];
        if (isNotEmpty(item.coupons_list)) {
          item.coupons_list.forEach((item, index) => {
            coupon_items.push({
              name: item.name,
              money: (item.price),
              id: item.id,
              expire_time: this._checkTimeStyle(safe(item.expire_time)),
              start_time: this._checkTimeStyle(safe(item.start_time)),
              coupon_des: item.use_condition_price_desc,
              dict_coupons_type: item.dict_coupons_type, // 1.店铺 2.单品
              isSelect:index==0,
              coupons_desc:item.coupons_desc || ''
            });
          });
          if (item.coupons_list.length > 0) {
            coupon_items.push({
              name: '不使用优惠券',
              coupon_des: '不使用优惠券',
              money: '0.00',
              id: '',
              coupons_desc:'不使用优惠券',
            });
          }
        }
        //un_coupons_list

        let un_coupon_items = [];
        if (isNotEmpty(item.un_coupons_list)) {
            item.un_coupons_list.forEach((item, index) => {
                un_coupon_items.push({
                    name: item.name,
                    money: item.price,
                    id: item.id,
                    expire_time: this._checkTimeStyle(safe(item.expire_time)),
                    start_time: this._checkTimeStyle(safe(item.start_time)),
                    coupon_des: item.use_condition_price_desc,
                    dict_coupons_type: item.dict_coupons_type, // 1.店铺 2.单品
                    unavailabledesc:item.unavailabledesc, //不可使用原因
                    condition_price:item.condition_price, //使用条件金额
                });
            });
        }

        let totalPrice = parseFloat(item.store_medicine_price_total)
        if (packagelist[0]) {
          totalPrice += parseFloat(packagelist[0].price)
        }
        if (logistic[0]) {
          totalPrice += parseFloat(logistic[0].price)
        }
        if (coupon_items[0]) {
          totalPrice -= parseFloat(coupon_items[0].money)
        }
        if (String(item.activity_item)) {
          totalPrice -= parseFloat(String(item.activity_item))
        }

        orderTotalPrice += totalPrice

        let shop_invoice_types = []
        if (isNotEmpty(item.invoice_types)) {
          shop_invoice_types = item.invoice_types.split(',')
        }
        if (isEmpty(shop_invoice_types) || shop_invoice_types.length==0) {
          shop_invoice_types = ['1']
        }
        
        shop_invoice_types = shop_invoice_types.map(sItem => {
          let name = ''
          let desc = ''
          if (sItem == '1') {
            name = '增值税纸质普通发票'
            desc = '商家支持开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开寄出。'
          } else if (sItem == '2') {
            name = '增值税电子普通发票'
            desc = '电子普通发票与纸质普通发票具有同等效力，可支持报销入账\n电子普通发票在发货后的2日内开具，若商家未开具，可联系商家开出。'
          }
          return {type: sItem, name: name, desc: desc}
        })

        let shop_invoice_info = {
          invoice_applicant:'',
          invoice_code:'',
        }
        if (isNotEmpty(item.invoice_info)) {
          shop_invoice_info = item.invoice_info
        }
        if (isEmpty(invoiceMap[item.storeid])) {
          invoiceMap[item.storeid] = {
            shopId: item.storeid,
            invoice_applicant: shop_invoice_info.invoice_applicant,
            invoice_code: shop_invoice_info.invoice_code,
            isNeed: false,
            itemTitle: '请选择',
            selectType: shop_invoice_types[0],
            suportTypes: shop_invoice_types
          }
        }

        shopmedicine.push({
          shop_id: item.storeid,
          shop_title: item.title,
          order_desc: '',
          cart_items: medicine,
          package_items: packagelist,
          selectPackInfo:packagelist[0],
          coupon_items: coupon_items,
          un_coupon_items: un_coupon_items,
          selectCouponInfo:coupon_items[0],
          shop_offers_price: String(item.activity_item),
          shop_invoice_types: shop_invoice_types,
          logistic_items: logistic,
          selectLogisticInfo:logistic[0],
          payment_items: item.payment_list,
          store_medicine_count_total: item.store_medicine_count_total,
          store_medicine_price_total: item.store_medicine_price_total,
          return_price_total:item.return_price_total,
          totalPrice: toDecimal(totalPrice),
        });


      });
      if(singleCount.length!=0){
        all_total = singleCount.reduce((pre, cur) => {
          return pre + cur;
        })
      }
      if (isNotEmpty(safeObj(data).medicate_item)) {
        medicate_item = {
          medicate_name: data.medicate_item.medicate_name,
          medicate_sex: isNotEmpty(data.medicate_item.medicate_sex)? (data.medicate_item.medicate_sex + '' === "1" ? '男' : "女"):'',
          medicate_idcard: data.medicate_item.medicate_idcard,
        }
      }
    }

    let platform_coupon_list = [];
    data.platform_coupon_list.forEach((value,index) => {

      let platform_coupon_list_obj = {
        id: safe(value.id),
        money: toDecimal(safe(value.price)),
        name: safe(value.name),
        isSelect: index == 0,
      };

      platform_coupon_list.push(platform_coupon_list_obj);
    });

    if (platform_coupon_list.length > 0) {
      orderTotalPrice -= parseFloat(platform_coupon_list[0].money)
      platform_coupon_list.push({
        id:'',
        money:'0.00',
        name:'不使用平台优惠券',
        isSelect:false
      })
    }

    if (orderTotalPrice <= 0) {
      orderTotalPrice = 0.01
    }

    // 用药人列表
    let drug_items = []
    if (isNotEmpty(data.drug_items)) {
      drug_items = data.drug_items.map(item => {
        item.secret_mobile = secretPhone(item.mobile)
        item.age = calculateAge(item.idcard_no)
        return item
      })
    }

    const disease_xz_add = data.disease_xz_add

    let medicine_disease_items = []
    if (isNotEmpty(data.medicine_disease_items)) {
      const diseaseMap = data.medicine_disease_items
      const diseaseKeys = Object.keys(diseaseMap)
      medicine_disease_items = diseaseKeys.map((medicineName, medicineIndex) => {
        let diseases = diseaseMap[medicineName]
        diseases = diseases.map(diseaseItem => {
          diseaseItem.active = false
          return diseaseItem
        })
        return {
          id: medicineIndex,
          active: false,
          quantity: 0,
          medicine_name: medicineName,
          diseases: diseases,
          showAdd: diseases.length==0 ? true : Boolean(disease_xz_add)
        }
      })
    }


    return {
      all_total,
      code: '1',
      shop_items: shopmedicine,
      platform_coupons_items: platform_coupon_list,
      selectPlatformCouponsInfo:platform_coupon_list[0],
      compliance_prompt: data.compliance_prompt,
      invoice_applicant: safe(safeObj(data.invoice_info).invoice_applicant),
      invoice_code: safe(safeObj(data.invoice_info).invoice_code),
      invoiceMap: invoiceMap,
      rx_img_items: [],
      medicate_info_show: data.medicate_info_show,//是否显示用药人信息 'true' = 显示 'false' = 不显示
      medicate_info_type: Number.parseInt(data.medicate_info_type), // 电子处方信息 1:登记用药人（现有）2:电子处方模式3:都不要
      medicate_item: medicate_item,//用药人信息
      drug_items: drug_items,
      medicine_disease_items: medicine_disease_items,
      medicine_disease_xz_count: data.medicine_disease_xz_count,
      is_certificate_upload: safe(data.is_certificate_upload).toString()=='true',
      disease_xz_add: disease_xz_add,
      rx_mode: data.rx_mode,
      balance: data.balance,
      balance_prompt: data.balance_prompt,
      use_ratio: data.use_ratio,
      user_point: data.user_point,
      orderTotalPrice: toDecimal(orderTotalPrice),
      pointEnable:false,
      balanceEnable:false,
      showBalance:false,
    };
  }
  _checkTimeStyle(time) {
    while (time.indexOf('-') > 0) {
        time = time.replace('-','.')
    }

    return time
  }
  /**
   * 处方、单双轨字段转换
   * @param type
   */
  convertPrescriptionType(type) {
    if (type + '' === '3') {
      return '1'//单轨
    }
    //TCP 和HTTP 双轨都是2
    return type + ""
  }

  convertDrugTypeDescription(type) {
    if (type + '' === '3' || type + '' === '1') {
      return '单轨 Rx'//单轨
    } else if (type + '' === '0') {
      return 'OTC'
    } else if (type + '' === '2') {
      return '双轨 Rx'
    }
    return ""
  }

  convertDrugTypeImage(type) {
    if (type + '' === '3' || type + '' === '1') {
      return '/images/ic_drug_track_label.png'//单轨
    } else if (type + '' === '0') {
      return '/images/ic_drug_OTC.png'
    } else if (type + '' === '2') {
      return '/images/ic_drug_track_label.png'
    }
    return ""
  }

  _checkTimeStyle(time) {
    while (time.indexOf('-') > 0) {
      time = time.replace('-', '.')
    }

    return time
  }

  static getModelValue(array) {
    let model = new YFWOrderSettlementModel();
    let ModeData = model.setModelData(array)
    return ModeData;

  }


}

export {
  YFWOrderSettlementModel
}