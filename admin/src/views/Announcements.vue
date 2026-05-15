<template>
  <div>
    <div class="page-header">
      <h1>网站公告</h1>
      <router-link to="/announcements/new" class="btn btn-primary">添加公告</router-link>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>公告内容</th>
            <th>排序</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="announcement in announcements" :key="announcement.id">
            <td>{{ announcement.title || '-' }}</td>
            <td class="content-cell">{{ announcement.content }}</td>
            <td>{{ announcement.sort_order }}</td>
            <td>
              <span :class="['badge', announcement.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ announcement.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ formatDate(announcement.created_at) }}</td>
            <td class="actions">
              <router-link :to="`/announcements/${announcement.id}/edit`" class="btn btn-secondary btn-sm">编辑</router-link>
              <button @click="handleDelete(announcement.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="announcements.length === 0">
            <td colspan="6" style="text-align: center; color: #999;">暂无公告</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { announcementsApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const announcements = ref([])

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

const loadAnnouncements = async () => {
  try {
    const { data } = await announcementsApi.getAll()
    announcements.value = data
  } catch (err) {
    console.error('加载公告失败', err)
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这个公告吗？')) return

  try {
    await announcementsApi.delete(id)
    announcements.value = announcements.value.filter(a => a.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadAnnouncements)
</script>

<style scoped>
.content-cell {
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
