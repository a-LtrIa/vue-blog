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
              <div class="avatar-wrap" @click="showProfileCard = true">
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
          <!-- Announcement Card -->
          <AnnouncementCard :announcements="announcements" />
          <!-- Hot Tags Card -->
          <TagsCard :tags="tags" />
          <!-- Visits Chart Card -->
          <VisitsChart />
          <!-- Social Links Card -->
          <div class="sidebar-card social-section" v-if="socialLinks.length">
            <h3 class="card-title">
              <Link2 class="title-icon" :size="16" />
              关注我
            </h3>
            <div class="social-grid">
              <a
                v-for="link in socialLinks.slice(0, 6)"
                :key="link.id"
                :href="isWebUrl(link.url) ? link.url : undefined"
                :target="isWebUrl(link.url) ? '_blank' : undefined"
                class="social-item"
                @click.prevent="handleSocialClick(link)"
              >
                <component :is="getSocialIcon(link)" :size="22" class="social-icon" />
                <span class="social-name">{{ link.platform }}</span>
              </a>
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
                <span class="detail-value">{{ runningTime }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">最后更新</span>
                <span class="detail-value">{{ lastUpdate }}</span>
              </div>
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
            <p class="welcome-desc">分享学习和生活中的点滴思考</p>
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
                <component :is="getCategoryIcon(category)" :size="24" />
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
                <span class="post-badge external-badge" v-if="posts[0].post_type === 'external'">外链</span>
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
            <article class="post-card" v-for="post in posts.slice(1, 6)" :key="post.id" @click="viewPost(post, '/')">
              <div class="post-image" v-if="post.cover_image">
                <img :src="post.cover_image" :alt="post.title" />
                <span class="post-badge external-badge" v-if="post.post_type === 'external'">外链</span>
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

        <!-- Tools Section -->
        <ToolsCard :tools="tools" />

        <!-- Resources Section -->
        <ResourcesCard :resources="resources" />
        </template>
      </main>
    </div>

    <!-- Hitokoto Section -->
    <div class="hitokoto-section">
      <HitokotoCard :transparent="true" />
    </div>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-glass">
        <div class="footer-main">
          <div class="footer-brand">
            <h3 class="footer-logo">{{ settings.site_name || '我的博客' }}</h3>
            <p class="footer-desc">{{ settings.site_description || '记录技术、生活与思考' }}</p>
            <div class="footer-social">
              <a
                v-for="link in socialLinks.slice(0, 4)"
                :key="link.id"
                :href="isWebUrl(link.url) ? link.url : undefined"
                :target="isWebUrl(link.url) ? '_blank' : undefined"
                class="social-link"
                @click.prevent="handleSocialClick(link)"
              >
                <component :is="getSocialIcon(link)" :size="16" />
              </a>
            </div>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <h4 class="footer-col-title">导航</h4>
              <a href="/" class="footer-link">首页</a>
              <a href="/articles" class="footer-link">文章</a>
              <a href="/categories" class="footer-link">分类</a>
              <a href="/tags" class="footer-link">标签</a>
            </div>
            <div class="footer-col">
              <h4 class="footer-col-title">资源</h4>
              <a href="/tools" class="footer-link">小工具</a>
              <a href="/resources" class="footer-link">资源分享</a>
              <a href="/music" class="footer-link">音乐</a>
              <a href="/about" class="footer-link">关于</a>
            </div>
            <div class="footer-col">
              <h4 class="footer-col-title">联系</h4>
              <a
                v-for="link in socialLinks.slice(0, 4)"
                :key="link.id"
                :href="isWebUrl(link.url) ? link.url : undefined"
                :target="isWebUrl(link.url) ? '_blank' : undefined"
                class="footer-link"
                @click.prevent="handleSocialClick(link)"
              >
                <component :is="getSocialIcon(link)" :size="14" class="footer-link-icon" />
                {{ link.platform }}
              </a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <p class="copyright">© {{ new Date().getFullYear() }} {{ settings.site_name || '我的博客' }}. All rights reserved.</p>
            <p class="credit">Powered by Vue.js & Express</p>
          </div>
          <div class="footer-bottom-right">
            <p class="icp-info">鄂ICP备2026025703号</p>
          </div>
        </div>
      </div>
    </footer>

    <ProfileCard
      :visible="showProfileCard"
      :settings="settings"
      :socialLinks="socialLinks"
      :posts="posts"
      :categories="categories"
      :tags="tags"
      @close="showProfileCard = false"
      @copy="showToast"
    />
    <ToastMessage message="已复制到剪贴板" :trigger="toastTrigger" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'
import { postsApi } from '../api/index.js'
import {
  Info,
  Link2,
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
  MessageCircle,
  Globe,
  Rss,
  MessageSquare,
  ArrowLeft,
  Eye,
  Mail,
  Twitter,
  Video,
  Camera,
  Music,
  Linkedin,
  BookOpen,
  Heart,
  Coffee,
  ExternalLink,
  Share2,
  Send,
  Phone,
  MapPin,
  Zap,
  Star,
  Lightbulb,
  Rocket,
  Shield,
  Terminal,
  Database,
  Cloud,
  Settings,
  Home,
  User,
  Users,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  Award
} from 'lucide-vue-next'
import ToastMessage from './ToastMessage.vue'
import AnnouncementCard from './AnnouncementCard.vue'
import HitokotoCard from './HitokotoCard.vue'
import TagsCard from './TagsCard.vue'
import ProfileCard from './ProfileCard.vue'
import VisitsChart from './VisitsChart.vue'
import ToolsCard from './ToolsCard.vue'
import ResourcesCard from './ResourcesCard.vue'
import { toolsData } from '../data/tools.js'
import { resourcesData } from '../data/resources.js'
import { parseDate } from '../utils/date.js'
import { toolsApi, resourcesApi, announcementsApi } from '../api/index.js'

const router = useRouter()
const route = useRoute()

const props = defineProps({
  settings: Object,
  socialLinks: Array,
  categories: Array,
  posts: Array,
  tags: Array,
  bgImage: String
})

const defaultAvatar = '/src/assets/avatar.jpg'
const leftSidebarRef = ref(null)
const sidebarInnerRef = ref(null)
const mainLayoutRef = ref(null)

const selectedPost = ref(null)
const postContent = ref({})
const isLoadingPost = ref(false)
const backTarget = ref('/articles')
const showProfileCard = ref(false)

// 公告数据
const announcements = ref([])

const fetchAnnouncements = async () => {
  try {
    const { data } = await announcementsApi.getAll({ status: 'published' })
    announcements.value = data
  } catch (err) {
    console.error('加载公告失败:', err)
  }
}

const tools = ref([])

const resources = ref([])

const fetchTools = async () => {
  try {
    const { data } = await toolsApi.getAll({ status: 'published' })
    tools.value = data.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      icon: t.icon,
      link: t.url
    }))
  } catch (err) {
    console.error('加载工具失败:', err)
  }
}

