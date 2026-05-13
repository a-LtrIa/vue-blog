<template>
  <div class="welcome-screen">
    <!-- Cinematic Background with Parallax -->
    <div
      class="cinematic-bg"
      :class="{ 'loaded': bgLoaded }"
      :style="bgLoaded ? { backgroundImage: `url(${backgroundImage})` } : {}"
    >
      <!-- Vignette effect -->
      <div class="vignette"></div>
    </div>

    <!-- Floating particles for atmosphere -->
    <div class="particles">
      <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
    </div>

    <!-- Content with Cinematic Entry -->
    <div
      class="welcome-content"
      :class="{ 'content-loaded': contentLoaded }"
    >
      <!-- Avatar with 3D tilt effect -->
      <div class="avatar-wrapper" @click="enterBlog" @mousemove="handleMouseMove" @mouseleave="resetTilt">
        <div class="avatar-container" :style="avatarTiltStyle">
          <div class="avatar-ring"></div>
          <img
            :src="avatarUrl || defaultAvatar"
            alt="Avatar"
            class="avatar"
            @error="handleAvatarError"
          />
        </div>
      </div>

      <!-- Title with cinematic reveal - No Card Style -->
      <h1 class="site-title">
        <span v-for="(char, i) in siteNameChars" :key="i"
              class="title-char"
              :style="{ animationDelay: `${0.5 + i * 0.05}s` }">
          {{ char === ' ' ? '\u00A0' : char }}
        </span>
      </h1>

      <!-- Animated divider -->
      <div class="divider">
        <div class="divider-line"></div>
        <div class="divider-dot"></div>
        <div class="divider-line"></div>
      </div>

      <!-- Subtitle with Typewriter Effect -->
      <p class="subtitle">
        <span class="typewriter-text">{{ displayedText }}</span>
        <span class="cursor" :class="{ 'blink': showCursor }">|</span>
      </p>

      <!-- Cinematic Enter button -->
      <button class="enter-btn glass-button magnetic" @click="enterBlog" ref="enterBtn">
        <span class="btn-text">进入博客</span>
        <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Elegant scroll hint -->
      <div class="scroll-hint" @click="enterBlog">
        <div class="mouse">
          <div class="wheel"></div>
        </div>
        <span class="scroll-text">向下滚动探索</span>
        <div class="scroll-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

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
const bgLoaded = ref(false)
const enterBtn = ref(null)

// 3D tilt effect for avatar
const avatarTilt = ref({ x: 0, y: 0 })
const avatarTiltStyle = computed(() => ({
  transform: `perspective(1000px) rotateX(${avatarTilt.value.y}deg) rotateY(${avatarTilt.value.x}deg)`
}))

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) / 10
  const y = (e.clientY - rect.top - rect.height / 2) / 10
  avatarTilt.value = { x: -y, y: x }
}

const resetTilt = () => {
  avatarTilt.value = { x: 0, y: 0 }
}

// Site name character animation
const siteNameChars = computed(() => props.siteName.split(''))

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
    displayedText.value = fullText.substring(0, currentIndex - 1)
    currentIndex--

    if (currentIndex === 0) {
      isDeleting = false
      typingTimeout = setTimeout(typeWriter, 500)
    } else {
      typingTimeout = setTimeout(typeWriter, deletingSpeed)
    }
  } else {
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
  displayedText.value = ''
  currentIndex = 0
  isDeleting = false
  if (typingTimeout) clearTimeout(typingTimeout)

  setTimeout(() => {
    typeWriter()
  }, 1500)
}

const enterBlog = () => {
  emit('scroll-down')
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

// Particle animation styles - Slow and subtle
const getParticleStyle = (n) => ({
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 15}s`,
  animationDuration: `${25 + Math.random() * 20}s`,
  opacity: 0.15
})

// Preload background image
const preloadImage = () => {
  const img = new Image()
  img.onload = () => {
    bgLoaded.value = true
  }
  img.src = props.backgroundImage
}

onMounted(() => {
  preloadImage()
  setTimeout(() => {
    contentLoaded.value = true
    startTypeWriter()
  }, 300)
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

/* Cinematic Background */
.cinematic-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #1a1a1a;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  transform: scale(1.1);
  transition: transform 2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1s ease;
  opacity: 0;
}

.cinematic-bg.loaded {
  opacity: 1;
  transform: scale(1);
}

.vignette {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  pointer-events: none;
}

/* Floating Particles - Slow and subtle */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float-up linear infinite;
}

@keyframes float-up {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }
  5% {
    opacity: 0.15;
  }
  95% {
    opacity: 0.15;
  }
  100% {
    transform: translateY(-100vh);
    opacity: 0;
  }
}

/* Content - No Card Style */
.welcome-content {
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(40px);
  transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px;
}

.content-loaded {
  opacity: 1;
  transform: translateY(0);
}

/* Avatar */
.avatar-wrapper {
  position: relative;
  margin-bottom: 40px;
  cursor: pointer;
  z-index: 1;
  perspective: 1000px;
}

.avatar-container {
  position: relative;
  z-index: 2;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform-style: preserve-3d;
}

.avatar-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: ring-rotate 15s linear infinite;
}

.avatar-ring::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ring-rotate 20s linear infinite reverse;
}

@keyframes ring-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.avatar-wrapper:hover .avatar {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* Title with Character Animation */
.site-title {
  font-family: var(--font-display, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
  font-size: clamp(36px, 8vw, 64px);
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
  text-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.title-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(30px);
  animation: charReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes charReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animated Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  z-index: 1;
}

.divider-line {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: lineExpand 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

@keyframes lineExpand {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 80px;
    opacity: 1;
  }
}

.divider-dot {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

/* Subtitle with Typewriter */
.subtitle {
  font-family: var(--font-text, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif);
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 40px 0;
  font-weight: 400;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.typewriter-text {
  white-space: nowrap;
}

.cursor {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  margin-left: 2px;
}

.cursor.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Cinematic Enter Button */
.enter-btn {
  margin-bottom: 48px;
  z-index: 1;
}

.enter-btn .arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.enter-btn:hover .arrow {
  transform: translateX(4px);
}

/* Elegant Scroll Hint */
.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.scroll-hint:hover {
  opacity: 0.7;
}

.scroll-text {
  font-family: var(--font-text, -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.mouse {
  width: 22px;
  height: 34px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 11px;
  position: relative;
}

.wheel {
  width: 3px;
  height: 5px;
  background: rgba(255, 255, 255, 0.6);
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
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) translateY(6px);
    opacity: 0.2;
  }
}

.scroll-line {
  width: 1px;
  height: 24px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent);
}

/* Responsive */
@media (max-width: 640px) {
  .welcome-content {
    padding: 24px;
  }

  .site-title {
    font-size: 32px;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .subtitle {
    font-size: 15px;
  }

  .divider-line {
    width: 50px;
  }

  @keyframes lineExpand {
    to {
      width: 50px;
    }
  }
}
</style>
