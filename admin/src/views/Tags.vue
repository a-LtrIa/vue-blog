<template>
  <div>
    <div class="page-header">
      <h1>标签管理</h1>
      <button @click="showModal = true" class="btn btn-primary">添加标签</button>
    </div>
    
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>Slug</th>
            <th>文章数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tag in tags" :key="tag.id">
            <td>{{ tag.name }}</td>
            <td>{{ tag.slug }}</td>
            <td>{{ tag.post_count }}</td>
            <td class="actions">
              <button @click="editTag(tag)" class="btn btn-secondary btn-sm">编辑</button>
              <button @click="handleDelete(tag.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="tags.length === 0">
            <td colspan="4" style="text-align: center; color: #999;">暂无标签</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>名称</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Slug（可选）</label>
            <input v-model="form.slug" type="text" placeholder="留空则自动生成" />
          </div>
          <div class="actions" style="margin-top: 20px;">
            <button type="button" @click="closeModal" class="btn btn-secondary">取消</button>
            <button type="submit" class="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { tagsApi } from '../api/modules.js'

const tags = ref([])
const showModal = ref(false)
const editingTag = ref(null)

const form = ref({
  name: '',
  slug: ''
})

const loadTags = async () => {
  const { data } = await tagsApi.getAll()
  tags.value = data
}

const editTag = (tag) => {
  editingTag.value = tag
  form.value = {
    name: tag.name,
    slug: tag.slug
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTag.value = null
  form.value = { name: '', slug: '' }
}

const handleSubmit = async () => {
  try {
    if (editingTag.value) {
      await tagsApi.update(editingTag.value.id, form.value)
    } else {
      await tagsApi.create(form.value)
    }
    closeModal()
    loadTags()
  } catch (err) {
    alert(err.response?.data?.error || '操作失败')
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这个标签吗？')) return
  
  try {
    await tagsApi.delete(id)
    tags.value = tags.value.filter(t => t.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadTags)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.modal h3 {
  margin-bottom: 20px;
}
</style>
