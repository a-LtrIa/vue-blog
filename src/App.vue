<!-- src/App.vue -->
<template>
  <div id="app" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- 欢迎页：固定定位，不参与滚动 -->
    <transition name="welcome-leave">
      <Welcome 
        v-if="showWelcome"
        :background-image="bgImage"
        @scroll-down="handleScrollDown"
      />
    </transition>
    <!-- App.vue 中的 transition -->
    <transition name="welcome-page">
      <Welcome 
        v-if="showWelcome"
        :background-image="bgImage"
        @scroll-down="handleScrollDown"
      />
    </transition>

    <!-- 博客内容：放在独立滚动容器中 -->
    <div 
      class="blog-scroller" 
      :class="{ active: !showWelcome }"
    >
      <BlogContent 
        @pull-to-welcome="handlePullToWelcome"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Welcome from './components/Welcome.vue'
import BlogContent from './components/BlogContent.vue'

const bgImage = ref('')
const showWelcome = ref(true)

const fetchBackground = async () => {
  try {
    bgImage.value = `https://www.loliapi.com/acg/?t=${Date.now()}`
  } catch (error) {
    console.error('背景图加载失败', error)
    document.body.style.backgroundColor = '#f0f0f0'
  }
}

const handleScrollDown = () => {
  showWelcome.value = false
  // 防止 body 滚动
  document.body.classList.add('no-scroll')
}

const handlePullToWelcome = () => {
  showWelcome.value = true
  document.body.classList.remove('no-scroll')
}

onMounted(() => {
  fetchBackground()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  /* 关键：禁止 #app 自身滚动 */
  overflow: hidden;
}

/* 欢迎页进入动画 */
.welcome-page-enter-active {
  transition: 
    transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.5s ease;
  transform-origin: top;
}
.welcome-page-enter-from {
  transform: rotateX(-90deg); /* 从上方翻入 */
  opacity: 0;
}
.welcome-page-enter-to {
  transform: rotateX(0);
  opacity: 1;
}
/* === 欢迎页离开动画（保持不变）=== */
.welcome-leave-leave-active {
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
  transform-origin: top;
}
.welcome-leave-leave-to {
  transform: rotateX(90deg);
  opacity: 0;
}

/* === 博客滚动容器 === */
.blog-scroller {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto; /* 只允许垂直滚动 */
  opacity: 0;
  pointer-events: none; /* 初始不可交互 */
  transition: opacity 0.3s ease;
}

.blog-scroller.active {
  opacity: 1;
  pointer-events: auto;
}

/* 隐藏滚动条（可选，美化） */
.blog-scroller::-webkit-scrollbar {
  display: none;
}
.blog-scroller {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}
</style>

<!-- 全局样式：禁止 body 滚动 -->
<style>
body.no-scroll {
  overflow: hidden;
  height: 100vh;
  touch-action: none; /* 禁用移动端默认手势（可选） */
}
</style>