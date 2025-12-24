<template>
  <div 
    class="welcome-screen"
    :style="{
      backgroundImage: `url(${backgroundImage})`,
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
  >
    <img src="../assets/avatar.jpg" alt="Avatar" class="avatar" />
    <h1 class="nickname">小明的博客</h1>
    <p class="hint">{{ hintText }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  backgroundImage: String
})

const emit = defineEmits(['scroll-down'])

// 拖拽状态
const isDragging = ref(false)
const startY = ref(0)
const dragOffset = ref(0)
const THRESHOLD = 80

const hintText = computed(() => {
  if (dragOffset.value <= -THRESHOLD) {
    return '✓ 松手进入博客'
  }
  return '↑ 向上滑动进入'
})

// 鼠标事件
const onMouseDown = (e) => {
  isDragging.value = true
  startY.value = e.clientY
}

const onMouseMove = (e) => {
  if (!isDragging.value) return
  const dy = e.clientY - startY.value
  if (dy > 0) {
    dragOffset.value = -dy * 0.7
  } else {
    dragOffset.value = 0
  }
}

const onMouseUp = () => {
  if (!isDragging.value) return
  handleDragEnd()
  isDragging.value = false
}

// 触摸事件
const onTouchStart = (e) => {
  isDragging.value = true
  startY.value = e.touches[0].clientY
}

const onTouchMove = (e) => {
  if (!isDragging.value) return
  const dy = e.touches[0].clientY - startY.value
  if (dy > 0) {
    dragOffset.value = -dy * 0.7
  } else {
    dragOffset.value = 0
  }
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  handleDragEnd()
  isDragging.value = false
}

// 拖拽结束处理
const handleDragEnd = () => {
  console.log('【拖拽结束】offset:', dragOffset.value, '阈值:', THRESHOLD)
  if (dragOffset.value <= -THRESHOLD) {
    emit('scroll-down')
  } else {
    dragOffset.value = 0 // 回弹
  }
}
</script>

<style scoped>
/* ... 样式保持不变 ... */
</style>
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
  cursor: grab;
  transform-origin: top;
  backface-visibility: hidden;
}

.welcome-screen:active {
  cursor: grabbing;
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
  transition: opacity 0.2s;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>