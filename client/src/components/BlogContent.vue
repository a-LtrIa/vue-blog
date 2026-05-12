<template>
  <div class="blog-content">
    <!-- Cinematic Hero Header -->
    <header class="hero-section">
      <div class="hero-glass glass-morphism">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span class="badge-text">个人博客</span>
        </div>
        <h1 class="hero-title">{{ settings.site_name || '欢迎来到我的博客' }}</h1>
        <p class="hero-subtitle">{{ settings.site_description || '记录技术、生活与思考' }}</p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">{{ posts.length }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">{{ categories.length }}</span>
            <span class="stat-label">分类</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">{{ tags.length }}</span>
            <span class="stat-label">标签</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <div class="container">
      <!-- Bento Grid Dashboard -->
      <div class="bento-grid">
        <!-- Profile Card - Large -->
        <div class="bento-card glass-morphism profile-card span-2 row-2">
          <div class="card-shine"></div>
          <div class="profile-header">
            <div class="avatar-wrapper">
              <div class="avatar-glow"></div>
              <img :src="settings.avatar_url || defaultAvatar" alt="头像" class="profile-avatar" @error="handleAvatarError" />
            </div>
            <div class="profile-meta">
              <h2 class="profile-name">{{ settings.author_name || 'ALT' }}</h2>
              <p class="profile-role">{{ settings.author_bio || '前端工程师 | 热爱开源与设计' }}</p>
            </div>
          </div>
          <div class="profile-actions">
            <button class="action-btn primary">
              <span>关于我</span>
            </button>
            <button class="action-btn secondary">
              <span>联系我</span>
            </button>
          </div>
        </div>

        <!-- Featured Post Card -->
        <div class="bento-card glass-morphism featured-card" v-if="posts[0]">
          <div class="card-badge hot">热门</div>
          <div class="featured-content">
            <span class="featured-category">{{ posts[0].category_name }}</span>
            <h3 class="featured-title">{{ posts[0].title }}</h3>
            <p class="featured-excerpt">{{ posts[0].excerpt || posts[0].content?.substring(0, 80) + '...' }}</p>
          </div>
          <button class="read-btn" @click="viewPost(posts[0])">
            <span>阅读</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Quick Stats Card -->
        <div class="bento-card glass-morphism stats-card">
          <h3 class="card-title">数据概览</h3>
          <div class="mini-stats">
            <div class="mini-stat">
              <div class="mini-stat-icon">📝</div>
              <div class="mini-stat-info">
                <span class="mini-stat-value">{{ posts.length }}</span>
                <span class="mini-stat-label">文章</span>
              </div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-icon">📂</div>
              <div class="mini-stat-info">
                <span class="mini-stat-value">{{ categories.length }}</span>
                <span class="mini-stat-label">分类</span>
              </div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-icon">🏷️</div>
              <div class="mini-stat-info">
                <span class="mini-stat-value">{{ tags.length }}</span>
                <span class="mini-stat-label">标签</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Card -->
        <div class="bento-card glass-morphism categories-card span-2">
          <div class="card-header">
            <h3 class="card-title">文章分类</h3>
            <span class="card-count">{{ categories.length }} 个分类</span>
          </div>
          <div class="category-grid">
            <div v-for="category in categories.slice(0, 6)" :key="category.id" class="category-item">
              <div class="category-icon-wrapper">
                <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
              </div>
              <div class="category-info">
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">{{ category.post_count || 0 }} 篇</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tags Cloud Card -->
        <div class="bento-card glass-morphism tags-card">
          <h3 class="card-title">热门标签</h3>
          <div class="tag-cloud">
            <span
              v-for="(tag, index) in tags.slice(0, 12)"
              :key="tag.id"
              class="tag-item"
              :class="{ 'tag-lg': index < 3, 'tag-md': index >= 3 && index < 7 }"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <!-- Social Links Card -->
        <div class="bento-card glass-morphism social-card">
          <h3 class="card-title">关注我</h3>
          <div class="social-grid">
            <a v-for="link in socialLinks.slice(0, 4)" :key="link.id" :href="link.url" target="_blank" class="social-item">
              <div class="social-icon-wrapper">
                <span class="social-icon">{{ link.icon }}</span>
              </div>
              <span class="social-name">{{ link.platform }}</span>
            </a>
          </div>
        </div>

        <!-- About Quote Card -->
        <div class="bento-card glass-morphism quote-card span-2">
          <div class="quote-icon">"</div>
          <p class="quote-text">{{ settings.site_description || '记录技术、分享知识、探索未知。在这里，我将与你分享前端开发的点点滴滴，以及生活中的所思所感。' }}</p>
          <div class="quote-author">
            <span>— {{ settings.author_name || 'ALT' }}</span>
          </div>
        </div>
      </div>

      <!-- Posts Section -->
      <section class="posts-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">✨</span>
            最新文章
          </h2>
          <button class="view-all-btn">
            <span>查看全部</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="posts-grid">
          <article
            class="post-card glass-morphism"
            v-for="(post, index) in posts"
            :key="post.id"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="viewPost(post)"
          >
            <div class="post-glow"></div>
            <div class="post-header">
              <span class="post-category" v-if="post.category_name">
                <span class="category-dot"></span>
                {{ post.category_name }}
              </span>
              <time class="post-date">{{ formatDate(post.created_at) }}</time>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt || post.content?.substring(0, 120) + '...' }}</p>
            <div class="post-footer">
              <div class="post-tags" v-if="post.tags">
                <span v-for="tag in post.tags.slice(0, 2)" :key="tag" class="post-tag">{{ tag }}</span>
              </div>
              <div class="post-meta">
                <span class="views">
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

        <div v-if="posts.length === 0" class="empty-state glass-morphism">
          <div class="empty-icon">📝</div>
          <p>暂无文章，敬请期待...</p>
        </div>
      </section>

      <!-- Footer -->
      <footer class="blog-footer glass-morphism">
        <div class="footer-content">
          <p class="copyright">© 2025 {{ settings.site_name || 'ALT的博客' }}</p>
          <p class="made-with">Made with ❤️ and Vue.js</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  settings: Object,
  socialLinks: Array,
  categories: Array,
  posts: Array,
  tags: Array
})

