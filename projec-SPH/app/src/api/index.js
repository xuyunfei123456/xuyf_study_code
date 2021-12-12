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