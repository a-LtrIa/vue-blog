<template>
  <div>
    <div class="page-header">
      <h1>友情链接</h1>
      <router-link to="/friend-links/new" class="btn btn-primary">添加链接</router-link>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>图标</th>
            <th>名称</th>
            <th>链接</th>
            <th>描述</th>
            <th>排序</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in links" :key="link.id">
            <td>
              <img v-if="link.icon" :src="link.icon" :alt="link.name" class="link-icon" @error="e => e.target.style.display = 'none'" />
              <span v-else style="color: #999;">-</span>
            </td>
            <td>{{ link.name }}</td>
            <td class="url-cell">{{ link.url }}</td>
            <td>{{ link.description || '-' }}</td>
            <td>{{ link.sort_order }}</td>
            <td>
              <span :class="['badge', link.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ link.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td class="actions">
              <router-link :to="`/friend-links/${link.id}/edit`" class="btn btn-secondary btn-sm">编辑</router-link>
              <button @click="handleDelete(link.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="links.length === 0">
            <td colspan="7" style="text-align: center; color: #999;">暂无友情链接</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { friendLinksApi } from '../api/modules.js'

const links = ref([])

const loadLinks = async () => {
  try {
    const { data } = await friendLinksApi.getAll()
    links.value = data
  } catch (err) {
    console.error('加载友情链接失败', err)
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这个友情链接吗？')) return

  try {
    await friendLinksApi.delete(id)
    links.value = links.value.filter(l => l.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadLinks)
</script>

<style scoped>
.link-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
}

.url-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>