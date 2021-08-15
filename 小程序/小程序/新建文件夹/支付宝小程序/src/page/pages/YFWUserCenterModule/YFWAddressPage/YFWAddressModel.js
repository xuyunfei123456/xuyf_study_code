import { isNotEmpty, safeObj } from '../../../../utils/YFWPublicFunction.js'

class YFWAddressDetailModel {
  method1(data) {
    if (isNotEmpty(data)) {
      let adrs = data.name_path && data.name_path.split('|')
      let userAddress = adrs[0] + adrs[1] + safeObj(adrs[2])
      let userAddressDetail = data.address_name.split(userAddress)[1]
      return {
        id: data.id,
        region_id: data.regionid,
        name: data.name,
        mobile: data.mobile,
        userAddress: userAddress,
        userAddressDetail: userAddressDetail,
        isDefault: data.dict_bool_default
      }
    }
  }

  /**
   *传入map对象，返回map对象
   */
  static getModelData(map) {
    let model = new YFWAddressDetailModel()
    let modelData = model.method1(map)
    return modelData
  }
}

export { YFWAddressDetailModel }
