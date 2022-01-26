import request from '@/utils/request'
//获取品牌管理数据
// GET /admin/product/baseTrademark/{page}/{limit}
export const reqTradeMarkList = (page, limit) => request({
  url: `/admin/product/baseTrademark/${page}/${limit}`,
  methods: 'get'
})
// POST /admin/product/baseTrademark/save
// 处理新增品牌  携带参数：品牌名称，品牌logo
//对于新增的品牌不需要传ID

// PUT /admin/product/baseTrademark/update
//修改品牌的地址  携带参数：品牌名称，品牌logo 品牌ID
export const reqAddOrUpdateTradeMark = (tradeMark) => {
  //带给服务器的数据携带ID ---修改
  if (tradeMark.id) {
    return request({
      url: '/admin/product/baseTrademark/update',
      method: 'put',
      data: tradeMark
    })
  } else {
    //新增品牌
    return request({
      url: '/admin/product/baseTrademark/save',
      method: 'post',
      data: tradeMark
    })
  }
}
//DELETE /admin/product/baseTrademark/remove/{id}
//删除品牌

export const reqDeleteTradeMark = (id) => request({
  url: `/admin/product/baseTrademark/remove/${id}`,
  method: 'delete'
})
