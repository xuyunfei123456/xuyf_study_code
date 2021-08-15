
import { isNotEmpty, safe, safeObj, toDecimal, tcpImage,secretPhone,calculateAge,isEmpty } from '../../../../utils/YFWPublicFunction.js';

class YFWOrderSettlementModel {

  setModelData(data) {

    let shopmedicine = []
    let medicate_item = {}
    let orderTotalPrice = 0
    let invoiceMap = data.invoiceMap
    let singleCount = [],all_total="";
    if (isNotEmpty(data)) {
      data.list.map((shopItem, shopIndex) => {
        let medicine = []
        let medicineIds = []
        let packageIds = []
        //count 一共有多少件商品
        if(shopItem.store_medicine_count_total)singleCount.push(shopItem.store_medicine_count_total)
        if (isNotEmpty(shopItem.medicine_list)) {
          shopItem.medicine_list.map((medicineitem, medicineIndex) => {
            medicineIds.push(medicineitem.id)
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
                package_id: '0',
                type: 'medicine',
                medicine_total:toDecimal(medicineitem.medicine_total),
                prescriptionType: this.convertPrescriptionType(medicineitem.dict_medicine_type),//单双轨 '1'='单轨' '2'=双轨
                drugType: this.convertDrugTypeDescription(medicineitem.dict_medicine_type + ''),
                drugImage: this.convertDrugTypeImage(medicineitem.dict_medicine_type + ''),

              })
          })
        }

        if (isNotEmpty(shopItem.packmedicine_list)) {
          shopItem.packmedicine_list.map((packmedicine, packageIndex) => {
            let packmedicine1 = []
            packageIds.push(packmedicine.packageid)
            if (isNotEmpty(packmedicine.medicine_list)) {

              packmedicine.medicine_list.map((medicine1, index1) => {
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
                )
              })
              medicine.push(
                {
                  package_id: packmedicine.packageid,
                  package_name: packmedicine.smp_name,
                  price: packmedicine.smp_price,
                  price_old: packmedicine.smp_price,
                  discount: packmedicine.price_desc,
                  count: packmedicine.amount,
                  type: packmedicine.package_type === 0 ? "package" : 'treatment',
                  package_medicines: packmedicine1,
                  package_type: packmedicine.package_type,
                  medicine_total: toDecimal(packmedicine.medicine_total),
                  smp_medicine_packmedicine_count:packmedicine.smp_medicine_packmedicine_count,
                  smp_medicine_packmedicine_total:toDecimal(packmedicine.smp_medicine_packmedicine_total)
                }
              )

            }

          })
        }

        let logistic = [];
        if (isNotEmpty(shopItem.logistcs_list)) {
          shopItem.logistcs_list.map((logisticItem, logisticIndex) => {
            logistic.push({
              id: logisticItem.id,
              name: logisticItem.name,
              cod: "0",
              price: toDecimal(logisticItem.price),
              money: Number.parseFloat(toDecimal(logisticItem.price)),
              desc: logisticItem.show_name,
              isSelect: logisticIndex === 0,
              content: '￥'+toDecimal(logisticItem.price),
              lname:logisticItem.lname,
              dict_shipping_type:logisticItem.dict_shipping_type,
            })
          });
        }

        let packagelist = [];
        if (isNotEmpty(shopItem.package_list)) {
          shopItem.package_list.map((packageItem, packageIndex) => {
            packagelist.push({
              id: packageItem.id,
              name: packageItem.name,
              desc: packageItem.show_name,
              price: toDecimal(packageItem.price),
              money: Number.parseFloat(toDecimal(packageItem.price)),
              isSelect: packageIndex === 0,
              content: '￥'+toDecimal(packageItem.price),
            })
          });
        }


        let coupon_items = [];
        if (isNotEmpty(shopItem.coupons_list)) {
          shopItem.coupons_list.map((couponItem, couponIndex) => {
            coupon_items.push({
              name: couponItem.name,
              price: toDecimal(couponItem.price),
              money: -Number.parseFloat(toDecimal(couponItem.price)),
              id: couponItem.id,
              expire_time: this._checkTimeStyle(safe(couponItem.expire_time)),
              start_time: this._checkTimeStyle(safe(couponItem.start_time)),
              coupon_des: couponItem.use_condition_price_desc,
              dict_coupons_type: couponItem.dict_coupons_type, // 1.店铺 2.单品
              isSelect: couponIndex === 0,
              content: '￥'+toDecimal(couponItem.price),
              coupons_desc:couponItem.coupons_desc || ''
            });
          });
          if (shopItem.coupons_list.length > 0) {
            coupon_items.push({
              name: '不使用优惠券',
              coupon_des: '不使用优惠券',
              price: '0.00',
              money: 0,
              id: 0,
              content: '￥0.00',
              coupons_desc:'不使用优惠券'
            });
          }
        }
        //un_coupons_list

        let un_coupon_items = [];
        if (isNotEmpty(shopItem.un_coupons_list)) {
          shopItem.un_coupons_list.forEach((item, index) => {
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
        let totalPrice = parseFloat(shopItem.store_medicine_price_total)
        if (packagelist[0]) {
          totalPrice += parseFloat(packagelist[0].price)
        }
        if (logistic[0]) {
          totalPrice += parseFloat(logistic[0].price)
        }
        if (coupon_items[0]) {
          totalPrice -= parseFloat(coupon_items[0].price)
        }

        orderTotalPrice += totalPrice

        let shop_invoice_types = []
        if (isNotEmpty(shopItem.invoice_types)) {
          shop_invoice_types = shopItem.invoice_types.split(',')
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
        if (isNotEmpty(shopItem.invoice_info)) {
          shop_invoice_info = shopItem.invoice_info
        }

        if (isEmpty(invoiceMap[shopItem.storeid])) {
          invoiceMap[shopItem.storeid] = {
            shopId: shopItem.storeid,
            invoice_applicant: shop_invoice_info.invoice_applicant,
            invoice_code: shop_invoice_info.invoice_code,
            isNeed: false,
            itemTitle: '请选择',
            selectType: {
              type: 1,
              name: '增值税纸质普通发票',
              desc: '商家支持开具纸质发票，发票随货寄出或者发货后2日内寄出，若未收到可要求商家补开寄出。'
            },
            suportTypes: shop_invoice_types
          }
        }






        const packageModal = this._dealActivityServiceModel('包装方式', '选择包装方式', packagelist[0]&&packagelist[0].content ||'', 'normal', 'dark', packagelist[0], packagelist, true, true, shopIndex, 0)
        const logisticModal = logistic.length > 0
          ? this._dealActivityServiceModel('配送方式', '选择配送方式', logistic[0]&&logistic[0].content || '', 'normal', 'dark', logistic[0], logistic, true, true, shopIndex, 1) 
          : this._dealActivityServiceModel('配送方式', '', '当前地区暂不支持配送', 'normal', 'red', {}, logistic, false, false, shopIndex, 1) 
        const couponModal = coupon_items.length > 0
        ? this._dealActivityServiceModel('优惠券', '可用优惠券', coupon_items[0]&&coupon_items[0].content || '', 'coupon', 'dark', coupon_items[0], coupon_items, true, true, shopIndex, 2)
        : this._dealActivityServiceModel('优惠券', '', '￥0.00', 'coupon', 'dark', {}, coupon_items, true, true, shopIndex, 2)
        let modalList = [packageModal, logisticModal, couponModal]
        if (Number.parseFloat(shopItem.activity_item) > 0) {
          const activityModal = this._dealActivityServiceModel('商家优惠', '', '商家优惠 ('+toDecimal(shopItem.activity_item)+' 元)', '', 'dark', {}, [], false, false, shopIndex, 3)
          modalList.push(activityModal)
          totalPrice -= Number.parseFloat(shopItem.activity_item)
          orderTotalPrice += totalPrice
        }

        shopmedicine.push({
          shop_id: shopItem.storeid,
          shop_title: shopItem.title,
          order_desc: '',
          cart_items: medicine,
          medicineIds: medicineIds,
          packageIds: packageIds,
          shop_offers_price: String(shopItem.activity_item),
          payment_items: shopItem.payment_list,
          store_medicine_count_total: shopItem.store_medicine_count_total,
          store_medicine_price_total: shopItem.store_medicine_price_total,
          totalPrice: toDecimal(totalPrice),
          modalList: modalList,
          package_items: packagelist,
          selectPackInfo:packagelist[0],
          coupon_items: coupon_items,
          un_coupon_items: un_coupon_items,
          selectCouponInfo:coupon_items[0],
          shop_invoice_types: shop_invoice_types,
          logistic_items: logistic,
          selectLogisticInfo:logistic[0],
          return_price_total:shopItem.return_price_total,
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
    data.platform_coupon_list.map((platformCouponItem, platformCouponIndex) => {

      let platform_coupon_list_obj = {
        id: safe(platformCouponItem.id),
        price: toDecimal(safe(platformCouponItem.price)),
        money: -Number.parseFloat(toDecimal(platformCouponItem.price)),
        name: safe(platformCouponItem.name),
        isSelect: platformCouponIndex === 0,
        content: toDecimal(safe(platformCouponItem.price))+'元'
      }

      platform_coupon_list.push(platform_coupon_list_obj);
    })

    if (platform_coupon_list.length > 0) {
      orderTotalPrice -= parseFloat(platform_coupon_list[0].price)
      platform_coupon_list.push({
        id:'',
        price:'0.00',
        money: 0,
        name:'不使用平台优惠券',
        isSelect:false,
        content: '0.00元'
      })
    }

    if (orderTotalPrice <= 0) {
      orderTotalPrice = 0.01
    }

    const paymentTypeModal = this._dealActivityServiceModel('付款方式', '', '在线支付', '', 'dark', {}, [], false, false, -1, 0)
    const platformModals = [paymentTypeModal]
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
      compliance_prompt: data.compliance_prompt,
      invoice_applicant: safe(safeObj(data.invoice_info).invoice_applicant),
      invoice_code: safe(safeObj(data.invoice_info).invoice_code),
      rx_img_items: [],
      medicate_info_show: data.medicate_info_show,//是否显示用药人信息 'true' = 显示 'false' = 不显示
      medicate_item: medicate_item,//用药人信息
      medicate_info_type: Number.parseInt(data.medicate_info_type), // 电子处方信息 1:登记用药人（现有）2:电子处方模式3:都不要
      balance: data.balance,
      balance_prompt: data.balance_prompt,
      useBalance: toDecimal(data.balance),
      balanceEnable:false,
      showBalance:false,
      use_ratio: data.use_ratio,
      user_point: data.user_point,
      userPointMoney: toDecimal(data.user_point / 100),
      showPoint: Number.parseInt(data.user_point) > 0,
      pointEnable:false,
      orderTotalPrice: toDecimal(orderTotalPrice),
      platformModals: platformModals,
      drug_items:drug_items,
      rx_mode: data.rx_mode,
      medicine_disease_items: medicine_disease_items,
      medicine_disease_xz_count: data.medicine_disease_xz_count,
      is_certificate_upload: safe(data.is_certificate_upload).toString()=='true',
      platform_coupons_items: platform_coupon_list,
      selectPlatformCouponsInfo:platform_coupon_list[0],
      invoiceMap: invoiceMap,
      disease_xz_add: disease_xz_add,
    };
  }

  /** 
   * 处理包装方式、配送方式、优惠券模型 
   * @param shopIndex 平台=-1 商家>0
   */
  _dealActivityServiceModel (title, modalName, content, type, contentColor, selectInfo, dataItems, showArrow, showModal, shopIndex, modalIndex) {
    return {
      title: title,
      modalName: modalName,
      type: type,
      content: content,
      contentColor: contentColor || 'dark',
      selectInfo: selectInfo || {},
      dataItems: dataItems || [],
      isShowArrow: showArrow,
      isShowModal: showModal,
      shopIndex: shopIndex,
      modalIndex: modalIndex,
      modalOpen: false,
      selectIndex: 0,
    }
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
      return '/images/ic_OTC.png'
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

  getModelValue(array) {
    let model = new YFWOrderSettlementModel();
    let ModeData = model.setModelData(array)
    return ModeData;

  }


}

export {
  YFWOrderSettlementModel
}