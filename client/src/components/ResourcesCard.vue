<template>
  <section class="content-section resources-area">
    <div class="section-header">
      <h3 class="section-title">
        <span class="title-dot"></span>
        资源分享
      </h3>
      <router-link to="/resources" class="view-all">查看全部 →</router-link>
    </div>

    <div class="resources-grid">
      <a
        v-for="resource in resources"
        :key="resource.id"
        :href="resource.link"
        target="_blank"
        rel="noopener noreferrer"
        class="resource-card"
      >
        <div class="resource-top">
          <span class="resource-tag">{{ resource.tag }}</span>
          <ExternalLink :size="13" class="resource-ext" />
        </div>
        <h4 class="resource-name">{{ resource.name }}</h4>
        <p class="resource-desc">{{ resource.description }}</p>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ExternalLink } from 'lucide-vue-next'

defineProps({
  resources: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
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

.section-subtitle {
  font-size: 13px;
  color: var(--text-muted);
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

.resources-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.resource-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.resource-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: var(--text-secondary);
}

.resource-ext {
  color: var(--text-muted);
  opacity: 0;
  transition: all 0.3s ease;
}

.resource-card:hover .resource-ext {
  opacity: 1;
}

.resource-name {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.resource-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