const fetchResources = async () => {
  try {
    const { data } = await resourcesApi.getAll({ status: 'published', limit: 100 })
    resources.value = data.resources.map(r => ({
      id: r.id,
      name: r.title,
      description: r.description,
      tag: r.tag,
      link: r.url
    }))
  } catch (err) {
    console.error('加载资源失败:', err)
  }
}

const renderedContent = computed(() => {
  if (!postContent.value.content) return ''
  return marked(postContent.value.content)
})

const totalViews = computed(() => {
  return props.posts.reduce((sum, post) => sum + (post.view_count || 0), 0)
})

const runningTime = ref('')

const updateRunningTime = () => {
  const startDate = new Date('2026-05-16T12:00:00')
  const now = new Date()
  const diff = now - startDate
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  runningTime.value = `${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`
}

let runningTimer = null
onMounted(() => {
  updateRunningTime()
  runningTimer = setInterval(updateRunningTime, 1000)
  fetchTools()
  fetchResources()
  fetchAnnouncements()
})
onUnmounted(() => {
  if (runningTimer) clearInterval(runningTimer)
})

const lastUpdate = computed(() => {
  if (props.posts.length === 0) return '-'
  const latest = props.posts[0]
  const date = parseDate(latest.updated_at || latest.created_at)
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

const iconNameMap = {
  Code2, Server, Palette, Smartphone, BarChart3, Box, Wrench,
  Sun, PenLine, FileText, Globe, BookOpen, Coffee, Heart,
  Camera, Music, Video, MessageCircle, Zap, Star, Lightbulb,
  Rocket, Shield, Terminal, Database, Cloud, Settings, Home,
  User, Users, Briefcase, ShoppingBag, TrendingUp, Award
}

const getCategoryIcon = (category) => {
  if (category.icon && iconNameMap[category.icon]) {
    return iconNameMap[category.icon]
  }
  return categoryIcons[category.name] || FileText
}

// 哔哩哔哩 SVG 图标组件
const BilibiliIcon = {
  name: 'BilibiliIcon',
  props: ['size'],
  render() {
    const size = this.size || 22
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 512 512',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M488.6 104.1C505.3 122.2 513 143.8 511.9 169.8V372.2C511.5 398.6 502.7 420.3 485.4 437.3C468.2 454.3 446.3 463.2 419.9 464H92.02C65.57 463.2 43.81 454.2 26.74 436.8C9.682 419.4 .7667 396.5 0 368.2V169.8C.7667 143.8 9.682 122.2 26.74 104.1C43.81 87.75 65.57 78.77 92.02 78H121.4L96.05 52.19C90.3 46.46 87.42 39.19 87.42 30.4C87.42 21.6 90.3 14.34 96.05 8.603C101.8 2.868 109.1 0 117.9 0C126.7 0 134 2.868 139.8 8.603L213.1 78H301.1L375.6 8.603C381.7 2.868 389.2 0 398 0C406.8 0 414.1 2.868 419.9 8.603C425.6 14.34 428.5 21.6 428.5 30.4C428.5 39.19 425.6 46.46 419.9 52.19L394.6 78L423.9 78C450.3 78.77 471.9 87.75 488.6 104.1H488.6zM449.8 173.8C449.4 164.2 446.1 156.4 439.1 150.3C433.9 144.2 425.1 140.9 416.4 140.5H96.05C86.46 140.9 78.6 144.2 72.47 150.3C66.33 156.4 63.07 164.2 62.69 173.8V368.2C62.69 377.4 65.95 385.2 72.47 391.7C78.99 398.2 86.85 401.5 96.05 401.5H416.4C425.6 401.5 433.4 398.2 439.7 391.7C446 385.2 449.4 377.4 449.8 368.2L449.8 173.8zM185.5 216.5C191.8 222.8 195.2 230.6 195.6 239.7V273C195.2 282.2 191.9 289.9 185.8 296.2C179.6 302.5 171.8 305.7 162.2 305.7C152.6 305.7 144.7 302.5 138.6 296.2C132.5 289.9 129.2 282.2 128.8 273V239.7C129.2 230.6 132.6 222.8 138.9 216.5C145.2 210.2 152.1 206.9 162.2 206.5C171.4 206.9 179.2 210.2 185.5 216.5H185.5zM377 216.5C383.3 222.8 386.7 230.6 387.1 239.7V273C386.7 282.2 383.4 289.9 377.3 296.2C371.2 302.5 363.3 305.7 353.7 305.7C344.1 305.7 336.3 302.5 330.1 296.2C323.1 289.9 320.7 282.2 320.4 273V239.7C320.7 230.6 324.1 222.8 330.4 216.5C336.7 210.2 344.5 206.9 353.7 206.5C362.9 206.9 370.7 210.2 377 216.5H377z'
      })
    ])
  }
}

