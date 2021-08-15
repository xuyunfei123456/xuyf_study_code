import { pushNavigation } from '../../apis/YFWRouting.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {}
    },
    froms: {
      type: String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickItemMethod:function(e) {
      let detailId = e.currentTarget.dataset.id
      pushNavigation('get_ask_detail', { value: detailId})
    }
  }
})