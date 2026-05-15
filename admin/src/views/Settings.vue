<template>
  <div>
    <div class="page-header">
      <h1>系统设置</h1>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>基本信息</h3>
      </div>
      <form @submit.prevent="saveSettings">
        <div class="form-row">
          <div class="form-group">
            <label>网站名称</label>
            <input v-model="settings.site_name" type="text" />
          </div>
          <div class="form-group">
            <label>网站描述</label>
            <input v-model="settings.site_description" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>作者名称</label>
            <input v-model="settings.author_name" type="text" />
          </div>
          <div class="form-group">
            <label>作者简介</label>
            <input v-model="settings.author_bio" type="text" />
          </div>
        </div>

        <div class="form-group">
          <label>背景图 URL</label>
          <input v-model="settings.background_url" type="text" placeholder="留空则使用随机背景" />
        </div>

        <div class="form-group">
          <label>头像</label>
          <div class="image-upload" @click="$refs.avatarInput.click()">
            <input ref="avatarInput" type="file" accept="image/*" @change="handleAvatarUpload" />
            <p v-if="!settings.avatar_url">点击上传头像</p>
            <img v-else :src="settings.avatar_url" class="image-preview" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>社交链接</h3>
        <button @click="addSocialLink" class="btn btn-primary btn-sm">添加链接</button>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>平台</th>
            <th>链接</th>
            <th>图标</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in socialLinks" :key="link.id">
            <td><input v-model="link.platform" type="text" class="inline-input" /></td>
            <td><input v-model="link.url" type="text" class="inline-input" /></td>
            <td><select v-model="link.icon" class="inline-input">
              <option value="">-- 选择图标 --</option>
              <option v-for="ic in SOCIAL_ICONS" :key="ic.name" :value="ic.name">{{ ic.label }} ({{ ic.name }})</option>
            </select></td>
            <td class="actions">
              <button @click="saveSocialLink(link)" class="btn btn-success btn-sm">保存</button>
              <button @click="deleteSocialLink(link.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>修改密码</h3>
      </div>
      <form @submit.prevent="changePassword">
        <div class="form-row">
          <div class="form-group">
            <label>旧密码</label>
            <input v-model="passwordForm.oldPassword" type="password" required />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="passwordForm.newPassword" type="password" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="changingPassword">
          {{ changingPassword ? '修改中...' : '修改密码' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { settingsApi, uploadApi, authApi } from '../api/modules.js'
import { SOCIAL_ICONS } from '../config/icons.js'

const settings = ref({
  site_name: '',
  site_description: '',
  author_name: '',
  author_bio: '',
  background_url: '',
  avatar_url: ''
})

const socialLinks = ref([])
const saving = ref(false)
const changingPassword = ref(false)

const passwordForm = ref({
  oldPassword: '',
  newPassword: ''
})

const loadSettings = async () => {
  const { data } = await settingsApi.getAll()
  settings.value = { ...settings.value, ...data }
}

const loadSocialLinks = async () => {
  const { data } = await settingsApi.getSocialLinks()
  socialLinks.value = data
}

const saveSettings = async () => {
  saving.value = true
  try {
    await settingsApi.update(settings.value)
    alert('保存成功')
  } catch (err) {
    alert('保存失败')
  } finally {
    saving.value = false
  }
}

const handleAvatarUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const { data } = await uploadApi.uploadImage(file)
    settings.value.avatar_url = data.url
  } catch (err) {
    alert('上传失败')
  }
}

const addSocialLink = () => {
  socialLinks.value.push({
    id: 'new-' + Date.now(),
    platform: '',
    url: '',
    icon: ''
  })
}

const saveSocialLink = async (link) => {
  try {
    if (typeof link.id === 'string' && link.id.startsWith('new-')) {
      const { data } = await settingsApi.createSocialLink({
        platform: link.platform,
        url: link.url,
        icon: link.icon
      })
      link.id = data.id
    } else {
      await settingsApi.updateSocialLink(link.id, {
        platform: link.platform,
        url: link.url,
        icon: link.icon
      })
    }
    alert('保存成功')
  } catch (err) {
    alert('保存失败')
  }
}

const deleteSocialLink = async (id) => {
  if (typeof id === 'string' && id.startsWith('new-')) {
    socialLinks.value = socialLinks.value.filter(l => l.id !== id)
    return
  }

  if (!confirm('确定要删除这个链接吗？')) return

  try {
    await settingsApi.deleteSocialLink(id)
    socialLinks.value = socialLinks.value.filter(l => l.id !== id)
  } catch (err) {
    alert('删除失败')
  }
}

const changePassword = async () => {
  changingPassword.value = true
  try {
    await authApi.changePassword(passwordForm.value)
    alert('密码修改成功')
    passwordForm.value = { oldPassword: '', newPassword: '' }
  } catch (err) {
    alert(err.response?.data?.error || '修改失败')
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  loadSettings()
  loadSocialLinks()
})
</script>

<style scoped>
.inline-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