const socialIconMap = {
  'GitHub': Github,
  'github': Github,
  '微信': MessageCircle,
  'WeChat': MessageCircle,
  'Website': Globe,
  'website': Globe,
  '网站': Globe,
  'RSS': Rss,
  'rss': Rss,
  'Discord': MessageSquare,
  'discord': MessageSquare,
  '哔哩哔哩': BilibiliIcon,
  'bilibili': BilibiliIcon,
  'Bilibili': BilibiliIcon,
  'B站': BilibiliIcon,
  '社媒': Globe,
  '社交媒体': Globe,
  'Social': Globe,
  'social': Globe,
  '邮箱': Mail,
  'Email': Mail,
  'email': Mail,
  'Twitter': Twitter,
  'twitter': Twitter,
  'X': Twitter,
  'YouTube': Video,
  'youtube': Video,
  '视频': Video,
  'Instagram': Camera,
  'instagram': Camera,
  '摄影': Camera,
  '音乐': Music,
  'Music': Music,
  '网易云': Music,
  'LinkedIn': Linkedin,
  'linkedin': Linkedin,
  '博客': BookOpen,
  'Blog': BookOpen,
  'blog': BookOpen,
  '赞助': Heart,
  'Sponsor': Heart,
  'Telegram': Send,
  'telegram': Send,
  '电话': Phone,
  'Phone': Phone,
  '地址': MapPin,
  'Address': MapPin,
}

