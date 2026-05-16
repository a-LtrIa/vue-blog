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

    <!-- 收藏图片 + 上传区域 -->
    <div class="card">
      <div class="card-header">
        <h3>收藏图片 ({{ preservedImages.length }} 张)</h3>
        <span class="preserve-hint">收藏的图片不会随刷新消失</span>
      </div>

      <div
        class="image-grid"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <!-- 收藏的图片 -->
        <div
          v-for="img in preservedImages"
          :key="img.filename"
          class="image-card preserved"
        >
          <div class="image-wrapper">
            <img :src="img.url" :alt="img.filename" loading="lazy" />
            <div class="image-overlay">
              <button
                class="action-btn unpreserve-btn"
                @click="unpreserveImage(img.filename)"
                title="取消收藏"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                :class="{ 'confirm': deleteClickCount[img.filename] === 1 }"
                @click="deleteImage(img.filename)"
                :title="deleteClickCount[img.filename] === 1 ? '再点击一次确认删除' : '双击删除图片'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="image-info">
            <span class="image-size">{{ formatSize(img.size) }}</span>
            <span class="preserve-badge">已收藏</span>
          </div>
        </div>

        <!-- 上传占位卡片 -->
        <div
          class="upload-card"
          :class="{ 'drag-active': isDragOver }"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            @change="handleFileSelect"
            style="display: none"
          />
          <div class="upload-content">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="upload-text">点击或拖拽上传</p>
            <p class="upload-subtext">JPG、PNG、GIF、WebP</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 缓存图片 -->
    <div class="card">
      <div class="card-header">
        <h3>缓存图片 ({{ regularImages.length }} 张)</h3>
        <span class="cache-date" v-if="cacheDate">缓存日期：{{ cacheDate }}</span>
      </div>

      <div v-if="loading && images.length === 0" class="loading-state">
        加载中...
      </div>

      <div v-else-if="images.length === 0" class="empty-state">
        暂无缓存图片，点击"获取新图片"开始
      </div>

      <div v-else-if="regularImages.length === 0" class="empty-state">
        暂无缓存图片，所有图片都已收藏
      </div>

      <div v-else class="image-grid">
        <div
          v-for="img in regularImages"
          :key="img.filename"
          class="image-card"
        >
          <div class="image-wrapper">
            <img :src="img.url" :alt="img.filename" loading="lazy" />
            <div class="image-overlay">
              <button
                class="action-btn preserve-btn"
                @click="preserveImage(img.filename)"
                title="收藏图片"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                :class="{ 'confirm': deleteClickCount[img.filename] === 1 }"
                @click="deleteImage(img.filename)"
                :title="deleteClickCount[img.filename] === 1 ? '再点击一次确认删除' : '双击删除图片'"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
import { ref, onMounted, computed } from 'vue'
import { backgroundApi } from '../api/modules.js'

const images = ref([])
const preservedImages = ref([])
const cacheDate = ref(null)
const loading = ref(false)
const isDragOver = ref(false)
const fileInput = ref(null)

const regularImages = computed(() => {
  const preservedSet = new Set(preservedImages.value.map(img => img.filename))
  return images.value.filter(img => !preservedSet.has(img.filename))
})

const loadImages = async () => {
  loading.value = true
  try {
    const [listRes, preservedRes] = await Promise.all([
      backgroundApi.list(),
      backgroundApi.preserved()
    ])
    images.value = listRes.data.images
    cacheDate.value = listRes.data.date
    preservedImages.value = preservedRes.data.images
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
  if (!confirm('确定要刷新全部缓存吗？收藏的图片不会被删除。')) return
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

const deleteClickCount = ref({})
const deleteTimers = ref({})

const deleteImage = async (filename) => {
  deleteClickCount.value[filename] = (deleteClickCount.value[filename] || 0) + 1

  if (deleteClickCount.value[filename] === 1) {
    deleteTimers.value[filename] = setTimeout(() => {
      deleteClickCount.value[filename] = 0
      delete deleteTimers.value[filename]
    }, 500)
    return
  }

  if (deleteClickCount.value[filename] >= 2) {
    if (deleteTimers.value[filename]) {
      clearTimeout(deleteTimers.value[filename])
      delete deleteTimers.value[filename]
    }
    deleteClickCount.value[filename] = 0

    try {
      await backgroundApi.delete(filename)
      images.value = images.value.filter(img => img.filename !== filename)
      preservedImages.value = preservedImages.value.filter(img => img.filename !== filename)
    } catch (err) {
      alert('删除失败')
    }
  }
}

const preserveImage = async (filename) => {
  try {
    await backgroundApi.preserve(filename)
    const img = images.value.find(i => i.filename === filename)
    if (img) {
      preservedImages.value.push(img)
    }
  } catch (err) {
    alert('收藏失败')
  }
}

const unpreserveImage = async (filename) => {
  try {
    await backgroundApi.unpreserve(filename)
    preservedImages.value = preservedImages.value.filter(img => img.filename !== filename)
  } catch (err) {
    alert('取消收藏失败')
  }
}

const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files)
  await uploadFiles(files)
}

const handleDrop = async (e) => {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  await uploadFiles(files)
}

const uploadFiles = async (files) => {
  if (files.length === 0) return

  loading.value = true
  try {
    for (const file of files) {
      await backgroundApi.upload(file)
    }
    await loadImages()
  } catch (err) {
    alert('上传失败: ' + (err.response?.data?.error || err.message))
  } finally {
    loading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
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

.preserve-hint {
  font-size: 14px;
  color: #e6a23c;
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
  padding: 4px;
}

.image-grid.drag-over {
  background: #f0f7ff;
  border-radius: 8px;
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

.image-card.preserved {
  border-color: #e6a23c;
  box-shadow: 0 0 0 1px #e6a23c20;
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
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, background-color 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:active {
  transform: scale(0.95);
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.preserve-btn {
  background: rgba(230, 162, 60, 0.9);
  color: #fff;
}

.preserve-btn:hover {
  background: #e6a23c;
}

.unpreserve-btn {
  background: rgba(230, 162, 60, 0.9);
  color: #fff;
}

.unpreserve-btn:hover {
  background: #cf9236;
}

.unpreserve-btn svg {
  fill: currentColor;
}

.delete-btn {
  background: rgba(231, 76, 60, 0.9);
  color: #fff;
}

.delete-btn:hover {
  background: #c0392b;
}

.delete-btn.confirm {
  background: #ff4d4f;
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.image-info {
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-size {
  font-size: 12px;
  color: #7a7a7a;
}

.preserve-badge {
  font-size: 11px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

/* 上传卡片 */
.upload-card {
  border-radius: 8px;
  overflow: hidden;
  border: 2px dashed #d0d0d0;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-card:hover {
  border-color: #409eff;
  background: #f0f7ff;
}

.upload-card.drag-active {
  border-color: #409eff;
  background: #e6f2ff;
  transform: scale(1.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: #909399;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin: 0;
  font-weight: 500;
}

.upload-subtext {
  font-size: 12px;
  color: #909399;
  margin: 0;
}
</style>
