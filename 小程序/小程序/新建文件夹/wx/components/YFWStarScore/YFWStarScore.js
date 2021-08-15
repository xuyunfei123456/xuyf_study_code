// components/YFWStarScore.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

      //给出的评分 默认为5
      starScores:{
        type:Number,
        value:5
      },

      //未给出的评分 默认为0
      unStartScores:{
        type:Number,
        value:0
      },

    score_text:{
      type:String,
      value:'非常好'
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
    onStarClick:function(item){
      let text;
      if ((item.currentTarget.dataset.position + 1)==5){
        text = '非常好'
      } else if ((item.currentTarget.dataset.position + 1)==4){
        text = '很好'
      } else if((item.currentTarget.dataset.position + 1)==3){
        text = '一般'
      } else if ((item.currentTarget.dataset.position + 1) == 2 || (item.currentTarget.dataset.position + 1)==1){
        text = '差'
      }
      this.setData({
        starScores: item.currentTarget.dataset.position+1,
        unStartScores: 5 - (item.currentTarget.dataset.position + 1),
        score_text:text
      })
    },
    onUnStarClick:function(item){
      let text;
      if ((this.data.starScores + item.currentTarget.dataset.position + 1) == 5) {
        text = '非常好'
      } else if ((this.data.starScores + item.currentTarget.dataset.position + 1) == 4) {
        text = '很好'
      } else if ((this.data.starScores + item.currentTarget.dataset.position + 1) == 3) {
        text = '一般'
      } else if ((this.data.starScores + item.currentTarget.dataset.position + 1) == 2 || (this.data.starScores + item.currentTarget.dataset.position + 1) == 1) {
        text = '差'
      }
      this.setData({
        starScores: this.data.starScores + item.currentTarget.dataset.position+1,
        unStartScores: 5 - (this.data.starScores+item.currentTarget.dataset.position + 1),
        score_text:text
      })
    },
    getStarScores:function(){
      return this.data.starScores
    }
  }
})
