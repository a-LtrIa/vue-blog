<template>
  <svg style="display: none">
    <defs>
      <filter id="liquid_glass_filter" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feDisplacementMap scale="200" />
      </filter>
    </defs>
  </svg>

  <nav class="glass-navbar" :class="{ 'nav-collapsed': isCollapsed, 'nav-scrolled': isScrolled, 'nav-hidden': isHidden }">
    <div class="nav-container">
      <a href="/" class="nav-logo" @click.prevent="goHome">
        <div class="logo-icon">
          <span class="logo-text">{{ logoText }}</span>
        </div>
        <span class="logo-brand">{{ siteName }}</span>
      </a>

      <div class="nav-right">
        <div class="nav-links">
          <a
            href="/"
            class="nav-link"
            :class="{ active: isActive('/') }"
            @click.prevent="navigate('/')"
          >
            <Home :size="16" class="link-icon" />
            <span class="link-text">主页</span>
            <span class="link-indicator"></span>
          </a>

          <div
            class="nav-dropdown"
            @mouseenter="showFileDropdown = true"
            @mouseleave="showFileDropdown = false"
          >
            <span
              class="nav-link dropdown-trigger"
              :class="{ active: isFileActive() }"
            >
              <FolderOpen :size="16" class="link-icon" />
              <span class="link-text">文件</span>
              <ChevronDown :size="12" class="dropdown-arrow" :class="{ rotated: showFileDropdown }" />
              <span class="link-indicator"></span>
            </span>
            <div class="dropdown-bridge"></div>
            <transition name="dropdown-fade">
              <div v-if="showFileDropdown" class="dropdown-menu">
                <a
                  href="/articles"
                  class="dropdown-item"
                  :class="{ active: isActive('/articles') }"
                  @click.prevent="navigate('/articles')"
                >
                  <FileText :size="15" />
                  <span>文章</span>
                </a>
                <a
                  href="/tools"
                  class="dropdown-item"
                  :class="{ active: isActive('/tools') }"
                  @click.prevent="navigate('/tools')"
                >
                  <Wrench :size="15" />
                  <span>妙妙工具</span>
                </a>
                <a
                  href="/resources"
                  class="dropdown-item"
                  :class="{ active: isActive('/resources') }"
                  @click.prevent="navigate('/resources')"
                >
                  <Share2 :size="15" />
                  <span>资源分享</span>
                </a>
              </div>
            </transition>
          </div>

          <span
            class="nav-link"
            @click="showFriendsModal = true"
          >
            <Link :size="16" class="link-icon" />
            <span class="link-text">友联</span>
            <span class="link-indicator"></span>
          </span>
        </div>

        <button class="action-btn search-btn" @click="toggleSearch" title="搜索">
          <Search :size="18" />
        </button>

        <button class="action-btn mobile-menu-btn" @click="toggleMobileMenu" title="菜单">
          <div class="hamburger" :class="{ open: showMobileMenu }">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </div>

    <transition name="mobile-menu">
      <div v-if="showMobileMenu" class="mobile-menu">
        <div class="mobile-menu-content">
          <a
            href="/"
            class="mobile-link"
            :class="{ active: isActive('/') }"
            @click.prevent="navigate('/')"
          >
            <Home :size="18" class="mobile-link-icon" />
            <span class="mobile-link-text">主页</span>
          </a>
          <a
            href="/articles"
            class="mobile-link"
            :class="{ active: isActive('/articles') }"
            @click.prevent="navigate('/articles')"
          >
            <FileText :size="18" class="mobile-link-icon" />
            <span class="mobile-link-text">文章</span>
          </a>
          <a
            href="/tools"
            class="mobile-link"
            :class="{ active: isActive('/tools') }"
            @click.prevent="navigate('/tools')"
          >
            <Wrench :size="18" class="mobile-link-icon" />
            <span class="mobile-link-text">妙妙工具</span>
          </a>
          <a
            href="/resources"
            class="mobile-link"
            :class="{ active: isActive('/resources') }"
            @click.prevent="navigate('/resources')"
          >
            <Share2 :size="18" class="mobile-link-icon" />
            <span class="mobile-link-text">资源分享</span>
          </a>
          <span
            class="mobile-link"
            @click="showFriendsModal = true; showMobileMenu = false"
          >
            <Link :size="18" class="mobile-link-icon" />
            <span class="mobile-link-text">友联</span>
          </span>
        </div>
      </div>
    </transition>

    <transition name="search-modal">
      <div v-if="showSearch" class="search-overlay" @click="closeSearch">
        <div class="search-panel" @click.stop>
          <div class="liquid_glass-outer"></div>
          <div class="liquid_glass-cover"></div>
          <div class="liquid_glass-sharp"></div>
          <div class="liquid_glass-reflect"></div>
          <div class="search-input-row">
            <Search :size="18" class="search-panel-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章..."
              class="search-panel-input"
              @input="handleSearchInput"
              @keyup.enter="performSearch"
              @keydown.escape="closeSearch"
              ref="searchInput"
            />
            <kbd class="search-kbd">esc</kbd>
          </div>
          <div class="search-panel-results" v-if="searchQuery.trim()">
            <div v-if="searchResults.length">
              <div
                v-for="(result, index) in searchResults"
                :key="result.id"
                class="search-panel-item"
                :class="{ 'search-panel-item-active': index === selectedIndex }"
                @click="goToPost(result)"
                @mouseenter="selectedIndex = index"
              >
                <FileText :size="16" class="search-panel-item-icon" />
                <div class="search-panel-item-content">
                  <span class="search-panel-item-title">{{ result.title }}</span>
                  <span class="search-panel-item-meta">
                    <span v-if="result.category_name" class="search-panel-item-cat">{{ result.category_name }}</span>
                    <span class="search-panel-item-date">{{ formatSearchDate(result.created_at) }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="search-panel-empty" v-else>
              <span>未找到相关文章</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <Teleport to="body">
      <transition name="modal-backdrop">
        <div v-if="showFriendsModal" class="friends-overlay" @click="showFriendsModal = false">
          <transition name="modal-pop">
            <div v-if="showFriendsModal" class="friends-modal" @click.stop>
              <button class="friends-close" @click="showFriendsModal = false">
                <X :size="16" />
              </button>
              <h3 class="friends-title">友情链接</h3>
              <div class="friends-list">
                <a
                  v-for="friend in friendsList"
                  :key="friend.id"
                  :href="friend.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="friend-item"
                  :title="friend.name"
                >
                  <img
                    :src="friend.icon"
                    :alt="friend.name"
                    class="friend-icon"
                    @error="e => e.target.style.display = 'none'"
                  />
                  <span class="friend-label">{{ friend.name }}</span>
                </a>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </Teleport>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Home, FileText, Search, FolderOpen, ChevronDown, Wrench, Share2, Link, X } from 'lucide-vue-next'
