//当前这个模块：API进行统一管理
import requsets from "./request";
import mockRequests from './mockAjax'
//三级联动的接口
//  /api/product/getBaseCategoryList  get   无参数

//发请求：axios发请求返回结果Promise对象
export const reqCategoryList = () => requsets({
    url: '/product/getBaseCategoryList',
    method: 'get'
})

//获取banner（Home首页轮播图接口）
export const reqGetBannerList = () => mockRequests.get('/banner');

//获取floor数据
export const reqFloorList = () => mockRequests.get('/floor')

//获取搜索模块数据 地址：/api/list 请求方式post
// {
//     "category3Id": "61",
//     "categoryName": "手机",
//     "keyword": "小米",
//     "order": "1:desc",
//     "pageNo": 1,
//     "pageSize": 10,
//     "props": ["1:1700-2799:价格", "2:6.65-6.74英寸:屏幕尺寸"],
//     "trademark": "4:小米"
//   }
export const reqGetSearchInfo = (params) => requsets({
    url: '/list',
    method: 'post',
    data: params
})

//获取产品信息详情的接口 URL : /api/item/{ skuId }  请求方式：get
export const reqGoodsInfo = (skuId) => requsets({
    url: `/item/${ skuId }`,
    method: 'get'
})
//将产品添加到购物车中，（获取更新某一个产品的个数）/api/cart/addToCart/{ skuId }/{ skuNum } POST
export const reqAddOrUpdateShopCart = (skuId, skuNum) => requsets({
    url: `/cart/addToCart/${skuId}/${skuNum}`,
    method: 'post'
})
//获取购物车列表数据接口
// /api/cart/cartList methods:GET
export const reqCartList = () => requsets({
    url: '/cart/cartList',
    method: 'get'
})
//删除购物车列表数据接口
export const reqDeleteCart = (skuId) => requsets({
    url: `cart/deleteCart/${skuId}`,
    method: 'delete'
})
//删除商品选中状态接口 /api/cart/checkCart/{skuID}/{isChecked} GET
export const reqUpdateCheckedById = (skuId, isChecked) => requsets({
    url: `cart/checkCart/${skuId}/${isChecked}`,
    method: 'get'
})
//获取验证码 /api/user/passport/sendCode/{phone} GET
export const reqGetCode = (phone) => requsets({
    url: `user/passport/sendCode/${phone}`,
    method: 'get'
})
//完成注册 /api/user/passport/register POST
export const reqUserRegister = (data) => requsets({
    url: '/user/passport/register',
    data,
    method: 'post'
})
//登录/api/user/passport/login  POST phone password
export const reqUserLogin = (data) => requsets({
    url: '/user/passport/login',
    data,
    method: 'post'
})
//获取用户信息【需要带着用户的token向服务器要用户信息】
///api/user/passport/auth/getUserInfo   GET
export const reqUserInfo = () => requsets({
    url: "/user/passport/auth/getUserInfo",
    method: 'get'
})
//退出登录 /api/user/passport/logout GET
export const reqLogout = () => requsets({
    url: "/user/passport/logout",
    method: 'get'
})
//获取用户地址信息 /api/user/userAddress/auth/findUserAddressList  GET
export const reqAddressInfo = () => requsets({
    url: "/user/userAddress/auth/findUserAddressList",
    method: 'get'
})
//获取商品清单 /api/order/auth/trade  GET
export const reqOrderInfo = () => requsets({
    url: "/order/auth/trade",
    method: 'get'
})
//提交订单的接口 /api/order/auth/submitOrder?tradeNo={tradeNo}  POST
export const reqSubmitOrder = (traderNo, data) => requsets({
    url: `/order/auth/submitOrder?tradeNo=${traderNo}`,
    data,
    method: 'post'
})
//获取支付信息 /api/payment/weixin/createNative/{orderId}   GET
export const reqPayInfo = (orderId) => requsets({
    url: `/payment/weixin/createNative/${orderId}`,
    method: 'get'
})
//获取支付订单状态 /api/payment/weixin/queryPayStatus/{orderId}  GET
export const reqPayStatus = (orderId) => requsets({
    url: `/payment/weixin/queryPayStatus/${orderId}`,
    method: 'get'
})
//获取个人中心的数据 /api/order/auth/{page}/{limit}
export const reqMyOrderList = (page, limit) => requsets({
    url: `/order/auth/${page}/${limit}`,
    method: 'get'
})