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
        :background-image="settings.background_url || 'https://www.loliapi.com/acg/'"
        :site-name="settings.site_name"
        :avatar-url="settings.avatar_url"
        @scroll-down="hideWelcome"
      />
    </transition>

    <!-- Main Content -->
    <div ref="contentRef" class="content-section" :class="{ 'content-visible': !showWelcome }">
      <BlogContent
        :settings="settings"
        :social-links="socialLinks"
        :categories="categories"
        :posts="posts"
        :tags="tags"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Welcome from '../components/Welcome.vue'
import BlogContent from '../components/BlogContent.vue'
import GlassNavbar from '../components/GlassNavbar.vue'

const contentRef = ref(null)
const showWelcome = ref(true)

const props = defineProps({
  posts: Array,
  categories: Array,
  tags: Array,
  settings: Object,
  socialLinks: Array
})

const hideWelcome = () => {
  showWelcome.value = false
}

const onWelcomeHidden = () => {
  // 欢迎界面完全隐藏后的回调
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
