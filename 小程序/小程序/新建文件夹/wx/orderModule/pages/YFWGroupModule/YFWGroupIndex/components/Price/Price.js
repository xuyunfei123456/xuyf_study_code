// orderModule/pages/YFWGroupModule/YFWGroupIndex/component/Price/Price.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    price: {
      type: String,
      value: '0.00'
    },
    newPrice: {
      type: String,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasNewPrice: false,
    newBefore: '0',
    newAfter: '00',
  },

  lifetimes: {
    attached() {
      this.handleInit()
      const newPrice = this.data.hasNewPrice ? this.data.newPrice : this.data.price
      const [newBefore = '0', newAfter = '00'] = newPrice.split('.')
      // console.log(after, before)
      this.setData({
        newBefore,
        newAfter
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleInit() {
      this.handleSetHasNewPrice()
    },
    handleSetHasNewPrice() {
      if(Number(this.data.newPrice) === 0) return
      this.setData({
        hasNewPrice: true
      })
    }
  }
})
