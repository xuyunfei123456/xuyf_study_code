Component({
  /**
  * 组件的属性列表
  */
  properties: {
    data:{
      type:Object,
      value:{}
    },
    keyWords:{
      type: String,
      value: ''
    },
    shop_id:{
      type: String,
      value: ''
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
    clickSearchShopMethod: function() {
      this.triggerEvent('clickSearchShopMethod')
    },
    clickHotItemMethod: function (event) {
      console.log(event)
      this.triggerEvent('clickHotItemMethod', {
        name: event.currentTarget.dataset.context
      })
    }
  },


})