import { parseDate } from '../utils/date.js'

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

const emit = defineEmits(['show-welcome'])

const isScrolled = ref(false)
const isCollapsed = ref(false)
const isHidden = ref(false)
const lastScrollY = ref(0)
const showMobileMenu = ref(false)
const showSearch = ref(false)
const showFileDropdown = ref(false)
const showFriendsModal = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searchInput = ref(null)
const selectedIndex = ref(0)

const logoText = computed(() => props.siteName.charAt(0).toUpperCase())

const friendsList = [
  { id: 1, name: 'Vue.js', icon: 'https://vuejs.org/logo.svg', link: 'https://vuejs.org/' },
  { id: 2, name: 'Vite', icon: 'https://vitejs.dev/logo.svg', link: 'https://vitejs.dev/' },
  { id: 3, name: 'React', icon: 'https://react.dev/favicon-32x32.png', link: 'https://react.dev/' },
  { id: 4, name: 'GitHub', icon: 'https://github.githubassets.com/favicons/favicon-dark.svg', link: 'https://github.com/' },
  { id: 5, name: 'MDN', icon: 'https://developer.mozilla.org/favicon-48x48.cbbd161b.png', link: 'https://developer.mozilla.org/' },
  { id: 6, name: 'Tailwind CSS', icon: 'https://tailwindcss.com/favicons/favicon-32x32.png', link: 'https://tailwindcss.com/' },
  { id: 7, name: 'Node.js', icon: 'https://nodejs.org/static/images/favicons/favicon.png', link: 'https://nodejs.org/' },
  { id: 8, name: 'TypeScript', icon: 'https://www.typescriptlang.org/favicon-32x32.png', link: 'https://www.typescriptlang.org/' }
]

const isFileActive = () => {
  return ['/articles', '/tools', '/resources'].some(p => route.path.startsWith(p))
}

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
  emit('show-welcome')
}

