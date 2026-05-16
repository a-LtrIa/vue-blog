<template>
  <div class="tags-card">
    <div class="card-header">
      <h3 class="card-title">
        <Tag class="title-icon" :size="16" />
        热门标签
      </h3>
      <button class="view-more-link" @click="showAllTags">
        查看更多
      </button>
    </div>
    <div class="tag-cloud">
      <span
        v-for="(tag, index) in topTags"
        :key="tag.id"
        class="tag-item"
        :class="`tag-size-${(index % 3) + 1}`"
        @click="goToTag(tag)"
      >
        {{ tag.name }}
      </span>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
        <Transition name="modal-content">
          <div v-if="isModalOpen" class="modal-container" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">全部标签</h3>
              <button class="modal-close" @click="closeModal">
                <X :size="18" />
              </button>
            </div>
            <div class="modal-body">
              <div class="tag-grid">
                <span
                  v-for="(tag, index) in sortedTags"
                  :key="tag.id"
                  class="modal-tag-item"
                  :style="{ animationDelay: `${index * 40}ms` }"
                  @click="goToTag(tag)"
                >
                  <span class="modal-tag-name">{{ tag.name }}</span>
                  <span class="modal-tag-count" v-if="tag.post_count">{{ tag.post_count }} 篇</span>
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Tag, X } from 'lucide-vue-next'

const router = useRouter()

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  }
})

const isModalOpen = ref(false)

const sortedTags = computed(() => {
  return [...props.tags].sort((a, b) => (b.post_count || 0) - (a.post_count || 0))
})

const topTags = computed(() => {
  return sortedTags.value.slice(0, 9)
})

const showAllTags = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const goToTag = (tag) => {
  closeModal()
  router.push(`/articles?tag=${encodeURIComponent(tag.name)}`)
}
</script>

<style scoped>
.tags-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.tags-card:hover {
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 100px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.tag-size-1 { font-size: 11px; }
.tag-size-2 { font-size: 13px; background: rgba(255, 255, 255, 0.08); }
.tag-size-3 { font-size: 12px; }

/* ===== 弹窗 ===== */
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

.modal-close {
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

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.modal-tag-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 100px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.3s ease;
}

.modal-tag-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.modal-tag-name {
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.modal-tag-item:hover .modal-tag-name {
  color: var(--text-primary);
}

.modal-tag-count {
  font-size: 11px;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 100px;
}

/* ===== 动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
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
    padding: 16px;
  }
}
</style>
