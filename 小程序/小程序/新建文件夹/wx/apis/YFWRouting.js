//健康问答模块
var GET_ASK = 'get_ASK' //问答页面
var GET_ASK_SEARCH = 'get_ASK_Search' //问答搜索页面
var GET_ASK_ALL_DEPARTMENT = 'get_ASK_all_department' //问答所有科室页面
var GET_ASK_ALL_QUESTION = 'get_ASK_all_question' //问答所有问答
var GET_ASK_ALL_CATEGORY = 'get_ASK_all_category' //问答分类
var GET_MYASK = 'get_myASK' //我的问答
var GET_SUBMIT_ASK = 'get_submit_ASK' //提问页面
var GET_ASK_DETAIL = 'get_ask_detail' //问题详情页面
var GET_ASK_PHARMACIST = 'get_ask_pharmacist' //问答药师页面
var RANKDETAIL = 'rankDetail'
var GET_NROLLMENT = 'get_nrollment'
//商品详情模块
var GET_SHOP_GOODS_DETAIL = 'get_shop_goods_detail' //商品详情
var GOODS_DETAIL_QA = 'goods_detail_qa' //商品详情问答
var GOODS_DETAIL_ALL_COMMENTS = 'goods_detail_all_comments' //商品详情全部评论
var DISCOUNT_NOTICE_PAGE = 'discount_notice_page'
var INVITAION_OLDUSER = 'invitation_oldUser' //老用户邀请页
var INVITAION_NEWUSER = 'invitation_newUser' //新用户邀请页
//首页找药模块
var GET_HOME = 'get_home' //首页
var GET_FINDYAO = 'get_findyao' //找药页
var GET_SEARCH = 'get_search' //搜索页面
var GET_CATEGORY = 'get_all_category' //商品分类
var GET_SUB_CATEGORY = 'get_category' //分类结果
var GET_AROUND_STORE = 'get_around_store' //附近药店

//登录模块
var GET_LOGIN = 'get_login' //登录页面
var GET_LOGIN_PSW = 'get_login_psw' //密码登录
var GET_BIND_PHONE = 'get_bind_phone' //绑定手机
var GET_AUTHOR_LOGIN = 'get_author_login' //授权登录

//消息模块
var GET_MESSAGE_HOME = 'get_message_home' //消息首页
var GET_MESSAGE_LIST = 'get_message_list' //消息列表页面

//订单模块
var GET_ORDER_LIST = 'get_order_list' //订单列表
var GET_ORDER_EVALUATION = 'get_order_evaluation' //订单评价
var GET_SUCCESS_RECEIPT = 'get_success_receipt' //确认收货
var GET_ORDER_DETAIL = 'get_order_detail' //订单详情
var GET_LOGISTICS_DETAIL = 'get_logistics_detail' //物流详情
var GET_APPLICATION_RETURN = 'get_application_return' //申请退款（已付款、未发货）
var GET_CHOOSE_RETURN_TYPE = 'get_choose_return_type' //选择退货款类型
var ORDER_REQUEST_MONEY_DETAIL = 'order_request_money_detail' //申请退款详情
var GET_EDITE_RETURN = 'get_edite_return' //退货款页
var GET_ORDER_SEARCH = 'get_order_search' //订单搜索
var GET_RETURN_WITHOUTGOODS = 'get_return_withoutgoods' //申请退货款（未收到货）
var GET_CANCLEORDER = 'get_cancle_order' //取消订单
var GET_COMPLAINT_ORDER = 'get_complaint_order' //投诉订单
var GET_DETAIL_REFUND = 'get_detail_refund' //退货款详情
var GET_RETURN_NEGOTIATION = 'get_return_negotiation' //协商详情
var GET_LOGISTICS_COMPANY = 'get_logistics_company' //退货物流公司
var GET_SEND_RETURN_GOODS = 'get_send_return_goods' //发出退货
var GET_UPLOAD_RX_INFO = 'get_upload_rx_info' //上传处方
var GET_CHECK_ORDER_STATUS = 'get_check_order_status' //订单操作转态页面
var CONFIRM_RECEIPT_PAGE = 'confirm_receipt_page'
var GET_INVOICE_DETAIL = 'get_invoice_detail'
var GET_INVOICE_PAGE = 'get_invoice_page'
var GET_PRESCRIPTION_DETAIL = 'get_prescription_detail_page'
var GET_TS = 'get_ts'
var CHECK_BATCH_PAGE = 'check_batch_page' //  查看批号说明
var CONFIRMRECEIVE = 'confirmReceive' //确认收货
var MESSAGE = 'message' //留言
//商家详情模块
var GET_SHOP_DETAIL = 'get_shop_detail' //商家详情页面
var GET_SHOP_DETAIL_LIST = 'get_shop_detail_list' //商家商品列表
var GET_SHOP_DETAIL_INTRO = 'get_shop_detail_intro' //商家简介

