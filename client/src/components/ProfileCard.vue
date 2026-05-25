<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="visible" class="modal-overlay" @click="close">
        <Transition name="modal-content">
          <div v-if="visible" class="profile-card" @click.stop>
            <button class="close-btn" @click="close">
              <X :size="18" />
            </button>

            <div class="card-bg-decoration"></div>

            <div class="card-body">
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <img
                    :src="settings.avatar_url || defaultAvatar"
                    alt="头像"
                    class="avatar"
                    @error="handleAvatarError"
                  />
                  <div class="avatar-glow"></div>
                </div>
                <h2 class="name">{{ settings.author_name || '作者' }}</h2>
                <span class="role">博主 / 开发者</span>
              </div>

              <p class="bio">梦想是成为独立开发者…</p>

              <div class="divider"></div>

              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-num">{{ posts.length }}</span>
                  <span class="stat-label">文章</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-num">{{ categories.length }}</span>
                  <span class="stat-label">分类</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-num">{{ tags.length }}</span>
                  <span class="stat-label">标签</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-num">{{ totalViews }}</span>
                  <span class="stat-label">浏览</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="social-section" v-if="socialLinks.length">
                <a
                  v-for="link in socialLinks"
                  :key="link.id"
                  :href="isWebUrl(link.url) ? link.url : undefined"
                  :target="isWebUrl(link.url) ? '_blank' : undefined"
                  :rel="isWebUrl(link.url) ? 'noopener noreferrer' : undefined"
                  class="social-link"
                  :title="link.platform"
                  @click.prevent="handleSocialClick(link)"
                >
                  <component :is="getSocialIcon(link)" :size="18" />
                  <span class="social-name">{{ link.platform }}</span>
                </a>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, h } from 'vue'
import {
  X, Github, MessageCircle, Globe, Rss, MessageSquare,
  Mail, Twitter, Video, Camera, Music, Linkedin, BookOpen,
  Heart, Coffee, ExternalLink, Link2, Share2, Send, Phone, MapPin
} from 'lucide-vue-next'
import defaultAvatar from '../assets/avatar.png'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    default: () => ({})
  },
  socialLinks: {
    type: Array,
    default: () => []
  },
  posts: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'copy'])

const totalViews = computed(() => {
  return props.posts.reduce((sum, post) => sum + (post.view_count || 0), 0)
})

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
    emit('copy')
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = copyText
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    emit('copy')
  }
}

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
  'QQ': MessageCircle,
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
  'Address': MapPin
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

const handleAvatarError = (e) => {
  e.target.src = defaultAvatar
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.profile-card {
  position: relative;
  width: 380px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(60px) saturate(180%);
  -webkit-backdrop-filter: blur(60px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  overflow: hidden;
}

.card-bg-decoration {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(120, 119, 198, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.card-body {
  position: relative;
  padding: 40px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  position: relative;
  width: 88px;
  height: 88px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.avatar-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(120, 119, 198, 0.3) 0%, transparent 70%);
  z-index: 0;
}

.name {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.role {
  font-size: 13px;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.bio {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 20px 0 0;
  max-width: 280px;
}

.divider {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 24px 0;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.stat-num {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
}

.social-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.social-name {
  font-size: 13px;
}

/* ===== 动画 ===== */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content-leave-active {
  transition: all 0.25s ease;
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
