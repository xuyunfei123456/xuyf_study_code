// components/YFWSpecificationModal/YFWSpecificationModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    guide: {
      type: Object,
      value: {}
    },
    order: {
      type: Array,
      value: []
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
    /**
     * 隐藏弹窗
     */
    hideModal: function () {
      let modal = this.selectComponent("#coupon")
      modal.hideModal();
    },
    /**
     * 显示弹窗
     */
    showModal: function () {
      let modal = this.selectComponent("#coupon")
      modal.showModal();
    },
  }
})
