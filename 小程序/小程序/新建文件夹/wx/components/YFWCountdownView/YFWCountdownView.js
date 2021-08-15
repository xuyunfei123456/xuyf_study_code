// components/YFWCountdownView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    waitpaytime: {
      type: Number,
      value: 0
    },
    orderNo:{
      type:String,
      value:''
    },
    value:{
      type:String,
      value:''
    },
    prompt_info:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    timestr: ''
  },

  lifetimes: {
    attached: function() {
      //开启倒计时
      let that = this
      countdown(this)
    },
    detached: function() {
      clearInterval(CountdownTimer)
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    orderPay:function(){
      switch(this.data.value){
        case "order_pay":
          this.triggerEvent('orderPay', { orderNo: this.data.orderNo})
        break
        case "order_pay_not":
          this.triggerEvent('orderPayNot', { orderNo: this.data.orderNo, prompt_info: this.data.prompt_info})
        break
      }
      
    }
  },
})

var CountdownTimer;

function countdown(that) {
  CountdownTimer = setInterval(
    () => {
      if (parseInt(that.data.waitpaytime)>=0) {
        that.data.waitpaytime = that.data.waitpaytime - 1
        let times = parseInt(that.data.waitpaytime)
        if (times <= 0) {
          clearInterval(CountdownTimer)
          that.setData({
            timestr: ''
          })
        } else {
          let lastSeaconds = times % 60 + ''
          let lastSeacondStr = lastSeaconds.length == 1 ? '0' + lastSeaconds : lastSeaconds
          that.setData({
            timestr: parseInt(times / 60) + ':' + lastSeacondStr
          })
        }
      }
    }, 1000)
}