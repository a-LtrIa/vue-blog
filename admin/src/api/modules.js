import api from './index.js'

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  verify: () => api.get('/auth/verify'),
  changePassword: (data) => api.post('/auth/change-password', data)
}

export const postsApi = {
  getAll: (params) => api.get('/posts', { params }),
  getOne: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`)
}

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
}

export const tagsApi = {
  getAll: () => api.get('/tags'),
  getOne: (id) => api.get(`/tags/${id}`),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`)
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  getSocialLinks: () => api.get('/settings/social-links'),
  createSocialLink: (data) => api.post('/settings/social-links', data),
  updateSocialLink: (id, data) => api.put(`/settings/social-links/${id}`, data),
  deleteSocialLink: (id) => api.delete(`/settings/social-links/${id}`)
}

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const backgroundApi = {
  list: () => api.get('/background/list'),
  delete: (filename) => api.delete(`/background/${filename}`),
  fetch: () => api.post('/background/fetch'),
  refresh: () => api.post('/background/refresh')
}

export const toolsApi = {
  getAll: (params) => api.get('/tools', { params }),
  getOne: (id) => api.get(`/tools/${id}`),
  create: (data) => api.post('/tools', data),
  update: (id, data) => api.put(`/tools/${id}`, data),
  delete: (id) => api.delete(`/tools/${id}`)
}

export const resourcesApi = {
  getAll: (params) => api.get('/resources', { params }),
  getOne: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`)
}

export const announcementsApi = {
  getAll: (params) => api.get('/announcements', { params }),
  getOne: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`)
}

export const friendLinksApi = {
  getAll: (params) => api.get('/friend-links', { params }),
  getOne: (id) => api.get(`/friend-links/${id}`),
  create: (data) => api.post('/friend-links', data),
  update: (id, data) => api.put(`/friend-links/${id}`, data),
  delete: (id) => api.delete(`/friend-links/${id}`)
}
