import {
    isNotEmpty,
    safeObj,
    isEmpty,
    itemAddKey
  } from '../../../../../utils/YFWPublicFunction.js'
  let model = null
  let dataArray = []
  class YFWCategoryModel {
    static getInstance() {
      if (isEmpty(model)) {
        model = new YFWCategoryModel()
      }
      return model
    }
  
    getModelData(data) {
      if (isNotEmpty(data)) {
        let items = []
        data.forEach((item, index) => {
          let sub_items = []
          if (isNotEmpty(item.items)) {
            item.items.forEach((item, index) => {
              let end_items = []
              if (isNotEmpty(item.items)) {
                item.items.forEach((item, index) => {
                  end_items.push({
                    id: item.id,
                    name: item.name,
                    intro_image: item.icon
                  })
                })
              }
              sub_items.push({
                id: item.id,
                name: item.name,
                intro_image: item.icon,
                categories: end_items
              })
            })
          }
          item.app_category_ad&&item.app_category_ad.map(item => {
            if (item.img_url.indexOf('http://c1.yaofangwang.net') > -1) {
              item.img_url = item.img_url.replace('http', 'https')
            }
          })
          let itemData = {
            id: item.id,
            name: item.name,
            intro_image: item.icon,
            categories: sub_items,
            app_category_ad: item.app_category_ad
          }
          switch (item.name) {
            case '中西药品':
              items.push(itemData)
              break
            case '养生保健':
              items.splice(1, 0, itemData)
              break
            case '医疗器械':
              items.splice(2, 0, itemData)
              break
            case '计生用品':
              items.splice(3, 0, itemData)
              break
            case '中药饮片':
              items.splice(4, 0, itemData)
              break
            case '美容护肤':
              items.splice(5, 0, itemData)
              break
          }
        })
        return items
      }
    }
  
    static getModelArray(array) {
      let model = YFWCategoryModel.getInstance()
      let ModeData = model.getModelData(array)
      // YFWCategoryModel.setDataArray(itemAddKey(ModeData))
  
      return itemAddKey(ModeData)
    }
  
    static getDataArray() {
      if (isEmpty(dataArray)) {
        dataArray = []
      }
      return dataArray
    }
  
    static setDataArray(array) {
      dataArray = array
    }
  }
  
  export { YFWCategoryModel }