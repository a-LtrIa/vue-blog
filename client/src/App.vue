<template>
  <div id="app">
    <!-- Global Background with Cinematic Effect -->
    <div class="global-background">
      <div
        class="bg-image"
        :class="{ 'loaded': bgLoaded }"
        :style="bgLoaded ? { backgroundImage: `url(${bgImage})` } : {}"
      ></div>
      <div class="bg-gradient"></div>
      <div class="bg-vignette"></div>
      <div class="bg-noise"></div>
    </div>

    <!-- Router View -->
    <router-view
      :posts="posts"
      :categories="categories"
      :tags="tags"
      :settings="settings"
      :socialLinks="socialLinks"
      :bgImage="bgImage"
    />

    <!-- Background Refresh Button -->
    <button
      class="bg-refresh-btn"
      :class="{ 'refreshing': isRefreshing }"
      @click="refreshBackground"
      :title="isRefreshing ? '正在刷新...' : '刷新背景图片'"
    >
      <svg class="refresh-icon" :class="{ 'spinning': isRefreshing }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { settingsApi, categoriesApi, postsApi, tagsApi, backgroundApi } from './api/index.js'

const bgImage = ref('')
const bgLoaded = ref(false)
const isRefreshing = ref(false)

const settings = ref({
  site_name: 'ALT的博客',
  site_description: '',
  author_name: '',
  author_bio: '',
  background_url: '',
  avatar_url: ''
})

const socialLinks = ref([])
const categories = ref([])
const posts = ref([])
const tags = ref([])

const loadBackground = async () => {
  try {
    const res = await backgroundApi.getRandom()
    if (res.data.url) {
      bgImage.value = res.data.url
      preloadImage(bgImage.value)
      return
    }
  } catch (error) {
    console.error('背景图片API请求失败', error)
  }
  bgImage.value = 'https://www.loliapi.com/acg/'
  preloadImage(bgImage.value)
}

const refreshBackground = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  bgLoaded.value = false

  try {
    await backgroundApi.refresh()
    await loadBackground()
  } catch (error) {
    console.error('刷新背景图片失败', error)
    bgLoaded.value = true
  } finally {
    isRefreshing.value = false
  }
}

const fetchData = async () => {
  try {
    const [settingsRes, socialRes, categoriesRes, postsRes, tagsRes] = await Promise.all([
      settingsApi.getAll(),
      settingsApi.getSocialLinks(),
      categoriesApi.getAll(),
      postsApi.getAll({ status: 'published', limit: 20 }),
      tagsApi.getAll()
    ])

    settings.value = { ...settings.value, ...settingsRes.data }
    socialLinks.value = socialRes.data?.socialLinks || socialRes.data || []
    categories.value = categoriesRes.data?.categories || categoriesRes.data || []
    posts.value = postsRes.data?.posts || []
    tags.value = tagsRes.data?.tags || tagsRes.data || []
  } catch (error) {
    console.error('数据加载失败', error)
  }
}

const preloadImage = (url) => {
  const img = new Image()
  img.onload = () => {
    bgLoaded.value = true
  }
  img.onerror = () => {
    bgLoaded.value = true
  }
  img.src = url
}

onMounted(async () => {
  await Promise.all([fetchData(), loadBackground()])
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* Global Cinematic Background */
.global-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  background: #0f0f1a;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  opacity: 0;
  transform: scale(1.1);
  transition: opacity 1.5s ease, transform 2s cubic-bezier(0.16, 1, 0.3, 1);
}

.bg-image.loaded {
  opacity: 1;
  transform: scale(1);
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(120, 119, 198, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.5) 0%, transparent 70%);
  animation: gradientShift 20s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.bg-vignette {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
}

.bg-noise {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  pointer-events: none;
}

.bg-refresh-btn {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 999;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  outline: none;
}

.bg-refresh-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

.bg-refresh-btn:active {
  transform: scale(0.95);
}

.bg-refresh-btn.refreshing {
  pointer-events: none;
  opacity: 0.5;
}

.refresh-icon {
  width: 18px;
  height: 18px;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
