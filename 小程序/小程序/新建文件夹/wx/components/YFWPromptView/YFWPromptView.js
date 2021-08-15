Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    margin_right: 60
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 隐藏弹窗
     */
    hideModal: function (event) {
      if (this.data.isShow) {
        this.setData({
          isShow: false
        })
      }
    },

    /**
     * 显示弹窗
     */
    showModal: function (top) {
      if (!this.data.isShow) {
        this.setData({
          isShow: true
        })
      }
    },
    del: function() {
      this.setData({
        isShow: false
      })
    }
  }
})
