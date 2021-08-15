
import { isNotEmpty } from "../../../utils/YFWPublicFunction.js";

class YFWAddressModel {

  setModelData(data) {

    if (isNotEmpty(data)) {
      this.id = data.id;
      this.region_id = data.regionid;
      this.name = data.name;
      this.mobile = data.mobile;
      this.address = data.address_name;
      this.is_default = data.dict_bool_default;
      this.city = data.city;
      this.lat = isNotEmpty(data.lat) ? data.lat : '31.23224';//没有经纬度数据设置为上海市政府坐标
      this.lng = isNotEmpty(data.lng) ? data.lng : '121.46902';
    }

    return this;

  }


  static getModelArray(array) {

    if (array == undefined) return [];

    let marray = [];
    array.forEach((item, index) => {

      let model = new YFWAddressModel();
      marray.push(model.setModelData(item));

    });

    return marray;

  }


}

export {
  YFWAddressModel
}