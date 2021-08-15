// components/YFWActionModal/YFWActionModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgWrapperHeight:{
      type: String,
      value: 281.334
    },
    hasActivity:{
      type:Boolean,
      value:false,
    },
    postdata:{
      type:Object,
      value:{}
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    opacityAnimation: {},
    translateAnimation: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
