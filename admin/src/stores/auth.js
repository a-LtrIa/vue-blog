import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/modules.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (username, password) => {
    const { data } = await authApi.login({ username, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const verifyAuth = async () => {
    if (!token.value) return false
    try {
      const { data } = await authApi.verify()
      return data.valid
    } catch {
      logout()
      return false
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    verifyAuth
  }
})
