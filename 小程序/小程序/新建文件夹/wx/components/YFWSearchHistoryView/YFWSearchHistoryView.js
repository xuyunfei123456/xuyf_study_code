
Component ({
  /**
  * 组件的属性列表
  */
  properties: {
    hotWords: {
      type: Object,
      value:{}
    },
    historyWords: {
      type: Array,
      value: []
    },
    shop_id: {
      type: String,
      value: ''
    }


  },

  /**
   * 组件的初始数据
   */
  data: {
    types:1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickHotItemMethod: function (event) {
      console.log(event)
      this.triggerEvent('clickHotItemMethod', {
        name: event.currentTarget.dataset.name
      })
    },
    clickHistoryItemMethod: function (event) {
      this.triggerEvent('clickHistoryItemMethod', {
        name: event.currentTarget.dataset.name
      })
    },
    clearHistoryMethod: function () {
      this.setData({
        types:this.data.types == 1 ? 2 :1
      })
    },
    completeDelete(){
      this.setData({
        types:1
      })
    },
    deleteAll(){
      let that = this;
      wx.showModal({
        content: '是否全部删除搜索历史',
        success:res=>{
          if(res.confirm){
            that.triggerEvent('clearHistoryMethod')
          }
        }

      })

    },
    deletesingle(e){
      const key = e.currentTarget.dataset.info;
      let _data = this.data.historyWords.filter(item=>item.key!=key);
      this.setData({
        historyWords:_data
      })
      wx.setStorage({
        data: _data,
        key: 'kSearchHistoryKey',
      })
    }

  },
  

})