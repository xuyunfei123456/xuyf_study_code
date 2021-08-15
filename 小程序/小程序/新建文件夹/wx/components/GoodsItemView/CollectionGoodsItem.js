// component/collectionGoodsItem.js
import { pushNavigation } from '../../apis/YFWRouting.js'
import {
  ShopCarApi
} from '../../apis/index.js'
const shopCarApi = new ShopCarApi()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      value: {}
    },
    showstanders: {            // 属性名
      type: Boolean,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: true     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    showfree: {
      type: Boolean,
      value: false
    },
    showcar: {
      type: Boolean,
      value: true
    },
    showstore: {
      type: Boolean,
      value: true
    },
    showCompany: {
      type: Boolean,
      value: false
    },
    dataIndex:{
      type:Number,
      value:1,
    },
    showSpecification2:{
      type:Boolean,
      value:false
    },
    showConditionTips:{
      type:Boolean,
      value:false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  observers: {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击item
     */
    toGoodsDetail(e) {
      let a = e.currentTarget.id
      if (a == 'father') {
        pushNavigation(this.data.data.navitation_params.type, this.data.data.navitation_params)
      } else {
        this.addCar()
      }
    },
    addCar(){
      this.addToShopCar(this.data.data.navitation_params);
    },
    
    showMoreAction: function (event) {
      let info = event.currentTarget.dataset.info
      pushNavigation(info.navitation_params.anotherType, { value: info.navitation_params.anotherValue })
    },

    addToShopCar: function (item) {
      let goodsID = item.value
      let goodsPrice = this.data.data.goods_price
      let isBuy = this.data.showConditionTips || false
      shopCarApi.addGoodsToShopCar(1, goodsID, '', isBuy).then(response => {
        wx.showToast({
          title: "加入需求单成功",
          icon: 'none',
          duration: 2000
        })
        let _arr = wx.getStorageSync('checkedArr') || [];
        _arr.push(goodsID);
        wx.setStorageSync('checkedArr', _arr)
        if (this.data.showConditionTips) {
          let info = {goodsPrice:goodsPrice}
          if (response && response.cartids) {
              info.id = response.cartids.join(',')
              info.storeMedicineId = goodsID
          } else {
              return
          }
          this.triggerEvent('callBack', info);
        } else {
          this.triggerEvent('callBack', { price: goodsPrice });
        }
      },error=>{
        wx.showToast({
          title: error&&error.msg || '加入购物车异常请稍后再试',
          icon:'none'
        })
      })
    }
  }
})
