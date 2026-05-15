<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? '编辑友情链接' : '添加友情链接' }}</h1>
      <router-link to="/friend-links" class="btn btn-secondary">返回列表</router-link>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>名称</label>
          <input v-model="form.name" type="text" placeholder="请输入链接名称" required />
        </div>

        <div class="form-group">
          <label>链接地址</label>
          <input v-model="form.url" type="url" placeholder="https://example.com" required />
        </div>

        <div class="form-group">
          <label>图标地址</label>
          <input v-model="form.icon" type="url" placeholder="https://example.com/favicon.ico" />
          <img v-if="form.icon" :src="form.icon" class="icon-preview" @error="e => e.target.style.display = 'none'" />
        </div>

        <div class="form-group">
          <label>描述</label>
          <input v-model="form.description" type="text" placeholder="简短描述" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>排序（数字越小越靠前）</label>
            <input v-model.number="form.sort_order" type="number" placeholder="0" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="published">发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        <div class="actions" style="margin-top: 20px;">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { friendLinksApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  url: '',
  icon: '',
  description: '',
  sort_order: 0,
  status: 'published'
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    if (isEdit.value) {
      await friendLinksApi.update(route.params.id, form.value)
    } else {
      await friendLinksApi.create(form.value)
    }
    router.push('/friend-links')
  } catch (err) {
    alert(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const { data: link } = await friendLinksApi.getOne(route.params.id)
    form.value = {
      name: link.name,
      url: link.url,
      icon: link.icon || '',
      description: link.description || '',
      sort_order: link.sort_order || 0,
      status: link.status
    }
  }
})
</script>

<style scoped>
.icon-preview {
  width: 32px;
  height: 32px;
  margin-top: 8px;
  border-radius: 4px;
  object-fit: contain;
}
</style>