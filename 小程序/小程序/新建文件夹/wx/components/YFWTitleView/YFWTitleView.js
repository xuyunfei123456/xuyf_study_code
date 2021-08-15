// components/YFWTitleView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type:String,
      value:''
    },
    fontSize:{
      type:Number,
      value:30
    },
    fontWeight: {
      type: String,
      value: "normal"
    },
    titleHeight:{
      type:Number,
      value:30
    },
    lineHeight:{
      type:Number,
      value:16
    },
    showLine:{
      type:Boolean,
      value:true
    },
    largeStyle:{
      type:Boolean,
      value:false
    },
    showbottom:{
      type:Boolean,
      value:true
    }
  },
  observers: {
    'largeStyle': function (largeStyle){
      this.setData({
        fontColor: largeStyle ?'#1fdb9b':'#333'
      })

  }},

  /**
   * 组件的初始数据
   */
  data: {
    fontColor:'#333'
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
