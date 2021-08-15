import { pushNavigation } from '../../apis/YFWRouting.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value:{}
    },
    title: {
      type: String,
      value: ''
    },
    margin_right: {
      type: Number,
      value: 30
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 隐藏弹窗
     */
    hideModal: function (event) {
      let a = event.currentTarget.id
      if (a == 'father') {
        if (this.data.isShow) {
          this.setData({
            isShow: false
          })
        }
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
    itemClick: function (e) {
      this.triggerEvent('itemClick',{
        context: e.currentTarget.dataset.item
      })
      this.setData({
        isShow: false
      })
    }
  }
})