const goToPost = (post) => {
  closeSearch()
  router.push(`/post/${post.slug}`)
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const toggleSearch = (e) => {
  e.stopPropagation()
  showSearch.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const closeSearch = () => {
  showSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
  selectedIndex.value = 0
}

const formatSearchDate = (dateStr) => {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const performSearch = () => {
  if (!searchQuery.value.trim()) return

  const query = searchQuery.value.toLowerCase()
  searchResults.value = props.posts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.excerpt?.toLowerCase().includes(query) ||
    post.content?.toLowerCase().includes(query)
  ).slice(0, 5)
}

const handleScroll = () => {
  const currentScrollY = window.scrollY

  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }

  isCollapsed.value = currentScrollY > 30
  isScrolled.value = currentScrollY > 120
  lastScrollY.value = currentScrollY
}

let searchTimeout
const handleSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

const handleClickOutside = (e) => {
  if (!showSearch.value) return
  const panel = document.querySelector('.search-panel')
  if (panel && !panel.contains(e.target)) {
    closeSearch()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.glass-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 14px 0;
  transition:
    padding 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    backdrop-filter 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    -webkit-backdrop-filter 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(0);
}

.glass-navbar.nav-collapsed {
  padding: 8px 0;
}

.glass-navbar.nav-scrolled {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
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
  flex-shrink: 0;
}

.nav-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.logo-brand {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

/* Right Section */
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Navigation Links */
.nav-links {
  display: flex;
  gap: 4px;
  align-items: center;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.25s ease;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
}

.nav-link.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.link-icon {
  flex-shrink: 0;
}

.link-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 16px;
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1px;
  transition: transform 0.3s ease;
}

.nav-link.active .link-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* Dropdown */
.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: default;
}

.dropdown-arrow {
  transition: transform 0.25s ease;
  opacity: 0.5;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-bridge {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 12px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.dropdown-item.active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.dropdown-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-leave-active {
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}

/* Action Buttons */
.action-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  transform: translateY(-1px);
}

/* Hamburger */
.hamburger {
  width: 16px;
  height: 12px;
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
  border-radius: 1px;
  transition: all 0.3s ease;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(3px, 3px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(3px, -3px);
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
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.mobile-menu-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
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
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.5);
}

.mobile-link.active .mobile-link-icon {
  color: #ffffff;
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

/* Search Overlay - Transparent */
.search-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 2000;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
}

/* Search Panel - Liquid Glass */
.search-panel {
  position: relative;
  width: 100%;
  max-width: 560px;
  margin: 0 24px;
  border-radius: 16px;
  overflow: hidden;
  height: fit-content;
}

.search-panel .liquid_glass-outer {
  backdrop-filter: url(#liquid_glass_filter);
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 16px;
  mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect x="0" y="0" width="100%" height="100%" rx="0" ry="0" fill="white"/></svg>'),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect x="5" y="5" width="calc(100% - 10px)" height="calc(100% - 10px)" rx="11" ry="11" fill="white"/></svg>');
  mask-composite: exclude;
}

.search-panel .liquid_glass-cover {
  backdrop-filter: blur(4px);
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}

.search-panel .liquid_glass-sharp {
  position: absolute;
  inset: 0;
  z-index: 3;
  box-shadow:
    inset 1px 1px 0px 0px rgba(255, 255, 255, 0.5),
    inset -1px -1px 0px 0px rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  pointer-events: none;
}

.search-panel .liquid_glass-reflect {
  position: absolute;
  inset: 1px;
  z-index: 2;
  box-shadow:
    inset 2px 2px 6px 2px rgba(255, 255, 255, 0.2),
    inset -2px -2px 4px -1px rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  pointer-events: none;
}

.search-input-row {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
}

.search-panel-icon {
  color: rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
}

.search-panel-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 17px;
  font-weight: 400;
  outline: none;
  letter-spacing: -0.01em;
}

.search-panel-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  font-family: inherit;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.search-panel-results {
  position: relative;
  z-index: 5;
  max-height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.search-panel-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 18px;
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
}

.search-panel-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 18px;
  width: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1.2);
}

.search-panel-item:hover::after,
.search-panel-item-active::after {
  width: calc(100% - 36px);
}

.search-panel-item:hover,
.search-panel-item-active {
  background: rgba(255, 255, 255, 0.06);
}

.search-panel-item + .search-panel-item {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.search-panel-item-icon {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 2px;
}

.search-panel-item-content {
  flex: 1;
  min-width: 0;
}

.search-panel-item-title {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-panel-item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.search-panel-item-cat {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.search-panel-item-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.search-panel-empty {
  padding: 32px 18px;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.3);
}

.search-modal-enter-active {
  transition: all 0.25s ease;
}

.search-modal-leave-active {
  transition: all 0.2s ease;
}

.search-modal-enter-from {
  opacity: 0;
}

.search-modal-enter-from .search-panel {
  transform: translateY(-12px) scale(0.97);
}

.search-modal-leave-to {
  opacity: 0;
}

.search-modal-leave-to .search-panel {
  transform: translateY(-8px) scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .search-btn {
    display: flex;
  }
}

/* Friends Modal */
.friends-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friends-modal {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 28px 32px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  max-width: 520px;
  width: calc(100% - 48px);
}

.friends-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.friends-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.friends-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  text-align: center;
}

.friends-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

.friend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.3s ease;
  min-width: 72px;
}

.friend-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.friend-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 6px;
}

.friend-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}

.friend-item:hover .friend-label {
  color: rgba(255, 255, 255, 0.85);
}

/* Modal transitions */
.modal-backdrop-enter-active {
  transition: all 0.3s ease;
}

.modal-backdrop-leave-active {
  transition: all 0.25s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-pop-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-pop-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(5px);
}
</style>
