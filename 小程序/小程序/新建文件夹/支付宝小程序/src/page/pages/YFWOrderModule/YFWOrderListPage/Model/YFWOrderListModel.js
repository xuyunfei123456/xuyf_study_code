import {
    isNotEmpty,
    safeObj,
    toDecimal
  } from '../../../../../utils/YFWPublicFunction.js'
  import { getOrderBottomTipsModel } from '../Components/YFWOderListBottomTips/OrderBottomsTipsModel.js'
  class YFWOrderListModel {
     getModelData(data) {
      if (isNotEmpty(data)) {
        let data_items = [];
        if (isNotEmpty(data.dataList)) {
          data.dataList.forEach((item, index) => {
            let goods_items = [];//单品商品
            let package_goods_items = [];//套餐商品
            let course_pack_goods_items = [];//疗程装
            if (isNotEmpty(item.medicineList) && item.medicineList.length > 0) {
              let noPackageMedicine = this.getGoodsModel(item.medicineList)
              goods_items.push(noPackageMedicine)
            }
            if (isNotEmpty(item.packmedicine_list) && item.packmedicine_list.length > 0) {
              item.packmedicine_list.forEach((item, index) => {
                let packageMedicine = {
                  package_name: item.smp_name,
                  package_id: item.packageid,
                  package_num: item.smp_medicine_count,
                  package_type_name: item.package_type == 0?'套餐':'疗程装',
                  data: this.getGoodsModel(item.medicine_list)
                }
                //套餐
                if (item.package_type == 0){
                  package_goods_items.push(packageMedicine)
                }else{
                  //疗程装
                  course_pack_goods_items.push(packageMedicine)
                }
              })
            }
  
  
            data_items.push({
              order_no: item.orderno,
              shop_id: item.storeid,
              shop_title: safeObj(item.title),
              order_total: toDecimal(item.total_price),
              status_id: '',
              status_name: safeObj(item.statusName),
              prescription_audit: "",
              goods_count: item.medicineCount,
              goods_items: goods_items,
              package_goods_items: package_goods_items,
              course_pack_goods_items: course_pack_goods_items,
              show_butons: item.buttons.length <= 3 ? item.buttons : item.buttons.slice(0,3),
              hide_buttons: item.buttons.length <= 3 ? [] : item.buttons.slice(3, item.buttons.length),
              showHideButtonsTips: item.buttons.length <= 3?false:true,
              send_info: {
                desc: item.scheduled_days_item.desc,
                button_items: item.scheduled_days_item.buttons,
              },
              itemIndex:index,
              orderBottomTipsData:this.handlerOrderBottomsData(item,index)
            })
          })
        }
        return data_items;
      }
    }
  
    getGoodsModel(array) {
      let medicines = [];
      array.forEach((gooditem, index) => {
        medicines.push({
          order_goods_no: gooditem.medicine_orderno,
          shop_goods_id: gooditem.store_medicineid,
          title: gooditem.medicine_name,
          standard: gooditem.standard,
          img_url: (gooditem.intro_image.indexOf('gif')!=-1)? gooditem.intro_image : gooditem.intro_image+'_300x300.jpg',
          prescription: gooditem.dict_bool_prescription,
          price: toDecimal(gooditem.unit_price),
          quantity: gooditem.qty,
          package_name: gooditem.package_name,
          PrescriptionType: this.convertPrescriptionType(gooditem.dict_medicine_type + '')
        });
      });
      return medicines;
    }
  
    sliceArray(array,start,end){
      let resulet = []
      array.slice(start,end)
      for(let i = start;i<=end;i++){
          resulet.push
      }
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
  
    handlerOrderBottomsData(data,index){
      let bottomsData = getOrderBottomTipsModel(data,'order_list',index)
      return bottomsData
    }
  
    static getModelArray(array) {
      let model = new OrderListModel();
      let ModeData = model.setModelData(array)
      return ModeData;
  
    }
  }
  
  export {
    YFWOrderListModel
  }