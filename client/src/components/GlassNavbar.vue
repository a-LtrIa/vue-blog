<template>
  <nav class="glass-navbar" :class="{ 'nav-scrolled': isScrolled, 'nav-hidden': isHidden }">
    <div class="nav-container">
      <!-- Logo -->
      <a href="/" class="nav-logo" @click.prevent="goHome">
        <div class="logo-icon">
          <span class="logo-text">{{ logoText }}</span>
        </div>
        <span class="logo-brand">{{ siteName }}</span>
      </a>

      <!-- Desktop Navigation -->
      <div class="nav-links">
        <a
          v-for="link in navLinks"
          :key="link.path"
          :href="link.path"
          class="nav-link"
          :class="{ active: isActive(link.path) }"
          @click.prevent="navigate(link.path)"
        >
          <span class="link-icon" v-if="link.icon">{{ link.icon }}</span>
          <span class="link-text">{{ link.name }}</span>
          <span class="link-indicator"></span>
        </a>
      </div>

      <!-- Actions -->
      <div class="nav-actions">
        <!-- Search Button -->
        <button class="action-btn" @click="toggleSearch" title="搜索">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>

        <!-- Theme Toggle -->
        <button class="action-btn" @click="toggleTheme" title="切换主题">
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="action-btn mobile-menu-btn" @click="toggleMobileMenu" title="菜单">
          <div class="hamburger" :class="{ open: showMobileMenu }">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div v-if="showMobileMenu" class="mobile-menu">
        <div class="mobile-menu-content">
          <a
            v-for="link in navLinks"
            :key="link.path"
            :href="link.path"
            class="mobile-link"
            :class="{ active: isActive(link.path) }"
            @click.prevent="navigate(link.path)"
          >
            <span class="mobile-link-icon" v-if="link.icon">{{ link.icon }}</span>
            <span class="mobile-link-text">{{ link.name }}</span>
          </a>
        </div>
      </div>
    </transition>

    <!-- Search Modal -->
    <transition name="search-modal">
      <div v-if="showSearch" class="search-modal" @click="closeSearch">
        <div class="search-container" @click.stop>
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章..."
              class="search-input"
              @keyup.enter="performSearch"
              ref="searchInput"
            />
            <button class="search-close" @click="closeSearch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="search-results" v-if="searchResults.length">
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="search-result-item"
              @click="goToPost(result)"
            >
              <span class="result-title">{{ result.title }}</span>
              <span class="result-category">{{ result.category_name }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { postsApi } from '../api/index.js'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  siteName: {
    type: String,
    default: '我的博客'
  },
  posts: {
    type: Array,
    default: () => []
  }
})

const isScrolled = ref(false)
const isHidden = ref(false)
const lastScrollY = ref(0)
const showMobileMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searchInput = ref(null)
const isDark = ref(true)

const logoText = computed(() => props.siteName.charAt(0).toUpperCase())

const navLinks = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '文章', path: '/#posts', icon: '📝' },
  { name: '分类', path: '/#categories', icon: '📂' },
  { name: '标签', path: '/#tags', icon: '🏷️' },
  { name: '关于', path: '/#about', icon: '👤' }
]

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path.split('#')[0])
}

const navigate = (path) => {
  showMobileMenu.value = false
  if (path.includes('#')) {
    const [routePath, hash] = path.split('#')
    if (route.path !== routePath && routePath !== '') {
      router.push(routePath)
    }
    nextTick(() => {
      const element = document.getElementById(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    })
  } else {
    router.push(path)
  }
}

const goHome = () => {
  router.push('/')
}

const goToPost = (post) => {
  closeSearch()
  router.push(`/post/${post.slug}`)
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const toggleSearch = () => {
  showSearch.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const closeSearch = () => {
  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  // 本地搜索
  const query = searchQuery.value.toLowerCase()
  searchResults.value = props.posts.filter(post => 
    post.title.toLowerCase().includes(query) ||
    post.excerpt?.toLowerCase().includes(query) ||
    post.content?.toLowerCase().includes(query)
  ).slice(0, 5)
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // 这里可以添加主题切换逻辑
}

const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  // 检测滚动方向
  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }
  
  // 检测是否滚动超过阈值
  isScrolled.value = currentScrollY > 50
  
  lastScrollY.value = currentScrollY
}

// 监听搜索输入
let searchTimeout
const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.glass-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 0;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(0);
}

.glass-navbar.nav-scrolled {
  background: rgba(15, 15, 25, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.glass-navbar.nav-hidden {
  transform: translateY(-100%);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #ffffff;
  transition: opacity 0.2s ease;
}

.nav-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-brand {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-link:hover::before,
.nav-link.active::before {
  opacity: 1;
}

.nav-link:hover,
.nav-link.active {
  color: #ffffff;
}

.link-icon {
  font-size: 16px;
}

.link-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 20px;
  height: 3px;
  background: #ffffff;
  border-radius: 2px;
  transition: transform 0.3s ease;
}

.nav-link.active .link-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* Actions */
.nav-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Hamburger Menu */
.hamburger {
  width: 18px;
  height: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(4px, 4px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

.mobile-menu-btn {
  display: none;
}

/* Mobile Menu */
.mobile-menu {
  position: absolute;
  top: 100%;
  left: 24px;
  right: 24px;
  margin-top: 12px;
  background: rgba(20, 20, 30, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 15px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.mobile-link:hover,
.mobile-link.active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.mobile-link-icon {
  font-size: 18px;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Search Modal */
.search-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin: 0 24px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(30, 30, 40, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.2s ease;
}

.search-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.search-close svg {
  width: 16px;
  height: 16px;
}

.search-results {
  margin-top: 12px;
  background: rgba(30, 30, 40, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.search-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.result-title {
  font-size: 15px;
  color: #ffffff;
}

.result-category {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
}

.search-modal-enter-active,
.search-modal-leave-active {
  transition: all 0.3s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}

.search-modal-enter-from .search-container,
.search-modal-leave-to .search-container {
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .logo-brand {
    display: none;
  }

  .nav-container {
    padding: 0 16px;
  }

  .mobile-menu {
    left: 16px;
    right: 16px;
  }
}

@media (max-width: 480px) {
  .glass-navbar {
    padding: 12px 0;
  }

  .action-btn {
    width: 36px;
    height: 36px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }
}
</style>
