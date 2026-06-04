<template>
  <div class="login-container">
    <div class="login-box">
      <h1>重置密码</h1>

      <!-- 验证中 -->
      <div v-if="verifying" class="loading-state">
        <div class="spinner"></div>
        <p>正在验证链接...</p>
      </div>

      <!-- 验证失败 -->
      <div v-else-if="!tokenValid" class="error-state">
        <div class="error-icon">✕</div>
        <h3>链接无效或已过期</h3>
        <p>该密码重置链接已失效，请重新申请。</p>
        <router-link :to="{ name: 'ForgotPassword' }" class="btn btn-primary" style="margin-top: 20px;">
          重新申请
        </router-link>
      </div>

      <!-- 重置成功 -->
      <div v-else-if="resetSuccess" class="success-state">
        <div class="success-icon">✓</div>
        <h3>密码重置成功</h3>
        <p>您的密码已重置，请使用新密码登录。</p>
        <router-link :to="{ name: 'Login' }" class="btn btn-primary" style="margin-top: 20px;">
          去登录
        </router-link>
      </div>

      <!-- 重置表单 -->
      <form v-else @submit.prevent="handleSubmit">
        <div class="info-box">
          <p><strong>用户名：</strong>{{ userInfo.username }}</p>
          <p><strong>邮箱：</strong>{{ userInfo.email }}</p>
        </div>

        <div class="form-group">
          <label>新密码</label>
          <input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            required
            minlength="6"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label>确认新密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            required
            :disabled="loading"
          />
        </div>

        <p v-if="form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword" class="warning-message">
          两次输入的密码不一致
        </p>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? '重置中...' : '重置密码' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const token = ref('')
const verifying = ref(true)
const tokenValid = ref(false)
const resetSuccess = ref(false)
const userInfo = ref({ username: '', email: '' })

const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return form.value.newPassword.length >= 6 &&
         form.value.newPassword === form.value.confirmPassword
})

onMounted(async () => {
  token.value = route.query.token

  if (!token.value) {
    verifying.value = false
    tokenValid.value = false
    return
  }

  try {
    const { data } = await authApi.verifyResetToken(token.value)
    userInfo.value = {
      username: data.username,
      email: data.email
    }
    tokenValid.value = true
  } catch (err) {
    tokenValid.value = false
  } finally {
    verifying.value = false
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    await authApi.resetPassword({
      token: token.value,
      newPassword: form.value.newPassword
    })
    resetSuccess.value = true
  } catch (err) {
    error.value = err.response?.data?.error || '重置失败，请重试'
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
  margin-bottom: 24px;
  color: #333;
  font-size: 24px;
}

.loading-state,
.error-state,
.success-state {
  text-align: center;
  padding: 20px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.error-icon {
  background: #e74c3c;
  color: white;
}

.success-icon {
  background: #27ae60;
  color: white;
}

.error-state h3,
.success-state h3 {
  color: #333;
  margin-bottom: 8px;
}

.error-state p,
.success-state p {
  color: #666;
  font-size: 14px;
}

.info-box {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.info-box p {
  margin: 4px 0;
  font-size: 14px;
  color: #555;
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
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd6;
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

.warning-message {
  color: #f39c12;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>
