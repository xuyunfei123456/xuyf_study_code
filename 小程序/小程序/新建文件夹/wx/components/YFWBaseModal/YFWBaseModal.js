// components/YFWBaseModal/YFWBaseModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      tips_text:{
        type:String,
        value:''
      },
      left_text:{
        type:String,
        value:'取消'
      },
      right_text:{
        type:String,
        value:'确认'
      },
      needLeftButton:{
        type:Boolean,
        value:true
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show:false,
    orderNo:'',
    img_url:'',
    shop_title:'',
    order_total:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showViewTypeTwo: function (tips,parm){
      this.setData({
        show: true,
        tips_text: tips,
        orderNo: parm.detail.orderNo,
        shop_title: parm.detail.shop_title,
        img_url: parm.detail.img_url,
        order_total: parm.detail.order_total,
        unreceive:parm.detail.unreceive || [],
      })
    },
    showView: function (tips, orderNo){
        this.setData({
          show:true,
          tips_text:tips,
          orderNo:orderNo
        })
    },
    closeView:function(){
      this.setData({
        show:false
      })
    },
    onRightButtonClick:function(){
      console.log('onRightButtonClick')
      this.triggerEvent('test', { unreceive:this.data.unreceive,orderNo: this.data.orderNo, img_url: this.data.img_url, shop_title: this.data.shop_title, order_total: this.data.order_total})
    },
    close:function(){
      this.setData({
        show: false
      })
    }
  }
})
