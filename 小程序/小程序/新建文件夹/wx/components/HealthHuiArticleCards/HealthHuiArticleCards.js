
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    postCardData:{
      value:{},
      type:Object
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClickArticleIKeyMethod:function(event){
      this.triggerEvent('onClickArticleIKeyMethod',{
        name:event.currentTarget.dataset.name
      })
    },
    goHotTopicClick(e){
      this.triggerEvent('goHotTopicClick',{
        name:e.currentTarget.dataset.name
      })
    }
 
 
  }
})
