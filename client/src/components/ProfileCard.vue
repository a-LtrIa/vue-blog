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

              <p class="bio">{{ settings.author_bio || '热爱技术与设计，记录学习与生活' }}</p>

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
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="social-link"
                  :title="link.name"
                >
                  <component :is="getSocialIcon(link.name)" :size="18" />
                  <span class="social-name">{{ link.name }}</span>
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
import { computed } from 'vue'
import { X, Github, MessageCircle, Globe, Rss, MessageSquare } from 'lucide-vue-next'

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

const emit = defineEmits(['close'])

const defaultAvatar = '/src/assets/avatar.jpg'

const totalViews = computed(() => {
  return props.posts.reduce((sum, post) => sum + (post.view_count || 0), 0)
})

const socialIconMap = {
  'GitHub': Github,
  'github': Github,
  'QQ': MessageCircle,
  '微信': MessageSquare,
  'WeChat': MessageSquare,
  '网站': Globe,
  'Website': Globe,
  'RSS': Rss
}

const getSocialIcon = (name) => {
  return socialIconMap[name] || Globe
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
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
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