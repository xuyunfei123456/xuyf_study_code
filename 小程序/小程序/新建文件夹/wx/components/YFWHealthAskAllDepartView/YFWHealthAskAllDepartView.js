import { pushNavigation } from '../../apis/YFWRouting.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    pressRow: function (event) {
      this.setData({
        selectIndex: event.currentTarget.dataset.index,
      })
    },
    toDetail: function (e) {

      let model = e.currentTarget.dataset.item // 选中大科室
      let cell = e.currentTarget.dataset.cell // 选中小科室
      let pageFrom = "pageAlldepart"
      let params = {
        model: model,
        selectModel: cell,
        pageFrom: pageFrom
      }

      pushNavigation('get_ASK_all_category', params)
    },
  }
})
