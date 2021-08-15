// components/GoodsItemView/YFWGoodsListView.js
import { pushNavigation } from '../../apis/YFWRouting.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    froms:{
      type:String,
      value: 'search'   //search:搜索商品列表    category:分类商品列表   shop_search:商家搜索商品列表    shop_all_goods:商家全部商品列表
    },
    showShopCarTips:{
      type:Boolean,
      value:false
    },
    shopCarTipsInfo:{
      type:Object,
      value:{}
    },
    showConditionTips:{
      type:Boolean,
      value:false,
    },
    conditionTips:{
      type:String,
      value:''
    },
    showSpecification:{
      type:Boolean,
      value:false
    },
    showSpecification2:{
      type:Boolean,
      value:false
    },
    associationGoodsData:{
      type:Array,
      value:[],
    },
    showType:{
      type:String,
      value:'',
    },
    nogoodslist:{
      type:Array,
      value:[],
    },
  },
  lifetimes: {
    created: function () {
    console.log(this.data.froms)
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    pageEnd: false,
    listType: false,
    shopCarTipsInfo:{},
    list:[]
  },
  /**
   * 组件的方法列表
   */
  methods: {
    requestNextPage(){
      this.triggerEvent('requestNextPage')
    },
    changeSortType: function (e) {
      this.triggerEvent('changeSortType', {
        sort: e.detail.sort,
        sorttype: e.detail.sorttype,
        categoryID: e.detail.categoryID
      });
    },
    changeListType() {
      this.setData({
        listType: !this.data.listType
      })
    },
    openControlPanel() {
      this.triggerEvent('openControlPanel')
    },
    refreshTips(e){
      this.triggerEvent('refreshTips',e.detail)
    },
    toShopCar(){
      pushNavigation('get_shopping_car')
    },
    toOrderSettle() {
      wx.navigateBack({
        complete: (res) => {},
      })
    }
  }
})
