// components/YFWActionModal/YFWActionModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgWrapperHeight:{
      type: String,
      value: 134.666
    },
    img:{
      type: String,
      value: ''
    },
    name:{
      type: String,
      value: ''
    },
    price:{
      type: String,
      value: ''
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