//个人中心模块
var GET_USER_CENTER = 'get_user_center' //个人中心
var GET_ADDRESS_LIST = 'get_address_list' //地址列表
var GET_ADDRESS = 'get_address' // 新增，編輯地址
var GET_ACCOUNT_MANAGEMENT = 'get_account_management' //账户管理
var GET_MY_EVALUATION = 'get_my_evaluation' //我的评价
var GET_MY_COMPLAINT = 'get_my_complaint' //我的投诉
var GET_MEDICINE_PERSON = 'get_medicine_person' //用药人
var ADD_DRUG = 'add_drug' //新增用药人
var GET_LIST_OF_COMPLAINTS = 'get_list_of_complaints' //投诉列表
var GET_COMPLAINT_DETAILS = 'get_complaint_Details' //投诉详情
var GET_MEDICATION_SEARCH = 'get_medication_search' //药品库搜索导入（用药提醒子页面）
var GET_MEDICATION_REMINDER_LIST = 'get_medication_reminder_list' //用药提醒列表
var GET_MEDICATION_REMINDER_DETAILS = 'get_medication_reminder_details' //用要提醒详情
var GET_SET = 'get_set' //设置
var GET_RECENT_BROWSE = 'get_rechent_browse' //浏览历史
var GET_MY_COLLECTION = 'get_my_collection' //收藏
var GET_MY_POINTS = 'get_my_points' //积分
var GET_MY_COUPON = 'get_my_coupon' //优惠券
var GET_COUPON_RECORD = 'get_coupon_record' //优惠券使用记录页
var GET_MY_MODIFY_THE_NAME = 'get_my_modify_the_name' //修改姓名
var GET_MY_MODIFY_THE_PHONE = 'get_my_modify_the_phone' //修改手机
var GET_MY_MODIFY_THE_QQ = 'get_my_modify_the_QQ' //修改qq
var GET_MY_MODIFY_THE_PASSWORD = 'get_my_modify_the_password' //修改密码
var GET_FEED_BACK = 'get_feed_back' //意见反馈
var GET_CONTACT_US = 'get_contact_us' //联系我们
var GET_CONTACT_US_LINE = 'get_contact_us_line' //联系我们在线客服
var GET_ABOUT_US = 'get_about_us' //关于我们
var GET_ONLINE_CUSTOMER_SERVICE = 'get_online_customer_service' //在线客服
var CANCELLATION = 'cancel_account' //注销账号
var ACCOUNT_VERIFY = 'account_verify' //注销时账号验证
var GETSAFE = 'get_safe' // 安全管理

//比价模块
var GET_GOODS_DETAIL = 'get_goods_detail' //比价页面
var GET_PRICE_TREND = 'get_price_trend' //价格趋势页面
var GET_CHOSE_MERCHANT = 'get_chose_cerchant' //同店购选择店铺页

//购物车结算模块
var GET_SHOPPINGCAR = 'get_shopping_car' //购物车
var GET_SETTLEMENT = 'get_settlement' //结算
var GET_ORDERSUBMIT = 'get_ordersubmit' //订单提交成功
var GET_INQUIRY_INFO = 'get_inquiry_info' //订单提交成功

var GET_HTML = 'get_h5' //跳转到H5页面
var GET_H5 = 'receive_h5'

