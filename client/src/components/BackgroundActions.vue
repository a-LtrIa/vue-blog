<template>
  <div class="bg-actions-card">
    <div class="actions-row">
      <div class="btn-wrapper">
        <button class="action-btn" @click="refreshBg" :disabled="isRefreshing">
          <RefreshCw :size="18" :class="{ spinning: isRefreshing }" />
        </button>
        <span class="btn-tooltip">刷新背景</span>
      </div>
      <div class="btn-wrapper">
        <button class="action-btn" @click="downloadBg">
          <Download :size="18" />
        </button>
        <span class="btn-tooltip">下载图片</span>
      </div>
      <div class="btn-wrapper">
        <button class="action-btn" @click="openViewer">
          <Eye :size="18" />
        </button>
        <span class="btn-tooltip">查看图片</span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="showViewer" class="image-viewer-overlay" @click="closeViewer">
        <img :src="currentBgImage" class="viewer-image" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RefreshCw, Download, Eye } from 'lucide-vue-next'
import { backgroundApi } from '../api/index.js'

const props = defineProps({
  bgImage: {
    type: String,
    default: ''
  }
})

const isRefreshing = ref(false)
const showViewer = ref(false)
const currentBgImage = ref(props.bgImage)

watch(() => props.bgImage, (val) => {
  if (val) {
    currentBgImage.value = val
  }
})

const refreshBg = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true

  const minDuration = new Promise(resolve => setTimeout(resolve, 600))

  try {
    const res = await backgroundApi.getRandom()
    if (res.data?.url) {
      const img = new Image()
      img.onload = async () => {
        const bgEl = document.querySelector('.bg-image')
        if (bgEl) {
          bgEl.style.backgroundImage = `url(${res.data.url})`
        }
        currentBgImage.value = res.data.url
        await minDuration
        isRefreshing.value = false
      }
      img.onerror = async () => {
        await minDuration
        isRefreshing.value = false
      }
      img.src = res.data.url
    } else {
      await minDuration
      isRefreshing.value = false
    }
  } catch (error) {
    console.error('刷新背景失败', error)
    await minDuration
    isRefreshing.value = false
  }
}

const openViewer = () => {
  if (!currentBgImage.value) return
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
}

const downloadBg = () => {
  if (!currentBgImage.value) return
  const link = document.createElement('a')
  link.href = currentBgImage.value
  link.download = `background-${Date.now()}.jpg`
  link.target = '_blank'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.bg-actions-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.bg-actions-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.actions-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.btn-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.btn-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

.btn-wrapper:hover .btn-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== 看图模式 ===== */
.image-viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.viewer-image {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center;
  user-select: none;
  -webkit-user-drag: none;
}

.viewer-fade-enter-active {
  transition: opacity 0.3s ease;
}

.viewer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}
</style>
