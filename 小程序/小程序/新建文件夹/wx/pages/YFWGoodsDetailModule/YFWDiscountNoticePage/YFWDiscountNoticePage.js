import {
  isNotEmpty,
  safeObj,
  isEmpty,
  safe,
  convertImg,
  tcpImage,
  toDecimal,
  coverAuthorizedTitle
} from '../../../utils/YFWPublicFunction.js'
import { GoodsDetailApi } from '../../../apis/index.js'
const goodsDetailApi = new GoodsDetailApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    price: '',
    msg:'',
    current_price:'',
    shop_goods_id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params = options.params&& typeof(options.params) == 'string'(options.params) || {}
    this.setData({
      current_price: params.value,
      shop_goods_id: params.shop_goods_id
    })
  },
  onConfirm: function () {
    if( !this.data.price || this.data.price == ''){
      wx.showToast({
        title: "请输入期望价格",
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    goodsDetailApi.setPriceOffNotice(this.data.shop_goods_id+'', parseFloat(this.data.current_price),parseFloat(this.data.price)).then(response => {
      console.log(response)
      wx.navigateBack({
        delta: 1
      })
    }, error => {
      this.setData({
        isLoading: false
      })
    })
  },

  changeInputText: function (event) {
    console.log(event.detail.value)
    this.setData({
      price: event.detail.value
    })
    
  },
  blurInputText: function (event) {
    let msg
    if (isEmpty(this.data.price)) {
      msg = ''
    } else if (parseFloat(this.data.current_price) <= parseFloat(this.data.price)) {
      msg = '必须低于当前价'
    } else {
      if ((parseFloat(this.data.price) / parseFloat(this.data.current_price) * 10) < 0.1) {
        msg = '低于0.1折'
      } else {
        msg = this.floorFun((parseFloat(this.data.price) / parseFloat(this.data.current_price) * 10), 1) + '' + '折'
      }
    }
    this.setData({
      msg:msg
    })

  },

  floorFun: function (value, n) {
    return Math.floor(value * Math.pow(10, n)) / Math.pow(10, n);
  },

  inputClear: function () {
    this.setData({
      price:'',
      msg:'',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})