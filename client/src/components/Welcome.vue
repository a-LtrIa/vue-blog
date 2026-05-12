<template>
  <div class="welcome-screen">
    <!-- Background Image -->
    <div class="bg-layer" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
    <div class="bg-overlay"></div>

    <!-- Content -->
    <div
      class="welcome-content"
      :class="{ 'content-loaded': contentLoaded }"
    >
      <div class="hero-card">
        <!-- Avatar -->
        <div class="avatar-wrapper" @click="enterBlog">
          <div class="avatar-container">
            <img
              :src="avatarUrl || defaultAvatar"
              alt="Avatar"
              class="avatar"
              @error="handleAvatarError"
            />
          </div>
        </div>

        <!-- Title -->
        <h1 class="site-title">{{ siteName }}</h1>

        <!-- Divider -->
        <div class="divider"></div>

        <!-- Subtitle with Typewriter Effect -->
        <p class="subtitle">
          <span class="typewriter-text">{{ displayedText }}</span>
          <span class="cursor" :class="{ 'blink': showCursor }">|</span>
        </p>

        <!-- Enter button -->
        <button class="enter-btn" @click="enterBlog">
          <span>进入博客</span>
          <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <!-- Scroll hint -->
        <div class="scroll-hint">
          <div class="mouse">
            <div class="wheel"></div>
          </div>
          <span>向下滚动探索</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  backgroundImage: {
    type: String,
    default: 'https://www.loliapi.com/acg/'
  },
  siteName: {
    type: String,
    default: 'ALT的博客'
  },
  avatarUrl: String
})

const emit = defineEmits(['scroll-down'])

const defaultAvatar = '/src/assets/avatar.jpg'
const contentLoaded = ref(false)

// Typewriter effect
const fullText = '探索技术与设计的交汇点'
const displayedText = ref('')
const showCursor = ref(true)
const typingSpeed = 100
const deletingSpeed = 50
const pauseTime = 2000

let currentIndex = 0
let isDeleting = false
let typingTimeout = null

const typeWriter = () => {
  if (isDeleting) {
    // Deleting
    displayedText.value = fullText.substring(0, currentIndex - 1)
    currentIndex--

    if (currentIndex === 0) {
      isDeleting = false
      typingTimeout = setTimeout(typeWriter, 500)
    } else {
      typingTimeout = setTimeout(typeWriter, deletingSpeed)
    }
  } else {
    // Typing
    displayedText.value = fullText.substring(0, currentIndex + 1)
    currentIndex++

    if (currentIndex === fullText.length) {
      isDeleting = true
      typingTimeout = setTimeout(typeWriter, pauseTime)
    } else {
      typingTimeout = setTimeout(typeWriter, typingSpeed)
    }
  }
}

const startTypeWriter = () => {
  // Reset
  displayedText.value = ''
  currentIndex = 0
  isDeleting = false
  if (typingTimeout) clearTimeout(typingTimeout)

  // Start typing after content loads
  setTimeout(() => {
    typeWriter()
  }, 800)
}

const enterBlog = () => {
  emit('scroll-down')
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

onMounted(() => {
  setTimeout(() => {
    contentLoaded.value = true
    startTypeWriter()
  }, 100)
})

// Cleanup on unmount
onMounted(() => {
  return () => {
    if (typingTimeout) clearTimeout(typingTimeout)
  }
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
  align-items: center;
  justify-content: center;
  z-index: 100;
  overflow: hidden;
}

/* Background Image */
.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: scale(1.05);
  transition: transform 0.8s ease;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* Content */
.welcome-content {
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.content-loaded {
  opacity: 1;
  transform: translateY(0);
}

.content-loaded ~ .bg-layer {
  transform: scale(1);
}

/* Hero card - glassmorphism on image background */
.hero-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 72px;
  text-align: center;
  min-width: 420px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  margin-bottom: 32px;
  cursor: pointer;
}

.avatar-container {
  position: relative;
  z-index: 2;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.avatar-wrapper:hover .avatar {
  transform: scale(1.03);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

/* Title */
.site-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 40px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  letter-spacing: -0.015em;
}

/* Divider */
.divider {
  width: 40px;
  height: 1px;
  background: #d2d2d7;
  margin-bottom: 16px;
}

/* Subtitle with Typewriter */
.subtitle {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: #86868b;
  margin: 0 0 32px 0;
  font-weight: 400;
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.typewriter-text {
  white-space: nowrap;
}

.cursor {
  color: #1d1d1f;
  font-weight: 300;
  margin-left: 2px;
  opacity: 1;
}

.cursor.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Enter button */
.enter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #1d1d1f;
  color: #ffffff;
  border: none;
  border-radius: 980px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  margin-bottom: 32px;
}

.enter-btn:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.enter-btn:active {
  transform: scale(0.98);
}

.enter-btn .arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.enter-btn:hover .arrow {
  transform: translateX(3px);
}

/* Scroll hint */
.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.scroll-hint span {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 11px;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.mouse {
  width: 22px;
  height: 34px;
  border: 1px solid #d2d2d7;
  border-radius: 11px;
  position: relative;
}

.wheel {
  width: 3px;
  height: 5px;
  background: #86868b;
  border-radius: 2px;
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  animation: scroll-wheel 2s ease-in-out infinite;
}

@keyframes scroll-wheel {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(6px);
    opacity: 0.3;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .hero-card {
    padding: 40px 32px;
    min-width: auto;
    margin: 0 20px;
  }

  .site-title {
    font-size: 32px;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .subtitle {
    font-size: 14px;
  }
}
</style>
