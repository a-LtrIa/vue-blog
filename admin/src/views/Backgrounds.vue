<template>
  <div>
    <div class="page-header">
      <h1>背景图片管理</h1>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="fetchNew" :disabled="loading">
          {{ loading ? '获取中...' : '获取新图片' }}
        </button>
        <button class="btn btn-primary" @click="refreshAll" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新全部缓存' }}
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>缓存图片 ({{ images.length }} 张)</h3>
        <span class="cache-date" v-if="cacheDate">缓存日期：{{ cacheDate }}</span>
      </div>

      <div v-if="loading && images.length === 0" class="loading-state">
        加载中...
      </div>

      <div v-else-if="images.length === 0" class="empty-state">
        暂无缓存图片，点击"获取新图片"开始
      </div>

      <div v-else class="image-grid">
        <div v-for="img in images" :key="img.filename" class="image-card">
          <div class="image-wrapper">
            <img :src="img.url" :alt="img.filename" loading="lazy" />
            <div class="image-overlay">
              <button class="delete-btn" @click="deleteImage(img.filename)" title="删除图片">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="image-info">
            <span class="image-size">{{ formatSize(img.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { backgroundApi } from '../api/modules.js'

const images = ref([])
const cacheDate = ref(null)
const loading = ref(false)

const loadImages = async () => {
  loading.value = true
  try {
    const { data } = await backgroundApi.list()
    images.value = data.images
    cacheDate.value = data.date
  } catch (err) {
    console.error('加载图片列表失败', err)
  } finally {
    loading.value = false
  }
}

const fetchNew = async () => {
  loading.value = true
  try {
    await backgroundApi.fetch()
    await loadImages()
  } catch (err) {
    alert('获取新图片失败')
  } finally {
    loading.value = false
  }
}

const refreshAll = async () => {
  if (!confirm('确定要刷新全部缓存吗？这将删除所有现有图片并重新下载。')) return
  loading.value = true
  try {
    await backgroundApi.refresh()
    await loadImages()
  } catch (err) {
    alert('刷新缓存失败')
  } finally {
    loading.value = false
  }
}

const deleteImage = async (filename) => {
  if (!confirm('确定要删除这张图片吗？')) return
  try {
    await backgroundApi.delete(filename)
    images.value = images.value.filter(img => img.filename !== filename)
  } catch (err) {
    alert('删除失败')
  }
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

onMounted(() => {
  loadImages()
})
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 12px;
}

.cache-date {
  font-size: 14px;
  color: #7a7a7a;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #7a7a7a;
  font-size: 15px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #fff;
  transition: box-shadow 0.2s;
}

.image-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66.67%;
  overflow: hidden;
  cursor: pointer;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-card:hover .image-wrapper img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.delete-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(231, 76, 60, 0.9);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, background-color 0.2s;
}

.delete-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.95);
}

.delete-btn svg {
  width: 18px;
  height: 18px;
}

.image-info {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-size {
  font-size: 12px;
  color: #7a7a7a;
}
</style>
