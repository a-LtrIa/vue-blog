<template>
  <div class="post-detail-overlay" @click.self="closePost">
    <div class="post-detail-container">
      <!-- Close Button -->
      <button class="close-btn" @click="closePost">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      <!-- Article Content -->
      <article class="post-article">
        <!-- Header -->
        <header class="post-header">
          <div class="post-meta-top">
            <span class="post-category" v-if="post.category_name">{{ post.category_name }}</span>
            <time class="post-date">{{ formatDate(post.created_at) }}</time>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-stats">
            <span class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {{ post.view_count || 0 }} 阅读
            </span>
            <span class="stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ readTime }} 分钟阅读
            </span>
          </div>
        </header>

        <!-- Cover Image -->
        <div class="post-cover" v-if="post.cover_image">
          <img :src="post.cover_image" :alt="post.title" />
        </div>

        <!-- Content -->
        <div class="post-content" v-html="renderedContent"></div>

        <!-- Tags -->
        <div class="post-tags" v-if="post.tags && post.tags.length > 0">
          <span class="tag" v-for="tag in post.tags" :key="tag.id">{{ tag.name }}</span>
        </div>

        <!-- Footer -->
        <footer class="post-footer">
          <div class="author-info">
            <img :src="authorAvatar" alt="作者" class="author-avatar" @error="handleAvatarError" />
            <div class="author-details">
              <span class="author-name">{{ authorName }}</span>
              <span class="author-bio">{{ authorBio }}</span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { parseDate } from '../utils/date.js'
import defaultAvatar from '../assets/avatar.png'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

// Mock data for author - in real app, this would come from settings
const authorName = 'ALT'
const authorBio = '前端开发 | 热爱vibecode'
const authorAvatar = defaultAvatar

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const readTime = computed(() => {
  if (!props.post.content) return 1
  const words = props.post.content.length
  return Math.max(1, Math.ceil(words / 500))
})

const renderedContent = computed(() => {
  // Simple markdown-like rendering
  if (!props.post.content) return ''
  let content = props.post.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/#{3}\s+(.+)/g, '<h3>$1</h3>')
    .replace(/#{2}\s+(.+)/g, '<h2>$1</h2>')
    .replace(/#{1}\s+(.+)/g, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')

  return `<p>${content}</p>`
})

const closePost = () => {
  emit('close')
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}
</script>

<style scoped>
.post-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  overflow-y: auto;
}

.post-detail-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 100px rgba(0, 0, 0, 0.2);
}

.post-detail-container::-webkit-scrollbar {
  width: 8px;
}

.post-detail-container::-webkit-scrollbar-track {
  background: transparent;
}

.post-detail-container::-webkit-scrollbar-thumb {
  background: #e8e8ed;
  border-radius: 4px;
}

.post-detail-container::-webkit-scrollbar-thumb:hover {
  background: #d2d2d7;
}

/* Close Button */
.close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  background: #ffffff;
  border: 1px solid #e8e8ed;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1001;
}

.close-btn:hover {
  transform: scale(1.05);
  background: #f5f5f7;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #86868b;
}

/* Article */
.post-article {
  padding: 48px;
}

/* Header */
.post-header {
  margin-bottom: 32px;
}

.post-meta-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.post-category {
  background: #1d1d1f;
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.post-date {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #86868b;
}

.post-title {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: clamp(28px, 5vw, 36px);
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 20px 0;
  line-height: 1.3;
  letter-spacing: -0.015em;
}

.post-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #86868b;
}

.stat svg {
  width: 16px;
  height: 16px;
}

/* Cover Image */
.post-cover {
  margin: 0 -48px 32px -48px;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
}

/* Content */
.post-content {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 17px;
  line-height: 1.8;
  color: #333333;
}

.post-content :deep(p) {
  margin: 0 0 1.5em 0;
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3) {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-weight: 600;
  color: #1d1d1f;
  margin: 2em 0 0.8em 0;
}

.post-content :deep(h1) {
  font-size: 26px;
}

.post-content :deep(h2) {
  font-size: 22px;
}

.post-content :deep(h3) {
  font-size: 18px;
}

.post-content :deep(strong) {
  font-weight: 600;
  color: #1d1d1f;
}

.post-content :deep(em) {
  font-style: italic;
}

.post-content :deep(code) {
  font-family: 'SF Mono', Monaco, monospace;
  background: #f5f5f7;
  color: #1d1d1f;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.post-content :deep(pre) {
  background: #1d1d1f;
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  margin: 1.5em 0;
}

.post-content :deep(pre code) {
  background: none;
  color: #f5f5f7;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
}

.post-content :deep(br) {
  display: block;
  content: '';
  margin-bottom: 0.5em;
}

/* Tags */
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 40px 0;
  padding-top: 32px;
  border-top: 1px solid #e8e8ed;
}

.tag {
  background: #f5f5f7;
  color: #1d1d1f;
  padding: 8px 16px;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s ease;
}

.tag:hover {
  background: #e8e8ed;
}

/* Footer */
.post-footer {
  padding-top: 32px;
  border-top: 1px solid #e8e8ed;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.author-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f5f5f7;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.author-bio {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #86868b;
}

/* Responsive */
@media (max-width: 640px) {
  .post-detail-overlay {
    padding: 0;
  }

  .post-detail-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .close-btn {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }

  .post-article {
    padding: 80px 24px 32px;
  }

  .post-cover {
    margin: 0 -24px 24px -24px;
  }

  .post-stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .post-content {
    font-size: 16px;
  }
}
</style>
