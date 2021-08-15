// components/YFWStar/YFWStar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //星星的数量
    total: {
      type: Number,
      value: 5
    },
    //星星的大小
    starSize: {
      type: Number,
      value: 24
    },
    //星星之间的间隔
    starSpacing: {
      type: Number,
      value: 10
    },
    //星星的颜色
    starColor: {
      type: String,
      value: 'yellow'
    },
    //评分
    stars: {
      type: Number,
      value: 5
    },
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

  }

})
