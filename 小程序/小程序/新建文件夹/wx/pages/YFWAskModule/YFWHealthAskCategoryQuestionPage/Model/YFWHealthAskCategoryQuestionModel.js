import {
  isNotEmpty,
  safeObj,
  tcpImage,
  isEmpty,
  safe
} from '../../../../utils/YFWPublicFunction.js'

class YFWHealthAskCategoryQuestionModel {
  method2(data) {
    if (isNotEmpty(data)) {
      return {
        id: data.id,
        title: data.title,
        dep_name: data.department_name,
        reply_count: data.reply_count,
        status_id: "",
        status: data.status,
        time: data.create_time,
        intro_image: 'https://c1.yaofangwang.net'+safe(data.pharmacist_intro_image),//医师头像
        name: safe(data.pharmacist_name),//医师姓名
        type_name: safe(data.pharmacist_type_name),//医师职称
        practice_unit: safe(data.practice_unit),//医师单位
        reply_content: safe(data.reply_content),//医师回复
      }
    }
  }
  static getQuestionArray(array) {
    let returnData = [];
    let model = new YFWHealthAskCategoryQuestionModel();
    array.forEach((item, index) => {
      returnData.push(model.method2(item));
    });
    return returnData;
  }
}

export {
  YFWHealthAskCategoryQuestionModel
}