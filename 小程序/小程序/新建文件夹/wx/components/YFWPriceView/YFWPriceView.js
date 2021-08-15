// components/YFWPriceView/YFWPriceView.js
import {
  safe,
  toDecimal
} from '../../utils/YFWPublicFunction.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    price: {
      type: String,
      value: '0.00'
    },
    discount: {
      type: String,
      value: ''
    },
    fontSize: {
      type: Number,
      value: 30
    },
    priceColor: {
      type: String,
      value: '#ff3300'
    },
    discountColor: {
      type: String,
      value: '#ff6d60'
    },
    isInvalid: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    interger_part: '0', // 整数部分
    decimal_part: '00' // 小数部分
  },

  /**
   * 数据监听
   */
  observers: {
    'price': function (price) {
      price = safe(price)
      let haveQi = safe(price).indexOf('起') != -1;
      price = safe(price).replace('起', '')
      price = toDecimal(price)
      let array = price.split(".")

      let interger_part = safe(array[0]).length > 0 ? safe(array[0]) : "0"
      let decimal_part = safe(array[1]).length > 0 ? safe(array[1]) + (haveQi ? "起" : "") : "00"
      this.setData({
        interger_part: interger_part,
        decimal_part: decimal_part
      });
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {

  }
})
