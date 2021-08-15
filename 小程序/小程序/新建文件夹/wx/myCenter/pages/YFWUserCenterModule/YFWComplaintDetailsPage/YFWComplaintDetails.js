import {
  OrderApi
} from '../../../../apis/index.js'
import {
  pushNavigation
} from '../../../../apis/YFWRouting.js'
import { isNotEmpty} from '../../../../utils/YFWPublicFunction.js'
const orderApi = new OrderApi()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataArray: [],
    dataProofImages: [], //举证图片
    dataReplyImages: [], //商家图片
    orderId: '',
    type: '',
    canCancel:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let orderno = options.params && typeof(options.params) == 'string'&& JSON.parse(options.params) || {}
    this.setData({
      orderId: orderno.order_no
    })
    this.requsetData();
    this.cancleComplaitModal = this.selectComponent('#cancleComplaitModal')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearTimeout(this.timer);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  bigProofPicture: function(event) {
    var src = event.currentTarget.dataset.src; //获取data-src
    var imgList = event.currentTarget.dataset.list; //获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  /**
   * 图片放大
   */
  bigReplyImages: function(event) {
    var src = event.currentTarget.dataset.src;
    var imgList = event.currentTarget.dataset.list;
    wx.previewImage({
      current: src,
      urls: imgList
    })
  },
  /**
   * 取消投诉
   */
  cancelComplaint: function() {
    this.cancleComplaitModal && this.cancleComplaitModal.show()

  },
  onCancelComplaint: function() {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    prevPage.setData({
      isCancelComplain: true
    })
    orderApi.cancelComplaints(this.data.orderId).then(res => {
      wx.showToast({
        title: '取消成功',
        icon: 'none',
        duration: 500
      })
      this.timer = setTimeout(function() {
        wx.navigateBack({
          delta: 1
        })
      }, 400)

    });
  },
  /**
   * 请求数据
   */
  requsetData: function() {

    orderApi.getComplaintsDetail(this.data.orderId).then(res => {
      let dataArray, type;
      let introImages = [];
      let replyImages = [];
      dataArray = res;
      console.log(dataArray);
      if (dataArray.dict_complaints_type == '1') {
        type = "商品质量问题"
      } else {
        type = "商家服务问题"
      }
      //投诉内容图片
      if (dataArray.intro_image != '') {
        for (let uri of dataArray.intro_image.split("|")) {
          let imageUri;
          var imgUri = uri.substring(0, 1);
          if (imgUri == '/') {
            imageUri = 'http://c1.yaofangwang.net' + uri.trim()
          } else if (imgUri == 'h') {
            imageUri = uri.trim()
          } else {
            imageUri = 'http://c1.yaofangwang.net' + '/' + uri.trim()
          }

          introImages.push(
            imageUri
          )
        }
      }
      //商家解释图片
      if (dataArray.reply_image.length != '') {
        for (let uri of dataArray.reply_image.split("|")) {
          let imageUri;
          var imgUri = uri.substring(0, 1);
          if (imgUri == '/') {
            imageUri = 'http://c1.yaofangwang.net' + uri.trim()
          } else if (imgUri == 'h') {
            imageUri = uri.trim()
          } else {
            imageUri = 'http://c1.yaofangwang.net' + '/' + uri.trim()
          }
          replyImages.push(
            imageUri
          )
        }
      }
      let canCancel = false
      if (isNotEmpty(dataArray.buttons)&&dataArray.buttons.length>0){
        canCancel = true
      }
      this.setData({
        dataArray: dataArray,
        type: type,
        dataProofImages: introImages,
        dataReplyImages: replyImages,
        canCancel: canCancel
      })
    });
  },
})