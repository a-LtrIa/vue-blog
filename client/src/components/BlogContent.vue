<template>
  <div class="blog-content">
    <!-- Main Layout: Left Sidebar + Right Content -->
    <div class="main-layout" ref="mainLayoutRef">
      <!-- Left Sidebar: Personal Info & Stats -->
      <aside class="left-sidebar" ref="leftSidebarRef">
        <div class="sidebar-inner" ref="sidebarInnerRef">
          <!-- Profile Card -->
          <div class="sidebar-card profile-section">
            <div class="profile-header">
              <div class="avatar-wrap" @click="goToWelcome">
                <img :src="settings.avatar_url || defaultAvatar" alt="头像" class="profile-avatar" @error="handleAvatarError" />
                <div class="online-indicator"></div>
              </div>
              <div class="profile-titles">
                <h2 class="profile-name">{{ settings.author_name || '作者' }}</h2>
                <span class="profile-role">博主 / 开发者</span>
              </div>
            </div>
            <p class="profile-bio">{{ settings.author_bio || '热爱技术与设计，记录学习与生活' }}</p>

            <!-- Stats Grid -->
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-num">{{ posts.length }}</span>
                <span class="stat-label">文章</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ categories.length }}</span>
                <span class="stat-label">分类</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ tags.length }}</span>
                <span class="stat-label">标签</span>
              </div>
              <div class="stat-item">
                <span class="stat-num">{{ totalViews }}</span>
                <span class="stat-label">浏览</span>
              </div>
            </div>
          </div>

          <!-- Site Info Card -->
          <div class="sidebar-card site-info">
            <h3 class="card-title">
              <Info class="title-icon" :size="16" />
              关于本站
            </h3>
            <div class="site-detail">
              <div class="detail-item">
                <span class="detail-label">网站名称</span>
                <span class="detail-value">{{ settings.site_name || '我的博客' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">运行时间</span>
                <span class="detail-value">{{ runningDays }} 天</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">最后更新</span>
                <span class="detail-value">{{ lastUpdate }}</span>
              </div>
            </div>
          </div>

          <!-- Social Links Card -->
          <div class="sidebar-card social-section" v-if="socialLinks.length">
            <h3 class="card-title">
              <Link2 class="title-icon" :size="16" />
              关注我
            </h3>
            <div class="social-grid">
              <a v-for="link in socialLinks.slice(0, 6)" :key="link.id" :href="link.url" target="_blank" class="social-item">
                <component :is="getSocialIcon(link.platform)" :size="22" class="social-icon" />
                <span class="social-name">{{ link.platform }}</span>
              </a>
            </div>
          </div>

          <!-- Hot Tags Card -->
          <div class="sidebar-card tags-section">
            <h3 class="card-title">
              <Tag class="title-icon" :size="16" />
              热门标签
            </h3>
            <div class="tag-cloud">
              <span v-for="(tag, index) in tags.slice(0, 12)" :key="tag.id" class="tag-item" :class="`tag-size-${(index % 3) + 1}`">
                {{ tag.name }}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Content: Grid Layout or Post Reading -->
      <main class="right-content">
        <!-- Post Reading View -->
        <div v-if="selectedPost" class="post-reading-view">
          <button class="back-btn" @click="closePost">
            <ArrowLeft :size="20" />
            <span>返回列表</span>
          </button>

          <article class="reading-article">
            <header class="reading-header">
              <div class="reading-meta">
                <span class="reading-category" v-if="postContent.category_name">{{ postContent.category_name }}</span>
                <time class="reading-date">{{ formatDate(postContent.created_at) }}</time>
                <span class="reading-views">
                  <Eye :size="14" />
                  {{ postContent.view_count || 0 }}
                </span>
              </div>
              <h1 class="reading-title">{{ postContent.title }}</h1>
              <div class="reading-tags" v-if="postContent.tags && postContent.tags.length">
                <span v-for="tag in postContent.tags" :key="tag.id || tag" class="reading-tag">
                  {{ tag.name || tag }}
                </span>
              </div>
            </header>

            <div class="reading-body" v-html="renderedContent"></div>

            <footer class="reading-footer">
              <div class="reading-author">
                <img :src="settings.avatar_url || defaultAvatar" alt="作者" class="reading-author-avatar" />
                <div class="reading-author-info">
                  <span class="reading-author-name">{{ settings.author_name || '作者' }}</span>
                  <span class="reading-author-bio">{{ settings.author_bio || '热爱技术与设计' }}</span>
                </div>
              </div>
            </footer>
          </article>
        </div>

        <!-- Default Grid View -->
        <template v-else>
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <h1 class="welcome-title">探索技术与设计</h1>
            <p class="welcome-desc">分享前端开发、UI 设计和生活中的点滴思考</p>
          </div>
        </div>

        <!-- Categories Grid -->
        <section class="content-section categories-area">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-dot"></span>
              文章分类
            </h3>
          </div>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card" @click="goToCategory(category)">
              <div class="category-icon-wrap">
                <component :is="getCategoryIcon(category.name)" :size="24" />
              </div>
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.post_count || 0 }} 篇</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Posts Grid - Masonry Style -->
        <section class="content-section posts-area">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-dot"></span>
              最新文章
            </h3>
            <a href="#" class="view-all" @click.prevent="goToArticles">查看全部 →</a>
          </div>

          <div class="posts-masonry">
            <!-- Featured Post (Large) -->
            <article class="post-card post-featured" v-if="posts[0]" @click="viewPost(posts[0], '/')">
              <div class="post-image" v-if="posts[0].cover_image">
                <img :src="posts[0].cover_image" :alt="posts[0].title" />
                <span class="post-badge">精选</span>
              </div>
              <div class="post-content">
                <div class="post-meta">
                  <span class="post-category" v-if="posts[0].category_name">{{ posts[0].category_name }}</span>
                  <time class="post-date">{{ formatDate(posts[0].created_at) }}</time>
                </div>
                <h4 class="post-title">{{ posts[0].title }}</h4>
                <p class="post-excerpt">{{ posts[0].excerpt || posts[0].content?.substring(0, 150) + '...' }}</p>
                <div class="post-footer">
                  <span class="post-views">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ posts[0].view_count || 0 }}
                  </span>
                </div>
              </div>
            </article>

            <!-- Regular Posts -->
            <article class="post-card" v-for="post in posts.slice(1, 7)" :key="post.id" @click="viewPost(post, '/')">
              <div class="post-image" v-if="post.cover_image">
                <img :src="post.cover_image" :alt="post.title" />
              </div>
              <div class="post-content">
                <div class="post-meta">
                  <span class="post-category" v-if="post.category_name">{{ post.category_name }}</span>
                  <time class="post-date">{{ formatDate(post.created_at) }}</time>
                </div>
                <h4 class="post-title">{{ post.title }}</h4>
                <p class="post-excerpt">{{ post.excerpt || post.content?.substring(0, 100) + '...' }}</p>
                <div class="post-footer">
                  <span class="post-views">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {{ post.view_count || 0 }}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div v-if="posts.length === 0" class="empty-state">
            <FileText class="empty-icon" :size="48" />
            <p>暂无文章，敬请期待...</p>
          </div>
        </section>
        </template>
      </main>
    </div>

    <!-- Footer -->
    <footer class="site-footer">
      <p class="copyright">© 2025 {{ settings.site_name || '我的博客' }}</p>
      <p class="credit">Made with Vue.js</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import { postsApi } from '../api/index.js'