const iconComponentMap = {
  Globe, Github, MessageCircle, MessageSquare, Rss, Mail,
  Twitter, Video, Camera, Music, Linkedin, BookOpen,
  Heart, Coffee, ExternalLink, Link2, Share2, Send, Phone, MapPin
}

const getSocialIcon = (link) => {
  if (link.icon && iconComponentMap[link.icon]) {
    return iconComponentMap[link.icon]
  }
  return socialIconMap[link.platform] || Globe
}

const toastTrigger = ref(0)

const showToast = () => {
  toastTrigger.value++
}

const isWebUrl = (url) => {
  return /^https?:\/\//i.test(url)
}

const getCopyText = (url) => {
  return url.replace(/^mailto:/i, '')
}

const handleSocialClick = async (link) => {
  if (isWebUrl(link.url)) {
    window.open(link.url, '_blank', 'noopener,noreferrer')
    return
  }
  const copyText = getCopyText(link.url)
  try {
    await navigator.clipboard.writeText(copyText)
    showToast()
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = copyText
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast()
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const viewPost = async (post, fromPath = '/articles') => {
  if (post.post_type === 'external' && post.external_url) {
    window.open(post.external_url, '_blank')
    return
  }
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

let rafId = null
let resizeRafId = null
let cachedSidebarHeight = 0
let cachedRightHeight = 0
let cachedLayoutTop = 0
let cachedMaxTranslate = 0
let lastScrollRecorded = 0

const updateLayoutCache = () => {
  if (!leftSidebarRef.value || !sidebarInnerRef.value || !mainLayoutRef.value) return

  const sidebarInner = sidebarInnerRef.value
  const layout = mainLayoutRef.value
  const rightContent = layout.querySelector('.right-content')

  cachedSidebarHeight = sidebarInner.offsetHeight
  cachedRightHeight = rightContent ? rightContent.offsetHeight : 0
  cachedLayoutTop = layout.offsetTop
  cachedMaxTranslate = Math.max(0, cachedRightHeight - cachedSidebarHeight)
}

const applySidebarTransform = () => {
  if (!sidebarInnerRef.value) return

  const sidebarInner = sidebarInnerRef.value
  const navHeight = 100

  if (cachedMaxTranslate <= 0) {
    sidebarInner.style.transform = 'translateY(0)'
    return
  }

  const scrollTop = window.scrollY
  const now = performance.now()

  if (scrollTop > cachedLayoutTop - navHeight) {
    const scrollProgress = (scrollTop - cachedLayoutTop + navHeight) / (cachedRightHeight - window.innerHeight + navHeight + 100)
    const clampedProgress = Math.max(0, Math.min(1, scrollProgress))
    const translateY = Math.round(clampedProgress * cachedMaxTranslate)
    sidebarInner.style.transform = `translateY(${translateY}px)`
  } else {
    sidebarInner.style.transform = 'translateY(0)'
  }

  lastScrollRecorded = now
}

const handleScroll = () => {
  if (rafId !== null) return

  rafId = requestAnimationFrame(() => {
    rafId = null
    const now = performance.now()
    if (now - lastScrollRecorded < 16) return
    applySidebarTransform()
  })
}

const handleResize = () => {
  if (resizeRafId !== null) return

  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = null
    updateLayoutCache()
    applySidebarTransform()
  })
}

onMounted(() => {
  updateLayoutCache()
  applySidebarTransform()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (resizeRafId !== null) {
    cancelAnimationFrame(resizeRafId)
    resizeRafId = null
  }
})

watch([() => props.posts, () => props.categories, () => props.tags], () => {
  nextTick(() => {
    updateLayoutCache()
    applySidebarTransform()
  })
}, { deep: true })

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
  transform: translateY(0) translateZ(0);
  backface-visibility: hidden;
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
  grid-auto-rows: 280px;
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
  height: 100%;
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
  max-height: 100%;
}

