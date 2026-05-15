<template>
  <div>
    <div class="page-header">
      <h1>音乐管理</h1>
      <router-link to="/music/new" class="btn btn-primary">添加音乐</router-link>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>封面</th>
            <th>标题</th>
            <th>艺术家</th>
            <th>时长</th>
            <th>播放次数</th>
            <th>状态</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="song in musicList" :key="song.id">
            <td>
              <img v-if="song.cover_url" :src="song.cover_url" class="cover-thumb" />
              <span v-else class="no-cover">无</span>
            </td>
            <td>{{ song.title }}</td>
            <td>{{ song.artist || '-' }}</td>
            <td>{{ formatDuration(song.duration) }}</td>
            <td>{{ song.play_count }}</td>
            <td>
              <span :class="['badge', song.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ song.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ song.sort_order }}</td>
            <td class="actions">
              <router-link :to="`/music/${song.id}/edit`" class="btn btn-secondary btn-sm">编辑</router-link>
              <button @click="handleDelete(song.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="musicList.length === 0">
            <td colspan="8" style="text-align: center; color: #999;">暂无音乐</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { musicApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const musicList = ref([])

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const loadMusic = async () => {
  try {
    const { data } = await musicApi.getAll({ limit: 100 })
    musicList.value = data
  } catch (err) {
    console.error('加载音乐失败', err)
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这首音乐吗？')) return

  try {
    await musicApi.delete(id)
    musicList.value = musicList.value.filter(m => m.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadMusic)
</script>

<style scoped>
.cover-thumb {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.no-cover {
  color: #999;
  font-size: 12px;
}
</style>