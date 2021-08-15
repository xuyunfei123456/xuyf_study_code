const { pushNavigation } = require("../../../../../../apis/YFWRouting")

// pages/YFWOrderModule/YFWOrderListPage/Components/YFWOrderListEmptyView/YFWOrderListEmptyView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type:{
      type:String,
      value:''
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
    jumpToHome:function(){
      pushNavigation('get_home')
      // wx.switchTab({
      //   url: "/pages/YFWHomeFindModule/YFWHomePage/YFWHome"
      // })
    }
  }
})
