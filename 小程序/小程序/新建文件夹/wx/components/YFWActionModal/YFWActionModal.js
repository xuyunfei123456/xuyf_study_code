// components/YFWActionModal/YFWActionModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title:{
      type: String,
      value: ''
    },
    bgcolor:{
      type: String,
      value: ''
    }

  },
  externalClasses:[
  'my-class','alignCenter'
],
  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    opacityAnimation: {},
    translateAnimation: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 隐藏弹窗
     */
    hideModal: function () {
      if(this.data.isShow) {
        let that = this
        let translateAni = wx.createAnimation({
          duration: 300,
          timingFunction: 'linear',
          delay:0
        })
        translateAni.translateY(500).step()

        let opacityAni = wx.createAnimation({
          duration: 300,
          timingFunction: 'linear',
          delay: 0
        })
        opacityAni.opacity(0).step()

        that.setData({
          translateAnimation: translateAni.export(),
          opacityAnimation: opacityAni.export(),
        })

        setTimeout(function () {
          opacityAni.opacity(0).step()
          translateAni.translateY(0).step()
          that.setData({
            opacityAnimation: opacityAni.export(),
            translateAnimation: translateAni.export(),
            isShow: false
          })
        }.bind(this), 300)
      }
    },

    /**
     * 显示弹窗
     */
    showModal: function () {
      // wx.hideTabBar({});

      if (!this.data.isShow) {
    
        let that = this

        let translateAni = wx.createAnimation({
          duration: 300,
          timingFunction: 'linear',
          delay: 0
        })

        translateAni.translateY(500).step()

        let opacityAni = wx.createAnimation({
          duration: 300,
          timingFunction: 'linear',
          delay: 0
        })

        opacityAni.opacity(0).step()

        that.setData({
          translateAnimation: translateAni.export(),
          opacityAnimation: opacityAni.export(), 
          isShow: true
        })

        setTimeout(function () {
       
          translateAni.translateY(0).step()
          opacityAni.opacity(1).step()
          that.setData({
      
            translateAnimation: translateAni.export(),
            opacityAnimation: opacityAni.export(),
          })
        }.bind(this), 0)
      }
    },

    /**
     * 解决底部滑动穿透问题
     */
    myTouchMove: function () {
      return false;
    }
  }
})
