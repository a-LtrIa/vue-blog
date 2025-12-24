<template>
  <!-- 根元素不再有 transform -->
  <div class="welcome-screen" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 新增一个内部容器，用于拖拽位移 -->
    <div 
      class="welcome-content"
      :style="{
        transform: `translateY(${dragOffset.value}px)`,
        transition: isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @mousemove="onMouseMove"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
      @touchcancel.passive="onTouchEnd"
      @touchmove.passive="onTouchMove"
      @wheel.passive="onWheel"
      @click="onClickBackground"
    >
      <img src="../assets/avatar.jpg" alt="Avatar" class="avatar" />
      <h1 class="nickname" @click.stop="enterBlog">ALT的博客</h1>
      <p class="hint" @click.stop="enterBlog">{{ hintText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  backgroundImage: String
})
const emit = defineEmits(['scroll-down'])

// 拖拽状态
const isDragging = ref(false)
const startY = ref(0)
const dragOffset = ref(0)
const THRESHOLD = 80 // 拖拽阈值

// 防止滚轮多次触发
let wheelTimeout = null

const hintText = computed(() => {
  return dragOffset.value <= -THRESHOLD ? '✓ 松手进入博客' : '↑ 上滑 / 滚动 / 点击进入'
})

// === 统一入口 ===
const enterBlog = () => {
  if (isDragging.value) return // 拖拽中不响应点击
  cleanup()
  emit('scroll-down')
}

// === 拖拽逻辑（保持原有）===
const getClientY = (e) => {
  if (e.touches?.length) return e.touches[0].clientY
  return e.clientY
}

const startDrag = (e) => {
  isDragging.value = true
  startY.value = getClientY(e)
}

const onDragMove = (e) => {
  if (!isDragging.value) return
  const dy = getClientY(e) - startY.value
  if (dy < 0) {
    dragOffset.value = dy * 0.7 // 向上滑
  } else {
    dragOffset.value = Math.max(dy * 0.3, 0) // 向下滑轻微回弹
  }
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false

  if (dragOffset.value <= -THRESHOLD) {
    emit('scroll-down')
  } else {
    dragOffset.value = 0
  }
}

// 鼠标事件
const onMouseDown = (e) => startDrag(e)
const onMouseMove = (e) => onDragMove(e)
const onMouseUp = () => endDrag()

// 触摸事件
const onTouchStart = (e) => startDrag(e)
const onTouchMove = (e) => onDragMove(e)
const onTouchEnd = () => endDrag()

// === 滚轮事件 ===
const onWheel = (e) => {
  // 只响应向下滚动（内容在下方）
  if (e.deltaY <= 10) return

  // 防抖：100ms 内只触发一次
  if (wheelTimeout) return
  wheelTimeout = setTimeout(() => {
    wheelTimeout = null
  }, 100)

  enterBlog()
}

// === 点击背景（可选）===
// 如果希望点击空白区域也进入，保留；否则删除
const onClickBackground = (e) => {
  // 如果点击的是文字，已由 stop 阻止冒泡，不会触发这里
  // 可选择是否允许点背景进入
  // enterBlog()
}

// 清理函数
const cleanup = () => {
  isDragging.value = false
  dragOffset.value = 0
  if (wheelTimeout) {
    clearTimeout(wheelTimeout)
    wheelTimeout = null
  }
}

// 可选：监听键盘 Enter 也进入（增强体验）
const handleKeyDown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    enterBlog()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (wheelTimeout) clearTimeout(wheelTimeout)
})
</script>

<style scoped>
.welcome-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  color: white;
  z-index: 100;
  user-select: none;
  cursor: default; /* 不再是 grab */

}

.welcome-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 拖拽位移将作用于此 */
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  animation: rotate 20s linear infinite;
}

.avatar:hover {
  animation-play-state: paused;
}

.nickname,
.hint {
  cursor: pointer; /* 明确可点击 */
  transition: opacity 0.2s;
}

.nickname:hover,
.hint:hover {
  opacity: 0.9;
}

.nickname {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 2px 6px rgba(0,0,0,0.5);
}

.hint {
  margin-top: 32px;
  font-size: 0.95rem;
  opacity: 0.75;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>