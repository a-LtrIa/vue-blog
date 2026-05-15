<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? '编辑公告' : '添加公告' }}</h1>
      <router-link to="/announcements" class="btn btn-secondary">返回列表</router-link>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>公告标题</label>
          <input v-model="form.title" type="text" placeholder="请输入公告标题" />
        </div>

        <div class="form-group">
          <label>公告内容</label>
          <textarea v-model="form.content" rows="4" placeholder="请输入公告内容" required></textarea>
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
import { announcementsApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  content: '',
  sort_order: 0,
  status: 'published'
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    if (isEdit.value) {
      await announcementsApi.update(route.params.id, form.value)
    } else {
      await announcementsApi.create(form.value)
    }
    router.push('/announcements')
  } catch (err) {
    alert(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const { data: announcement } = await announcementsApi.getOne(route.params.id)
    form.value = {
      title: announcement.title || '',
      content: announcement.content,
      sort_order: announcement.sort_order || 0,
      status: announcement.status
    }
  }
})
</script>
