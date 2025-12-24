<!-- src/App.vue -->
<template>
  <div id="app" :style="{ backgroundImage: `url(${bgImage})` }">
    <!-- 使用 transition 包裹 Welcome，实现离开动画 -->
    <transition name="welcome-leave">
      <Welcome 
        v-if="showWelcome"
        :background-image="bgImage"
        @scroll-down="handleScrollDown"
      />
    </transition>

    <BlogContent 
      class="blog-content"
      :class="{ 'scrolled': !showWelcome }"
    />
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
  position: relative;
  overflow-x: hidden;
}

.blog-content {
  position: relative;
  top: 100vh;
  transition: transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease;
  opacity: 0;
}

.blog-content.scrolled {
  transform: translateY(-100vh);
  opacity: 1;
}

/* 欢迎页离开动画 */
.welcome-leave-leave-active {
  transition: 
    transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.5s ease;
  transform-origin: top; /* 绕顶部旋转 */
}

.welcome-leave-leave-to {
  transform: rotateX(90deg); /* 向上翻90度 */
  opacity: 0;
}
</style>