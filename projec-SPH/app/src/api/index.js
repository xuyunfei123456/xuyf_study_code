//当前这个模块：API进行统一管理
import requsets from "./request";

//三级联动的接口
//  /api/product/getBaseCategoryList  get   无参数

//发请求：axios发请求返回结果Promise对象
export const reqCategoryList = () => requsets({
    url: '/product/getBaseCategoryList',
    method: 'get'
})