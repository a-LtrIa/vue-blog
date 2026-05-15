<template>
  <div class="resources-repo">
    <div class="repo-container">
      <header class="repo-header">
        <button class="back-home-btn" @click="$router.push('/')">
          <ArrowLeft :size="18" />
          <span>返回主页</span>
        </button>
        <div class="repo-title-area">
          <h1 class="repo-title">资源分享</h1>
          <p class="repo-subtitle">好用的工具与资源推荐</p>
        </div>
      </header>

      <div class="resources-grid">
        <a
          v-for="(resource, index) in resources"
          :key="resource.id"
          :href="resource.link"
          target="_blank"
          rel="noopener noreferrer"
          class="resource-card"
          :class="{ 'animate-in': isAnimated }"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <div class="resource-top">
            <span class="resource-tag">{{ resource.tag }}</span>
            <ExternalLink :size="14" class="resource-ext" />
          </div>
          <h3 class="resource-name">{{ resource.name }}</h3>
          <p class="resource-desc">{{ resource.description }}</p>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, ExternalLink } from 'lucide-vue-next'
import { resourcesApi } from '../api/index.js'

const resources = ref([])
const isAnimated = ref(false)

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

onMounted(() => {
  fetchResources()
  setTimeout(() => {
    isAnimated.value = true
  }, 100)
})
</script>

<style scoped>
.resources-repo {
  min-height: 100vh;
  color: #ffffff;
  padding-top: 120px;
  padding-bottom: 60px;
}

.repo-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.repo-header {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 40px;
}

.back-home-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: 4px;
}

.back-home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.repo-title-area {
  flex: 1;
}

.repo-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.repo-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 6px 0 0 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.3s ease;
  opacity: 0;
}

.resource-card.animate-in {
  animation: slideInUp 0.5s ease forwards;
}

.resource-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.resource-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.resource-ext {
  color: rgba(255, 255, 255, 0.3);
  opacity: 0;
  transition: all 0.3s ease;
}

.resource-card:hover .resource-ext {
  opacity: 1;
}

.resource-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.resource-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  line-height: 1.6;
}
</style>
