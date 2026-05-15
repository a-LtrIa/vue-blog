<template>
  <div :class="['hitokoto-card', { 'hitokoto-transparent': transparent }]">
    <div class="card-header" v-if="!transparent">
      <h3 class="card-title">
        <Quote class="title-icon" :size="16" />
        一言
      </h3>
      <button class="refresh-btn" @click="fetchHitokoto" :disabled="loading" title="换一句">
        <RefreshCw :size="14" :class="{ spinning: loading }" />
      </button>
    </div>
    <div class="hitokoto-content" v-if="hitokoto">
      <div class="hitokoto-row">
        <p class="hitokoto-text" @click="copyHitokoto" :title="transparent ? '点击复制' : ''">
          <Quote v-if="transparent" :size="16" class="quote-mark" />
          {{ hitokoto.hitokoto }}
        </p>
        <div class="hitokoto-tools" v-if="transparent">
          <button class="tool-btn" @click="copyHitokoto" :title="copied ? '已复制' : '复制'">
            <Check v-if="copied" :size="15" class="icon-copied" />
            <Copy v-else :size="15" />
          </button>
          <button class="tool-btn" @click="fetchHitokoto" :disabled="loading" title="换一句">
            <RefreshCw :size="15" :class="{ spinning: loading }" />
          </button>
          <button class="tool-btn" @click="searchHitokoto" title="搜索这句话">
            <Search :size="15" />
          </button>
        </div>
      </div>
      <div class="hitokoto-meta" v-if="!transparent">
        <span class="hitokoto-from" v-if="hitokoto.from">—— {{ hitokoto.from }}</span>
        <span class="hitokoto-author" v-if="hitokoto.from_who">{{ hitokoto.from_who }}</span>
      </div>
      <div class="hitokoto-meta-row" v-if="transparent">
        <span class="hitokoto-from" v-if="hitokoto.from">—— {{ hitokoto.from }}</span>
        <span class="hitokoto-author" v-if="hitokoto.from_who">{{ hitokoto.from_who }}</span>
      </div>
    </div>
    <div class="hitokoto-loading" v-else-if="!hitokoto && loading">
      <p class="loading-text">加载中...</p>
    </div>
    <div class="hitokoto-error" v-else-if="!hitokoto">
      <p class="error-text" @click="fetchHitokoto">获取失败，点击重试</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Quote, RefreshCw, Copy, Check, Search } from 'lucide-vue-next'

defineProps({
  transparent: {
    type: Boolean,
    default: false
  }
})

const HITOKOTO_API = 'https://hitokoto.yealqp.cn/?encode=json&charset=utf-8'

const hitokoto = ref(null)
const loading = ref(false)
const copied = ref(false)

const fetchHitokoto = async () => {
  loading.value = true
  try {
    const res = await fetch(HITOKOTO_API)
    if (!res.ok) throw new Error('Network error')
    const data = await res.json()
    hitokoto.value = data
  } catch (err) {
    console.error('获取一言失败:', err)
    hitokoto.value = null
  } finally {
    loading.value = false
  }
}

const copyHitokoto = async () => {
  if (!hitokoto.value) return
  try {
    await navigator.clipboard.writeText(hitokoto.value.hitokoto)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = hitokoto.value.hitokoto
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

const searchHitokoto = () => {
  if (!hitokoto.value) return
  const query = encodeURIComponent(hitokoto.value.hitokoto)
  window.open(`https://www.bing.com/search?q=${query}`, '_blank')
}

onMounted(() => {
  fetchHitokoto()
})
</script>

<style scoped>
.hitokoto-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.hitokoto-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.hitokoto-transparent {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: relative;
  transition: background 0.4s ease, backdrop-filter 0.4s ease, -webkit-backdrop-filter 0.4s ease, border-color 0.4s ease;
}

.hitokoto-transparent:hover {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.title-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

.refresh-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.hitokoto-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.hitokoto-transparent .hitokoto-content {
  align-items: center;
  text-align: center;
  gap: 8px;
}

.hitokoto-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  position: relative;
}

.hitokoto-text {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.5px;
}

.hitokoto-transparent .hitokoto-text {
  font-size: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 6px;
  cursor: pointer;
  padding-right: 106px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.hitokoto-transparent:hover .hitokoto-text {
  color: var(--text-primary);
}

.quote-mark {
  flex-shrink: 0;
  margin-top: 2px;
  opacity: 0.4;
}

.hitokoto-tools {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  position: absolute;
  right: 0;
  top: -2px;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.hitokoto-transparent:hover .hitokoto-tools {
  opacity: 1;
  pointer-events: auto;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.tool-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.icon-copied {
  color: #4ade80;
}

.hitokoto-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hitokoto-meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
  min-height: 18px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.hitokoto-transparent:hover .hitokoto-meta-row {
  opacity: 1;
}

.hitokoto-from {
  font-size: 12px;
  color: var(--text-muted);
}

.hitokoto-author {
  font-size: 12px;
  color: var(--text-muted);
}

.hitokoto-author::before {
  content: '/';
  margin-right: 8px;
  color: var(--text-muted);
  opacity: 0.4;
}

.hitokoto-loading,
.hitokoto-error {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.hitokoto-transparent .hitokoto-loading,
.hitokoto-transparent .hitokoto-error {
  justify-content: center;
}

.loading-text {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.error-text {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  cursor: pointer;
}
</style>
