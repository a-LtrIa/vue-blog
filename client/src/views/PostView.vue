<template>
  <div class="post-view">
    <!-- Sticky Glass Navigation -->
    <nav class="glass-nav" :class="{ 'nav-scrolled': isScrolled }">
      <div class="nav-inner">
        <a href="/" class="nav-brand" @click.prevent="goHome">
          <span class="brand-icon">←</span>
          <span class="brand-text">{{ settings.site_name || '我的博客' }}</span>
        </a>
        <div class="nav-actions">
          <button class="nav-btn" @click="sharePost" title="分享">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
          <button class="nav-btn" @click="toggleToc" title="目录" v-if="headers.length > 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Article Header -->
    <header class="article-header">
      <div class="header-content">
        <div class="article-meta">
          <span class="article-category" v-if="post.category_name">{{ post.category_name }}</span>
          <time class="article-date">{{ formatDate(post.created_at) }}</time>
          <span class="article-views">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {{ post.view_count || 0 }}
          </span>
        </div>
        <h1 class="article-title">{{ post.title }}</h1>
        <div class="article-tags" v-if="post.tags && post.tags.length">
          <span v-for="tag in post.tags" :key="tag.id || tag" class="article-tag">
            {{ tag.name || tag }}
          </span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="article-main">
      <div class="content-wrapper">
        <!-- Table of Contents -->
        <aside class="toc-sidebar" :class="{ 'toc-visible': showToc }">
          <div class="toc-card">
            <h3 class="toc-title">目录</h3>
            <ul class="toc-list">
              <li v-for="header in headers" :key="header.id" :class="`toc-level-${header.level}`">
                <a :href="`#${header.id}`" @click.prevent="scrollToHeader(header.id)">{{ header.text }}</a>
              </li>
            </ul>
          </div>
        </aside>

        <!-- Article Content -->
        <article class="article-content">
          <div class="content-body" v-html="renderedContent"></div>
        </article>
      </div>
    </main>

    <!-- Article Footer -->
    <footer class="article-footer">
      <div class="footer-content">
        <div class="author-card">
          <img :src="settings.avatar_url || defaultAvatar" alt="作者" class="author-avatar" />
          <div class="author-info">
            <span class="author-name">{{ settings.author_name || '作者' }}</span>
            <span class="author-bio">{{ settings.author_bio || '热爱技术与设计' }}</span>
          </div>
        </div>
        <div class="article-nav">
          <button v-if="prevPost" class="nav-post prev" @click="goToPost(prevPost)">
            <span class="nav-label">上一篇</span>
            <span class="nav-title">{{ prevPost.title }}</span>
          </button>
          <button v-if="nextPost" class="nav-post next" @click="goToPost(nextPost)">
            <span class="nav-label">下一篇</span>
            <span class="nav-title">{{ nextPost.title }}</span>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { postsApi, settingsApi } from '../api/index.js'

const route = useRoute()
const router = useRouter()

const post = ref({})
const settings = ref({})
const posts = ref([])
const isScrolled = ref(false)
const showToc = ref(false)
const headers = ref([])

const defaultAvatar = '/src/assets/avatar.jpg'

// 渲染 Markdown
const renderedContent = computed(() => {
  if (!post.value.content) return ''
  return marked(post.value.content)
})

// 上一篇/下一篇
const currentIndex = computed(() => posts.value.findIndex(p => p.id === post.value.id))
const prevPost = computed(() => currentIndex.value > 0 ? posts.value[currentIndex.value - 1] : null)
const nextPost = computed(() => currentIndex.value < posts.value.length - 1 ? posts.value[currentIndex.value + 1] : null)

