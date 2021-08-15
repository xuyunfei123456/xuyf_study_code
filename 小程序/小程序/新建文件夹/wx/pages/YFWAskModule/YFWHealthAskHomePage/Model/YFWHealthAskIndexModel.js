import {
  isNotEmpty,
  safeObj,
  tcpImage,
  isEmpty,
  safe
} from '../../../../utils/YFWPublicFunction.js'

class YFWHealthAskIndexModel {
  model1(data){
    if(isNotEmpty(data)) {
      let returnData = []
      let ads_items = []
      let hot_seach_items = []
      let popular_ask_items = []
      let new_ask_items = []
      let last_ask = []
      if (isNotEmpty(data.hot_department_items)) {
        data.hot_department_items.forEach((item, index) => {
          hot_seach_items.push({
            py_name: item.py_name,
            parent_py: item.parent_py_name,
            dep_name: safe(item.department_name),
            dep_id: safe(item.department_id)
          });
        });
      }
      popular_ask_items = this.convertAskItem(data.hot_items);
      new_ask_items = this.convertAskItem(data.latest_items);
      ads_items = [
        {
          img_url: safeObj(data.ad_detail).image,
          type: safeObj(data.ad_detail).type,
          value: safeObj(data.ad_detail).value,
        }
      ]
      last_ask = [
        {
        reply_time: safeObj(data.last_reply).create_time,
        intro_image: safeObj(data.last_reply).pharmacist_intro_image,
        name: safeObj(data.last_reply).pharmacist_name
        }
      ]
      return {
            ads_items: ads_items,
            hot_seach_items: hot_seach_items,
            popular_ask_items: popular_ask_items,
            new_ask_items: new_ask_items,
            last_ask: last_ask
        }
    }

  }

  convertAskItem(array) {
    let items = []
    if (isEmpty(array) || safeObj(array).length === 0) {
      return items
    }
    return array.map((item, index) => {
      return {
        id: item.id,
        title: item.title,   //标题
        status_id: "",//回复状态
        reply_count: item.reply_count,//回复数量
        status: item.status_name,//状态名
        time: item.create_time,//创建时间，多少天之前
        intro_image: safe(item.pharmacist_intro_image),//医师头像
        name: safe(item.pharmacist_name),//医师姓名
        type_name: safe(item.pharmacist_type_name),//医师职称
        practice_unit: safe(item.practice_unit),//医师单位
        reply_content: safe(item.reply_content),//医师回复
      }
    })
  }

  static getModelArray(array) {
    let model = new YFWHealthAskIndexModel();
    let ModeData = model.model1(array)
    return ModeData;

  }
}

export {
  YFWHealthAskIndexModel
}