var LLTX = 'lltx'; //立即体现
var TXRECORD = 'txrecord'; //提现记录
var EXCHANGE_POINTS = 'exchange_points' //兑换积分
var YYYJ = 'yyyj' //邀请有奖
// 健康汇
var HEALTH_HUI = 'health_hui'
var HEALTH_HUI_HOT_TOPIC = 'health_hui_hot_topic'
var GROUPINDEX = 'grounp_index'
var GROUPDETAIL = 'groupDetail'
var GROUPGOODSDETAIL = 'groupGoodsDetail'
export function pushNavigation(type, params, jumptype) {
  let url
  switch (type) {
    case GROUPDETAIL:
      url = '/orderModule/pages/YFWGroupModule/YFWGroupDetail/groupDetail'
      break;
    case GROUPGOODSDETAIL:
      url = '/orderModule/pages/YFWGroupModule/YFWGroupGoodsDetail/groupGoodsDetail'
      break;
    case GROUPINDEX:
      url = "/orderModule/pages/YFWGroupModule/YFWGroupIndex/GroupIndex"
      break;
    case HEALTH_HUI_HOT_TOPIC:
      url = "/myCenter/pages/YFWUserCenterModule/HealthHuiHotTopic/HealthHuiHotTopic"
      break
    case HEALTH_HUI:
      url = "/myCenter/pages/YFWUserCenterModule/YFWHealthHuiPage/YFWHealthHui"
      break
    case RANKDETAIL:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyPointsDetail/YFWMyPointsDetail"
      break
    case GET_ASK:
      url = "/pages/YFWAskModule/YFWHealthAskHomePage/YFWHealthAskHome"
      break
    case GET_ASK_SEARCH:
      url = "/pages/YFWAskModule/YFWHealthAskSearchPage/YFWHealthAskSearch"
      break
    case GET_ASK_ALL_DEPARTMENT:
      url = "/pages/YFWAskModule/YFWHealthAskAllDepartmentPage/YFWHealthAskAllDepartment"
      break
    case GET_ASK_ALL_QUESTION:
      url = "/pages/YFWAskModule/YFWHealthAskAllQuestionPage/YFWHealthAskAllQuestion"
      break
    case GET_ASK_ALL_CATEGORY:
      url = "/pages/YFWAskModule/YFWHealthAskCategoryQuestionPage/YFWHealthAskCategoryQuestion"
      break
    case GET_MYASK:
      url = "/pages/YFWAskModule/YFWHealthMyAskPage/YFWHealthMyAsk"
      break
    case GET_SUBMIT_ASK:
      url = "/pages/YFWAskModule/YFWHealthAskQuestionsPage/YFWHealthAskQuestions"
      break
    case GET_ASK_DETAIL:
      url = "/pages/YFWAskModule/YFWHealthAskDetailPage/YFWHealthAskDetail"
      break
    case GET_ASK_PHARMACIST:
      url = "/pages/YFWAskModule/YFWHealthAskPharmacistHomePage/YFWHealthAskPharmacistHome"
      break
    case GET_SHOP_GOODS_DETAIL:
      url = "/pages/YFWGoodsDetailModule/YFWGoodsDetailPage/YFWGoodsDetail"
      break
    case GOODS_DETAIL_QA:
      url = "/pages/YFWGoodsDetailModule/YFWGoodsDetailQAPage/YFWGoodsDetailQA"
      break
    case GET_HOME:
      url = "/pages/YFWHomeFindModule/YFWHomePage/YFWHome"
      break
    case GET_FINDYAO:
      url = "/pages/YFWHomeFindModule/YFWFindYaoPage/YFWFindYao"
      break
    case GET_SEARCH:
      url = "/pages/YFWHomeFindModule/YFWSearchPage/YFWSearch"
      break
    case GET_LOGIN:
      url = "/pages/YFWLoginModule/YFWLoginPage/YFWLogin"
      break
    case GET_LOGIN_PSW:
      url = "/pages/YFWLoginModule/YFWLoginByPswPage/YFWLoginByPsw"
      break
    case GET_MESSAGE_HOME:
      url = "/pages/YFWMessageModule/YFWMessageHomePage/YFWMessageHome"
      break
    case GET_MESSAGE_LIST:
      url = "/pages/YFWMessageModule/YFWMessageListPage/YFWMessageList"
      break
    case GET_SHOP_DETAIL:
      url = "/pages/YFWStoreModule/YFWShopDetailHomePage/YFWShopDetailHome"
      break
    case GET_SHOP_DETAIL_INTRO:
      url = "/pages/YFWStoreModule/YFWShopDetailIntroPage/YFWShopDetailIntro"
      break
    case GET_SHOP_DETAIL_LIST:
      url = "/pages/YFWStoreModule/YFWShopDetailAllGoodsListPage/YFWShopDetailAllGoodsList"
      break
    case GET_GOODS_DETAIL:
      url = "/pages/YFWSellersListModule/YFWSellersListViewPage/YFWSellersListView"
      break
    case GET_PRICE_TREND:
      url = "/pages/YFWSellersListModule/YFWPriceTrendViewPage/YFWPriceTrendView"
      break
    case GET_SHOPPINGCAR:
      url = "/pages/YFWShopCarModule/YFWShopCarPage/YFWShopCar"
      break
    case GET_SETTLEMENT:
      url = "/pages/YFWShopCarModule/YFWOrderSettlementPage/YFWOrderSettlement"
      break
    case GET_NROLLMENT:
      url = "/pages/YFWShopCarModule/YFWNrollmentPage/YFWNrollment"
      break
    case GET_ORDERSUBMIT:
      url = "/pages/YFWShopCarModule/YFWOrderSubmitSuccessPage/YFWOrderSubmitSuccess"
      break
    case GET_INQUIRY_INFO:
      url = "/pages/YFWShopCarModule/YFWInquiryInfoPage/YFWInquiryInfoPage"
      break
    case GET_BIND_PHONE:
      url = "/pages/YFWLoginModule/YFWBindPhonePage/YFWBindPhone"
      break
    case GET_ORDER_EVALUATION:
      url = "/orderModule/pages/YFWOrderModule/YFWOrderEvaluationPage/YFWOrderEvaluation"
      break
    case GET_CATEGORY:
      url = "/pages/YFWHomeFindModule/YFWCategoryPage/YFWCategory"
      break
    case GET_SUCCESS_RECEIPT:
      url = "/orderModule/pages/YFWOrderModule/YFWSuccessfulreceiptPage/YFWSuccessfulReceipt"
      break
    case GET_AROUND_STORE:
      url = "/pages/YFWHomeFindModule/YFWAroundStorePage/YFWAroundStore"
      break
    case GET_SUB_CATEGORY:
      url = "/pages/YFWHomeFindModule/YFWSubCategoryPage/YFWSubCategory"
      break
    case GET_ORDER_DETAIL:
      url = "/orderModule/pages/YFWOrderModule/YFWOrderDetailPage/YFWOrderDetail"
      break
    case GET_PRESCRIPTION_DETAIL:
      url = "/orderModule/pages/YFWOrderModule/YFWPrescriptionDetailPage/YFWPrescriptionDetailPage"
      break
    case GET_LOGISTICS_DETAIL:
      url = "/orderModule/pages/YFWOrderModule/YFWLogisticsDetailsPage/YFWLogisticsDetails"
      break
    case GET_CHOSE_MERCHANT:
      url = "/pages/YFWSellersListModule/YFWChoseMerchantPage/YFWChoseMerchant"
      break
    case GET_APPLICATION_RETURN:
      url = "/orderModule/pages/YFWOrderModule/YFWApplicationForReturnPage/ApplicationForReturn"
      break
    case GET_CHOOSE_RETURN_TYPE:
      url = "/orderModule/pages/YFWOrderModule/YFWChooseReturnTypePage/YFWChooseReturnTypePage"
      break
    case ORDER_REQUEST_MONEY_DETAIL:
      url = "/orderModule/pages/YFWOrderModule/YFWReturnGoodsPage/YFWReturnGoods"
      break
    case GET_EDITE_RETURN:
      url = "/orderModule/pages/YFWOrderModule/YFWEditeReturnPage/YFWEditeReturnPage"
      break
    case GET_ORDER_LIST:
      url = "/orderModule/pages/YFWOrderModule/YFWOrderListPage/YFWOrderLis"
      break
    case INVITAION_OLDUSER:
      url = "/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitationOldUser"
      break
    case LLTX:
      url = "/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWLLTX"
      break
    case TXRECORD:
      url = "/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWTxRecord"
      break
    case EXCHANGE_POINTS:
      url = "/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWExchangePoints"
      break
    case YYYJ:
      url = "/myCenter/pages/YFWUserCenterModule/YFWInvitatioReappearancePage/YFWInvitatioReappearance"
      break
    case INVITAION_NEWUSER:
      url = "/myCenter/pages/YFWUserCenterModule/YFWInvitationPage/YFWInvitationNewUser"
      break
    case GET_ADDRESS_LIST:
      url = "/myCenter/pages/YFWUserCenterModule/YFWAddressListPage/YFWAddressList"
      break
    case GET_ADDRESS:
      url = "/myCenter/pages/YFWUserCenterModule/YFWAddressPage/YFWAddress"
      break
    case GET_ACCOUNT_MANAGEMENT:
      url = "/myCenter/pages/YFWUserCenterModule/YFWAccountManagementPage/YFWAccountManagement"
      break
    case GET_MY_EVALUATION:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyEvaluationPage/YFWMyEvaluation"
      break
    case GET_MY_COMPLAINT:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyComplaintPage/YFWMyComplaint"
      break
    case GET_MEDICINE_PERSON:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMedicinePage/index"
      break
    case GET_LIST_OF_COMPLAINTS:
      url = "/myCenter/pages/YFWUserCenterModule/YFWListOfComplaintsPage/YFWListOfComplaints"
      break
    case GET_COMPLAINT_DETAILS:
      url = "/myCenter/pages/YFWUserCenterModule/YFWComplaintDetailsPage/YFWComplaintDetails"
      break
    case GET_MEDICATION_SEARCH:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMedicationSearchPage/YFWMedicationSearch"
      break
    case GET_MEDICATION_REMINDER_LIST:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMedicationReminderListPage/YFWMedicationReminderList"
      break
    case GET_MEDICATION_REMINDER_DETAILS:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMedicationReminderDetailsPage/YFWMedicationReminderDetails"
      break
    case GET_INVOICE_DETAIL:
      url = "/orderModule/pages/YFWOrderModule/YFWInvoiceDetailPage/YFWInvoiceDetailPage"
      break
    case GET_INVOICE_PAGE:
      url = "/orderModule/pages/YFWOrderModule/YFWInvoiceDetailPage/YFWInvoicePage"
      break
    case GET_SET:
      url = "/myCenter/pages/YFWUserCenterModule/YFWSetPage/YFWSet"
      break
    case GET_RECENT_BROWSE:
      url = "/myCenter/pages/YFWUserCenterModule/YFWRecentBrowsePage/YFWRecentBrowse"
      break
    case GET_MY_COLLECTION:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyCollectionPage/YFWMyCollection"
      break
    case GET_MY_POINTS:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyPointsPage/YFWMyPoints"
      break
    case GET_MY_COUPON:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyCouponPage/YFWMyCoupon"
      break
    case GET_COUPON_RECORD:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMyCouponRecordPage/YFWMyCouponRecord"
      break
    case GET_MY_MODIFY_THE_NAME:
      url = "/myCenter/pages/YFWUserCenterModule/YFWModifyTheNamePage/YFWModifyTheName"
      break
    case GET_MY_MODIFY_THE_PHONE:
      url = "/myCenter/pages/YFWUserCenterModule/YFWModifyThePhonePage/YFWModifyThePhone"
      break
    case GET_MY_MODIFY_THE_QQ:
      url = "/myCenter/pages/YFWUserCenterModule/YFWModifyTheQQPage/YFWModifyTheQQ"
      break
    case GET_MY_MODIFY_THE_PASSWORD:
      url = "/myCenter/pages/YFWUserCenterModule/YFWChangeThePasswordPage/YFWChangeThePassword"
      break
    case GET_FEED_BACK:
      url = "/myCenter/pages/YFWUserCenterModule/YFWFeedBackPage/YFWFeedBack"
      break
    case GET_CONTACT_US:
      url = "/myCenter/pages/YFWUserCenterModule/YFWContactUsPage/YFWContactUs"
      break

    case GET_CONTACT_US_LINE:
      url = "/myCenter/pages/YFWUserCenterModule/YFWContactUslinePage/YFWContactUsLine"
      break

    case GET_ABOUT_US:
      url = "/myCenter/pages/YFWUserCenterModule/YFWAboutUsPage/YFWAboutUs"
      break
    case ADD_DRUG:
      url = "/myCenter/pages/YFWUserCenterModule/YFWMedicinePage/addDrug/index"
      break

    case GET_ONLINE_CUSTOMER_SERVICE:
      url = "/myCenter/pages/YFWUserCenterModule/YFWOnlineCustomerServicePage/YFWOnlineCustomerService"
      break
    case GET_ORDER_SEARCH:
      url = "/orderModule/pages/YFWOrderModule/YFWOrderSerchPage/YFWOrderSearch"
      break
    case GOODS_DETAIL_ALL_COMMENTS:
      url = "/pages/YFWGoodsDetailModule/YFWGoodsAllCommentsPage/YFWGoodsAllComments"
      break
    case DISCOUNT_NOTICE_PAGE:
      url = "/pages/YFWGoodsDetailModule/YFWDiscountNoticePage/YFWDiscountNoticePage"
      break
    case GET_HTML:
      url = "/components/YFWWebView/YFWWebView"
      break
    case GET_H5:
      url = "/components/YFWWebView/YFWWebView"
      break
    case GET_USER_CENTER:
      url = "/pages/YFWUserCenterModule/YFWUserCenterPage/YFWUserCenter"
      break
    case GET_RETURN_WITHOUTGOODS:
      url = "/orderModule/pages/YFWOrderModule/YFWEditeReturnWithOutGoodsPage/YFWEditeReturnWithOutGoodsPage"
      break
    case GET_CANCLEORDER:
      url = "/orderModule/pages/YFWOrderModule/YFWCancleOrderPage/YFWCancleOrderPage"
      break
    case GET_COMPLAINT_ORDER:
      url = "/orderModule/pages/YFWOrderModule/YFWComplaintOrderPage/YFWComplaintOrder"
      break
    case GET_TS:
      url = "/orderModule/pages/YFWOrderModule/YFWComplaintOrderPage/complainDetail/index"
      break
    case GET_AUTHOR_LOGIN:
      url = "/pages/YFWLoginModule/YFWAuthorLoginPage/YFWAuthorLogin"
      break
    case GET_DETAIL_REFUND:
      url = "/orderModule/pages/YFWOrderModule/YFWDetailsOfRefundPage/YFWDetailsOfRefund"
      break
    case GET_RETURN_NEGOTIATION:
      url = "/orderModule/pages/YFWOrderModule/YFWRefundNegotiationPage/YFWRefundNegotiationPage"
      break
    case GET_LOGISTICS_COMPANY:
      url = "/orderModule/pages/YFWOrderModule/YFWRefundLogisticsCompanyPage/YFWRefundLogisticsCompany"
      break
    case GET_SEND_RETURN_GOODS:
      url = "/orderModule/pages/YFWOrderModule/YFWSendReturnPage/YFWSendReturnGoods"
      break
    case GET_UPLOAD_RX_INFO:
      url = "/orderModule/pages/YFWOrderModule/YFWUploadPrescriptionInfoPage/YFWUploadPrescriptionInfo"
      break
    case GET_CHECK_ORDER_STATUS:
      url = "/orderModule/pages/YFWOrderModule/YFWCheckOrderStatusPage/YFWCheckOrderStatusPage"
      break
    case CONFIRM_RECEIPT_PAGE:
      url = "/orderModule/pages/YFWOrderModule/YFWConfirmReceiptPage/YFWConfirmReceipt"
      break
    case CHECK_BATCH_PAGE:
      url = "/orderModule/pages/YFWOrderModule/YFWCheckBatchPage/YFWCheckBatch"
      break
    case CONFIRMRECEIVE:
      url = "/orderModule/pages/YFWOrderModule/YFWOrderListPage/Components/YFWConfirmReceive/index"
      break
    case MESSAGE:
      url = "/orderModule/pages/YFWOrderModule/YFWOrderDetailPage/Components/Message/index"
      break
    case CANCELLATION:
      url = "/myCenter/pages/YFWUserCenterModule/cancellation/index"
      break
    case ACCOUNT_VERIFY:
      url = "/myCenter/pages/YFWUserCenterModule/accountverify/index"
      break
    case GETSAFE:
      url = "/myCenter/pages/YFWUserCenterModule/YFWSafePage/index"
      break
  }
  YFWNavigate(type, url, params, jumptype)
}

