import Taro, { Component, Config } from '@tarojs/taro'
import Index from './page/index'
import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
 
     //项目配置
  config: Config = {
    pages: [
      'page/tabBar/YFWHomePage/YFWHome',
      'components/YFWWebView/YFWWebView',
      'page/tabBar/YFWFindYaoPage/YFWFindYao',
      'page/tabBar/YFWShopCarPage/YFWShopCar',
      'page/tabBar/YFWUserCenterPage/YFWUserCenter'
    ],
    subPackages: [
      {
        root: 'page/pages/',
        pages: [
          'YFWShopCarModule/YFWOrderSettlementPage/YFWOrderSettlement',
          'YFWShopCarModule/YFWOrderSubmitSuccessPage/YFWOrderSubmitSuccess',
          'YFWSellersListModule/YFWSellersListViewPage/YFWSellersListView',
          'YFWSellersListModule/YFWPriceTrendViewPage/YFWPriceTrendView',
          'YFWUserCenterModule/YFWAddressListPage/YFWAddressList',
          'YFWUserCenterModule/YFWMedicinePage/index',
          'YFWUserCenterModule/YFWMedicinePage/addDrug/index',
          'YFWUserCenterModule/YFWMyPointsPage/YFWMyPoints',
          'YFWMessageModule/YFWMessageHomePage/YFWMessageHome',
          'YFWMessageModule/YFWMessageListPage/YFWMessageList',
          'YFWUserCenterModule/YFWFeedBackPage/YFWFeedBack',
          'YFWUserCenterModule/YFWMyCouponPage/YFWMyCoupon',
          'YFWUserCenterModule/YFWContactUsPage/YFWContactUs',
          'YFWUserCenterModule/YFWModifyThePhonePage/YFWModifyThePhone',
          'YFWUserCenterModule/YFWModifyTheQQPage/YFWModifyTheQQ',
          'YFWUserCenterModule/YFWRecentBrowsePage/YFWRecentBrowse',
          'YFWUserCenterModule/YFWMyCollectionPage/YFWMyCollection',
          'YFWUserCenterModule/YFWModifyTheNamePage/YFWModifyTheName',
          'YFWUserCenterModule/YFWComplaintDetailsPage/YFWComplaintDetails',
          'YFWUserCenterModule/YFWMyComplaintPage/YFWMyComplaint',
          'YFWOrderModule/YFWOrderEvaluationPage/YFWOrderEvaluation',
          'YFWUserCenterModule/YFWMyEvaluationPage/YFWMyEvaluation',
          'YFWUserCenterModule/YFWAboutUsPage/YFWAboutUs',
          'YFWUserCenterModule/YFWAccountManagementPage/YFWAccountManagement',
          'YFWLoginModule/YFWLoginPage/YFWLogin',
          'YFWLoginModule/YFWAuthorLoginPage/YFWAuthorLogin',
          'YFWLoginModule/YFWBindPhonePage/YFWBindPhone',
          'YFWUserCenterModule/YFWSetPage/YFWSet',
          'YFWUserCenterModule/YFWAddressPage/YFWAddress',
          'YFWGoodsDetailModule/YFWGoodsDetailPage/YFWGoodsDetail',
          'YFWGoodsDetailModule/YFWGoodsDetailQAPage/YFWGoodsDetailQA',
          'YFWGoodsDetailModule/YFWGoodsAllCommentsPage/YFWGoodsAllComments',
          'YFWStoreModule/YFWShopDetailHomePage/YFWShopDetailHome',
          'YFWStoreModule/YFWShopDetailAllGoodsListPage/YFWShopDetailAllGoodsList',
          'YFWStoreModule/YFWShopDetailIntroPage/YFWShopDetailIntro',
          'YFWHomeFindModule/YFWCategoryPage/YFWCategory',
          'YFWHomeFindModule/YFWAroundStorePage/YFWAroundStore',
          'YFWHomeFindModule/YFWSearchPage/YFWSearch',
          'YFWHomeFindModule/YFWSubCategoryPage/YFWSubCategory',
          'YFWOrderModule/YFWOrderListPage/YFWOrderLis',
          'YFWOrderModule/YFWOrderDetailPage/YFWOrderDetail',
          'YFWOrderModule/YFWLogisticsDetailsPage/YFWLogisticsDetails',
          'YFWOrderModule/YFWOrderSerchPage/YFWOrderSearch',
          'YFWOrderModule/YFWEditeReturnPage/YFWEditeReturnPage',
          'YFWOrderModule/YFWChooseReturnTypePage/YFWChooseReturnTypePage',
          'YFWOrderModule/YFWDetailsOfRefundPage/YFWDetailsOfRefund',
          'YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn',
          'YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage',
          'YFWOrderModule/YFWSendReturnPage/YFWSendReturnGoods',
          'YFWOrderModule/YFWCancleOrderPage/YFWCancleOrderPage',
          'YFWOrderModule/YFWEditeReturnWithOutGoodsPage/YFWEditeReturnWithOutGoodsPage',
          'YFWOrderModule/YFWComplaintOrderPage/YFWComplaintOrder',
          'YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt',
          'YFWOrderModule/YFWUploadPrescriptionInfoPage/YFWUploadPrescriptionInfo',
          'YFWUserCenterModule/YFWModifyThePhoneNextPage/YFWModifyThePhoneNext',
          'YFWJumpCenter/YFWJumpCenter'
        ]
      }
    ],
    preloadRule: {
      'page/tabBar/YFWHomePage/YFWHome': {
        'network': 'all',
        'packages': ['page/pages/']
      }
    },
    window: {
      navigationBarBackgroundColor: '#49ddb8',
      navigationBarTextStyle: 'white',
      navigationBarTitleText: '药房网商城',
      backgroundTextStyle: 'dark',
      backgroundColor: '#fff'
    },
    tabBar: {
      selectedColor: '#27BF8F',
      color: '#333333',
      backgroundColor: '#fff',
      borderStyle: 'white',
      list: [
        {
          selectedIconPath: 'images/tab/bottom_home_selected3x.png',
          iconPath: 'images/tab/bottom_home3x.png',
          pagePath: 'page/tabBar/YFWHomePage/YFWHome',
          text: '首页'
        },
        {
          selectedIconPath: 'images/tab/bottom_Seek_selected3x.png',
          iconPath: 'images/tab/bottom_Seek3x.png',
          pagePath: 'page/tabBar/YFWFindYaoPage/YFWFindYao',
          text: '找药'
        },
        {
          selectedIconPath: 'images/tab/bottom_cart_selected3x.png',
          iconPath: 'images/tab/bottom_cart3x.png',
          pagePath: 'page/tabBar/YFWShopCarPage/YFWShopCar',
          text: '购物车'
        },
        {
          selectedIconPath: 'images/tab/bottom_user_selected3x.png',
          iconPath: 'images/tab/bottom_user3x.png',
          pagePath: 'page/tabBar/YFWUserCenterPage/YFWUserCenter',
          text: '我的'
        }
      ]
    },
    permission: {
      'scope.userLocation': {
        desc: '你的位置信息将用于小程序位置接口的效果展示'
      }
    },
    debug: false,
  }

  componentDidMount () {
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))