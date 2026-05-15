<template>
  <div>
    <div class="page-header">
      <h1>资源分享</h1>
      <router-link to="/resources/new" class="btn btn-primary">添加资源</router-link>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>标签</th>
            <th>链接</th>
            <th>状态</th>
            <th>浏览</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resources" :key="resource.id">
            <td>{{ resource.title }}</td>
            <td>
              <span v-if="resource.tag" class="badge badge-info">{{ resource.tag }}</span>
              <span v-else>-</span>
            </td>
            <td>
              <a v-if="resource.url" :href="resource.url" target="_blank" class="link">{{ resource.url }}</a>
              <span v-else>-</span>
            </td>
            <td>
              <span :class="['badge', resource.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ resource.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ resource.view_count }}</td>
            <td>{{ formatDate(resource.created_at) }}</td>
            <td class="actions">
              <router-link :to="`/resources/${resource.id}/edit`" class="btn btn-secondary btn-sm">编辑</router-link>
              <button @click="handleDelete(resource.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="resources.length === 0">
            <td colspan="7" style="text-align: center; color: #999;">暂无资源</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { resourcesApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const resources = ref([])

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

const loadResources = async () => {
  try {
    const { data } = await resourcesApi.getAll({ limit: 100 })
    resources.value = data.resources
  } catch (err) {
    console.error('加载资源失败', err)
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这个资源吗？')) return

  try {
    await resourcesApi.delete(id)
    resources.value = resources.value.filter(r => r.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadResources)
</script>