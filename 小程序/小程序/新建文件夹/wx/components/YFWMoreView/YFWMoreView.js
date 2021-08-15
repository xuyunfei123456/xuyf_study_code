// components/YFWMoreView/YFWMoreView.js
import { pushNavigation } from '../../apis/YFWRouting.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
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
    isShow: false,
    margin_top: 90,
    margin_right:30
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
        if(top){
          this.setData({
            margin_top: top,
            isShow: true
          })
        }else{
          this.setData({
            isShow: true
          })
        }

      }
    },

    toMessage(){
      this.setData({
        isShow: false
      })
      pushNavigation('get_message_home')
    },

    toHome(){
      this.setData({
        isShow: false
      })
      pushNavigation('get_home')
    },

    toCategory(){
      this.setData({
        isShow: false
      })
      pushNavigation('get_all_category')
    },

    toCar(){
      this.setData({
        isShow: false
      })
      pushNavigation('get_shopping_car')
    },

    toUserCenter(){
      this.setData({
        isShow: false
      })
      pushNavigation('get_user_center')
    },
    // moveAction: function () {
      
    // }
  }
})
