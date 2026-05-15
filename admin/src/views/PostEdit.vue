<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? '编辑文章' : '写文章' }}</h1>
      <router-link to="/posts" class="btn btn-secondary">返回列表</router-link>
    </div>

    <div class="card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" type="text" placeholder="请输入文章标题" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Slug（URL路径）</label>
            <input v-model="form.slug" type="text" placeholder="如: my-first-post" required />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="form.category_id">
              <option :value="null">未分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>文章类型</label>
            <div class="type-selector">
              <label class="type-option" :class="{ active: form.post_type === 'local' }">
                <input type="radio" v-model="form.post_type" value="local" />
                <span>站内文章</span>
              </label>
              <label class="type-option" :class="{ active: form.post_type === 'external' }">
                <input type="radio" v-model="form.post_type" value="external" />
                <span>外部链接</span>
              </label>
            </div>
          </div>
          <div class="form-group" v-if="form.post_type === 'external'">
            <label>外部链接 URL</label>
            <input v-model="form.external_url" type="url" placeholder="https://example.com/article" />
          </div>
        </div>

        <div class="form-group">
          <label>标签</label>
          <div class="tag-input">
            <span v-for="tag in selectedTags" :key="tag.id" class="tag-chip">
              {{ tag.name }}
              <button type="button" @click="removeTag(tag.id)">&times;</button>
            </span>
            <select @change="addTag($event)" style="border: none; outline: none; flex: 1;">
              <option value="">选择标签...</option>
              <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
            </select>
          </div>
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
          <label>摘要</label>
          <textarea v-model="form.excerpt" rows="3" placeholder="请输入文章摘要"></textarea>
        </div>

        <div class="form-group" v-if="form.post_type === 'local'">
          <label>内容（支持 HTML）</label>
          <textarea v-model="form.content" rows="20" placeholder="请输入文章内容"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>状态</label>
            <select v-model="form.status">
              <option value="draft">草稿</option>
              <option value="published">发布</option>
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
import { postsApi, categoriesApi, tagsApi, uploadApi } from '../api/modules.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  cover_image: '',
  category_id: null,
  post_type: 'local',
  external_url: '',
  status: 'draft',
  tags: []
})

const categories = ref([])
const allTags = ref([])
const loading = ref(false)

const selectedTags = computed(() => {
  return allTags.value.filter(t => form.value.tags.includes(t.id))
})

const availableTags = computed(() => {
  return allTags.value.filter(t => !form.value.tags.includes(t.id))
})

const addTag = (e) => {
  const tagId = parseInt(e.target.value)
  if (tagId && !form.value.tags.includes(tagId)) {
    form.value.tags.push(tagId)
  }
  e.target.value = ''
}

const removeTag = (tagId) => {
  form.value.tags = form.value.tags.filter(id => id !== tagId)
}

const handleCoverUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const { data } = await uploadApi.uploadImage(file)
    form.value.cover_image = data.url
  } catch (err) {
    alert('上传失败')
  }
}

const handleSubmit = async () => {
  loading.value = true

  try {
    if (isEdit.value) {
      await postsApi.update(route.params.id, form.value)
    } else {
      await postsApi.create(form.value)
    }
    router.push('/posts')
  } catch (err) {
    alert(err.response?.data?.error || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const [catsRes, tagsRes] = await Promise.all([
    categoriesApi.getAll(),
    tagsApi.getAll()
  ])

  categories.value = catsRes.data
  allTags.value = tagsRes.data

  if (isEdit.value) {
    const { data: post } = await postsApi.getOne(route.params.id)
    form.value = {
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      excerpt: post.excerpt || '',
      cover_image: post.cover_image || '',
      category_id: post.category_id,
      post_type: post.post_type || 'local',
      external_url: post.external_url || '',
      status: post.status,
      tags: post.tags?.map(t => t.id) || []
    }
  }
})
</script>