function YFWNavigate(type, urls, params, jumptype) {
  if ((type == 'receive_h5' || type == 'get_h5') && params && params.value) {
    let param = {
      type: 'receive_h5',
      url: encodeURIComponent(params.value),
      share: encodeURIComponent(params.share),
      name: params.name || '',
      needToken: params.needToken ? 1 : 0
    }
    let url = urls + '?params=' + JSON.stringify(param);
    wx.navigateTo({
      url,
    })
    return;
  }
  // if(type == 'get_h5'&&params&&params.value){
  //   let urls = params.value.split('?')
  //   params.value = urls[0]
  //   if (urls[1] && urls[1].includes('=')) {
  //     params.extraValue = {
  //       key: urls[1].split('=')[0],
  //       value: urls[1].split('=')[2]
  //     }
  //   }

  // }
  let param = params && JSON.stringify(params) || ''
  param = param.replace(/(↵|\r|\n|&|=|\b|\f|\t|\?)/g, "").trim()
  /**
   * 在路由跳转传参时将参数的？替换，未换可能导致？之后参数被截断
   */
  param = param.replace('?', "@")
  let url
  if (params) {
    url = urls + "?params=" + param
  } else {
    url = urls
  }
  if (type == 'get_home' || type == 'get_shopping_car' || type == 'get_user_center' || type == 'get_findyao') {
    wx.switchTab({
      url: url
    })
  } else {
    if (jumptype && jumptype == 'redirect') {
      wx.redirectTo({
        url: url
      })
    } else {
      wx.navigateTo({
        url: url
      })
    }
  }
}