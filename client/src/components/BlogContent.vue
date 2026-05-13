<template>
  <div class="blog-content">
    <!-- Clean Header -->
    <header class="site-header">
      <div class="header-inner">
        <div class="brand">
          <h1 class="site-title">{{ settings.site_name || '我的博客' }}</h1>
          <p class="site-desc">{{ settings.site_description || '记录技术、生活与思考' }}</p>
        </div>
        <nav class="header-nav">
          <a href="#" class="nav-link active">首页</a>
          <a href="#posts" class="nav-link">文章</a>
          <a href="#about" class="nav-link">关于</a>
        </nav>
      </div>
    </header>

    <!-- Main Container -->
    <main class="main-container">
      <!-- Hero Profile Section -->
      <section class="hero-section">
        <div class="profile-card">
          <div class="profile-avatar-wrap">
            <img :src="settings.avatar_url || defaultAvatar" alt="头像" class="profile-avatar" @error="handleAvatarError" />
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ settings.author_name || '作者' }}</h2>
            <p class="profile-bio">{{ settings.author_bio || '热爱技术与设计' }}</p>
            <div class="profile-stats">
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
            </div>
          </div>
        </div>

        <!-- Featured Post -->
        <div class="featured-card" v-if="posts[0]" @click="viewPost(posts[0])">
          <div class="featured-badge">精选</div>
          <div class="featured-content">
            <span class="featured-category">{{ posts[0].category_name }}</span>
            <h3 class="featured-title">{{ posts[0].title }}</h3>
            <p class="featured-excerpt">{{ posts[0].excerpt || posts[0].content?.substring(0, 100) + '...' }}</p>
          </div>
          <div class="featured-footer">
            <time>{{ formatDate(posts[0].created_at) }}</time>
            <span class="read-more">阅读全文 →</span>
          </div>
        </div>
      </section>

      <!-- Categories Grid -->
      <section class="categories-section">
        <h3 class="section-title">文章分类</h3>
        <div class="categories-grid">
          <div v-for="category in categories.slice(0, 6)" :key="category.id" class="category-card">
            <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.post_count || 0 }} 篇</span>
          </div>
        </div>
      </section>

      <!-- Tags Cloud -->
      <section class="tags-section">
        <h3 class="section-title">热门标签</h3>
        <div class="tags-list">
          <span v-for="(tag, index) in tags.slice(0, 15)" :key="tag.id" class="tag-pill" :class="{ 'tag-lg': index < 5 }">
            {{ tag.name }}
          </span>
        </div>
      </section>

      <!-- Posts List -->
      <section id="posts" class="posts-section">
        <div class="section-header">
          <h3 class="section-title">最新文章</h3>
          <a href="#" class="view-all">查看全部</a>
        </div>

        <div class="posts-list">
          <article class="post-item" v-for="(post, index) in posts" :key="post.id" @click="viewPost(post)">
            <div class="post-meta">
              <span class="post-category" v-if="post.category_name">{{ post.category_name }}</span>
              <time class="post-date">{{ formatDate(post.created_at) }}</time>
            </div>
            <h4 class="post-title">{{ post.title }}</h4>
            <p class="post-excerpt">{{ post.excerpt || post.content?.substring(0, 150) + '...' }}</p>
            <div class="post-footer">
              <div class="post-tags" v-if="post.tags">
                <span v-for="tag in post.tags.slice(0, 3)" :key="tag" class="post-tag">{{ tag }}</span>
              </div>
              <span class="post-views">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {{ post.view_count || 0 }}
              </span>
            </div>
          </article>
        </div>

        <div v-if="posts.length === 0" class="empty-state">
          <span class="empty-icon">📝</span>
          <p>暂无文章，敬请期待...</p>
        </div>
      </section>

      <!-- Social Links -->
      <section class="social-section">
        <h3 class="section-title">关注我</h3>
        <div class="social-list">
          <a v-for="link in socialLinks" :key="link.id" :href="link.url" target="_blank" class="social-link">
            <span class="social-icon">{{ link.icon }}</span>
            <span class="social-name">{{ link.platform }}</span>
          </a>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <p class="copyright">© 2025 {{ settings.site_name || '我的博客' }}</p>
      <p class="credit">Made with Vue.js</p>
    </footer>
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
/* ===== Base Layout ===== */
.blog-content {
  min-height: 100vh;
  color: #ffffff;
}

/* ===== Header ===== */
.site-header {
  padding: 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
}

.site-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0 0;
}

.header-nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #ffffff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ffffff;
  border-radius: 1px;
}

/* ===== Main Container ===== */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* ===== Hero Section ===== */
.hero-section {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

/* Profile Card - Clean Style */
.profile-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
}

.profile-avatar-wrap {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 0, 0, 0.5);
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.profile-bio {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 24px 0;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Featured Card - Clean Style */
.featured-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.featured-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.featured-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.featured-category {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.featured-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.featured-excerpt {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.featured-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.read-more {
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease;
}

.featured-card:hover .read-more {
  color: #ffffff;
}

/* ===== Section Title ===== */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 20px 0;
}

/* ===== Categories Section ===== */
.categories-section {
  margin-bottom: 48px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.category-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.category-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-bottom: 4px;
}

.category-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* ===== Tags Section ===== */
.tags-section {
  margin-bottom: 48px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-pill {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.tag-lg {
  font-size: 14px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.08);
}

/* ===== Posts Section ===== */
.posts-section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.view-all {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.view-all:hover {
  color: #ffffff;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.post-category {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 100px;
}

.post-date {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #ffffff;
}

.post-excerpt {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
  margin: 0 0 16px 0;
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
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 100px;
}

.post-views {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.post-views svg {
  width: 14px;
  height: 14px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* ===== Social Section ===== */
.social-section {
  margin-bottom: 48px;
}

.social-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.social-icon {
  font-size: 18px;
}

.social-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== Footer ===== */
.site-footer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}

.copyright {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px 0;
}

.credit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 280px 1fr;
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .hero-section {
    grid-template-columns: 1fr;
  }

  .profile-card {
    padding: 24px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .post-item {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 24px 16px;
  }

  .header-nav {
    gap: 20px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .category-card {
    padding: 16px 8px;
  }

  .featured-card {
    padding: 24px;
  }

  .featured-title {
    font-size: 18px;
  }
}
</style>
