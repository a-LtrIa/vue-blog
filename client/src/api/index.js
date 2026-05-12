import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const postsApi = {
  getAll: (params) => api.get('/posts', { params }),
  getOne: (id) => api.get(`/posts/${id}`),
  getBySlug: (slug) => api.get(`/posts/slug/${slug}`)
}

export const categoriesApi = {
  getAll: () => api.get('/categories')
}

export const tagsApi = {
  getAll: () => api.get('/tags')
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  getSocialLinks: () => api.get('/settings/social-links')
}

export default api
