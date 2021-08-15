// pages/YFWGoodsDetailModule/YFWGoodsDetailQAPage/YFWGoodsDetailQA.js
import {
  GoodsDetailApi
} from '../../../apis/index.js'
const indexApi = new GoodsDetailApi()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSource: [
      {
        id: 1,
        name: "物流问题",
        items: []
      },
      {
        id: 2,
        name: "商品问题",
        items: []
      },
      {
        id: 3,
        name: "支付问题",
        items: []
      },
      {
        id: 4,
        name: "处方问题",
        items: []
      },
      {
        id: 5,
        name: "价格问题",
        items: []
      },
    ], // 接口返回数据
    selectIndex: 0,
    contentHeight: 1100
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        let screenWidth = res.windowWidth
        let screenHeight = res.windowHeight
        let height = 750 / screenWidth * screenHeight - 100
        that.setData({
          contentHeight: height
        })
      },
    })

    /** 获取全部问题列表 */
    indexApi.getQuestionList().then(response => {
      var dataSource = this.data.dataSource;
      /**
       * title：问题
       * content：答案
       * dict_question_ask_type：问题类型 1.物流问题 2.商品问题 3.支付问题 4.处方问题 5.价格问题
       */
      if (response.length > 0) {

        for (var index = 0; index < response.length; index++) {
          var model = response[index]

          if ((model.dict_question_ask_type - 1) >= 0 && (model.dict_question_ask_type - 1) < dataSource.length) {
            var qaModel = dataSource[model.dict_question_ask_type - 1]
            qaModel.items.push(model)
          }
        }

        this.setData({
          dataSource: dataSource,
        })
      }
    })
  },

  /** 点击顶部item方法 */
  changeQuestionIndex: function (event) {
    console.log(event.currentTarget)
    var index = event.currentTarget.dataset.index
    if (index != this.data.selectIndex) {
      this.setData({
        selectIndex: index
      })
    }
  },

  /** 下方列表滑动方法 */
  swiperChangIndex: function (event) {
    if (event.detail.source == "touch") {
      this.setData({
        selectIndex: event.detail.current
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})