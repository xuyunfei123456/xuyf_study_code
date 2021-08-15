export default {
    pages: [
      'page/tabBar/Home/Home',
      'page/confirmReceipt/confirmReceipt',
      'page/confirmReceiptQRcode/confirmReceiptQRcode',
      'page/invoiceShow/invoiceShow',
      'page/invoiceDetail/invoiceDetail',
      'page/applyRefund/applyRefund',
      'page/YFWInquiryInfoPage/YFWInquiryInfoPage',
      'page/consultationDetail/consultationDetail',
      'page/login/login',
      'page/buSlfOrderDetail/buSlfOrderDetail',
      'page/tabBar/Order/Order',
      'page/submitOrder/submitOrder',
      'page/buyMedicine/buyMedicine',
      'page/search/search',
      'page/shippingAddress/shippingAddress',
      'page/sickPerson/sickPerson',
      'page/tabBar/Consultation/Consultation',
      'page/tabBar/Personal/Personal',
      'page/visitedStore/visitedStore',
      'page/storeList/storeList',
      'page/addressList/addressList',
      'page/storeDetails/storeDetails',
      'page/commodityDetail/commodityDetail',
      'page/addConsultation/addConsultation',
      'page/sickList/sickList',
      'page/map/map',
      'page/recipedetails/recipedetails',
      'page/shopSendDetail/shopSendDetail',
    ],
    window: {
      navigationBarTitleText: '视塔',
      backgroundTextStyle: 'dark',
      backgroundColor: '#fff',
      navigationBarBackgroundColor: '#fff',
      navigationBarTextStyle: 'black',
    },
    tabBar: {
      selectedColor: '#27BF8F',
      color: '#333333',
      backgroundColor: '#fff',
      borderStyle: 'white', 
      list: [
        {
          selectedIconPath: 'images/tab/homeSelected.png',
          iconPath: 'images/tab/home.png',
          pagePath: 'page/tabBar/Home/Home',
          text: '首页'
        },
        {
          selectedIconPath: 'images/tab/orderSelected.png',
          iconPath: 'images/tab/order.png',
          pagePath: 'page/tabBar/Order/Order',
          text: '订单'
        },
        {
          selectedIconPath: 'images/tab/consultationSelected.png',
          iconPath: 'images/tab/consultation.png',
          pagePath: 'page/tabBar/Consultation/Consultation',
          text: '问诊单'
        },
        {
          selectedIconPath: 'images/tab/userSelected.png',
          iconPath: 'images/tab/user.png',
          pagePath: 'page/tabBar/Personal/Personal',
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
