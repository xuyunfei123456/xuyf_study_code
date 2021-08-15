import {isEmpty} from '../../utils/YFWPublicFunction.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // show:{
    //   type:Boolean,
    //   value:false
    // },
    phone:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    isFocus: false,
    inputValue: '',
    codes: ["", "", "", ""],
    orderNo:'',
    order_total:'',
    packaging_total: '',
    shipping_total: '',
    type:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showView({ phone, orderNo, orderTotal, packagingTotal, shippingTotal, type, inputSuccess}) {
      this.inputSuccess = inputSuccess;
      var mPhone = phone.substr(0, 3) + '****' + phone.substr(7);
      this.setData({
        show: true,
        phone: mPhone,
        isFocus: true,
        codes: ["", "", "", ""],
        orderNo: orderNo,
        order_total: orderTotal,
        packaging_total: packagingTotal,
        shipping_total: shippingTotal,
        type:type
      })
    },
    listenKeyInput: function (e){
      var text = e.detail.value;
      this.data.inputValue = text
      var textLength = text.length;
      var codeArray = new Array();
      for (var i = 0; i < (textLength > 4? 4 : textLength); i++) {
        var code = text.substr(i, 1);
        codeArray[i] = (code);
      }
      for (var i = codeArray.length; i < 4; i++) {
        codeArray.push("");
      }
      this.setData({
        codes: codeArray
      })
      if (textLength > 3) {
        wx.hideKeyboard()
        var returnString = text.substr(0, 4);
        this.inputSuccess(returnString);
        this.checkNumber();
      }
    },
    openKeyboard:function(){
      this.setData({
        isFocus: true
      })
    },
    focusInput:function() {
      this.setData({
        isFocus: true
      })
    },
    closeView: function () {
      this.setData({
        show: false,
        isFocus: false,
        codes: ["", "", "", ""],
        inputValue:''
      })
    },
    checkNumber: function () {
      if (isEmpty(this.data.codes[3])){
          wx.showToast({
            title: '请输入正确的手机号码数字',
            icon:'none'
          })
         return
      }
      this.triggerEvent('checkPhone', { orderNo: this.data.orderNo, order_total: this.data.order_total, packaging_total: this.data.packaging_total, shipping_total: this.data.shipping_total, type: this.data.type,phone:this.data.phone})
    }
  }
  
})
