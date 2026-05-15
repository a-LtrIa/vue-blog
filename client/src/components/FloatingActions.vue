<template>
  <div class="floating-actions" :class="{ 'actions-expanded': isExpanded }">
    <Transition name="fab-backtop">
      <div v-if="showBackTop" class="fab-wrapper fab-backtop-wrapper">
        <button class="fab-btn fab-backtop" @click="scrollToTop">
          <span class="fab-icon-wrap">
            <ArrowUp :size="18" class="fab-icon" />
          </span>
          <span class="fab-shine"></span>
          <span class="fab-ring"></span>
        </button>
        <span class="fab-tooltip">回到顶部</span>
      </div>
    </Transition>

    <Transition name="fab-music">
      <div class="fab-music-wrapper" v-if="showMusicPlayer">
        <button class="fab-btn fab-music" @click.stop="togglePlay">
          <span class="fab-icon-wrap music-icon-wrap">
            <img
              :src="currentSong.cover || 'https://picsum.photos/seed/music/80/80'"
              class="music-cover-thumb"
              :class="{ 'is-playing': isPlaying }"
            />
            <span class="play-indicator" :class="{ 'show': !isPlaying }">
              <Pause v-if="isPlaying" :size="14" />
              <Play v-else :size="14" />
            </span>
          </span>
          <span class="fab-shine"></span>
          <span class="fab-ring"></span>
        </button>
        <div class="fab-music-card">
          <div class="music-cover-wrap">
            <img
              :src="currentSong.cover || 'https://picsum.photos/seed/music/80/80'"
              class="music-cover"
              :class="{ 'is-playing': isPlaying }"
            />
            <div class="music-cover-ring"></div>
          </div>
          <div class="music-info">
            <span class="music-title">{{ currentSong.title }}</span>
            <span class="music-artist">{{ currentSong.artist || '未知艺术家' }}</span>
            <div class="music-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <div class="progress-time">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>
          </div>
          <div class="music-controls">
            <button class="music-btn" @click="prevTrack">
              <SkipBack :size="14" />
            </button>
            <button class="music-btn music-toggle" @click="togglePlay">
              <Pause v-if="isPlaying" :size="16" />
              <Play v-else :size="16" />
            </button>
            <button class="music-btn" @click="nextTrack">
              <SkipForward :size="14" />
            </button>
          </div>
        </div>
        <span class="fab-tooltip fab-tooltip-left">{{ currentSong.title || '音乐播放器' }}</span>
      </div>
    </Transition>

    <TransitionGroup name="fab-item" tag="div" class="fab-list">
      <div
        v-for="(btn, index) in expandedButtons"
        :key="btn.id"
        class="fab-wrapper"
        :style="{ '--fab-index': index, '--fab-delay': `${index * 0.06}s` }"
      >
        <button
          class="fab-btn"
          :class="[`fab-${btn.id}`, { 'fab-loading': btn.loading }]"
          @click="handleAction(btn)"
          :disabled="btn.loading"
        >
          <span class="fab-icon-wrap">
            <component :is="btn.icon" :size="18" class="fab-icon" />
          </span>
          <span class="fab-shine"></span>
          <span class="fab-ring"></span>
        </button>
        <span class="fab-tooltip">{{ btn.label }}</span>
      </div>
    </TransitionGroup>

    <div class="fab-main-wrapper">
      <button
        class="fab-btn fab-main"
        :class="{ 'fab-main-active': isExpanded }"
        @click="toggleExpand"
      >
        <span class="fab-icon-wrap">
          <Plus :size="18" class="fab-icon fab-icon-main" />
        </span>
        <span class="fab-shine"></span>
        <span class="fab-ring"></span>
      </button>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="showViewer" class="image-viewer-overlay" @click="closeViewer">
        <img :src="currentBgImage" class="viewer-image" />
      </div>
    </Transition>

    <Transition name="toast-fade">
      <div v-if="toastMessage" class="fab-toast">
        <Check :size="14" />
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Plus,
  ArrowUp,
  RefreshCw,
  Download,
  Eye,
  Share2,
  MessageSquare,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-vue-next'
import { backgroundApi, musicApi } from '../api/index.js'

const props = defineProps({
  bgImage: {
    type: String,
    default: ''
  }
})

