Component({

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {

    width: {
      type: Number,
      value: '500'
    },
    height:{
      type: Number,
      value: '300'
    },
    bottomWidth: {
      type: Number,
      value: '200'
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    open: true,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    transform: '',
    moveIsVertical:false,
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.setData({
        itemHeight: this.data.height + 'rpx',
        itemWidth: this.data.width + 'rpx',
        itemBottomWidth: this.data.bottomWidth + 'rpx',
        itemBottomWidthPx: wx.getSystemInfoSync().windowWidth / 750 * this.data.bottomWidth,
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      
    },
    /**
     * 触摸开始
     */
    touchstart(e, ins) {
      // console.log(e)
      var pageX = (e.touches[0] || e.changedTouches[0]).pageX
      var pageY = (e.touches[0] || e.changedTouches[0]).pageY
      this.data.startmark = this.data.newmark = pageX
      this.data.startmarkY = this.data.newmark = pageY
    },

    /**
     * 移动事件
     */
    touchmove(e, ins) {
      if (this.data.moveIsVertical) {
        return
      }
      // console.log(e)
      var pageX = (e.touches[0] || e.changedTouches[0]).pageX
      var pageY = (e.touches[0] || e.changedTouches[0]).pageY
      this.data.newmark = pageX
      if (Math.abs(this.data.startmarkY - pageY) > 1 / 3 * Math.abs(this.data.newmark - this.data.startmark)) {
        // console.log('竖向滑动')
        this.data.moveIsVertical = true
        return  
      }
      if (this.data.startmark > pageX) {
        if (this.data.itemBottomWidthPx *1.25 > Math.abs(this.data.newmark - this.data.startmark)) {
          this.setData({
            transform: 'translateX(-' + Math.min(this.data.itemBottomWidthPx, ((this.data.open ? this.data.itemBottomWidthPx : 0) + this.data.startmark - this.data.newmark)) + 'px)'
          })
        }
      }
      if (this.data.startmark < pageX) {
        this.setData({
          transform: 'translateX(-' + Math.min(0, ((this.data.open ? this.data.itemBottomWidthPx : 0) + this.data.startmark - this.data.newmark)) + 'px)'
        })
      }
    },

    /**
     * 触摸结束
     */
    touchend(e, ins) {
      // console.log(e)
      if (this.data.moveIsVertical) {
        this.setData({
          transform: 'translateX(-' + this.data.open ? (this.data.itemBottomWidthPx) : '0' + 'px)'
        })
        this.data.moveIsVertical = false;
        return
      }
      var pageX = (e.touches[0] || e.changedTouches[0]).pageX
      this.data.newmark = pageX
      if (this.data.startmark > pageX) {
        if (this.data.itemBottomWidthPx * 0.2 < Math.abs(this.data.newmark - this.data.startmark)) {
          this.setData({
            transform: 'translateX(-' + (this.data.itemBottomWidthPx) + 'px)'
          })
          this.data.open = true // 展开状态
          this.triggerEvent('onOpen')
        } else {
          this.setData({
            transform: 'translateX(0px)'
          })
          this.data.open = false // 收起状态
          this.triggerEvent('onClose')
        }
      }
      if (this.data.startmark < this.data.newmark) {
        this.setData({
          transform: 'translateX(0px)'
        })
        this.data.open = false // 收起状态
        this.triggerEvent('onClose')
      }
    },

    /**
     * 关闭展开按钮
     */
    close(e, ins) {
      this.setData({
        transform: 'translateX(0px)'
      })
      this.data.open = false // 收起状态
      this.triggerEvent('onClose')
    }
  },
})