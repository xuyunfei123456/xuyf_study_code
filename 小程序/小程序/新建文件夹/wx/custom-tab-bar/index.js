import {
  IndexApi,
} from '../apis/index.js'
const indexApi = new IndexApi()
Component({
  data: {
    url:"",
    hasActivity:false,
    carCount:0,
    selected: null,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list:  [
      {
        "selectedIconPath": "/images/tab/bottom_home_selected@3x.png",
        "iconPath": "/images/tab/bottom_home@3x.png",
        "pagePath": "/pages/YFWHomeFindModule/YFWHomePage/YFWHome",
        "text": "首页"
      },
      {
        "selectedIconPath": "/images/tab/bottom_Seek_selected@3x.png",
        "iconPath": "/images/tab/bottom_Seek@3x.png",
        "pagePath": "/pages/YFWHomeFindModule/YFWFindYaoPage/YFWFindYao",
        "text": "找药"
      },
      {
        "selectedIconPath": "/images/tab/bottom_cart_selected@3x.png",
        "iconPath": "/images/tab/bottom_cart@3x.png",
        "pagePath": "/pages/YFWShopCarModule/YFWShopCarPage/YFWShopCar",
        "text": "购物车"
      },
      {
        "selectedIconPath": "/images/tab/bottom_user_selected@3x.png",
        "iconPath": "/images/tab/bottom_user@3x.png",
        "pagePath": "/pages/YFWUserCenterModule/YFWUserCenterPage/YFWUserCenter",
        "text": "我的"
      }
    ]
  },
  attached() {
    var obj = this.createSelectorQuery();
    obj.select('.tab-bar').boundingClientRect(function (rect) {
      console.log('获取tabBar元素的高度',rect.height);
      wx.setStorageSync('tabBarHeight', rect.height)     // 将获取到的高度设置缓存，以便之后使用
    }).exec();
    indexApi.getTbbarBtn().then(res=>{
      
    })
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
    },
    activityClick(){
      
    }
  }
})