// 解析文章标题
const parseHeaders = () => {
  const content = post.value.content || ''
  const headerRegex = /^(#{1,3})\s+(.+)$/gm
  const matches = []
  let match
  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    matches.push({ level, text, id })
  }
  headers.value = matches
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 跳转到文章
const goToPost = (p) => {
  router.push(`/post/${p.slug}`)
}

// 分享文章
const sharePost = () => {
  if (navigator.share) {
    navigator.share({
      title: post.value.title,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

// 切换目录
const toggleToc = () => {
  showToc.value = !showToc.value
}

// 滚动到标题
const scrollToHeader = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  showToc.value = false
}

// 监听滚动
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// 加载数据
const loadData = async () => {
  const slug = route.params.slug
  try {
    const [postRes, settingsRes, postsRes] = await Promise.all([
      postsApi.getBySlug(slug),
      settingsApi.getAll(),
      postsApi.getAll({ status: 'published', limit: 100 })
    ])
    
    post.value = postRes.data
    settings.value = settingsRes.data
    posts.value = postsRes.data?.posts || []
    
    parseHeaders()
  } catch (error) {
    console.error('加载文章失败', error)
    router.push('/')
  }
}

onMounted(() => {
  loadData()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.post-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #151520 100%);
  color: #ffffff;
}

/* Glass Navigation */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px 0;
  transition: all 0.3s ease;
  background: transparent;
}

.glass-nav.nav-scrolled {
  background: rgba(15, 15, 25, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #ffffff;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.nav-brand:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 18px;
}

.brand-text {
  font-size: 16px;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.nav-btn {
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

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}

/* Article Header */
.article-header {
  padding: 120px 24px 60px;
  text-align: center;
  background: linear-gradient(180deg, rgba(20, 20, 35, 0.8) 0%, transparent 100%);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.article-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.article-category {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.article-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.article-views {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.article-views svg {
  width: 16px;
  height: 16px;
}

.article-title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 24px 0;
  letter-spacing: -0.02em;
}

.article-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.article-tag {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* Main Content */
.article-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

/* Table of Contents */
.toc-sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.toc-card {
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.toc-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.8);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  margin-bottom: 8px;
}

.toc-list a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
  display: block;
  padding: 4px 0;
}

.toc-list a:hover {
  color: #ffffff;
}

.toc-level-2 {
  padding-left: 16px;
}

.toc-level-3 {
  padding-left: 32px;
}

/* Article Content */
.article-content {
  background: rgba(20, 20, 30, 0.4);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 48px;
}

.content-body {
  font-size: 17px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
}

.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3) {
  color: #ffffff;
  margin-top: 40px;
  margin-bottom: 20px;
  font-weight: 600;
}

.content-body :deep(h1) {
  font-size: 28px;
}

.content-body :deep(h2) {
  font-size: 24px;
}

.content-body :deep(h3) {
  font-size: 20px;
}

.content-body :deep(p) {
  margin-bottom: 20px;
}

.content-body :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
  font-size: 0.9em;
}

.content-body :deep(pre) {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  margin: 24px 0;
}

.content-body :deep(pre code) {
  background: transparent;
  padding: 0;
}

.content-body :deep(ul),
.content-body :deep(ol) {
  margin-bottom: 20px;
  padding-left: 24px;
}

.content-body :deep(li) {
  margin-bottom: 8px;
}

.content-body :deep(blockquote) {
  border-left: 4px solid rgba(255, 255, 255, 0.3);
  padding-left: 20px;
  margin: 24px 0;
  color: rgba(255, 255, 255, 0.7);
}

/* Article Footer */
.article-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.author-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.author-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 600;
}

.author-bio {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.article-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.nav-post {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: rgba(20, 20, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ffffff;
}

.nav-post:hover {
  background: rgba(30, 30, 45, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
}

.nav-post.next {
  text-align: right;
}

.nav-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }

  .toc-sidebar {
    position: fixed;
    top: 80px;
    left: 24px;
    right: 24px;
    z-index: 100;
    transform: translateY(-150%);
    transition: transform 0.3s ease;
  }

  .toc-sidebar.toc-visible {
    transform: translateY(0);
  }

  .article-content {
    padding: 32px;
  }
}

@media (max-width: 640px) {
  .article-header {
    padding: 100px 20px 40px;
  }

  .article-meta {
    gap: 12px;
  }

  .article-content {
    padding: 24px;
  }

  .content-body {
    font-size: 16px;
  }

  .article-nav {
    grid-template-columns: 1fr;
  }

  .nav-post.next {
    text-align: left;
  }
}
</style>
