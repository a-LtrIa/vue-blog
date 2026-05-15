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

export const backgroundApi = {
  getRandom: () => api.get('/background/random'),
  refresh: () => api.post('/background/refresh')
}

export const visitsApi = {
  record: () => api.post('/visits'),
  getStats: () => api.get('/visits/stats')
}

export const toolsApi = {
  getAll: (params) => api.get('/tools', { params })
}

export const resourcesApi = {
  getAll: (params) => api.get('/resources', { params })
}

export const announcementsApi = {
  getAll: (params) => api.get('/announcements', { params })
}

export const friendLinksApi = {
  getAll: (params) => api.get('/friend-links', { params })
}

export default api
