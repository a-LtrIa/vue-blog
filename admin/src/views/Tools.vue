<template>
  <div>
    <div class="page-header">
      <h1>小工具</h1>
      <router-link to="/tools/new" class="btn btn-primary">添加工具</router-link>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>图标</th>
            <th>分类</th>
            <th>链接</th>
            <th>排序</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tool in tools" :key="tool.id">
            <td>{{ tool.name }}</td>
            <td>{{ tool.icon || '-' }}</td>
            <td>{{ tool.category || '-' }}</td>
            <td>
              <a v-if="tool.url" :href="tool.url" target="_blank" class="link">{{ tool.url }}</a>
              <span v-else>-</span>
            </td>
            <td>{{ tool.sort_order }}</td>
            <td>
              <span :class="['badge', tool.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ tool.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ formatDate(tool.created_at) }}</td>
            <td class="actions">
              <router-link :to="`/tools/${tool.id}/edit`" class="btn btn-secondary btn-sm">编辑</router-link>
              <button @click="handleDelete(tool.id)" class="btn btn-danger btn-sm">删除</button>
            </td>
          </tr>
          <tr v-if="tools.length === 0">
            <td colspan="8" style="text-align: center; color: #999;">暂无工具</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toolsApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const tools = ref([])

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

const loadTools = async () => {
  try {
    const { data } = await toolsApi.getAll()
    tools.value = data
  } catch (err) {
    console.error('加载工具失败', err)
  }
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这个工具吗？')) return

  try {
    await toolsApi.delete(id)
    tools.value = tools.value.filter(t => t.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || '删除失败')
  }
}

onMounted(loadTools)
</script>
