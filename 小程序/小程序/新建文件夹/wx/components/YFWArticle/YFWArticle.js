Component({
    /**
  * 组件的属性列表
  */
  properties:{
    articleWords:{
      type:Array,
      value:[]
    },
    articleRecommandWords:{
      type:Array,
      value:[]
    },
    pageEnd: {
      type:Boolean,
      value:false
    },
    isShowSearchArticleKey:{
      type:Boolean,
      value:false
    }
  },
    /**
   * 组件的初始数据
   */
  data:{
  
  },
    /**
   * 组件的方法列表
   */
  methods:{
    requestNextPage(){
      this.triggerEvent('requestNextPage')
    },
    onClickArticleItem(e){
      this.triggerEvent('onClickArticleItem',{
        name:e.currentTarget.dataset.name
      })
    }
  }
})