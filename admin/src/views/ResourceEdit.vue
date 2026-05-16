<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? '编辑资源' : '添加资源' }}</h1>
      <router-link to="/resources" class="btn btn-secondary">返回列表</router-link>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" type="text" placeholder="请输入资源标题" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Slug（URL路径）</label>
            <input v-model="form.slug" type="text" placeholder="如: my-resource" required />
          </div>
          <div class="form-group">
            <label>标签</label>
            <input v-model="form.tag" type="text" placeholder="如: 图标、设计、工具" />
          </div>
        </div>

        <div class="form-group">
          <label>链接地址</label>
          <input v-model="form.url" type="url" placeholder="https://example.com" />
        </div>

        <div class="form-group">
          <label>封面图片</label>
          <div class="image-upload" @click="$refs.coverInput.click()">
            <input ref="coverInput" type="file" accept="image/*" @change="handleCoverUpload" />
            <p v-if="!form.cover_image">点击上传封面图片</p>
            <img v-else :src="form.cover_image" class="image-preview" />
          </div>
        </div>

        <div class="form-group">
          <label>描述</label>
          <textarea v-model="form.description" rows="3" placeholder="请输入资源描述"></textarea>
        </div>

        <div class="form-row">
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
import { resourcesApi, uploadApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  slug: '',
  description: '',
  cover_image: '',
  url: '',
  tag: '',
  status: 'published'
})

const loading = ref(false)

const handleCoverUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const { data } = await uploadApi.uploadImage(file, 'cover')
    form.value.cover_image = data.url
  } catch (err) {
    alert('上传失败')
  }
}

const handleSubmit = async () => {
  loading.value = true

  try {
    if (isEdit.value) {
      await resourcesApi.update(route.params.id, form.value)
    } else {
      await resourcesApi.create(form.value)
    }
    router.push('/resources')
  } catch (err) {
    alert(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    const { data: resource } = await resourcesApi.getOne(route.params.id)
    form.value = {
      title: resource.title,
      slug: resource.slug,
      description: resource.description || '',
      cover_image: resource.cover_image || '',
      url: resource.url || '',
      tag: resource.tag || '',
      status: resource.status
    }
  }
})
</script>