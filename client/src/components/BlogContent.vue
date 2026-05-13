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
              <div class="avatar-wrap">
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
              <span class="title-icon">✨</span>
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
              <span class="title-icon">🔗</span>
              关注我
            </h3>
            <div class="social-grid">
              <a v-for="link in socialLinks.slice(0, 6)" :key="link.id" :href="link.url" target="_blank" class="social-item">
                <span class="social-icon">{{ link.icon }}</span>
                <span class="social-name">{{ link.platform }}</span>
              </a>
            </div>
          </div>

          <!-- Hot Tags Card -->
          <div class="sidebar-card tags-section">
            <h3 class="card-title">
              <span class="title-icon">🏷️</span>
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

      <!-- Right Content: Categories & Posts -->
      <main class="right-content">
        <!-- Welcome Banner -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <h1 class="welcome-title">探索技术与设计</h1>
            <p class="welcome-desc">分享前端开发、UI 设计和生活中的点滴思考</p>
          </div>
          <div class="welcome-decoration">
            <div class="deco-circle"></div>
          </div>
        </div>

        <!-- Categories Section -->
        <section class="content-section categories-area">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-dot"></span>
              文章分类
            </h3>
          </div>
          <div class="categories-list">
            <div v-for="category in categories" :key="category.id" class="category-item">
              <div class="category-icon-wrap">
                <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
              </div>
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.post_count || 0 }} 篇文章</span>
              </div>
              <div class="category-arrow">→</div>
            </div>
          </div>
        </section>

        <!-- Featured Post -->
        <section class="content-section featured-area" v-if="posts[0]">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-dot featured"></span>
              精选文章
            </h3>
          </div>
          <div class="featured-card-large" @click="viewPost(posts[0])">
            <div class="featured-image" v-if="posts[0].cover_image">
              <img :src="posts[0].cover_image" :alt="posts[0].title" />
            </div>
            <div class="featured-content">
              <div class="featured-meta">
                <span class="featured-category">{{ posts[0].category_name }}</span>
                <span class="featured-date">{{ formatDate(posts[0].created_at) }}</span>
              </div>
              <h2 class="featured-title">{{ posts[0].title }}</h2>
              <p class="featured-excerpt">{{ posts[0].excerpt || posts[0].content?.substring(0, 200) + '...' }}</p>
              <div class="featured-footer">
                <span class="read-more">阅读全文 →</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Posts List -->
        <section class="content-section posts-area">
          <div class="section-header">
            <h3 class="section-title">
              <span class="title-dot"></span>
              最新文章
            </h3>
            <a href="#" class="view-all">查看全部 →</a>
          </div>

          <div class="posts-grid">
            <article class="post-card" v-for="post in posts.slice(1, 7)" :key="post.id" @click="viewPost(post)">
              <div class="post-image" v-if="post.cover_image">
                <img :src="post.cover_image" :alt="post.title" />
              </div>
              <div class="post-content">
                <div class="post-meta">
                  <span class="post-category" v-if="post.category_name">{{ post.category_name }}</span>
                  <time class="post-date">{{ formatDate(post.created_at) }}</time>
                </div>
                <h4 class="post-title">{{ post.title }}</h4>
                <p class="post-excerpt">{{ post.excerpt || post.content?.substring(0, 120) + '...' }}</p>
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
            <span class="empty-icon">📝</span>
            <p>暂无文章，敬请期待...</p>
          </div>
        </section>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

// 计算总浏览量
const totalViews = computed(() => {
  return props.posts.reduce((sum, post) => sum + (post.view_count || 0), 0)
})

// 计算运行天数
const runningDays = computed(() => {
  const startDate = new Date('2024-01-01')
  const now = new Date()
  return Math.floor((now - startDate) / (1000 * 60 * 60 * 24))
})

