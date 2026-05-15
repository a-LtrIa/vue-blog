<template>
  <div>
    <div class="page-header">
      <h1>文章管理</h1>
      <router-link to="/posts/new" class="btn btn-primary">写文章</router-link>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>类型</th>
            <th>分类</th>
            <th>标签</th>
            <th>状态</th>
            <th>浏览</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td>{{ post.title }}</td>
            <td>
              <span :class="['badge', post.post_type === 'external' ? 'badge-info' : 'badge-success']">
                {{ post.post_type === 'external' ? '外链' : '站内' }}
              </span>
            </td>
            <td>{{ post.category_name || '未分类' }}</td>
            <td>
              <span v-for="tag in post.tags" :key="tag.id" class="badge badge-info" style="margin-right: 4px;">
                {{ tag.name }}
              </span>
            </td>
            <td>
              <span :class="['badge', post.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ post.view_count }}</td>
            <td>{{ formatDate(post.created_at) }}</td>
            <td class="actions">
              <router-link :to="`/posts/${post.id}/edit`" class="btn btn-secondary btn-sm">编辑</router-link>
              <button @click="handleDelete(post.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="posts.length === 0">
            <td colspan="8" style="text-align: center; color: #999;">暂无文章</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postsApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const posts = ref([])

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

const loadPosts = async () => {
  try {
    const { data } = await postsApi.getAll({ limit: 100 })
    posts.value = data.posts
  } catch (err) {
    console.error('加载文章失败', err)
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    await postsApi.delete(id)
    posts.value = posts.value.filter(p => p.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadPosts)
</script>
