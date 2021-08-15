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
      'page/tabBar/YFWUserCenterPage/YFWUserCenter',
      'page/pages/YFWOrderModule/YFWMessage/YFWMessage',
      'page/pages/YFWShopCarModule/YFWOrderSettlementPage/YFWOrderSettlement',
      'page/pages/YFWShopCarModule/YFWOrderSubmitSuccessPage/YFWOrderSubmitSuccess',
      "page/pages/YFWShopCarModule/YFWInquiryInfoPage/YFWInquiryInfoPage",
      'page/pages/YFWSellersListModule/YFWSellersListViewPage/YFWSellersListView',
      'page/pages/YFWSellersListModule/YFWPriceTrendViewPage/YFWPriceTrendView',
      'page/pages/YFWUserCenterModule/YFWAddressListPage/YFWAddressList',
      'page/pages/YFWUserCenterModule/YFWMyPointsPage/YFWMyPoints',
      'page/pages/YFWMessageModule/YFWMessageHomePage/YFWMessageHome',
      'page/pages/YFWMessageModule/YFWMessageListPage/YFWMessageList',
      'page/pages/YFWUserCenterModule/YFWFeedBackPage/YFWFeedBack',
      'page/pages/YFWUserCenterModule/YFWMyCouponPage/YFWMyCoupon',
      'page/pages/YFWUserCenterModule/YFWContactUsPage/YFWContactUs',
      'page/pages/YFWUserCenterModule/YFWMedicinePage/index',
      'page/pages/YFWUserCenterModule/YFWMedicinePage/addDrug/index',
      'page/pages/YFWUserCenterModule/YFWModifyThePhonePage/YFWModifyThePhone',
      'page/pages/YFWUserCenterModule/YFWModifyTheQQPage/YFWModifyTheQQ',
      'page/pages/YFWUserCenterModule/YFWRecentBrowsePage/YFWRecentBrowse',
      'page/pages/YFWUserCenterModule/YFWMyCollectionPage/YFWMyCollection',
      'page/pages/YFWUserCenterModule/YFWModifyTheNamePage/YFWModifyTheName',
      'page/pages/YFWUserCenterModule/YFWComplaintDetailsPage/YFWComplaintDetails',
      'page/pages/YFWUserCenterModule/YFWMyComplaintPage/YFWMyComplaint',
      'page/pages/YFWOrderModule/YFWOrderEvaluationPage/YFWOrderEvaluation',
      'page/pages/YFWUserCenterModule/YFWMyEvaluationPage/YFWMyEvaluation',
      'page/pages/YFWUserCenterModule/YFWAboutUsPage/YFWAboutUs',
      'page/pages/YFWUserCenterModule/YFWAccountManagementPage/YFWAccountManagement',
      'page/pages/YFWLoginModule/YFWLoginPage/YFWLogin',
      'page/pages/YFWLoginModule/YFWAuthorLoginPage/YFWAuthorLogin',
      'page/pages/YFWLoginModule/YFWBindPhonePage/YFWBindPhone',
      'page/pages/YFWUserCenterModule/YFWSetPage/YFWSet',
      'page/pages/YFWUserCenterModule/YFWAddressPage/YFWAddress',
      'page/pages/YFWGoodsDetailModule/YFWGoodsDetailPage/YFWGoodsDetail',
      'page/pages/YFWGoodsDetailModule/YFWGoodsDetailQAPage/YFWGoodsDetailQA',
      'page/pages/YFWGoodsDetailModule/YFWGoodsAllCommentsPage/YFWGoodsAllComments',
      'page/pages/YFWStoreModule/YFWShopDetailHomePage/YFWShopDetailHome',
      'page/pages/YFWStoreModule/YFWShopDetailAllGoodsListPage/YFWShopDetailAllGoodsList',
      'page/pages/YFWStoreModule/YFWShopDetailIntroPage/YFWShopDetailIntro',
      'page/pages/YFWHomeFindModule/YFWCategoryPage/YFWCategory',
      'page/pages/YFWHomeFindModule/YFWAroundStorePage/YFWAroundStore',
      'page/pages/YFWHomeFindModule/YFWSearchPage/YFWSearch',
      'page/pages/YFWHomeFindModule/YFWSubCategoryPage/YFWSubCategory',
      'page/pages/YFWOrderModule/YFWOrderListPage/YFWOrderLis',
      'page/pages/YFWOrderModule/YFWOrderDetailPage/YFWOrderDetail',
      'page/pages/YFWOrderModule/YFWLogisticsDetailsPage/YFWLogisticsDetails',
      'page/pages/YFWOrderModule/YFWOrderSerchPage/YFWOrderSearch',
      'page/pages/YFWOrderModule/YFWEditeReturnPage/YFWEditeReturnPage',
      'page/pages/YFWOrderModule/YFWChooseReturnTypePage/YFWChooseReturnTypePage',
      'page/pages/YFWOrderModule/YFWDetailsOfRefundPage/YFWDetailsOfRefund',
      'page/pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn',
      'page/pages/YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage',
      'page/pages/YFWOrderModule/YFWSendReturnPage/YFWSendReturnGoods',
      'page/pages/YFWOrderModule/YFWCancleOrderPage/YFWCancleOrderPage',
      'page/pages/YFWOrderModule/YFWEditeReturnWithOutGoodsPage/YFWEditeReturnWithOutGoodsPage',
      'page/pages/YFWOrderModule/YFWComplaintOrderPage/YFWComplaintOrder',
      'page/pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt',
      'page/pages/YFWOrderModule/YFWUploadPrescriptionInfoPage/YFWUploadPrescriptionInfo',
      'page/pages/YFWUserCenterModule/YFWModifyThePhoneNextPage/YFWModifyThePhoneNext',
      'page/pages/YFWJumpCenter/YFWJumpCenter',
      'page/pages/YFWAskModule/YFWHealthAskHomePage/YFWHealthAskHome',
      'page/pages/YFWAskModule/YFWHealthAskSearchPage/YFWHealthAskSearch',
      'page/pages/YFWAskModule/YFWHealthAskAllQuestionPage/YFWHealthAskAllQuestion',
      'page/pages/YFWAskModule/YFWHealthAskCategoryQuestionPage/YFWHealthAskCategoryQuestion',
      'page/pages/YFWAskModule/YFWHealthMyAskPage/YFWHealthMyAsk',
      'page/pages/YFWAskModule/YFWHealthAskQuestionsPage/YFWHealthAskQuestions',
      'page/pages/YFWAskModule/YFWHealthAskDetailPage/YFWHealthAskDetail',
      'page/pages/YFWAskModule/YFWHealthAskPharmacistHomePage/YFWHealthAskPharmacistHome',
      'page/pages/YFWUserCenterModule/YFWChangeThePasswordPage/YFWChangeThePassword',
      'page/pages/YFWUserCenterModule/YFWSafePage/YFWSafePage',
      'page/pages/YFWUserCenterModule/YFWcancellation/YFWcancellation',
      'page/pages/YFWUserCenterModule/YFWAccountverify/YFWAccountverify',
      'page/pages/YFWUserCenterModule/YFWMyPointsDetail/YFWMyPointsDetail',
      'page/pages/YFWShopCarModule/YFWNrollmentPage/YFWNrollment',
      "page/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitation",
      "page/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitationOldUser",
      "page/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitationNewUser",
      "page/pages/YFWUserCenterModule/YFWInvitatioReappearancePage/YFWInvitatioReappearance",
      "page/pages/YFWUserCenterModule/YFWInvitationPage/YFWLLTX",
      "page/pages/YFWUserCenterModule/YFWInvitationPage/YFWTxRecord",
      "page/pages/YFWUserCenterModule/YFWInvitationPage/YFWExchangePoints",
      "page/pages/YFWHomeFindModule/YFWVideoPage/YFWVideoPage",
      "page/pages/YFWUserCenterModule/YFWMyCouponPage/YFWMYCouponType"
    ],
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