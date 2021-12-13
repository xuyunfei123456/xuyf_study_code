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