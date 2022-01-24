import request from '@/utils/request'
//获取品牌管理数据
// GET /admin/product/baseTrademark/{page}/{limit}
export const reqTradeMarkList = (page, limit) => request({
  url: `/admin/product/baseTrademark/${page}/${limit}`,
  methods: 'get'
})
