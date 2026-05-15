<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? '编辑工具' : '添加工具' }}</h1>
      <router-link to="/tools" class="btn btn-secondary">返回列表</router-link>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>工具名称</label>
          <input v-model="form.name" type="text" placeholder="请输入工具名称" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>图标名称（lucide 图标库）</label>
            <input v-model="form.icon" type="text" placeholder="如: Palette, Code2, Image" />
          </div>
          <div class="form-group">
            <label>分类</label>
            <input v-model="form.category" type="text" placeholder="如: 开发工具、设计工具" />
          </div>
        </div>

        <div class="form-group">
          <label>链接地址</label>
          <input v-model="form.url" type="url" placeholder="https://example.com" />
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="3" placeholder="请输入工具描述"></textarea>
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
import { toolsApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  description: '',
  url: '',
  icon: '',
  category: '',
  sort_order: 0,
  status: 'published'
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    if (isEdit.value) {
      await toolsApi.update(route.params.id, form.value)
    } else {
      await toolsApi.create(form.value)
    }
    router.push('/tools')
  } catch (err) {
    alert(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const { data: tool } = await toolsApi.getOne(route.params.id)
    form.value = {
      name: tool.name,
      description: tool.description || '',
      url: tool.url || '',
      icon: tool.icon || '',
      category: tool.category || '',
      sort_order: tool.sort_order || 0,
      status: tool.status
    }
  }
})
</script>