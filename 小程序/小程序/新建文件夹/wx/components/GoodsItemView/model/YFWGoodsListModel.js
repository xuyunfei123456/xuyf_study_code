import {
  isNotEmpty,
  isEmpty,
  safe,
  safeObj
} from '../../../utils/YFWPublicFunction.js';
import {
  getModel
} from "../../../model/YFWMedicineInfoModel.js"
import {
  getItemModel
} from '../../../components/GoodsItemView/model/YFWGoodsItemModel.js'

function setModelData(data,froms) {
  let items = [];
  if (isNotEmpty(data)) {
    data.forEach((item, index) => {
      let model = getModel(item)
      // model["itemHeight"] = this._calculateCollectionItemHeight(model)
      // model["shop_goods_id"] = item.store_medicineid
      model["price_min"] = item.price_min
      let goods_model = getItemModel(model, froms)
      items.push(goods_model);
    })
  }
  return items;
}

/** 搜索瀑布流计算高度缓存 */
function _calculateCollectionItemHeight(item) {
  // let itemWidth = (kScreenWidth - 34) / 2;
  // let itemHeight = 0;

  // let imageHeight = itemWidth - 16;
  // /** 中文长度*15 + 字母长度*10 + 数字长度*9 + 其他长度*5 */
  // let letterCount = item.home_search_tcpname.replace(/[^a-zA-Z]/g, '').length
  // let numCount = item.home_search_tcpname.replace(/\D/g, '').length;
  // let chineseCount = item.home_search_tcpname.match(/[\u4E00-\u9FA5]/g).length
  // let otherCount = item.home_search_tcpname.length - letterCount - numCount - chineseCount
  // let titleWidth = chineseCount * 15 + letterCount * 10 + numCount * 9 + otherCount * 5
  // // let titleHeight = (parseInt(titleWidth/(itemWidth-16))+1)*18+10
  // let titleHeight = 43
  // let standardHeight = 18
  // let activityHeight = (safe(item.free_logistics_desc).length > 0 || safe(item.activity_desc).length > 0 || safe(item.coupons_desc).length > 0 || safe(item.scheduled_days).length > 0) ? 18 : 0
  // let priceHeight = 36
  // let shopCount = item.price_quantity ? item.price_quantity : item.store_count;
  // let storeNameHeight = safe(item.store_title).length > 0 ? 17 : (isNotEmpty(shopCount) && parseInt(safeObj(shopCount)) >= 0 ? 15 : 0);
  // let bottomM = 10

  // itemHeight = imageHeight + titleHeight + standardHeight + activityHeight + priceHeight + storeNameHeight + bottomM
  // return itemHeight
}

export function getModelArray(array,froms) {
  if (isEmpty(array)) {
    return [];
  }
  return setModelData(array,froms)
}