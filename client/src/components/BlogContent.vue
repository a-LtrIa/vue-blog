<template>
  <div class="blog-content">
    <!-- Hero Header -->
    <header class="hero-header">
      <div class="hero-content">
        <h1 class="hero-title">{{ settings.site_name || '欢迎来到我的博客' }}</h1>
        <p class="hero-subtitle">{{ settings.site_description || '记录技术、生活与思考' }}</p>
      </div>
    </header>

    <!-- Main Container -->
    <div class="container">
      <!-- Bento Grid Dashboard -->
      <div class="bento-grid">
        <!-- Profile Card -->
        <div class="bento-card profile-card span-2">
          <div class="profile-content">
            <div class="avatar-section">
              <img :src="settings.avatar_url || defaultAvatar" alt="头像" class="profile-avatar" @error="handleAvatarError" />
            </div>
            <div class="profile-info">
              <h2>{{ settings.author_name || 'ALT' }}</h2>
              <p class="bio">{{ settings.author_bio || '前端工程师 | 热爱开源与设计' }}</p>
            </div>
          </div>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-number">{{ posts.length }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ categories.length }}</span>
              <span class="stat-label">分类</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ tags.length }}</span>
              <span class="stat-label">标签</span>
            </div>
          </div>
        </div>

        <!-- Social Card -->
        <div class="bento-card social-card">
          <h3>社交链接</h3>
          <div class="social-list">
            <a v-for="link in socialLinks" :key="link.id" :href="link.url" target="_blank" class="social-item">
              <span class="icon">{{ link.icon }}</span>
              <span class="name">{{ link.platform }}</span>
            </a>
          </div>
        </div>

        <!-- Tags Card -->
        <div class="bento-card tags-card">
          <h3>热门标签</h3>
          <div class="tag-list">
            <span v-for="tag in tags.slice(0, 10)" :key="tag.id" class="tag-item">{{ tag.name }}</span>
          </div>
        </div>

        <!-- Categories Card -->
        <div class="bento-card categories-card span-2">
          <h3>文章分类</h3>
          <div class="category-list">
            <div v-for="category in categories" :key="category.id" class="category-item">
              <div class="category-icon">📁</div>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ category.post_count || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- About Card -->
        <div class="bento-card about-card">
          <h3>关于</h3>
          <p>{{ settings.site_description || '这是我的技术博客，记录学习与思考。欢迎交流！' }}</p>
        </div>
      </div>

      <!-- Posts Section -->
      <section class="posts-section">
        <h2 class="section-title">最新文章</h2>
        <div class="posts-grid">
          <article 
            class="post-card" 
            v-for="(post, index) in posts" 
            :key="post.id" 
            :style="{ animationDelay: `${index * 0.1}s` }"
            @click="viewPost(post)"
          >
            <div class="post-header">
              <span class="post-category" v-if="post.category_name">{{ post.category_name }}</span>
              <time class="post-date">{{ formatDate(post.created_at) }}</time>
            </div>
            <h3 class="post-title">{{ post.title }}</h3>
            <p class="post-excerpt">{{ post.excerpt || post.content?.substring(0, 150) + '...' }}</p>
            <div class="post-footer">
              <span class="read-more">阅读全文 →</span>
              <div class="post-meta">
                <span class="views">👁 {{ post.view_count || 0 }}</span>
              </div>
            </div>
          </article>
        </div>
        <div v-if="posts.length === 0" class="empty-state">
          <p>暂无文章</p>
        </div>
      </section>

      <!-- Footer -->
      <footer class="blog-footer">
        <p>© 2025 {{ settings.site_name || 'ALT的博客' }} | Made with ❤️</p>
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

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
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
  background: #f5f5f7;
}

/* Hero Header - clean white */
.hero-header {
  position: relative;
  background: #ffffff;
  padding: 100px 20px 80px;
  text-align: center;
  border-bottom: 1px solid #e8e8ed;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
  letter-spacing: -0.015em;
}

.hero-subtitle {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  color: #86868b;
  margin: 0;
  font-weight: 400;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Bento Grid */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 60px;
}

/* Bento Card - clean white with subtle shadow */
.bento-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8e8ed;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.bento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.bento-card.span-2 {
  grid-column: span 2;
}

.bento-card h3 {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Profile Card */
.profile-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f5f5f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-info h2 {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 4px 0;
}

.profile-info .bio {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.profile-stats {
  display: flex;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid #e8e8ed;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1;
}

.stat-label {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Social Card */
.social-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
  color: #1d1d1f;
  text-decoration: none;
}

.social-item:hover {
  background: #f5f5f7;
}

.social-item .icon {
  font-size: 20px;
}

.social-item .name {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
}

/* Tags Card */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  background: #f5f5f7;
  color: #1d1d1f;
  padding: 6px 14px;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tag-item:hover {
  background: #e8e8ed;
}

/* Categories Card */
.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #f5f5f7;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: #e8e8ed;
}

.category-icon {
  font-size: 18px;
}

.category-name {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #1d1d1f;
  flex: 1;
}

.category-count {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  color: #86868b;
  background: #ffffff;
  padding: 2px 8px;
  border-radius: 10px;
}

/* About Card */
.about-card p {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #86868b;
  line-height: 1.6;
  margin: 0;
}

/* Posts Section */
.posts-section {
  margin-bottom: 60px;
}

.section-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 32px 0;
  text-align: center;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.post-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8e8ed;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.post-category {
  background: #f5f5f7;
  color: #1d1d1f;
  padding: 4px 12px;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.post-date {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #86868b;
}

.post-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.post-excerpt {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  color: #86868b;
  line-height: 1.6;
  margin: 0 0 20px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.read-more {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.2s ease;
}

.post-card:hover .read-more {
  color: #000000;
}

.post-meta {
  display: flex;
  gap: 16px;
}

.views {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #86868b;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8e8ed;
}

.empty-state p {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  color: #86868b;
}

/* Footer */
.blog-footer {
  text-align: center;
  padding: 40px 0;
  border-top: 1px solid #e8e8ed;
}

.blog-footer p {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: #86868b;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bento-card.span-2 {
    grid-column: span 2;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
  
  .bento-card.span-2 {
    grid-column: span 1;
  }
  
  .profile-content {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .category-list {
    grid-template-columns: 1fr;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-header {
    padding: 60px 20px 50px;
  }
}
</style>