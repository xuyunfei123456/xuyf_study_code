import {
  isNotEmpty,
  safeObj,
  tcpImage,
  isEmpty,
  safe
} from '../../../../../utils/YFWPublicFunction.js'
class YFWHealthMyAskModel {
  model1(data) {
    if (isNotEmpty(data)) {
      let title = ''
      let reply_count = ''
      let status = ''
      let time = ''
      let status_id = ''
      let id = ''

      time = data.create_time
      status = data.status
      reply_count = data.reply_count
      title = data.title
      id = data.id + ''
      status_id = data.status_id
      return {
        time: time,
        status: status,
        reply_count: reply_count,
        title: title,
        id: id,
        status_id: status_id
      }
    }
  }

  static getModelArray(data) {
    let model = new YFWHealthMyAskModel()
    let ModeData = model.model1(data)
    return ModeData
  }
}
export { YFWHealthMyAskModel }