// 最后更新时间
const lastUpdate = computed(() => {
  if (props.posts.length === 0) return '-'
  const latest = props.posts[0]
  const date = new Date(latest.updated_at || latest.created_at)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

const categoryIcons = {
  '前端': '💻',
  '后端': '⚙️',
  '设计': '🎨',
  '产品': '📱',
  '运营': '📊',
  '其他': '📦',
  '技术': '🔧',
  '生活': '🌟',
  '随笔': '✍️'
}

const getCategoryIcon = (name) => {
  return categoryIcons[name] || '📄'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const viewPost = (post) => {
  router.push(`/post/${post.slug}`)
}

// 智能粘性效果
const handleScroll = () => {
  if (!leftSidebarRef.value || !sidebarInnerRef.value || !mainLayoutRef.value) return

  const sidebar = leftSidebarRef.value
  const sidebarInner = sidebarInnerRef.value
  const layout = mainLayoutRef.value

  const layoutRect = layout.getBoundingClientRect()
  const sidebarRect = sidebar.getBoundingClientRect()
  const sidebarHeight = sidebarInner.offsetHeight
  const viewportHeight = window.innerHeight
  const navHeight = 80 // 导航栏高度

  // 计算右侧内容高度
  const rightContent = layout.querySelector('.right-content')
  const rightHeight = rightContent ? rightContent.offsetHeight : 0

  // 只有当左侧内容比右侧短，且比视口高时才需要粘性效果
  if (sidebarHeight < rightHeight && sidebarHeight > viewportHeight - navHeight - 40) {
    const scrollTop = window.scrollY
    const layoutTop = layout.offsetTop
    const maxScroll = rightHeight - sidebarHeight + 40

    // 当滚动到布局区域时开始计算
    if (scrollTop > layoutTop - navHeight) {
      const scrollInLayout = scrollTop - layoutTop + navHeight
      const translateY = Math.min(Math.max(scrollInLayout * 0.5, 0), maxScroll)
      sidebarInner.style.transform = `translateY(-${translateY}px)`
    } else {
      sidebarInner.style.transform = 'translateY(0)'
    }
  } else {
    sidebarInner.style.transform = 'translateY(0)'
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.blog-content {
  min-height: 100vh;
  color: #ffffff;
  padding-top: 100px; /* 为导航栏留出空间 */
}

/* ===== Main Layout ===== */
.main-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 24px 40px;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 40px;
  align-items: start;
}

/* ===== Left Sidebar ===== */
.left-sidebar {
  position: relative;
  overflow: hidden;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  gap: 24px;
  will-change: transform;
  transition: transform 0.1s linear;
}

.sidebar-card {
  background: rgba(25, 25, 35, 0.7);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  padding: 28px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.sidebar-card:hover {
  background: rgba(30, 30, 45, 0.8);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Profile Section */
.profile-section {
  text-align: center;
  position: relative;
  overflow: hidden;
}

.profile-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.2) 100%);
  opacity: 0.5;
}

.profile-header {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.avatar-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.15);
}

.online-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border: 3px solid rgba(25, 25, 35, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
  animation: pulse-indicator 2s ease-in-out infinite;
}

@keyframes pulse-indicator {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.profile-titles {
  margin-bottom: 16px;
}

.profile-name {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-role {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  letter-spacing: 0.05em;
}

.profile-bio {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  margin: 0 0 24px 0;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  letter-spacing: 0.05em;
}

/* Card Title */
.card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
}

.title-icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Site Info */
.site-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.detail-value {
  color: #ffffff;
  font-weight: 600;
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.social-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.social-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.social-name {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tag-item:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: #ffffff;
  transform: translateY(-2px);
}

.tag-size-1 { font-size: 12px; }
.tag-size-2 { font-size: 14px; background: rgba(255, 255, 255, 0.1); }
.tag-size-3 { font-size: 13px; background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.3); }

/* ===== Right Content ===== */
.right-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Welcome Banner */
.welcome-banner {
  position: relative;
  padding: 48px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(20, 20, 35, 0.4) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28px;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, -20px) scale(1.1); }
}

.welcome-text {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 36px;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.welcome-desc {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  max-width: 500px;
  line-height: 1.7;
}

.welcome-decoration {
  position: absolute;
  top: 50%;
  right: 60px;
  transform: translateY(-50%);
  width: 120px;
  height: 120px;
  opacity: 0.6;
}

.deco-circle {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: rotate-slow 20s linear infinite;
  position: relative;
}

.deco-circle::before {
  content: '';
  position: absolute;
  inset: 20px;
  border: 2px dashed rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  animation: rotate-slow 15s linear infinite reverse;
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Content Section */
.content-section {
  background: rgba(25, 25, 35, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.95);
}

.title-dot {
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.5);
}

.title-dot.featured {
  background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
  box-shadow: 0 0 16px rgba(244, 114, 182, 0.6);
}

.view-all {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-all:hover {
  color: #ffffff;
  transform: translateX(4px);
}

/* Categories List */
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.category-icon-wrap {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
  border-radius: 14px;
  font-size: 26px;
  transition: all 0.3s ease;
}

.category-item:hover .category-icon-wrap {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-name {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
}

.category-count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.category-arrow {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.category-item:hover .category-arrow {
  transform: translateX(6px);
  color: rgba(255, 255, 255, 0.8);
}

/* Featured Card Large */
.featured-card-large {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.featured-card-large:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.15);
}

.featured-image {
  position: relative;
  overflow: hidden;
  min-height: 280px;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.featured-card-large:hover .featured-image img {
  transform: scale(1.08);
}

.featured-content {
  padding: 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}

.featured-category {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(244, 114, 182, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
  border: 1px solid rgba(244, 114, 182, 0.3);
  border-radius: 100px;
  font-size: 12px;
  color: #f9a8d4;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.featured-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.featured-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.4;
  color: #ffffff;
}

.featured-excerpt {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.8;
  margin: 0 0 24px 0;
}

.featured-footer {
  margin-top: auto;
}

.read-more {
  font-size: 15px;
  color: #60a5fa;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.featured-card-large:hover .read-more {
  color: #93c5fd;
  transform: translateX(4px);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.post-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.post-image {
  height: 160px;
  overflow: hidden;
  position: relative;
}

.post-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card:hover .post-image::after {
  opacity: 1;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.post-card:hover .post-image img {
  transform: scale(1.08);
}

.post-content {
  padding: 24px;
}

.post-meta {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  align-items: center;
}

.post-category {
  font-size: 12px;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.post-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

.post-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.5;
  color: #ffffff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-excerpt {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  margin: 0 0 18px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.post-views {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.post-views svg {
  width: 16px;
  height: 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 20px;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.empty-state p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
}

/* Footer */
.site-footer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 24px 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.copyright {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 10px 0;
  font-weight: 500;
}

.credit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 300px 1fr;
    gap: 32px;
  }

  .welcome-banner {
    padding: 36px;
  }

  .welcome-title {
    font-size: 28px;
  }
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 40px;
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

  .featured-card-large {
    grid-template-columns: 1fr;
  }

  .featured-image {
    min-height: 220px;
  }

  .welcome-decoration {
    display: none;
  }
}

@media (max-width: 768px) {
  .blog-content {
    padding-top: 80px;
  }

  .main-layout {
    padding: 30px 16px;
    gap: 30px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .welcome-banner {
    padding: 28px;
    border-radius: 20px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-desc {
    font-size: 15px;
  }

  .content-section {
    padding: 24px;
    border-radius: 20px;
  }

  .featured-content {
    padding: 24px;
  }

  .featured-title {
    font-size: 20px;
  }

  .sidebar-card {
    padding: 24px;
  }
}
</style>
