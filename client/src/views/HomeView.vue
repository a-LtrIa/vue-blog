<template>
  <div class="home-view">
    <!-- Glass Navigation - 仅在非欢迎界面显示 -->
    <transition name="nav-fade">
      <GlassNavbar
        v-if="!showWelcome"
        :siteName="settings.site_name"
        :posts="posts"
      />
    </transition>

    <!-- Welcome Screen -->
    <transition name="welcome-fade" @after-leave="onWelcomeHidden">
      <Welcome
        v-if="showWelcome"
        :background-image="bgImage || 'https://www.loliapi.com/acg/'"
        :site-name="settings.site_name"
        :avatar-url="settings.avatar_url"
        @scroll-down="hideWelcome"
      />
    </transition>

    <!-- Main Content -->
    <div ref="contentRef" class="content-section" :class="{ 'content-visible': !showWelcome, 'scroll-locked': scrollLocked }">
      <BlogContent
        :settings="settings"
        :social-links="socialLinks"
        :categories="categories"
        :posts="posts"
        :tags="tags"
        @show-welcome="showWelcomeScreen"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Welcome from '../components/Welcome.vue'
import BlogContent from '../components/BlogContent.vue'
import GlassNavbar from '../components/GlassNavbar.vue'

const route = useRoute()
const contentRef = ref(null)
const showWelcome = ref(false)
const scrollLocked = ref(false)
const WELCOME_PAGE_KEY = 'onWelcomePage'
const LAST_VISIT_MINUTE_KEY = 'lastVisitMinute'

const props = defineProps({
  posts: Array,
  categories: Array,
  tags: Array,
  settings: Object,
  socialLinks: Array,
  bgImage: String
})

const getCurrentMinute = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const shouldShowWelcome = () => {
  const wasOnWelcomePage = sessionStorage.getItem(WELCOME_PAGE_KEY) === 'true'
  if (wasOnWelcomePage) {
    return true
  }
  const currentMinute = getCurrentMinute()
  const lastVisitMinute = localStorage.getItem(LAST_VISIT_MINUTE_KEY)
  if (lastVisitMinute !== currentMinute) {
    localStorage.setItem(LAST_VISIT_MINUTE_KEY, currentMinute)
    return true
  }
  return false
}

onMounted(() => {
  if (route.query.read) {
    showWelcome.value = false
    sessionStorage.setItem(WELCOME_PAGE_KEY, 'false')
  } else {
    showWelcome.value = shouldShowWelcome()
    sessionStorage.setItem(WELCOME_PAGE_KEY, showWelcome.value ? 'true' : 'false')
  }
})

watch(showWelcome, (val) => {
  sessionStorage.setItem(WELCOME_PAGE_KEY, val ? 'true' : 'false')
})

const hideWelcome = () => {
  showWelcome.value = false
  scrollLocked.value = true
  setTimeout(() => {
    scrollLocked.value = false
  }, 500)
}

const showWelcomeScreen = () => {
  showWelcome.value = true
}

const onWelcomeHidden = () => {
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}

.content-section {
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease 0.3s;
}

.content-section.content-visible {
  opacity: 1;
  transform: translateY(0);
}

.content-section.scroll-locked {
  overflow: hidden;
  max-height: 100vh;
}

/* Welcome transition */
.welcome-fade-leave-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.welcome-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
  filter: blur(10px);
}

/* Navigation fade */
.nav-fade-enter-active {
  transition: all 0.4s ease 0.5s;
}

.nav-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
