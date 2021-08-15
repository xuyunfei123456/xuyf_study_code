// components/YFWFooterView/YFWFooterView.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isShowFooter: false,
    isLoading: false,
    moreData: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 展示
     */
    showFooter: function () {
      this.setData({
        isShowFooter: true,
        isLoading: true,
        moreData: false,
      })
    },

    /**
     * 结束加载
     */
    endRefresh: function () {
      this.setData({
        isLoading: false,
        moreData: false,
        isShowFooter: false,
      })
    },

    /**
     * 没有更多数据了
     */
    endRefreshWithNoMoreData: function () {
      this.setData({
        isShowFooter: true,
        isLoading: false,
        moreData: true,
      })
    }
  }
})
