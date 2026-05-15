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
            <th>图标</th>
            <th>名称</th>
            <th>Slug</th>
            <th>描述</th>
            <th>文章数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>
              <span v-if="cat.icon" class="icon-preview">
                <component :is="getIconComponent(cat.icon)" :size="18" />
              </span>
              <span v-else style="color: #999;">-</span>
            </td>
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
            <td colspan="6" style="text-align: center; color: #999;">暂无分类</td>
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
            <label>图标</label>
            <select v-model="form.icon">
              <option value="">无图标</option>
              <option v-for="opt in iconOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <span v-if="form.icon" class="icon-preview-inline">
              <component :is="getIconComponent(form.icon)" :size="16" />
            </span>
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
import {
  Code2, Server, Palette, Smartphone, BarChart3, Box, Wrench,
  Sun, PenLine, FileText, Globe, BookOpen, Coffee, Heart,
  Camera, Music, Video, MessageCircle, Zap, Star, Lightbulb,
  Rocket, Shield, Terminal, Database, Cloud, Settings, Home,
  User, Users, Briefcase, ShoppingBag, TrendingUp, Award
} from 'lucide-vue-next'

const iconMap = {
  Code2, Server, Palette, Smartphone, BarChart3, Box, Wrench,
  Sun, PenLine, FileText, Globe, BookOpen, Coffee, Heart,
  Camera, Music, Video, MessageCircle, Zap, Star, Lightbulb,
  Rocket, Shield, Terminal, Database, Cloud, Settings, Home,
  User, Users, Briefcase, ShoppingBag, TrendingUp, Award
}

const iconOptions = [
  { value: 'Code2', label: 'Code2 - 代码' },
  { value: 'Server', label: 'Server - 服务器' },
  { value: 'Palette', label: 'Palette - 设计' },
  { value: 'Smartphone', label: 'Smartphone - 移动端' },
  { value: 'BarChart3', label: 'BarChart3 - 数据' },
  { value: 'Box', label: 'Box - 盒子' },
  { value: 'Wrench', label: 'Wrench - 工具' },
  { value: 'Sun', label: 'Sun - 生活' },
  { value: 'PenLine', label: 'PenLine - 写作' },
  { value: 'FileText', label: 'FileText - 文档' },
  { value: 'Globe', label: 'Globe - 网络' },
  { value: 'BookOpen', label: 'BookOpen - 阅读' },
  { value: 'Coffee', label: 'Coffee - 咖啡' },
  { value: 'Heart', label: 'Heart - 喜欢' },
  { value: 'Camera', label: 'Camera - 摄影' },
  { value: 'Music', label: 'Music - 音乐' },
  { value: 'Video', label: 'Video - 视频' },
  { value: 'MessageCircle', label: 'MessageCircle - 评论' },
  { value: 'Zap', label: 'Zap - 快速' },
  { value: 'Star', label: 'Star - 收藏' },
  { value: 'Lightbulb', label: 'Lightbulb - 灵感' },
  { value: 'Rocket', label: 'Rocket - 火箭' },
  { value: 'Shield', label: 'Shield - 安全' },
  { value: 'Terminal', label: 'Terminal - 终端' },
  { value: 'Database', label: 'Database - 数据库' },
  { value: 'Cloud', label: 'Cloud - 云' },
  { value: 'Settings', label: 'Settings - 设置' },
  { value: 'Home', label: 'Home - 首页' },
  { value: 'User', label: 'User - 用户' },
  { value: 'Users', label: 'Users - 团队' },
  { value: 'Briefcase', label: 'Briefcase - 工作' },
  { value: 'ShoppingBag', label: 'ShoppingBag - 购物' },
  { value: 'TrendingUp', label: 'TrendingUp - 趋势' },
  { value: 'Award', label: 'Award - 成就' }
]

const getIconComponent = (name) => {
  return iconMap[name] || FileText
}

const categories = ref([])
const showModal = ref(false)
const editingCategory = ref(null)

const form = ref({
  name: '',
  slug: '',
  icon: '',
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
    icon: cat.icon || '',
    description: cat.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  form.value = { name: '', slug: '', icon: '', description: '' }
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

.icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f0f0f0;
}

.icon-preview-inline {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  vertical-align: middle;
}
</style>
