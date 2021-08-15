// pages/index/taskList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    datasource:[
      {
        name:"健康问答模块",
        url: "taskdetail",
        items:[
          {
            name:"健康首页",
            type:"get_ASK"
          },
          {
            name:'全部科室',
            type:'get_ASK_all_department'
          },
          {
            name:'全部问题',
            type:'get_ASK_all_question'
          },
          {
            name:'问题分类',
            type:'get_ASK_all_category'
          },
          {
            name:'问题详情',
            type:'get_ask_detail'
          },
          {
            name:'药师主页',
            type:'get_ask_pharmacist'
          },
          {
            name:'我要提问',
            type:'get_submit_ASK'
          },
          {
            name:'问题搜索',
            type:'get_ASK_Search'
          },
          {
            name:'我的问题',
            type:'get_myASK'
          }
        ]
      },
      {
        name: "商品详情模块",
        url: "taskdetail",
        items: [
          {
            name: "商品详情",
            type: "get_shop_goods_detail"
          },
          {
            name: '全部问题',
            type: "goods_detail_qa"
          }
        ]
      },
      {
        name: "首页找药模块",
        url: "taskdetail",
        items: [
          {
            name: "首页",
            type: 'get_home'
          },
          {
            name: '找药页',
            type: 'get_findyao'
          },
          {
            name: '搜索页',
            type: 'get_search'
          }
        ]
      },
      {
        name: "登录模块",
        url: "taskdetail",
        items: [
          {
            name: "登录页",
            type: "get_login"
          },
          {
            name: '密码登录页',
            type: 'get_login_psw'
          },
           {
            name: '绑定手机页',
            type: 'get_bind_phone'
          }
        ]
      },
      {
        name: "消息模块",
        url: "taskdetail",
        items: [
          {
            name: "消息首页",
            type: 'get_message_home'
          },
          {
            name: '消息列表',
            type: 'get_message_list'
          }
        ]
      },
      {
        name: "订单模块",
        url: "/orderModule/pages/YFWOrderModule/YFWOrderListPage/YFWOrderLis",
        items: [
          
        ]
      },
      {
        name: "商家详情模块",
        url: "taskdetail",
        items: [
          {
            name: "商家首页",
            type: 'get_shop_detail'
          },
          {
            name: '商家简介',
            type: 'get_shop_detail_intro'
          },
          {
            name: '全部商品',
            type: 'get_shop_detail_list'
          }
        ]
      },

      {
        name: "个人中心模块",
        url: "taskdetail",
        items: [
          {
            name:"账户管理",
            type:"get_account_management"
          },
          {
            
            name: "地址列表",
            type: "get_address_list"
          },
          {

            name: "新增,编辑地址",
            type: "get_address"
          },
          
          {
            name: "我的评价",
            type:"get_my_evaluation"
          },
          {
            name: "我的投诉",
            type:"get_my_complaint"
          },
          {
            name: "投诉列表",
            type:"get_list_of_complaints"
            
          },
          {
            name: "投诉详情",
            type:"get_complaint_Details"
          },
          {
            name: "药品库搜索导入（用药提醒子页面）",
            type:"get_medication_search"
            
          },
          {
            name: "用药提醒列表",
            type:"get_medication_reminder_list"
           
          },
          {
            name: "用药提醒详情",
            type:"get_medication_reminder_details"
          
          },
          {
            name: "设置",
            type:"get_set"
         
          },
          {
            name: "浏览历史",
            type:"get_rechent_browse"
           
          },
          {
            name: "收藏",
            type:"get_my_collection"
          },
          {
            name: "积分",
            type:"get_my_points"
           
          },
          {
            name: "优惠券",
            type:"get_my_coupon"
          },
          {
            name: "修改姓名",
            type:"get_my_modify_the_name"
           
          },
          {
            name: "修改手机",
            type:"get_my_modify_the_phone"
           
          },
          {
            name: "修改QQ",
            type:"get_my_modify_the_QQ"
           
          },
          {
            name: "修改固话",
            type:"get_my_modify_the_fiexd-line"
           
          },
          {
            name: "修改密码",
            type:"get_my_modify_the_password"
            
          },
          {
            name: "意见反馈",
            type:"get_feed_back"
           
          },
          {
            name: "联系我们",
            type:"get_contact_us"
          
          },
          { 
            name:"联系我们在线客服",
            type:"get_contact_us_line"
          },
          {
            name: "关于我们",
            type: "get_about_us"

          },
          {
            name: "在线客服",
            type:"get_online_customer_service"
            
          },
        ]
      },
      {
        name: "比价模块",
        url: "taskdetail",
        items: [
          {
            name: '比价页',
            type: 'get_goods_detail'
          },
          {
            name: '价格趋势',
            type: 'get_price_trend'
          }
        ]
      },
      {
        name: "购物车结算模块",
        url: "taskdetail",
        items: [
          {
            name: '购物车',
            type: 'get_shopping_car'
          },
          {
            name: '结算页',
            type: 'get_settlement'
          },
          {
            name: '订单提交成功页',
            type: 'get_ordersubmit'
          }
        ]
      }


    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  toDetail:function(event){
    var item = event.currentTarget.dataset.item
    var parames = JSON.stringify(item)
    var url = item.url + "?parames=" + parames
    wx.navigateTo({
      url: url
    })
  }
})