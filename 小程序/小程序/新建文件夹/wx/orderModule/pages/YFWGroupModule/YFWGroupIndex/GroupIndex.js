import { GroupApi } from "../../../../apis/index.js"
import { jsonToArray, mapToJson, convertImg, tcpImage } from "../../../../utils/YFWPublicFunction"
const groupApi = new GroupApi()

const switchNavigationBarTitle = {
  拼团首页: '拼团',
  我的拼团: '我的拼团'
}

const switch$dict_Group_status = {
  success: '拼团成功',
  on_going: '拼团中',
  fail: '拼团失败'
}

const switch$dict_group_buy_medicine_type = {
  1: '单品',
  2: '2件装'
}

const GROUPNOSUCCESS = 'GROUPNOSUCCESS'
const GROUPSUCCESS = 'GROUPSUCCESS'
const GROUPFULL = 'GROUPFULL'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg_top: "",
    activity_map: {
    },
    medicinelist: [],
    active: '我的拼团',
    nav: [
      {
        name: '拼团首页',
        ico: {
          normal: '../image/home.png',
          active: '../image/home_active.png',
        }
      },
      {
        name: '我的拼团',
        ico: {
          normal: '../image/mygroup.png',
          active: '../image/mygroup_active.png',
        }
      },
    ],
    userGroupList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.handleInit()
  },

  onShareAppMessage(res) {
    //console.log(res)
    const {
      share_title: title,
      share_img_url: imageUrl
    } = this.data.activity_map
    return {
      title,
      imageUrl
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

  handleInit() {
    wx.showLoading({
      title: '加载中...',
    })
    Promise.all([
      this.fetchGroupIndex(),
      this.fetchUserGroupList()
    ])
      .finally((res) => {
        wx.hideLoading()
      })


  },

  fetchGroupIndex() {
    const that = this
    groupApi.groupIndex({
      group_buyid: 1
    }).then((res) => {
      console.log(res);
      const { activity_map, medicinelist } = res
      for (let i = 0; i < medicinelist.length; i++) {
        const { dict_group_buy_medicine_type: type } = medicinelist[i]

        medicinelist[i].img_url =
          tcpImage(medicinelist[i].img_url)

        medicinelist[i].dict_group_buy_medicine_type_word =
          switch$dict_group_buy_medicine_type[type]
      }
      that.setData({
        activity_map,
        medicinelist
      })

    })
  },
  fetchUserGroupList() {
    const that = this
    groupApi
      .userGroupList()
      .then(userGroupList => {
        console.log(userGroupList);
        for (let i = 0; i < userGroupList.length; i++) {
          const {
            dict_group_buy_medicine_type: type,
            dict_Group_status: status,
            group_count,
            offered_count } = userGroupList[i]
          let count_status = GROUPNOSUCCESS
          userGroupList[i].theme_img_url =
            tcpImage(userGroupList[i].theme_img_url)

          userGroupList[i].dict_group_buy_medicine_type_word =
            switch$dict_group_buy_medicine_type[type]

          userGroupList[i].dict_Group_status_word =
            switch$dict_Group_status[status]
          switch (true) {
            case 10 === group_count:
              count_status = GROUPFULL
              break;
            case offered_count < group_count:
              count_status = GROUPSUCCESS
              break;
            default:
              break;
          }
          userGroupList[i].count_status = count_status
        }
        that.setData({
          userGroupList
        })
      })
  },
  fetcchUserGroupDetail(e) {
    const orderno = e.currentTarget.dataset['orderno']
    groupApi.userGroupDetail({ orderno }).then(res => {

    })
  },
  handleSetAcivePage(e) {
    const active = e.currentTarget.dataset['active']
    const title = switchNavigationBarTitle[active]
    wx.setNavigationBarTitle({ title })
    this.setData({
      active
    })
    this.handleInit()
  }
})