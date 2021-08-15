
import {
  UserCenterApi,
  PublicApi
} from '../../../../apis/index.js'
const userCenterApi = new UserCenterApi()
const publicApi = new PublicApi()
import {
  isNotEmpty,
  toDecimal
} from '../../../../utils/YFWPublicFunction.js'
import { pushNavigation } from '../../../../apis/YFWRouting.js'
import { YFWCouponDetailModel} from '../../../../pages/YFWUserCenterModule/Model/YFWCouponDetailModel'
const couponDetailModel = new YFWCouponDetailModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    toH5Flag:true,
    getDataFlag:false,
    selectIndex: 0,
    // dataSource: [{
    //   id: 0,
    //   name: "未使用",
    //   items: []
    // },
    // {
    //   id: 1,
    //   name: "已使用",
    //   items: []
    // }
    // ],
    dataSource: [{
        id: 0,
        name: "全部",
        items: [],
        rowCount:0
      },
      {
        id: 1,
        name: "单品券",
        items: [],
        rowCount: 0
      },
      {
        id: 2,
        name: "店铺券",
        items: [],
        rowCount: 0
      },
      {
        id: 3,
        name: "平台券",
        items: [],
        rowCount: 0
      },
    ],
    listHeight: 600,
    ratio: 1,
    isEdit: false,
    pageEnd: false,
    pageEndOne: false,
    pageEndTwo: false,
    pageEndThree: false,
    pageEndfour: false,
    pageIndexOne: 1,
    pageIndexTwo: 1,
    pageIndexThree: 1,
    pageIndexfour: 1,
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
            listHeight: height-100
          });
        })
      }
    });
    publicApi.getCouponUrl().then((result) => {
      this.data.coupon_url = result.coupon_url || ''
    }, (error) => {})
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
    if(this.data.toH5Flag){   //如果点击领券中心 返回的时候刷新 优惠券  默认存在（为了第一次进来加载）
      this.data.toH5Flag = false;
      this.getData();
    }
    
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

  showMore() {
    let that = this
    let query = wx.createSelectorQuery()
    query.select('#more_image').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let bottom = res[0].bottom * that.data.ratio;
      that.selectComponent("#moreview").showModal(bottom + 30)
    })
  },
  /**
   * 选中事件
   */
  itemClick: function (e) {
    let item = e.currentTarget.dataset.item
    if (item.dict_bool_status != 0){
      return
    }
    if (item.dict_coupons_type == 1) {
      pushNavigation("get_shop_detail", { value: item.storeid })
    } else if (item.dict_coupons_type == 2) {
      if (isNotEmpty(item.medicineid)){
        pushNavigation('get_goods_detail', { value: item.medicineid })
      }else{
        pushNavigation('get_shop_goods_detail', { value: item.store_medicineid })
      }
    } else {
      pushNavigation('get_home')
    }

  },
  clickedMethod: function (event) {
    let type = parseInt(event.currentTarget.dataset.type)
    switch (type) {
      case 0:
        pushNavigation('get_coupon_record')
        break;
      case 1:
        this.data.toH5Flag = true;
        pushNavigation('receive_h5', {value:this.data.coupon_url,type:'receive_h5'})
        break;
    }
  },

  /** 点击顶部item方法 */
  changeIndex: function (event) {
    let index = event.currentTarget.dataset.index
    if (index != this.data.selectIndex) {
      this.data.pageEnd = false;
      this.setData({
        selectIndex: index,
      })
      this.getData()
    }
  },

  swiperChangIndex: function (event) {
    if (event.detail.source == "touch") {
      this.data.pageEnd = false
      this.setData({
        selectIndex: event.detail.current
      })
      this.getData()
    }
  },
  requestNextPage: function (e) {
    if (this.data.selectIndex == 0) {
      this.data.pageEnd = this.data.pageEndOne
    } else if (this.data.selectIndex == 1) {
      this.data.pageEnd = this.data.pageEndTwo
    } else if (this.data.selectIndex == 2) {
      this.data.pageEnd = this.data.pageEndThree
    } else if (this.data.selectIndex == 3) {
      this.data.pageEnd = this.data.pageEndfour
    }
    if (!this.data.pageEnd) {
      if (this.data.selectIndex == 0) {
        this.data.pageIndexOne = this.data.pageIndexOne + 1
      } else if (this.data.selectIndex == 1) {
        this.data.pageIndexTwo = this.data.pageIndexTwo + 1
      } else if (this.data.selectIndex == 2) {
        this.data.pageIndexThree = this.data.pageIndexThree + 1
      }
      else if (this.data.selectIndex == 3) {
        this.data.pageIndexfour = this.data.pageIndexfour + 1
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
    // if (this.data.selectIndex == 0) {
    //   userCenterApi.getMyCoupons(this.data.pageIndexLeft,'0').then((response) => {
    //     let data = response.dataList || []
    //     if (data.length < 20) {
    //       this.data.pageEndLeft = true
    //       this.hideLoadingView()
    //     }
    //     if (this.data.pageIndexLeft == 1) {
    //       this.data.list = data
    //     } else {
    //       data = this.data.dataSource[0].items.concat(data)
    //     }
    //     this.data.dataSource[0].items = data
    //     this.setData({
    //       dataSource: this.data.dataSource
    //     })
    //   })
    // } else {
    //   userCenterApi.getMyCoupons(this.data.pageIndexRight,'1').then((response) => {
    //     let data = response.dataList || []
    //     if (data.length < 20) {
    //       this.data.pageEndRight = true
    //       this.hideLoadingView()
    //     }
    //     if (this.data.pageIndexRight == 1) {
    //       this.data.list = data
    //     } else {
    //       data = this.data.dataSource[1].items.concat(data)
    //     }
    //     this.data.dataSource[1].items = data
    //     this.setData({
    //       dataSource: this.data.dataSource
    //     })
    //   })
    // }
    let couponType
    let pageIndex
    if (this.data.selectIndex == 0) {
      couponType = ''
      pageIndex = this.data.pageIndexOne
    } else if (this.data.selectIndex == 1) {
      couponType = '2'
      pageIndex = this.data.pageIndexTwo
    } else if (this.data.selectIndex == 2) {
      couponType = '1'
      pageIndex = this.data.pageIndexThree
    } else if (this.data.selectIndex == 3) {
      couponType = '3'
      pageIndex = this.data.pageIndexfour
    }
    
    userCenterApi.getMyCoupons(pageIndex, '0', couponType).then((response) => {
      let data = couponDetailModel.getModelArray(response.dataList) || []
      data = data.map(item=>{
        item.description = this.getShort(item.description)
        item.namecn = this.getShort(item.namecn)
        item.store_title = this.getShort(item.store_title)
        return item;
      })
      if (data.length < 20) {
        this.data.pageEnd = true
        this.hideLoadingView()
      }
      if (pageIndex == 1) {
        this.data.list = data
      } else {
        data = this.data.dataSource[this.data.selectIndex].items.concat(data)
      }

      this.data.dataSource[this.data.selectIndex].items = data
      
      this.data.dataSource[0].rowCount = response.unUseCount
      this.data.dataSource[1].rowCount = response.danpinquanCount
      this.data.dataSource[2].rowCount = response.dianpuquanCount
      this.data.dataSource[3].rowCount = response.pingtaiquanCount
      this.setData({
        dataSource: this.data.dataSource,
        getDataFlag:true,
      })
    })

  },



})