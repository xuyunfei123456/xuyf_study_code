import request from '@/utils/request'
// 对外暴露登录接口函数
export const login = (data) => {
  return request({
    url: '/admin/acl/index/login',
    method: 'post',
    data
  })
}
// 对外暴露用户信息函数
export const getInfo = (token) => {
  return request({
    url: '/admin/acl/index/info',
    method: 'get',
    params: {
      token
    }
  })
}
// 对外暴露退出登录函数
export const logout = () => {
  return request({
    url: '/admin/acl/index/logout',
    method: 'post'
  })
}
