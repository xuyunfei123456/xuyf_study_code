import request from '@/utils/request'

export const getList = (params) => {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}
