<template>
  <div>
    <div class="page-header">
      <h1>仪表盘</h1>
      <router-link to="/posts/new" class="btn btn-primary">写文章</router-link>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h4>文章总数</h4>
        <div class="value">{{ stats.posts }}</div>
      </div>
      <div class="stat-card">
        <h4>已发布</h4>
        <div class="value stat-success">{{ stats.published }}</div>
      </div>
      <div class="stat-card">
        <h4>草稿</h4>
        <div class="value stat-warning">{{ stats.drafts }}</div>
      </div>
      <div class="stat-card">
        <h4>分类数</h4>
        <div class="value stat-primary">{{ stats.categories }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>最新文章</h3>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>浏览</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in recentPosts" :key="post.id">
            <td>{{ post.title }}</td>
            <td>{{ post.category_name || '未分类' }}</td>
            <td>
              <span :class="['badge', post.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ post.view_count }}</td>
            <td>{{ formatDate(post.created_at) }}</td>
          </tr>
          <tr v-if="recentPosts.length === 0">
            <td colspan="5" style="text-align: center;">暂无文章</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postsApi, categoriesApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const stats = ref({
  posts: 0,
  published: 0,
  drafts: 0,
  categories: 0
})

const recentPosts = ref([])

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      postsApi.getAll({ limit: 5 }),
      categoriesApi.getAll()
    ])

    recentPosts.value = postsRes.data.posts

    stats.value = {
      posts: postsRes.data.pagination.total,
      published: postsRes.data.posts.filter(p => p.status === 'published').length,
      drafts: postsRes.data.posts.filter(p => p.status === 'draft').length,
      categories: categoriesRes.data.length
    }
  } catch (err) {
    console.error('加载数据失败', err)
  }
})
</script>
