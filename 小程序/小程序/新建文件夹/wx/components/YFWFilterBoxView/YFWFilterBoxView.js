import {
  SearchApi, GoodsCategaryApi
} from '../../apis/index.js'
const searchApi = new SearchApi()
const goodsCategaryApi = new GoodsCategaryApi()
import {
  isNotEmpty,
} from '../../utils/YFWPublicFunction.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    category_id: {
      type: String,
      value: ''
    },
    keywords: {
      type: String,
      value: ''
    },
    paramJson: {
      type: Object,
      value: {}
    },
    drugNameDataArray: {
      type: Object,
      value: {}
    },
    manufacturerDataArray: {
      type: Object,
      value: {}
    },
    topDrugArray:{
      type:Array,
      value:[]
    },
    topManArray:{
      type:Array,
      value:[]
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    selectName: [],
    selectForm: [],
    selectStand: [],
    selectProduce: [],

    showDetail: false,
    selectDataArray: [],
    selectTitle: '',
    selectIndex: 0,
    showAll:false,
    brandsName:'商品名/品牌',
    manufacturersName:'厂家',
  },
  lefttimes: {
    attached: function () {
    },
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      
     },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
   

    /**
     * 解决底部滑动穿透问题
     */
    // myTouchMove: function () {
    //   return false;
    // },
    resetAction: function () {
      if (this.data.showAll) {
        if (this.data.showType == 'Aliascn') {
          this.data.drugNameDataArray.map((item)=>{
            item.select = false
          })
          this.data.topDrugArray.map((item)=>{
            item.select = false
          })
          this.setData({
            drugNameDataArray: this.data.drugNameDataArray,
            topDrugArray: this.data.topDrugArray
          })
        } else {
          this.data.manufacturerDataArray.map((item) => {
            item.select = false
          })
          this.data.topManArray.map((item) => {
            item.select = false
          })
          this.setData({
            manufacturerDataArray:this.data.manufacturerDataArray,
            topManArray:this.data.topManArray
          })
        }
      } else {
        this.data.drugNameDataArray.map((item) => {
          item.select = false
        })
        this.data.topDrugArray.map((item) => {
          item.select = false
        })
        this.data.manufacturerDataArray.map((item) => {
          item.select = false
        })
        this.data.topManArray.map((item) => {
          item.select = false
        })
        this.setData({
          drugNameDataArray: this.data.drugNameDataArray,
          topDrugArray: this.data.topDrugArray,
          manufacturerDataArray: this.data.manufacturerDataArray,
          topManArray: this.data.topManArray
        })
      }
    },
    confirmAction: function () {
      console.log(this.data.manufacturerDataArray)
      console.log(this.data.drugNameDataArray)
      let selectManArray = []
      let selectDrugArray = []
      this.data.manufacturerDataArray.map((item)=>{
        if (item.select) {
          let info = item.id?item.id:item.title
          selectManArray.push(info)
        }
      })
      this.data.drugNameDataArray.map((item)=>{
        if (item.select) {
          let info = item.id ? item.id : item.title
          selectDrugArray.push(info)
        }
      })
      let result = {
        brands:selectDrugArray,
        manufacturers:selectManArray,
      }
      this.triggerEvent('changeFilter', result)
      this.triggerEvent('hideModal')
    },
    backAction: function () {
      this.setData({
        showAll:false
      })
    },
    itemClickAction: function (e) {
      let item = e.currentTarget.dataset.info
      let index = e.currentTarget.dataset.index
      let type = e.currentTarget.dataset.type
      if (item.isShowAll) {
        this.setData({
          showAll:true,
          showType:type,
        })
      } else {
        if (type == 'Aliascn') {
          this.data.drugNameDataArray[index].select = !this.data.drugNameDataArray[index].select
          if (index < this.data.topDrugArray.length) {
            this.data.topDrugArray[index].select = !this.data.topDrugArray[index].select
          }
          this.setData({
            drugNameDataArray: this.data.drugNameDataArray,
            topDrugArray: this.data.topDrugArray
          })
        } else {
          this.data.manufacturerDataArray[index].select = !this.data.manufacturerDataArray[index].select
          if (index < this.data.topManArray.length) {
            this.data.topManArray[index].select = !this.data.topManArray[index].select
          }

          this.setData({
            manufacturerDataArray: this.data.manufacturerDataArray,
            topManArray: this.data.topManArray
          })
        }
        
      }
    }
  }
})
