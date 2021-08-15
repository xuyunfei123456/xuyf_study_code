// components/YFWCouponModal/YFWCouponModal.js
import {
  getModel
} from '../../model/YFWCouponModel.js'

import {
  isNotEmpty,
} from '../../utils/YFWPublicFunction.js'

import {
  GoodsDetailApi,
} from '../../apis/index.js'
import { pushNavigation } from '../../apis/YFWRouting.js'
const goodsDetailApi = new GoodsDetailApi()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    coupons: {
      type: Object,
      value: []
    },
    isShowDiscount: {
      type:Boolean,
      value:false
    },
    discounts: {
      type: String,
      value: ''
    },
    freepostages: {
      type: String,
      value: ''
    },
    storeID: {
      type:String,
      value:''
    },
    priceInShop:{
      type:String,
      value:''
    }
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    receiveingCoupon: [], // 可领取优惠券
    receivedCoupon: [] // 已领取优惠券
  },

  /**
   * 组件的生命周期
   */
  lefttimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      // console.log("优惠券",this.data)
    },
  },

  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    // 在组件实例进入页面节点树时执行
    // console.log("优惠券", this.data)
  },

  /**
   * 数据监听
   */
  observers: {
    'coupons': function (coupons) {
      console.log("优惠券", this.data)
      let coupon_list = coupons
      let receiveing = []
      let received = []

      if (isNotEmpty(coupon_list)) {
        for (let index = 0; index < coupon_list.length; index++) {
          let model = coupon_list[index]
          let couponModel = getModel(model)
          if (coupon_list[index].get) {
            receiveing.push(couponModel)
          }
          if (coupon_list[index].user_coupon_count > 0) {
            let user_coupon_count = coupon_list[index].user_coupon_count
            while (user_coupon_count > 0) {
              user_coupon_count--;
              received.push(couponModel);
            }
          }
        }
        this.setData({
          receiveingCoupon: receiveing,
          receivedCoupon: received
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 隐藏弹窗
     */
    hideModal: function () {
      let modal = this.selectComponent("#coupon")
      modal.hideModal();
    },
    /**
     * 显示弹窗
     */
    showModal: function () {
      let modal = this.selectComponent("#coupon")
      modal.showModal();
    },

    toshopAllGoods: function (event) {
      let storeid = event.currentTarget.dataset.storeid
      pushNavigation('get_shop_detail_list', { value: storeid,priceInShop:this.data.priceInShop,isShowTips:true })
    },
    /**
     * 领取优惠券
     */
    receiveCoupon: function (event) {
      let coupon = event.currentTarget.dataset.coupon
      let that = this

      goodsDetailApi.getCoupon(coupon.id).then(response => {
        let received = that.data.receivedCoupon;
        received.push(coupon);
        if(isNotEmpty(that.data.receiveingCoupon)){
          for (let index = 0; index < that.data.receiveingCoupon.length; index++){
            if (that.data.receiveingCoupon[index].user_coupon_count == 0){
              if (that.data.receiveingCoupon[index].id==coupon.id){
                that.data.receiveingCoupon.splice(index, 1);
              }
          }      
          }
        }
        that.setData({
          receiveingCoupon: that.data.receiveingCoupon,
          receivedCoupon: received
        })
        wx.showToast({
          title: '领取成功',
          icon:'none'
        })
      },error=>{
        wx.showToast({
          title: error.msg || '领取异常',
          icon:'none'
        })
      })
    }
  }
})
