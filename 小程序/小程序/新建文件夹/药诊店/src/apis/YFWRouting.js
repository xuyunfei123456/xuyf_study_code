import Taro from "@tarojs/taro";

const HOME = "home"; //首页
const ORDER = "order"; //订单
const CONSULATION = "Consultation"; //问诊单
const PERSONAL = "personal"; //我的
const SEARCH = "search"; //搜索页
const ADDRESSLIST = "addressList"; //地址列表页
const LOGIN = "login"; //登录页
const CHANGESTORE = "changeStore"; //店铺列表页
const VISITEDSTORE = "visitedStore"; //去过的店
const STOREDETAIL = "storeDetail"; //门店详情
const BUYMEDICINE = "buyMedicine"; //买药页面
const GOODSDETAIL = "goodsDetail"; //买药页面
const SUBMITORDER = "submitOrder"; //提交订单
const CONSULTATIONDETAIL = "consultationDetail"; //问诊单详情
const ADDCONSULTATION = "addConsultation"; //添加问诊单
const SICKLIST = "sickList"; //患者信息列表
const SICKPERSON = "sickPerson"; //新增/修改患者
const INQUIRE = "inquire"; //就诊信息
const ORDERDETAIL = "orderDetail"; //订单详情
const APPLYREFUND = "applyRefund"; //申请退款
const INVLICEDETAIL = "invoiceDetail"; //发票详情
const INVOICESHOW = "invoiceShow"; //发票图片
const MAP = "map"; //发票图片
const RECIPEDETAILS = "recipedetails"; //处方详情
const SHOPSENDDETAIL = "shopSendDetail"; //商家配送详情

export function pushNavigation(type, params, jumptype) {
  let url;
  switch (type) {
    case SHOPSENDDETAIL:
      url = "/page/shopSendDetail/shopSendDetail";
      break;
    case RECIPEDETAILS:
      url = "/page/recipedetails/recipedetails";
      break;
    case INVLICEDETAIL:
      url = "/page/invoiceDetail/invoiceDetail";
      break;
    case MAP:
      url = "/page/map/map";
      break;
    case INVOICESHOW:
      url = "/page/invoiceShow/invoiceShow";
      break;
    case APPLYREFUND:
      url = "/page/applyRefund/applyRefund";
      break;
    case ORDERDETAIL:
      url = "/page/buSlfOrderDetail/buSlfOrderDetail";
      break;
    case INQUIRE:
      url = "/page/YFWInquiryInfoPage/YFWInquiryInfoPage";
      break;
    case SICKPERSON:
      url = "/page/sickPerson/sickPerson";
      break;
    case HOME:
      url = "/page/tabBar/Home/Home";
      break;
    case ORDER:
      url = "/page/tabBar/order/order";
      break;
    case CONSULATION:
      url = "/page/tabBar/Consultation/Consultation";
      break;
    case PERSONAL:
      url = "/page/tabBar/personal/personal";
      break;
    case SEARCH:
      url = "/page/search/search";
      break;
    case ADDRESSLIST:
      url = "/page/addressList/addressList";
      break;
    case LOGIN:
      url = "/page/login/login";
      break;
    case CHANGESTORE:
      url = "/page/storeList/storeList";
      break;
    case VISITEDSTORE:
      url = "/page/visitedStore/visitedStore";
      break;
    case STOREDETAIL:
      url = "/page/storeDetails/storeDetails";
      break;
    case BUYMEDICINE:
      url = "/page/buyMedicine/buyMedicine";
      break;
    case GOODSDETAIL:
      url = "/page/commodityDetail/commodityDetail";
      break;
    case SUBMITORDER:
      url = "/page/submitOrder/submitOrder";
      break;
    case CONSULTATIONDETAIL:
      url = "/page/consultationDetail/consultationDetail";
      break;
    case ADDCONSULTATION:
      url = "/page/addConsultation/addConsultation";
      break;
    case SICKLIST:
      url = "/page/sickList/sickList";
      break;
  }
  YFWNavigate(type, url, params, jumptype);
}

const YFWNavigate = (type, url, params, jumptype) => {
  if (params && JSON.stringify(params) != "{}") {
    let keys,
      values,
      _param = [];
    keys = Object.keys(params);
    values = Object.values(params);
    _param = keys.map((item, index) => {
      return item + "=" + values[index];
    });
    url += "?" + _param.join("&");
  }
  if (
    type == "home" ||
    type == "order" ||
    type == "Consultation" ||
    type == "personal"
  ) {
    Taro.switchTab({
      url: url
    });
  } else {
    if (jumptype && jumptype == "redirect") {
      Taro.redirectTo({
        url: url
      });
    } else {
      Taro.navigateTo({
        url: url
      });
    }
  }
};
