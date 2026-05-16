<template>
  <div class="announcement-card">
    <div class="card-header">
      <h3 class="card-title">
        <Megaphone class="title-icon" :size="16" />
        网站公告
      </h3>
      <button class="view-more-link" @click="showAllAnnouncements">
        查看更多
      </button>
    </div>
    <div class="announcement-list">
      <div
        v-for="(announcement, index) in latestAnnouncements"
        :key="announcement.id"
        class="announcement-item"
        :style="{ animationDelay: `${index * 80}ms` }"
        @click="openDetail(announcement)"
      >
        <span class="announcement-dot"></span>
        <span class="announcement-title">{{ announcement.title }}</span>
        <span class="announcement-date">{{ formatDate(announcement.created_at) }}</span>
        <div class="announcement-line"></div>
      </div>
    </div>
  </div>

  <!-- Announcement Modal -->
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <Transition name="modal-content">
          <div v-if="isModalOpen" class="modal-container" @click.stop>
            <!-- 列表视图 -->
            <template v-if="viewMode === 'list'">
              <div class="modal-header">
                <h3 class="modal-title">公告列表</h3>
                <button class="modal-close" @click="closeModal">
                  <X :size="18" />
                </button>
              </div>
              <div class="modal-body">
                <div class="announcement-detail-list">
                  <div
                    v-for="(announcement, index) in allAnnouncements"
                    :key="announcement.id"
                    class="announcement-detail-item"
                    :style="{ animationDelay: `${index * 60}ms` }"
                    @click="openDetail(announcement)"
                  >
                    <span class="announcement-detail-title">{{ announcement.title }}</span>
                    <span class="announcement-detail-date">{{ formatFullDate(announcement.created_at) }}</span>
                    <div class="announcement-detail-line"></div>
                  </div>
                </div>
              </div>
            </template>

            <!-- 详情视图 -->
            <template v-else>
              <div class="modal-header">
                <button class="modal-back" @click="backToList">
                  <ArrowLeft :size="18" />
                </button>
                <h3 class="modal-title">公告详情</h3>
                <button class="modal-close" @click="closeModal">
                  <X :size="18" />
                </button>
              </div>
              <div class="modal-body detail-body">
                <div class="detail-content">
                  <h4 class="detail-title">{{ currentAnnouncement?.title }}</h4>
                  <span class="detail-date">{{ formatFullDate(currentAnnouncement?.created_at) }}</span>
                  <p class="detail-text">{{ currentAnnouncement?.content }}</p>
                </div>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Megaphone, X, ArrowLeft } from 'lucide-vue-next'
import { parseDate } from '../utils/date.js'

const props = defineProps({
  announcements: {
    type: Array,
    default: () => []
  }
})

const isModalOpen = ref(false)
const viewMode = ref('list')
const currentAnnouncement = ref(null)

const latestAnnouncements = computed(() => {
  return props.announcements.slice(0, 5)
})

const allAnnouncements = computed(() => {
  return props.announcements
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = parseDate(dateString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const formatFullDate = (dateString) => {
  if (!dateString) return ''
  const date = parseDate(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const showAllAnnouncements = () => {
  viewMode.value = 'list'
  isModalOpen.value = true
}

const openDetail = (announcement) => {
  currentAnnouncement.value = announcement
  viewMode.value = 'detail'
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  viewMode.value = 'list'
  currentAnnouncement.value = null
}

const backToList = () => {
  viewMode.value = 'list'
  currentAnnouncement.value = null
}
</script>

<style scoped>
.announcement-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.announcement-card:hover {
  background: var(--bg-hover);
  border-color: var(--border-hover);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.title-icon {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.view-more-link {
  font-size: 13px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.view-more-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.announcement-list {
  display: flex;
  flex-direction: column;
}

.announcement-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: padding 0.3s ease;
}

.announcement-item:hover {
  padding-left: 4px;
}

.announcement-item:hover .announcement-line {
  width: 100%;
  opacity: 1;
}

.announcement-item:hover .announcement-title {
  color: var(--text-primary);
}

.announcement-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.announcement-title {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.announcement-date {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.announcement-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--border-color);
  opacity: 0;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
}

/* ===== 弹窗 - 浅色高模糊 ===== */
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

.modal-container {
  width: 440px;
  height: 480px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(60px) saturate(180%);
  -webkit-backdrop-filter: blur(60px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close,
.modal-back {
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
}

.modal-close:hover,
.modal-back:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
}

.modal-back:hover {
  transform: translateX(-2px);
}

.modal-close:hover {
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.announcement-detail-list {
  display: flex;
  flex-direction: column;
}

.announcement-detail-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 0;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: padding 0.3s ease;
}

.announcement-detail-item:hover {
  padding-left: 4px;
}

.announcement-detail-item:hover .announcement-detail-line {
  width: 100%;
  opacity: 1;
}

.announcement-detail-item:hover .announcement-detail-title {
  color: var(--text-primary);
}

.announcement-detail-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.announcement-detail-date {
  font-size: 12px;
  color: var(--text-muted);
}

.announcement-detail-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease;
}

/* ===== 详情页 ===== */
.detail-body {
  padding: 24px 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.5;
  margin: 0;
}

.detail-date {
  font-size: 13px;
  color: var(--text-muted);
}

.detail-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 8px 0 0 0;
  white-space: pre-wrap;
}

/* ===== 动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(10px);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .modal-container {
    width: calc(100vw - 32px);
    height: 60vh;
    margin: 16px;
  }

  .modal-header {
    padding: 14px 16px;
  }

  .modal-body {
    padding: 12px 16px;
  }

  .detail-body {
    padding: 20px 16px;
  }
}
</style>
