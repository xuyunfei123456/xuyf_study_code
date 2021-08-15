import { pushNavigation } from '../../apis/YFWRouting.js'
Component({
  /**
  * 组件的属性列表
  */
  properties: {
    model: {
      type: Object,
      value: {}
    },
    isResult: {
      type: Boolean,
      value: false
    }



  },

  /**
   * 组件的初始数据
   */
  data: {
    pageEnd: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    requestNextPage: function() {
      this.triggerEvent('requestNextPage')
    },
    toShopDetail: function (e) {
      pushNavigation('get_shop_detail', { value: e.currentTarget.dataset.id+'' })
    },
    toShopGoodDetail: function (e) {
      pushNavigation('get_shop_goods_detail', { value: e.currentTarget.dataset.id })
    }
  },


})