const isExpanded = ref(false)
const isRefreshing = ref(false)
const showBackTop = ref(false)
const toastMessage = ref('')
const showViewer = ref(false)
const currentBgImage = ref(props.bgImage)
const showMusicPlayer = ref(false)
const musicList = ref([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
let audioEl = null
let progressTimer = null
let toastTimer = null

const currentSong = computed(() => {
  if (musicList.value.length === 0) {
    return { title: '暂无音乐', artist: '请添加音乐', cover: '' }
  }
  const song = musicList.value[currentIndex.value] || musicList.value[0]
  return {
    ...song,
    cover: song.cover_url || ''
  }
})

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const loadMusicList = async () => {
  try {
    const res = await musicApi.getAll({ status: 'published' })
    if (res.data && res.data.length > 0) {
      musicList.value = res.data
      currentIndex.value = Math.floor(Math.random() * res.data.length)
      showMusicPlayer.value = true
      initAudio()
    }
  } catch (err) {
    console.error('加载音乐列表失败', err)
  }
}

const initAudio = () => {
  if (!audioEl && currentSong.value.audio_url) {
    audioEl = new Audio()
    audioEl.src = currentSong.value.audio_url
    audioEl.addEventListener('timeupdate', updateProgress)
    audioEl.addEventListener('loadedmetadata', () => {
      duration.value = audioEl.duration
    })
    audioEl.addEventListener('ended', handleTrackEnded)
  }
}

const updateProgress = () => {
  if (audioEl) {
    currentTime.value = audioEl.currentTime
  }
}

const handleTrackEnded = () => {
  nextTrack()
}

const togglePlay = async () => {
  if (musicList.value.length === 0) {
    showToast('暂无音乐可播放')
    return
  }

  if (!audioEl) {
    initAudio()
  }

  if (isPlaying.value) {
    audioEl.pause()
    isPlaying.value = false
    stopProgressTimer()
  } else {
    try {
      await audioEl.play()
      isPlaying.value = true
      startProgressTimer()
      musicApi.recordPlay(currentSong.value.id).catch(() => {})
    } catch (err) {
      console.error('播放失败', err)
      showToast('播放失败')
    }
  }
}

const startProgressTimer = () => {
  stopProgressTimer()
  progressTimer = setInterval(() => {
    if (audioEl) {
      currentTime.value = audioEl.currentTime
      duration.value = audioEl.duration || 0
    }
  }, 1000)
}

const stopProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const prevTrack = () => {
  if (musicList.value.length === 0) return
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = musicList.value.length - 1
  }
  changeTrack()
}

const nextTrack = () => {
  if (musicList.value.length === 0) return
  if (currentIndex.value < musicList.value.length - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
  changeTrack()
}

const changeTrack = () => {
  if (audioEl) {
    audioEl.src = currentSong.value.audio_url
    if (isPlaying.value) {
      audioEl.play().catch(() => {})
    }
  }
  currentTime.value = 0
  duration.value = currentSong.value.duration || 0
}

watch(() => props.bgImage, (val) => {
  if (val) currentBgImage.value = val
})

watch(currentSong, (newSong) => {
  if (audioEl && newSong.audio_url) {
    duration.value = newSong.duration || 0
  }
})

const expandedButtons = computed(() => {
  if (!isExpanded.value) return []
  return [
    { id: 'refresh-bg', icon: RefreshCw, label: '切换背景', loading: isRefreshing.value },
    { id: 'download-bg', icon: Download, label: '下载图片', loading: false },
    { id: 'view-bg', icon: Eye, label: '查看图片', loading: false },
    { id: 'share', icon: Share2, label: '分享页面', loading: false },
    { id: 'message', icon: MessageSquare, label: '留言反馈', loading: false }
  ]
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleAction = async (btn) => {
  switch (btn.id) {
    case 'refresh-bg':
      await refreshBackground()
      break
    case 'download-bg':
      downloadBg()
      break
    case 'view-bg':
      openViewer()
      break
    case 'share':
      sharePage()
      break
    case 'message':
      goToComments()
      break
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const refreshBackground = async () => {
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
        showToast('背景已切换')
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

const openViewer = () => {
  if (!currentBgImage.value) return
  showViewer.value = true
}

const closeViewer = () => {
  showViewer.value = false
}

const sharePage = async () => {
  const url = window.location.href
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(url)
      showToast('链接已复制到剪贴板')
    } catch {
      fallbackCopy(url)
    }
  } else {
    fallbackCopy(url)
  }
}

const fallbackCopy = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  showToast('链接已复制到剪贴板')
}

const goToComments = () => {
  const commentSection = document.getElementById('comments')
  if (commentSection) {
    commentSection.scrollIntoView({ behavior: 'smooth' })
  } else {
    showToast('暂无评论区')
  }
}

const showToast = (msg) => {
  clearTimeout(toastTimer)
  toastMessage.value = msg
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

const handleScroll = () => {
  showBackTop.value = window.scrollY > 300
}

const handleClickOutside = (e) => {
  if (!isExpanded.value) return
  const container = document.querySelector('.floating-actions')
  if (container && !container.contains(e.target)) {
    isExpanded.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  loadMusicList()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(toastTimer)
  stopProgressTimer()
  if (audioEl) {
    audioEl.pause()
    audioEl = null
  }
})
</script>

<style scoped>
.floating-actions {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0;
  pointer-events: none;
}

.floating-actions > * {
  pointer-events: auto;
}

.fab-backtop-wrapper {
  margin-bottom: 14px;
}

.fab-list {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 14px;
}

.fab-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.fab-btn {
  position: relative;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-btn:hover {
  transform: translateY(-3px) scale(1.08);
  border-color: rgba(255, 255, 255, 0.35);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.18) 100%
  );
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.fab-btn:active {
  transform: translateY(-1px) scale(0.95);
  transition-duration: 0.1s;
}

.fab-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.fab-icon-wrap {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-icon {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-btn:hover .fab-icon {
  transform: scale(1.1);
}

.fab-loading .fab-icon {
  animation: fab-spin 1s linear infinite;
}

@keyframes fab-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.fab-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    135deg,
    transparent 30%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 70%
  );
  z-index: 1;
  transform: translateX(-100%) translateY(-100%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.fab-btn:hover .fab-shine {
  transform: translateX(30%) translateY(30%);
}

.fab-ring {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.fab-btn:hover .fab-ring {
  border-color: rgba(255, 255, 255, 0.2);
  inset: -4px;
}

.fab-tooltip {
  position: absolute;
  right: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%) translateX(8px);
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fab-tooltip::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-left-color: rgba(0, 0, 0, 0.75);
  border-right: none;
}

.fab-wrapper:hover .fab-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}

/* Main FAB */
.fab-main-wrapper {
  position: relative;
}

.fab-main {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.fab-main:hover {
  transform: translateY(-3px) scale(1.08);
  border-color: rgba(255, 255, 255, 0.35);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.18) 100%
  );
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.fab-main .fab-ring {
  border-color: rgba(255, 255, 255, 0.1);
  inset: -3px;
}

.fab-main:hover .fab-ring {
  border-color: rgba(255, 255, 255, 0.2);
  inset: -5px;
}

.fab-icon-main {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-main-active .fab-icon-main {
  transform: rotate(45deg);
}

/* Back to top transition */
.fab-backtop-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-backtop-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-backtop-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.5);
}

.fab-backtop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.7);
}

/* FAB Item Transitions */
.fab-item-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--fab-delay);
}

.fab-item-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: calc(var(--fab-delay) * 0.5);
}

