<template>
  <div class="article-repo">
    <div class="repo-container">
      <header class="repo-header">
        <button class="back-home-btn" @click="goHome">
          <ArrowLeft :size="18" />
          <span>返回主页</span>
        </button>
        <div class="repo-title-area">
          <h1 class="repo-title">文章仓库</h1>
          <p class="repo-subtitle" v-if="activeCategory">分类：{{ activeCategory }}</p>
        </div>
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: viewMode === 'folder' }"
            @click="viewMode = 'folder'"
          >
            <FolderOpen :size="16" />
            <span>文件仓库</span>
          </button>
          <button
            class="mode-btn"
            :class="{ active: viewMode === 'timeline' }"
            @click="viewMode = 'timeline'"
          >
            <Clock :size="16" />
            <span>时间线</span>
          </button>
        </div>
      </header>

      <!-- File Repository Mode -->
      <div v-if="viewMode === 'folder'" class="folder-mode">
        <div class="folder-grid">
          <div
            v-for="cat in categoriesWithPosts"
            :key="cat.id"
            class="folder-card"
            :class="{ expanded: expandedFolder === cat.id }"
          >
            <div class="folder-header" @click="toggleFolder(cat.id)">
              <div class="folder-icon-wrap">
                <Folder :size="22" v-if="expandedFolder !== cat.id" />
                <FolderOpen :size="22" v-else />
              </div>
              <div class="folder-info">
                <span class="folder-name">{{ cat.name }}</span>
                <span class="folder-count">{{ cat.posts.length }} 篇文章</span>
              </div>
              <ChevronRight
                :size="18"
                class="folder-chevron"
                :class="{ rotated: expandedFolder === cat.id }"
              />
            </div>
            <transition name="folder-expand">
              <div v-if="expandedFolder === cat.id" class="folder-posts">
                <div
                  v-for="post in cat.posts"
                  :key="post.id"
                  class="folder-post-item"
                  @click="viewPost(post)"
                >
                  <div class="post-item-main">
                    <FileText :size="16" class="post-item-icon" />
                    <span class="post-item-title">{{ post.title }}</span>
                  </div>
                  <span class="post-item-date">{{ formatDate(post.created_at) }}</span>
                </div>
                <div v-if="cat.posts.length === 0" class="folder-empty">
                  暂无文章
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- Timeline Mode -->
      <div v-if="viewMode === 'timeline'" class="timeline-mode">
        <div class="timeline-track">
          <div
            v-for="group in timelineGroups"
            :key="group.label"
            class="timeline-group"
          >
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              <div class="marker-line"></div>
            </div>
            <div class="timeline-content">
              <h3 class="timeline-label">{{ group.label }}</h3>
              <div class="timeline-cards">
                <div
                  v-for="post in group.posts"
                  :key="post.id"
                  class="timeline-card"
                  @click="viewPost(post)"
                >
                  <div class="timeline-card-body">
                    <div class="timeline-card-meta">
                      <span class="timeline-card-category" v-if="post.category_name">
                        {{ post.category_name }}
                      </span>
                      <time class="timeline-card-date">{{ formatDate(post.created_at) }}</time>
                    </div>
                    <h4 class="timeline-card-title">{{ post.title }}</h4>
                    <p class="timeline-card-excerpt">
                      {{ post.excerpt || post.content?.substring(0, 120) + '...' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="allPosts.length === 0" class="repo-empty">
        <FileText :size="48" class="empty-icon" />
        <p>暂无文章</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft,
  FolderOpen,
  Clock,
  Folder,
  ChevronRight,
  FileText
} from 'lucide-vue-next'
import { postsApi, categoriesApi } from '../api/index.js'

const router = useRouter()
const route = useRoute()

const viewMode = ref('folder')
const expandedFolder = ref(null)
const allPosts = ref([])
const allCategories = ref([])
const activeCategory = ref('')

const categoriesWithPosts = computed(() => {
  return allCategories.value.map(cat => ({
    ...cat,
    posts: allPosts.value.filter(p => p.category_id === cat.id)
  }))
})

const timelineGroups = computed(() => {
  const groups = {}
  const posts = [...allPosts.value].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  posts.forEach(post => {
    const date = new Date(post.created_at)
    const label = `${date.getFullYear()}年${date.getMonth() + 1}月`
    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(post)
  })

  return Object.entries(groups).map(([label, posts]) => ({ label, posts }))
})

const toggleFolder = (id) => {
  expandedFolder.value = expandedFolder.value === id ? null : id
}

const viewPost = (post) => {
  router.push(`/post/${post.slug}`)
}

const goHome = () => {
  router.push('/')
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const loadData = async () => {
  try {
    const [postsRes, categoriesRes] = await Promise.all([
      postsApi.getAll({ status: 'published', limit: 200 }),
      categoriesApi.getAll()
    ])

    allPosts.value = postsRes.data?.posts || []
    allCategories.value = categoriesRes.data?.categories || categoriesRes.data || []

    const catParam = route.query.category
    if (catParam) {
      activeCategory.value = catParam
      const matchedCat = allCategories.value.find(
        c => c.name === catParam || c.slug === catParam
      )
      if (matchedCat) {
        expandedFolder.value = matchedCat.id
      }
    }
  } catch (error) {
    console.error('加载文章仓库失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.article-repo {
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 80px;
}

.repo-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header */
.repo-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--bg-card, rgba(40, 40, 40, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.back-home-btn:hover {
  background: var(--bg-hover, rgba(50, 50, 50, 0.9));
  border-color: var(--border-hover, rgba(255, 255, 255, 0.15));
  color: var(--text-primary, #ffffff);
  transform: translateX(-4px);
}

.repo-title-area {
  flex: 1;
  min-width: 0;
}

.repo-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
  letter-spacing: -0.02em;
}

.repo-subtitle {
  font-size: 14px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  margin: 6px 0 0 0;
}

/* Mode Toggle */
.mode-toggle {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  padding: 4px;
  flex-shrink: 0;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 9px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.mode-btn:hover {
  color: var(--text-primary, #ffffff);
}

.mode-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* ===== File Repository Mode ===== */
.folder-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.folder-card {
  background: var(--bg-card, rgba(40, 40, 40, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.folder-card:hover {
  border-color: var(--border-hover, rgba(255, 255, 255, 0.15));
}

.folder-card.expanded {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.folder-header:hover {
  background: rgba(255, 255, 255, 0.03);
}

.folder-icon-wrap {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.folder-card.expanded .folder-icon-wrap {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
}

.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.folder-count {
  display: block;
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  margin-top: 2px;
}

.folder-chevron {
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.folder-chevron.rotated {
  transform: rotate(90deg);
}

/* Folder Posts */
.folder-posts {
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
}

.folder-post-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 14px 56px;
  cursor: pointer;
  transition: background 0.2s ease;
  gap: 16px;
}

.folder-post-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.folder-post-item + .folder-post-item {
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.post-item-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.post-item-icon {
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  flex-shrink: 0;
}

.post-item-title {
  font-size: 14px;
  color: var(--text-primary, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-item-date {
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  flex-shrink: 0;
}

.folder-empty {
  padding: 24px 20px 24px 56px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  font-size: 14px;
}

/* Folder Expand Transition */
.folder-expand-enter-active,
.folder-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.folder-expand-enter-from,
.folder-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.folder-expand-enter-to,
.folder-expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}

/* ===== Timeline Mode ===== */
.timeline-track {
  position: relative;
  padding-left: 32px;
}

.timeline-track::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--border-color, rgba(255, 255, 255, 0.1));
}

.timeline-group {
  position: relative;
  margin-bottom: 40px;
}

.timeline-group:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -32px;
  top: 8px;
}

.marker-dot {
  width: 15px;
  height: 15px;
  background: rgba(255, 255, 255, 0.15);
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.timeline-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  margin: 0 0 16px 0;
  padding-top: 2px;
}

.timeline-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-card {
  background: var(--bg-card, rgba(40, 40, 40, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  border-color: var(--border-hover, rgba(255, 255, 255, 0.15));
  transform: translateX(6px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.timeline-card-body {
  padding: 18px 20px;
}

.timeline-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.timeline-card-category {
  font-size: 11px;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 100px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timeline-card-date {
  font-size: 12px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
}

.timeline-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.timeline-card-excerpt {
  font-size: 13px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.5));
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Empty State */
.repo-empty {
  text-align: center;
  padding: 80px 20px;
}

.repo-empty .empty-icon {
  color: var(--text-muted, rgba(255, 255, 255, 0.3));
  margin-bottom: 16px;
}

.repo-empty p {
  font-size: 15px;
  color: var(--text-muted, rgba(255, 255, 255, 0.4));
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .article-repo {
    padding-top: 80px;
  }

  .repo-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .repo-title {
    font-size: 24px;
  }

  .mode-toggle {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
    justify-content: center;
  }

  .folder-post-item {
    padding-left: 20px;
  }

  .timeline-track {
    padding-left: 24px;
  }

  .timeline-marker {
    left: -24px;
  }
}
</style>