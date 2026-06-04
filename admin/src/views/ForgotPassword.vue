<template>
  <div class="login-container">
    <div class="login-box">
      <h1>找回密码</h1>
      <p class="subtitle">请输入您的用户名和邮箱，我们将发送密码重置链接</p>

      <form v-if="!emailSent" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="请输入注册邮箱"
            required
            :disabled="loading"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '发送中...' : '发送重置链接' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div v-else class="success-message">
        <div class="success-icon">✓</div>
        <h3>邮件已发送</h3>
        <p>密码重置链接已发送到您的邮箱，请查收。</p>
        <p class="hint">链接有效期为 1 小时</p>
        <router-link to="/login" class="btn btn-secondary" style="margin-top: 20px;">
          返回登录
        </router-link>
      </div>

      <div class="back-link">
        <router-link to="/login">← 返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authApi } from '../api/modules.js'

const form = ref({
  username: '',
  email: ''
})

const loading = ref(false)
const error = ref('')
const emailSent = ref(false)

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await authApi.forgotPassword(form.value)
    emailSent.value = true
  } catch (err) {
    error.value = err.response?.data?.error || '发送失败，请检查用户名和邮箱是否正确'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 8px;
  color: #333;
  font-size: 24px;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd6;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.success-message h3 {
  color: #333;
  margin-bottom: 8px;
}

.success-message p {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.success-message .hint {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.back-link {
  text-align: center;
  margin-top: 20px;
}

.back-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>