const emit = defineEmits(['view-post'])

const defaultAvatar = '/src/assets/avatar.jpg'

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
  emit('view-post', post)
}
</script>

<style scoped>
.blog-content {
  min-height: 100vh;
  padding: 40px 0;
}

/* Use global glass-morphism classes from main.css */
/* Local overrides for BlogContent specific styles */

.bento-card {
  composes: glass-morphism;
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.glass-morphism:hover .card-shine {
  opacity: 1;
}

/* Cinematic Hero Section */
.hero-section {
  padding: 60px 20px 40px;
  display: flex;
  justify-content: center;
}

.hero-glass {
  padding: 48px 64px;
  text-align: center;
  max-width: 700px;
  width: 100%;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  margin-bottom: 24px;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.badge-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 32px 0;
  font-weight: 400;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.stat-label {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 20px;
  margin-bottom: 60px;
}

.bento-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.span-2 {
  grid-column: span 2;
}

.row-2 {
  grid-row: span 2;
}

.card-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Profile Card */
.profile-card {
  justify-content: space-between;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
}

.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(120, 119, 198, 0.5) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(15px);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.profile-name {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.profile-role {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.action-btn.primary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.action-btn.secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Featured Card */
.featured-card {
  position: relative;
  justify-content: space-between;
}

.card-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.featured-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.featured-category {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.featured-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-excerpt {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  align-self: flex-start;
}

.read-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
}

.read-btn svg {
  width: 14px;
  height: 14px;
}

/* Stats Card */
.mini-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 20px;
}

.mini-stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-stat-value {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.mini-stat-label {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Categories Card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-count {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.category-icon-wrapper {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 24px;
}

.category-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.category-name {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.category-count {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/* Tags Card */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
}

.tag-lg {
  font-size: 14px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
}

.tag-md {
  font-size: 13px;
}

/* Social Card */
.social-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.social-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 18px;
}

.social-name {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* Quote Card */
.quote-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px;
}

.quote-icon {
  font-family: Georgia, serif;
  font-size: 64px;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1;
  margin-bottom: -20px;
}

.quote-text {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  margin: 0 0 16px 0;
  font-style: italic;
}

.quote-author {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* Posts Section */
.posts-section {
  margin-bottom: 60px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 28px;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  color: rgba(255, 255, 255, 0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.view-all-btn svg {
  width: 16px;
  height: 16px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.post-card {
  padding: 28px;
  cursor: pointer;
  animation: fadeInUp 0.6s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.post-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 0%,
    rgba(120, 119, 198, 0.15) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.post-card:hover .post-glow {
  opacity: 1;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.post-category {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.category-dot {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
}

.post-date {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.post-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-excerpt {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0 0 20px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-tags {
  display: flex;
  gap: 8px;
}

.post-tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.views {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.views svg {
  width: 16px;
  height: 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Footer */
.blog-footer {
  padding: 32px;
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.copyright {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.made-with {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .span-2 {
    grid-column: span 2;
  }

  .row-2 {
    grid-row: span 1;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-glass {
    padding: 32px 24px;
  }

  .hero-stats {
    gap: 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .bento-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: span 1;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
