// components/YFWMessageRedPointView/YFWMessageRedPointView.js
import { pushNavigation} from '../../apis/YFWRouting.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    messagecount:{
      type:Number,
      value:0
    },
    darkstyle:{
      type:Boolean,
      value:false
    },
    mtop:{
      type:Number,
      value:10
    }
  },

  observers:{
    'messagecount,darkstyle': function (messagecount, darkstyle){
      console.log(messagecount,'mmmm')
      let count = messagecount
      if(messagecount > 99){
        count = '99+'
      }
      this.setData({
        imageSource: darkstyle ? '/images/icon_notice_2.png' :'/images/icon_notice.png',
        count:count,
        showCount:messagecount>0
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imageSource:'',
    count:0,
    showCount:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    messageAction:function () {
      pushNavigation('get_message_home')
    }
  }
})