.fab-item-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.5);
}

.fab-item-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.7);
}

/* Image Viewer */
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

/* Toast */
.fab-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.toast-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-fade-leave-active {
  transition: all 0.2s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

/* Music Player */
.fab-music-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 14px;
}

.fab-music {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.fab-music:hover {
  transform: translateY(-3px) scale(1.08);
  border-color: rgba(255, 255, 255, 0.35);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.18) 100%
  );
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.fab-music .fab-ring {
  border-color: rgba(255, 255, 255, 0.1);
  inset: -3px;
}

.fab-music:hover .fab-ring {
  border-color: rgba(255, 255, 255, 0.2);
  inset: -5px;
}

.music-icon-wrap {
  border-radius: 50%;
  overflow: visible;
  position: relative;
}

.music-cover-thumb {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  animation: music-rotate 8s linear infinite;
  animation-play-state: paused;
}

.music-cover-thumb.is-playing {
  animation-play-state: running;
}

.play-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.fab-music:hover .play-indicator,
.play-indicator.show {
  opacity: 1;
}

.fab-music-card {
  position: absolute;
  right: 62px;
  top: 50%;
  transform: translateX(10px) translateY(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  corner-shape: superellipse(2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@supports not (corner-shape: superellipse(2)) {
  .fab-music-card {
    border-radius: 24px;
  }
}

.fab-music-wrapper:hover .fab-music-card {
  opacity: 1;
  visibility: visible;
  transform: translateX(0) translateY(-50%);
}

.music-cover-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.music-cover {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  animation: music-rotate 8s linear infinite;
  animation-play-state: paused;
}

.music-cover.is-playing {
  animation-play-state: running;
}

.music-cover-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

@keyframes music-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.music-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
  max-width: 120px;
}

.music-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-progress {
  margin-top: 6px;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.music-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.music-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.music-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.music-toggle {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
}

.fab-tooltip-left {
  right: auto;
  left: calc(100% + 14px);
}

.fab-tooltip-left::after {
  right: auto;
  left: -5px;
  border-left-color: transparent;
  border-right-color: rgba(0, 0, 0, 0.75);
}

/* Music transition */
.fab-music-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-music-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-music-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.5);
}

.fab-music-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.7);
}

/* Responsive */
@media (max-width: 640px) {
  .floating-actions {
    bottom: 20px;
    right: 20px;
  }

  .fab-btn {
    width: 42px;
    height: 42px;
  }

  .fab-main {
    width: 48px;
    height: 48px;
  }

  .fab-list {
    gap: 10px;
    margin-bottom: 10px;
  }

  .fab-backtop-wrapper {
    margin-bottom: 10px;
  }
}
</style>
