import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // 使用 window.location.href 做全量跳转，确保清除所有前端状态
      // 注意：admin 部署在 /admin/ 子路径下，必须跳转到 /admin/login
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api
