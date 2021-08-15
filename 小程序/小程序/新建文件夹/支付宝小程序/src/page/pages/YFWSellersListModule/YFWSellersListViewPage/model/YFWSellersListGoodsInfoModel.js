import { isEmpty, isNotEmpty, safeObj, tcpImage, coverAuthorizedTitle } from '../../../../../utils/YFWPublicFunction.js'

class YFWSellersListGoodsInfoModel {

  method1(data) {
    if (isNotEmpty(data)) {
      let standards = [{standard:data.standard,id:data.id,select:true}]
      if (isNotEmpty(data.standards)) {
        data.standards.map((standardItem, standardIndex) => {
          standards.push({
            id: standardItem.id+'',
            standard: standardItem.standard,
            select: false
          })
        })
      }
      return {
        authorized_code: data.authorized_code,
        authorizedTitle: coverAuthorizedTitle(data.authorized_code),
        title: data.aliascn + ' ' + data.namecn,
        name_cn: data.namecn,
        standard: data.standard,
        applicability: safeObj(data.applicability).replace(/<[^>]+>/g, '').replace(/(↵|\r|\n|&|=|\?)/g, '').trim()
,
        islock: data.dict_bool_lock,
        IsHalfLock: data.dict_bool_half_lock,
        mill_title: data.title,
        img_url: tcpImage(safeObj(data.image_list)[0]),
        image_list: data.image_list,
        goods_id: data.id + '',
        troche_type: data.troche_type,
        name_path: data.special_category_name_path,
        prescription: data.dict_medicine_type + '',               //是否是处方药 0不是 1 是
        // goods_guid_show: isNotEmpty(data.guide) ? 'true' : 'false',         //是否有说明书
        advisory_button_show: 'false',   //咨询处方，不需要
        rx_info_show: 'true',    //是否打码，不需要
        status: data.show_buy_button === 'true' ? 'show' : 'hide',          //是否显示隐藏加入同店购按钮
        share: '',           //分享链接
        chart_show_status: true,//是否显示价格趋势图标按钮,TCP一直显示
        standards: standards,//选择规格
        type: '',           //同店购按钮文字，1 = 加入同店购，2 = 取消
        tdg_goods_count: '',//同店购数量
        // guide: data.guide,//说明书
        short_title: data.short_title,//TCP端的厂商名
        prompt_info: data.buy_prompt_info,//处方提示语，凭什么处方购买之类的
        prescriptionType: this.convertPrescriptionType(data.dict_medicine_type),//单双轨标签 1=单轨, 2=双轨
        prompt_url: data.rx_giude_url,//单双轨说明H5链接
        isCanSale: data.show_buy_button === 'false' ? false : true,
        shop_num: data.shop_num,//商家
        drugTypeDescription: this.convertDrugTypeDescription(data.dict_medicine_type),
        drugImage:this.convertDrugTypeImage(data.dict_medicine_type),
      }
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
    return type + ''
  }

  convertDrugTypeDescription(type) {
    if (type + '' === '3' || type + '' === '1') {
      return '单轨 Rx'//单轨
    } else if (type + '' === '0') {
      return 'OTC'
    } else if (type + '' === '2') {
      return '双轨 Rx'
    }
    return ''
  }
  convertDrugTypeImage(type) {
    if (type + '' === '3' || type + '' === '1') {
      return '/images/ic_drug_track_label.png'//单轨
    } else if (type + '' === '0') {
      return '/images/ic_OTC.png'
    } else if (type + '' === '2') {
      return '/images/ic_drug_track_label.png'
    }
    return ''
  }

  static getGoodsInfo(map) {
    let model = new YFWSellersListGoodsInfoModel()
    let ModeData = model.method1(map)
    return ModeData

  }
}

export {
  YFWSellersListGoodsInfoModel
}