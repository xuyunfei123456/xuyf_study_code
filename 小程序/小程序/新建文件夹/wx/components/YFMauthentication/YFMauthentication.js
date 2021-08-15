import { pushNavigation } from '../../apis/YFWRouting'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 隐藏弹窗
     */
    closeInfo: function () {
      this.setData({
        isShow:false
      })
    },
    certification:function(){
      pushNavigation('get_my_modify_the_name')
    },

    /**
     * 解决底部滑动穿透问题
     */
    myTouchMove: function () {
      return false;
    }
  }
})
