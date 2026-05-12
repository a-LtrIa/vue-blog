<template>
  <div>
    <div class="page-header">
      <h1>分类管理</h1>
      <button @click="showModal = true" class="btn btn-primary">添加分类</button>
    </div>
    
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>Slug</th>
            <th>描述</th>
            <th>文章数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>{{ cat.name }}</td>
            <td>{{ cat.slug }}</td>
            <td>{{ cat.description || '-' }}</td>
            <td>{{ cat.post_count }}</td>
            <td class="actions">
              <button @click="editCategory(cat)" class="btn btn-secondary btn-sm">编辑</button>
              <button @click="handleDelete(cat.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="categories.length === 0">
            <td colspan="5" style="text-align: center; color: #999;">暂无分类</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>名称</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="form.slug" type="text" required />
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="form.description" rows="3"></textarea>
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
import { categoriesApi } from '../api/modules.js'

const categories = ref([])
const showModal = ref(false)
const editingCategory = ref(null)

const form = ref({
  name: '',
  slug: '',
  description: ''
})

const loadCategories = async () => {
  const { data } = await categoriesApi.getAll()
  categories.value = data
}

const editCategory = (cat) => {
  editingCategory.value = cat
  form.value = {
    name: cat.name,
    slug: cat.slug,
    description: cat.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  form.value = { name: '', slug: '', description: '' }
}

const handleSubmit = async () => {
  try {
    if (editingCategory.value) {
      await categoriesApi.update(editingCategory.value.id, form.value)
    } else {
      await categoriesApi.create(form.value)
    }
    closeModal()
    loadCategories()
  } catch (err) {
    alert(err.response?.data?.error || '操作失败')
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这个分类吗？')) return
  
  try {
    await categoriesApi.delete(id)
    categories.value = categories.value.filter(c => c.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadCategories)
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
  max-width: 500px;
}

.modal h3 {
  margin-bottom: 20px;
}
</style>
