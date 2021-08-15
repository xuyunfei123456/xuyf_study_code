export function getModelArray(dataArray) {
    let allDataArray = []
    dataArray.map((item) => {
      let type = Object.prototype.toString.call(item)
      let info = {}
      if (type === '[object String]') {
        info.title = item
      } else {
        info = item
        if (item.aliascn) {
          info.title = item.aliascn
        }      
      }
  
      let name = info.short_title ? info.short_title : info.title
      if (name.length > 4) {
        name = info.title.substr(0, 4) + '...'
      }
      info.name = name
      info.select = 'no'
      allDataArray.push(info)
  
    })
    return allDataArray
}