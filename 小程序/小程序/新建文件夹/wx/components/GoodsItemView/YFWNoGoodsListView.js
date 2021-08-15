Component({
  /**
   * 组件的属性列表
   */
  properties: {
    froms: {
      type: String,
      value: 'search'      //search:搜索商品列表    category:分类商品列表   shop_search:商家搜索商品列表    shop_all_goods:商家全部商品列表
    },
    list:{
      type:Array,
      value:""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pageEnd: false,
    listType: true,
  },
  /**
   * 组件的方法列表
   */
  methods: {
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
    }
  }
})