import {
  isNotEmpty,
  safeObj,
  itemAddKey
} from '../../../../utils/YFWPublicFunction.js'

class YFWHotWordsModel {
  setModelData(data) {
    if (isNotEmpty(data)) {
      let items = [];
      if (isNotEmpty(data)) {
        data.forEach((item, index) => {
          items.push(item.keywords_name);
        });
      }
      return items;
    }
  }

  static getModelArray(array) {
    let model = new YFWHotWordsModel();
    let ModeData = model.setModelData(array);
    return ModeData;

  }

}
export {
  YFWHotWordsModel
}