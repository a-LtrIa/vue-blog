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
          <div class="tag-create">
            <input
              v-model="newTagName"
              type="text"
              placeholder="输入新标签名称"
              @keyup.enter="createTag"
              class="tag-create-input"
            />
            <button type="button" @click="createTag" class="btn btn-secondary btn-sm" :disabled="creatingTag">
              {{ creatingTag ? '创建中...' : '添加新标签' }}
            </button>
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
          <div class="content-label-row">
            <label>内容（支持 Markdown）</label>
            <div class="view-toggle">
              <button
                type="button"
                :class="['toggle-btn', { active: contentView === 'edit' }]"
                @click="contentView = 'edit'"
              >
                编辑
              </button>
              <button
                type="button"
                :class="['toggle-btn', { active: contentView === 'preview' }]"
                @click="contentView = 'preview'"
              >
                预览
              </button>
            </div>
          </div>
          <textarea
            v-show="contentView === 'edit'"
            v-model="form.content"
            rows="20"
            placeholder="请输入 Markdown 格式的文章内容"
          ></textarea>
          <div v-show="contentView === 'preview'" class="markdown-preview" v-html="renderedContent"></div>
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
import { marked } from 'marked'
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
const newTagName = ref('')
const creatingTag = ref(false)
const contentView = ref('edit')

const selectedTags = computed(() => {
  return allTags.value.filter(t => form.value.tags.includes(t.id))
})

const availableTags = computed(() => {
  return allTags.value.filter(t => !form.value.tags.includes(t.id))
})

const renderedContent = computed(() => {
  if (!form.value.content) return '<p style="color: #999;">暂无内容</p>'
  return marked.parse(form.value.content)
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

const createTag = async () => {
  const name = newTagName.value.trim()
  if (!name) return

  creatingTag.value = true
  try {
    const { data } = await tagsApi.create({ name })
    const newTag = {
      id: data.id,
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }
    allTags.value.push(newTag)
    form.value.tags.push(data.id)
    newTagName.value = ''
  } catch (err) {
    alert(err.response?.data?.error || '创建标签失败')
  } finally {
    creatingTag.value = false
  }
}

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

<style scoped>
.tag-create {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.tag-create-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-hairline, #ddd);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.tag-create-input:focus {
  border-color: var(--color-primary, #0066cc);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.content-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-hairline, #ddd);
  border-radius: 4px;
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 16px;
  border: none;
  background: var(--color-canvas, #fff);
  color: var(--color-ink-muted-80, #666);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--color-divider-soft, #f5f5f5);
}

.toggle-btn.active {
  background: var(--color-primary, #0066cc);
  color: white;
}

.toggle-btn:first-child {
  border-right: 1px solid var(--color-hairline, #ddd);
}

.markdown-preview {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid var(--color-hairline, #ddd);
  border-radius: 4px;
  background: var(--color-canvas, #fff);
  line-height: 1.8;
}

.markdown-preview :deep(h1) {
  font-size: 1.8em;
  margin: 0.8em 0 0.4em;
  border-bottom: 1px solid var(--color-hairline, #eee);
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h2) {
  font-size: 1.5em;
  margin: 0.8em 0 0.4em;
  border-bottom: 1px solid var(--color-hairline, #eee);
  padding-bottom: 0.3em;
}

.markdown-preview :deep(h3) {
  font-size: 1.25em;
  margin: 0.6em 0 0.3em;
}

.markdown-preview :deep(p) {
  margin: 0.6em 0;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 0.6em 0;
  padding-left: 2em;
}

.markdown-preview :deep(li) {
  margin: 0.3em 0;
}

.markdown-preview :deep(code) {
  background: var(--color-canvas-parchment, #f5f5f5);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: var(--color-canvas-parchment, #f5f5f5);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.8em 0;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid var(--color-primary, #0066cc);
  margin: 0.8em 0;
  padding: 0.5em 1em;
  background: var(--color-canvas-parchment, #f9f9f9);
  color: var(--color-ink-muted-80, #555);
}

.markdown-preview :deep(a) {
  color: var(--color-primary, #0066cc);
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.8em 0;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid var(--color-hairline, #ddd);
  padding: 8px 12px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background: var(--color-canvas-parchment, #f5f5f5);
  font-weight: 600;
}

.markdown-preview :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-hairline, #ddd);
  margin: 1.5em 0;
}
</style>
