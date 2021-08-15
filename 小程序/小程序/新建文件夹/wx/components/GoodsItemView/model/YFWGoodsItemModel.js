
import { isNotEmpty, safe, convertImg } from "../../../utils/YFWPublicFunction.js"
import { tcpImage, isLogin } from '../../../utils/YFWPublicFunction.js'
var app = getApp();
/**
 * 将解析的数据转出itemModel
 * 
 * @param {数据模型} data 
 * @param {数据来源} from 
 */
export function getItemModel(data, froms) {
  if (isNotEmpty(data)) {
    return setItemModel(data, froms)
  }
}

function setItemModel(data, froms) {
  
  let goods_id = ''
  let good_shop_id = ''
  let goods_image = ''
  let goods_name = ''
  let goods_authorized_code = ''
  let goods_price = ''
  let goods_stories = ''
  let isShowStories = true
  let isShowCart = false
  let goods_mobclick = ''
  let goods_discount = ''
  let goods_standard = ''
  let store_medicine_status = ''
  let store_title = ''
  let navitation_params = {}
  let goods_Type = ''
  let activity_img_url = ''
  data.intro_image = tcpImage(data.intro_image)

  if (froms === 'cart_list_recommend') {
    /** 购物车精选商品 */
    goods_id = safe(data.id)
    goods_image = safe(data.intro_image)
    goods_name = safe(data.namecn)
    goods_authorized_code = safe(data.authorized_code)
    goods_price = '' + toDecimal(safe(data.price_min)) + '起'
    goods_stories = data.store_num
    goods_standard = safe(data.standard)
    goods_mobclick = 'cart_list_recommend'
    navitation_params = {
      type: 'get_goods_detail',
      value: goods_id
    }
  } else if (froms === 'all_medicine_list') {
    /** 商家内全部商品搜索 */
    goods_id = safe(data.medicine_id)
    goods_image = safe(data.intro_image)
    goods_name = safe(data.inshop_search_tcpname)
    goods_authorized_code = safe(data.authorized_code)
    goods_price = '' + toDecimal(safe(data.price))
    goods_Type = data.prescriptionType
    goods_mobclick = 'all_medicine_list'
    goods_discount = data.discount
    goods_standard = safe(data.standard)
    // isShowCart = (data.prescriptionType == '0' || data.prescriptionType == '') ? data.is_add_cart : !data.is_add_cart
    isShowCart = (parseInt(app.globalData.appSystemConfig.wx_rx_is_buy) != 0 || parseInt(data.prescriptionType) < 0) && data.is_add_cart && isLogin()
    isShowStories = false
    navitation_params = {
      type: 'get_shop_goods_detail',
      value: goods_id,
    }
  } else if (froms === 'all_highlights_list') {
    goods_authorized_code = safe(data.authorized_code)
    goods_id = safe(data.id)
    goods_image = safe(data.intro_image)
    goods_name = safe(data.namecn)
    goods_price = '' + toDecimal(safe(data.price_min))
    goods_stories = safe(data.store_num)
    goods_standard = safe(data.standard)
    goods_mobclick = 'all_highlights_list'
    navitation_params = {
      type: 'get_goods_detail',
      value: goods_id
    }
  } else if (froms === 'shop_medicine_recomand') {
    goods_authorized_code = safe(data.authorized_code)
    goods_id = safe(data.medicine_id)
    goods_image = safe(data.intro_image)
    goods_name = safe(data.name)
    goods_price = '' + toDecimal(safe(data.price))
    goods_discount = data.discount
    goods_standard = safe(data.standard)
    goods_mobclick = 'shop_medicine_recomand'
    goods_Type = data.prescriptionType
    isShowStories = false
    store_medicine_status = data.dict_store_medicine_status
    navitation_params = {
      type: 'get_shop_goods_detail',
      value: goods_id,
    }
  } else if (froms === 'home_medicine_recomand') {
    /** 首页精选商品 */
    goods_id = safe(data.id)
    goods_image = safe(data.intro_image)
    goods_name = data.alt_name ? data.alt_name : data.namecn
    goods_authorized_code = data.authorized_code
    goods_price = '' + toDecimal(safe(data.price))
    if (data.type != 'get_shop_goods_detail') {
      goods_price += '起'
    }
    goods_stories = data.shop_num
    goods_standard = safe(data.standard)
    goods_mobclick = 'cart_list_recommend'
    isShowStories = false
    navitation_params = {
      type: data.type ? data.type :'get_goods_detail',
      value: goods_id
    }
  } else if (froms === 'all_medicine_subCategory'){
    goods_id = data.originData.store_medicineid
    goods_image = safe(data.intro_image)
    goods_name = safe(data.name)
    goods_authorized_code = safe(data.authorized_code)
    goods_price = '' + toDecimal(safe(data.price))
    goods_Type = data.prescriptionType
    goods_mobclick = 'all_medicine_subCategory'
    goods_discount = data.discount
    goods_standard = safe(data.standard)
    goods_stories = safe(data.store_count)
    isShowStories = false
    isShowCart = isNotEmpty(data.store_title) && isLogin()
    if (!isNotEmpty(data.store_title)) {
      goods_price += '起'
      isShowStories = true
      goods_id = safe(data.medicine_id)
    }
    if (data.store_title) {
      console.log(data,'ssss')
    }
    data.originData.applicability = data.originData.applicability.replace(/<[^>]+>/g, "").replace(/(↵|\r|\n|&|=|\?)/g, "").trim()
    navitation_params = {
      type: isNotEmpty(data.store_title) ? 'get_shop_goods_detail' : 'get_goods_detail',
      value: goods_id,
     // img_url: convertImg(goods_image),
      //goodsInfoData: data.originData,
      anotherType: 'get_goods_detail',
      anotherValue: safe(data.goods_id),
    }
  }
  else if (froms === 'all_goods_search') {
    goods_id = data.originData.store_medicineid
    goods_image = safe(data.img_url)
    goods_name = safe(data.home_search_tcpname)
    goods_authorized_code = safe(data.authorized_code)
    goods_price = '' + toDecimal(safe(data.price))
    goods_Type = data.prescriptionType
    isShowStories = false
    isShowCart = isNotEmpty(data.store_title) && isLogin()
    if (!isNotEmpty(data.store_title)) {
      goods_price += '起'
      isShowStories = true
      goods_id = safe(data.goods_id)
    }
    goods_mobclick = 'all_goods_search'
    goods_discount = data.discount
    goods_standard = safe(data.standard)
    goods_stories = safe(data.store_count)
    store_title = data.store_title
    data.originData.applicability = data.originData.applicability.replace(/<[^>]+>/g, "").replace(/(↵|\r|\n|&|=|\?)/g, "").trim()
    navitation_params = {
      type: isNotEmpty(data.store_title) ?'get_shop_goods_detail':'get_goods_detail',
      value: goods_id,
      //img_url: convertImg(goods_image),
      //goodsInfoData: data.originData,
      anotherType:'get_goods_detail',
      anotherValue: safe(data.goods_id),
    }
  }
  else if (froms === 'hot_search_goods') {
    goods_id = safe(data.medicine_id)
    good_shop_id = safe(data.shop_medicine_id)
    goods_image = safe(data.intro_image)
    goods_name = safe(data.home_search_tcpname)
    goods_authorized_code = safe(data.authorized_code)
    goods_price = '' + toDecimal(safe(data.price_min))
    goods_Type = safe(data.prescriptionType)+''
    goods_mobclick = 'hot_search_goods'
    goods_discount = data.discount
    goods_standard = safe(data.standard)
    goods_stories = safe(data.store_count)
    isShowStories = true
    navitation_params = {
      type: 'get_goods_detail',
      value: goods_id,
      img_url: convertImg(goods_image),
    }
  } else if (froms === 'health_medicine_list') {
    goods_authorized_code = safe(data.authorized_code)
    goods_id = safe(data.id)
    goods_image = safe(data.intro_image)
    goods_name = safe(data.medicine_name)
    goods_price = '' + toDecimal(safe(data.price)) + '起'
    goods_discount = data.price_desc
    goods_stories = safe(data.shopcount)
    goods_standard = safe(data.standard)
    goods_mobclick = 'health_medicine_list'
    isShowStories = false
    navitation_params = {
      type: 'get_shop_goods_detail',
      value: goods_id,
      //img_url: convertImg(goods_image),
    }
  }

  return {
    goods_id: goods_id,
    good_shop_id: good_shop_id,
    goods_image: goods_image,
    goods_name: goods_name,
    goods_authorized_code: goods_authorized_code,
    goods_price: goods_price,
    goods_stories: isNotEmpty(goods_stories) ? goods_stories:"0",
    isShowCart: isShowCart,
    goods_discount: goods_discount,
    goods_standard: goods_standard,
    goods_mobclick: goods_mobclick,
    navitation_params: navitation_params,
    model: data,
    isShowStories: isShowStories,
    store_title: safe(store_title),
    goods_Type: goods_Type,
    store_medicine_status,
    activity_img_url: safe(data.activity_img_url)
  }
}

function toDecimal(x) {
  try {

    if (x == undefined) {
      return '0.00';
    }

    if (typeof (x) == 'string' && x.indexOf('-') != -1) {
      return x;
    }

    var f_x = parseFloat(x + "");
    if (isNaN(f_x)) {
      return '';
    }
    var f_x = Math.round(x * 100) / 100;
    var s_x = f_x.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
      pos_decimal = s_x.length;
      s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
      s_x += '0';
    }
    return s_x;
  } catch (e) {
    return '0.00'
  }
}
