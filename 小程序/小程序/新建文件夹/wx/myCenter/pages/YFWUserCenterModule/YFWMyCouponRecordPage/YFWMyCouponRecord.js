
import {
  UserCenterApi,PublicApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
import {
  isNotEmpty,
  toDecimal
} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { YFWCouponDetailModel } from '../../../../pages/YFWUserCenterModule/Model/YFWCouponDetailModel'
const couponDetailModel = new YFWCouponDetailModel()
const publicApi = new PublicApi()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstSwiper:true,
    getDataFlag:false,
    selectIndex: 0,
    dataSource: [{
      id: 0,
      name: "已使用",
      items: []
    },
    {
      id: 1,
      name: "已过期",
      items: []
    },
    ],
    listHeight: 600,
    ratio: 1,
    isEdit: false,
    pageEnd: false,
    pageEndLeft: false,
    pageEndRight: false,
    pageIndexLeft: 1,
    pageIndexRight: 1,
    lastOpenSiderId: '',
    coupon_url:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        let clientWidth = res.windowWidth;
        let ratio = 750 / clientWidth;
        that.data.ratio = ratio
        let query = wx.createSelectorQuery()
        query.select('#separateView').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
          let height = (clientHeight - res[0].bottom) * ratio;
          that.setData({
            listHeight: height
          });
        })
      }
    });
    publicApi.getCouponUrl().then((result) => {
      this.setData({
        coupon_url: result.coupon_url || ''
      })
    }, (error) => {})
    this.getData()
  },
  onSidebarOpen: function (e) {
    if (this.data.lastOpenSiderId != '' && this.data.lastOpenSiderId != e.currentTarget.id) {
      if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
        this.selectComponent('#' + this.data.lastOpenSiderId).close()
      }
    }
    this.data.lastOpenSiderId = e.currentTarget.id;
  },
  clickedMethod: function () {
    pushNavigation('receive_h5', {value:this.data.coupon_url,type:'receive_h5'})
  },
  onDeleteitem: function (event) {
    let id = event.currentTarget.dataset.item.id
    let that = this
    wx.showModal({
      content: "确定删除吗？",
      cancelColor: "#999999",
      cancelText: "取消",
      confirmColor: "#49ddb8",
      confirmText: "确定",
      success(res) {
        if (res.confirm) {
          that.handleData(id)
        } else if (res.cancel) {

        }
      }
    })
  },
  handleData: function (id) {
    userCenterApi.couponsDelete(id).then((response) => {
      if (response){
        this.getData()
      }
    })
  },

  /** 点击顶部item方法 */
  changeIndex: function (event) {
    let index = event.currentTarget.dataset.index
    if (index != this.data.selectIndex) {
      this.data.pageEnd = false;
      this.setData({
        selectIndex: index
      })
      if(this.data.firstSwiper){
        this.getData()
        this.data.firstSwiper = false;
      }
    }
  },

  swiperChangIndex: function (event) {
    if (event.detail.source == "touch") {
      this.data.pageEnd = false
      this.setData({
        selectIndex: event.detail.current
      })
      if(this.data.firstSwiper){
        this.getData()
        this.data.firstSwiper = false;
      }
    }
  },
  stopTouchMove: function () {
    return false;
  },
  requestNextPage: function (e) {
    if (this.data.selectIndex == 0) {
      this.data.pageEnd = this.data.pageEndLeft
    } else {
      this.data.pageEnd = this.data.pageEndRight
    } 
    if (!this.data.pageEnd) {
      if (this.data.selectIndex == 0) {
        this.data.pageIndexLeft = this.data.pageIndexLeft + 1
      } else {
        this.data.pageIndexRight = this.data.pageIndexRight + 1
      }
      this.getData()
    } else {
      this.hideLoadingView()
    }
  },
  hideLoadingView() {
    this.setData({
      pageEnd: true
    })
  },
  getShort(str){
    if(str && typeof  str == 'string' && str.length >19){
      str = str.substring(0,20)+'...';
    }
    return str
  },
  getData() {
    this.setData({
      getDataFlag:false,
    })
    if (this.data.selectIndex == 0) {
      userCenterApi.getMyCoupons(this.data.pageIndexLeft,'1').then((response) => {
        let data = response.dataList || [];
        data = data.map(k=>{
          k.description = this.getShort(k.description)
          k.namecn = this.getShort(k.namecn)
          k.store_title = this.getShort(k.store_title)
          return k
        })
        if (data.length < 20) {
          this.data.pageEndLeft = true
          this.hideLoadingView()
        }
        if (this.data.pageIndexLeft == 1) {
          this.data.list = data
        } else {
          data = this.data.dataSource[0].items.concat(data)
        }
        this.data.dataSource[0].items = data
        if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
          this.selectComponent('#' + this.data.lastOpenSiderId).close()
        }
        this.setData({
          dataSource: this.data.dataSource,
          getDataFlag:true,
        })
      })
    } else {
      userCenterApi.getMyCoupons(this.data.pageIndexRight,'2').then((response) => {
        let data = response.dataList || [];
        data = data.map(k=>{
          k.description = this.getShort(k.description)
          k.namecn = this.getShort(k.namecn)
          k.store_title = this.getShort(k.store_title)
          return k
        })
        if (data.length < 20) {
          this.data.pageEndRight = true
          this.hideLoadingView()
        }
        if (this.data.pageIndexRight == 1) {
          this.data.list = data
        } else {
          data = this.data.dataSource[1].items.concat(data)
        }
        this.data.dataSource[1].items = data
        if (isNotEmpty(this.selectComponent('#' + this.data.lastOpenSiderId))) {
          this.selectComponent('#' + this.data.lastOpenSiderId).close()
        }
        this.setData({
          dataSource: this.data.dataSource,
          getDataFlag:true,
        })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})