.post-featured .post-image {
  width: 60%;
  height: 100%;
  flex-shrink: 0;
}

.post-featured .post-content {
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.post-featured .post-title {
  font-size: 22px;
}

.post-featured .post-excerpt {
  font-size: 14px;
  -webkit-line-clamp: 4;
  line-clamp: 4;
}

.post-image {
  height: 140px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
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

.post-badge.external-badge {
  left: auto;
  right: 12px;
  background: rgba(59, 130, 246, 0.9);
  color: #ffffff;
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
  line-clamp: 2;
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
  line-clamp: 2;
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
  padding: 0 24px 32px;
}

.footer-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 48px;
  padding: 48px 48px 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-brand {
  max-width: 280px;
}

.footer-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-desc {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 20px 0;
}

.footer-social {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  transition: all 0.25s var(--ease-smooth);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.footer-links {
  display: flex;
  gap: 64px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-col-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.footer-link {
  font-size: 14px;
  color: var(--text-muted);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.25s var(--ease-smooth);
  padding: 2px 0;
}

.footer-link:hover {
  color: var(--text-primary);
  transform: translateX(4px);
}

.footer-link-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 48px;
}

.footer-bottom-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.copyright {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.credit {
  font-size: 12px;
  color: var(--text-subtle);
  margin: 0;
}

.footer-bottom-right {
  display: flex;
  align-items: center;
}

.icp-info {
  font-size: 12px;
  color: var(--text-subtle);
  margin: 0;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  letter-spacing: 0.3px;
}

.hitokoto-section {
  max-width: 700px;
  margin: 0 auto;
  padding: 48px 24px 32px;
  text-align: center;
}

/* ===== Responsive ===== */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 280px 1fr;
    gap: 24px;
  }

  .posts-masonry {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 260px;
  }

  .post-featured {
    grid-column: span 2;
    grid-row: span 1;
    flex-direction: column;
    max-height: none;
  }

  .post-featured .post-image,
  .post-featured .post-content {
    width: 100%;
  }

  .post-featured .post-image {
    height: 180px;
    flex-shrink: 0;
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
    grid-auto-rows: auto;
  }

  .post-featured {
    grid-column: span 1;
    max-height: none;
  }

  .post-card {
    height: auto;
  }

  .post-image {
    height: 160px;
  }

  .post-featured .post-image {
    height: 200px;
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

  .footer-main {
    flex-direction: column;
    gap: 32px;
    padding: 32px 28px 28px;
  }

  .footer-brand {
    max-width: 100%;
  }

  .footer-links {
    gap: 32px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 20px 28px;
  }

  .footer-bottom-left {
    align-items: center;
  }

  .hitokoto-section {
    padding: 32px 16px 24px;
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