import {
  Info,
  Link2,
  Tag,
  Code2,
  Server,
  Palette,
  Smartphone,
  BarChart3,
  Box,
  Wrench,
  Sun,
  PenLine,
  FileText,
  Github,
  Twitter,
  MessageCircle,
  Mail,
  Globe,
  Rss,
  MessageSquare,
  ArrowLeft,
  Eye
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

const emit = defineEmits(['show-welcome'])

const props = defineProps({
  settings: Object,
  socialLinks: Array,
  categories: Array,
  posts: Array,
  tags: Array
})

const defaultAvatar = '/src/assets/avatar.jpg'
const leftSidebarRef = ref(null)
const sidebarInnerRef = ref(null)
const mainLayoutRef = ref(null)

const selectedPost = ref(null)
const postContent = ref({})
const isLoadingPost = ref(false)
const backTarget = ref('/articles')

const goToWelcome = () => {
  emit('show-welcome')
}

const renderedContent = computed(() => {
  if (!postContent.value.content) return ''
  return marked(postContent.value.content)
})

const totalViews = computed(() => {
  return props.posts.reduce((sum, post) => sum + (post.view_count || 0), 0)
})

const runningDays = computed(() => {
  const startDate = new Date('2024-01-01')
  const now = new Date()
  return Math.floor((now - startDate) / (1000 * 60 * 60 * 24))
})

const lastUpdate = computed(() => {
  if (props.posts.length === 0) return '-'
  const latest = props.posts[0]
  const date = new Date(latest.updated_at || latest.created_at)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

const categoryIcons = {
  '前端': Code2,
  '后端': Server,
  '设计': Palette,
  '产品': Smartphone,
  '运营': BarChart3,
  '其他': Box,
  '技术': Wrench,
  '生活': Sun,
  '随笔': PenLine
}

const getCategoryIcon = (name) => {
  return categoryIcons[name] || FileText
}

const socialIconMap = {
  'GitHub': Github,
  'github': Github,
  'Twitter': Twitter,
  'twitter': Twitter,
  'X': Twitter,
  '微信': MessageCircle,
  'WeChat': MessageCircle,
  'Email': Mail,
  'email': Mail,
  '邮箱': Mail,
  'Website': Globe,
  'website': Globe,
  '网站': Globe,
  'RSS': Rss,
  'rss': Rss,
  'Discord': MessageSquare,
  'discord': MessageSquare
}

const getSocialIcon = (platform) => {
  return socialIconMap[platform] || Globe
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const viewPost = async (post, fromPath = '/articles') => {
  backTarget.value = fromPath
  selectedPost.value = post
  isLoadingPost.value = true
  try {
    const res = await postsApi.getBySlug(post.slug)
    postContent.value = res.data
  } catch (error) {
    console.error('加载文章失败', error)
    postContent.value = post
  } finally {
    isLoadingPost.value = false
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const closePost = () => {
  selectedPost.value = null
  postContent.value = {}
  router.push(backTarget.value)
}

const goToArticles = () => {
  router.push('/articles')
}

const goToCategory = (category) => {
  router.push(`/articles?category=${encodeURIComponent(category.name)}&view=single`)
}

// 同步滚动效果 - 左右两侧完全同步
const handleScroll = () => {
  if (!leftSidebarRef.value || !sidebarInnerRef.value || !mainLayoutRef.value) return

  const sidebarInner = sidebarInnerRef.value
  const layout = mainLayoutRef.value

  const sidebarHeight = sidebarInner.offsetHeight
  const rightContent = layout.querySelector('.right-content')
  const rightHeight = rightContent ? rightContent.offsetHeight : 0

  // 只有当右侧内容比左侧高时才需要同步滚动
  if (rightHeight > sidebarHeight) {
    const scrollTop = window.scrollY
    const layoutTop = layout.offsetTop
    const navHeight = 100
    const maxTranslate = rightHeight - sidebarHeight

    // 计算当前滚动在布局区域内的进度
    if (scrollTop > layoutTop - navHeight) {
      const scrollProgress = (scrollTop - layoutTop + navHeight) / (rightHeight - window.innerHeight + navHeight + 100)
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
      const translateY = clampedProgress * maxTranslate
      sidebarInner.style.transform = `translateY(${translateY}px)`
    } else {
      sidebarInner.style.transform = 'translateY(0)'
    }
  } else {
    sidebarInner.style.transform = 'translateY(0)'
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  // 初始化时执行一次
  setTimeout(handleScroll, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听路由参数，从仓库返回时自动打开文章
watch(() => route.query.read, async (slug) => {
  if (slug && typeof slug === 'string') {
    const from = route.query.from
    const fromPath = typeof from === 'string' ? from : '/articles'
    const post = props.posts.find(p => p.slug === slug)
    if (post) {
      await viewPost(post, fromPath)
    } else {
      try {
        const res = await postsApi.getBySlug(slug)
        await viewPost(res.data, fromPath)
      } catch (e) {
        console.error('自动打开文章失败', e)
      }
    }
    // 清除 query，避免刷新重复触发
    router.replace({ path: '/', query: {} })
  }
}, { immediate: true })
</script>

<style scoped>
/* ===== CSS Variables - 简洁配色 ===== */
:root {
  --bg-primary: #1a1a1a;
  --bg-card: rgba(40, 40, 40, 0.8);
  --bg-hover: rgba(50, 50, 50, 0.9);
  --border-color: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.15);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-muted: rgba(255, 255, 255, 0.4);
  --accent: rgba(255, 255, 255, 0.9);
}

.blog-content {
  min-height: 100vh;
  color: var(--text-primary);
  padding-top: 100px;
}

/* ===== Main Layout ===== */
.main-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
  align-items: start;
}

/* ===== Left Sidebar ===== */
.left-sidebar {
  position: relative;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  gap: 20px;
  will-change: transform;
}

.sidebar-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.sidebar-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

/* Profile Section */
.profile-section {
  text-align: center;
}

.avatar-wrap {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto 16px;
  cursor: pointer;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  border-color: var(--border-hover);
  transform: scale(1.02);
}

.online-indicator {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 3px solid var(--bg-card);
  border-radius: 50%;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.profile-role {
  font-size: 13px;
  color: var(--text-muted);
}

.profile-bio {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 20px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.stat-num {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

/* Card Title */
.card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.title-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

/* Site Info */
.site-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--text-muted);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.social-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.social-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.social-name {
  font-size: 11px;
  color: var(--text-secondary);
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.tag-size-1 { font-size: 11px; }
.tag-size-2 { font-size: 13px; background: rgba(255, 255, 255, 0.08); }
.tag-size-3 { font-size: 12px; }

/* ===== Right Content ===== */
.right-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Welcome Banner */
.welcome-banner {
  padding: 36px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.welcome-desc {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Content Section */
.content-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 28px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
}

.title-dot {
  width: 8px;
  height: 8px;
  background: var(--text-primary);
  border-radius: 50%;
}

.view-all {
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.3s ease;
}

.view-all:hover {
  color: var(--text-primary);
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 16px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-3px);
}

.category-card .category-icon-wrap {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.category-card:hover .category-icon-wrap {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: scale(1.1);
}

.category-card .category-info {
  text-align: center;
}

.category-card .category-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.category-card .category-count {
  font-size: 12px;
  color: var(--text-muted);
}

/* Posts Masonry Grid */
.posts-masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 20px;
}

.post-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border-hover);
  transform: translateY(-4px);
}

/* Featured Post - Spans 2 columns and 2 rows */
.post-featured {
  grid-column: span 2;
  grid-row: span 2;
  flex-direction: row;
}

.post-featured .post-image {
  width: 60%;
  height: auto;
  min-height: 100%;
}

.post-featured .post-content {
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.post-featured .post-title {
  font-size: 22px;
}

.post-featured .post-excerpt {
  font-size: 14px;
  -webkit-line-clamp: 4;
}

.post-image {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

.post-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
  font-size: 11px;
  font-weight: 600;
  border-radius: 100px;
}

.post-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.post-category {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.post-date {
  font-size: 12px;
  color: var(--text-muted);
}

.post-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 10px 0;
  line-height: 1.5;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.post-views {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.post-views svg {
  width: 14px;
  height: 14px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  grid-column: 1 / -1;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 16px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.empty-state p {
  font-size: 15px;
  color: var(--text-muted);
}

/* Footer */
.site-footer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 24px 32px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.copyright {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
}

.credit {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 280px 1fr;
    gap: 24px;
  }

  .posts-masonry {
    grid-template-columns: repeat(2, 1fr);
  }

  .post-featured {
    grid-column: span 2;
    grid-row: span 1;
    flex-direction: column;
  }

  .post-featured .post-image,
  .post-featured .post-content {
    width: 100%;
  }

  .post-featured .post-image {
    height: 200px;
    min-height: auto;
  }
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .left-sidebar {
    position: static;
  }

  .sidebar-inner {
    transform: none !important;
  }

  .profile-section {
    max-width: 500px;
    margin: 0 auto;
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .blog-content {
    padding-top: 80px;
  }

  .main-layout {
    padding: 24px 16px;
    gap: 24px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .posts-masonry {
    grid-template-columns: 1fr;
  }

  .post-featured {
    grid-column: span 1;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-banner {
    padding: 24px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .content-section {
    padding: 20px;
  }

  .sidebar-card {
    padding: 20px;
  }
}

/* ===== Post Reading View ===== */
.post-reading-view {
  animation: fadeSlideIn 0.35s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  margin-bottom: 24px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.back-btn:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
  transform: translateX(-4px);
}

.reading-article {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
}

.reading-header {
  padding: 48px 48px 32px;
  border-bottom: 1px solid var(--border-color);
}

.reading-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.reading-category {
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reading-date {
  font-size: 14px;
  color: var(--text-muted);
}

.reading-views {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--text-muted);
}

.reading-title {
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 20px 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.reading-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.reading-tag {
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 12px;
  color: var(--text-secondary);
}

.reading-body {
  padding: 48px;
  font-size: 16px;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.82);
}

.reading-body :deep(h1),
.reading-body :deep(h2),
.reading-body :deep(h3),
.reading-body :deep(h4) {
  color: var(--text-primary);
  margin-top: 40px;
  margin-bottom: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.reading-body :deep(h1) { font-size: 26px; }
.reading-body :deep(h2) { font-size: 22px; }
.reading-body :deep(h3) { font-size: 18px; }
.reading-body :deep(h4) { font-size: 16px; }

.reading-body :deep(p) {
  margin-bottom: 20px;
}

.reading-body :deep(a) {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.2s ease;
}

.reading-body :deep(a:hover) {
  color: var(--text-primary);
}

.reading-body :deep(code) {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.85);
}

.reading-body :deep(pre) {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  overflow-x: auto;
  margin: 24px 0;
}

.reading-body :deep(pre code) {
  background: transparent;
  padding: 0;
  font-size: 14px;
  line-height: 1.7;
}

.reading-body :deep(ul),
.reading-body :deep(ol) {
  margin-bottom: 20px;
  padding-left: 24px;
}

.reading-body :deep(li) {
  margin-bottom: 8px;
}

.reading-body :deep(blockquote) {
  border-left: 3px solid rgba(255, 255, 255, 0.2);
  padding: 4px 0 4px 20px;
  margin: 24px 0;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.reading-body :deep(img) {
  max-width: 100%;
  border-radius: 12px;
  margin: 24px 0;
}

.reading-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
}

.reading-body :deep(th),
.reading-body :deep(td) {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  text-align: left;
}

.reading-body :deep(th) {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  color: var(--text-primary);
}

.reading-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 32px 0;
}

.reading-footer {
  padding: 32px 48px;
  border-top: 1px solid var(--border-color);
}

.reading-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.reading-author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.reading-author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reading-author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.reading-author-bio {
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .reading-header {
    padding: 32px 24px 24px;
  }

  .reading-body {
    padding: 24px;
  }

  .reading-footer {
    padding: 24px;
  }
}
</style>
