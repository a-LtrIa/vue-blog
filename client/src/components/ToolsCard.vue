<template>
  <section class="content-section tools-area">
    <div class="section-header">
      <h3 class="section-title">
        <span class="title-dot"></span>
        妙妙工具
      </h3>
      <router-link to="/tools" class="view-all">查看全部 →</router-link>
    </div>

    <div class="tools-grid">
      <a
        v-for="tool in tools"
        :key="tool.id"
        :href="tool.link"
        target="_blank"
        rel="noopener noreferrer"
        class="tool-card"
      >
        <div class="tool-icon-wrap">
          <component :is="getToolIcon(tool.icon)" :size="22" />
        </div>
        <div class="tool-info">
          <span class="tool-name">{{ tool.name }}</span>
          <span class="tool-desc">{{ tool.description }}</span>
        </div>
        <div class="tool-arrow">
          <ExternalLink :size="14" />
        </div>
      </a>
    </div>
  </section>
</template>

<script setup>
import { Wrench, Palette, Code2, Image, Type, Calculator, QrCode, FileJson } from 'lucide-vue-next'
import { ExternalLink } from 'lucide-vue-next'

defineProps({
  tools: {
    type: Array,
    default: () => []
  }
})

const iconMap = {
  'Wrench': Wrench,
  'Palette': Palette,
  'Code2': Code2,
  'Image': Image,
  'Type': Type,
  'Calculator': Calculator,
  'QrCode': QrCode,
  'FileJson': FileJson
}

const getToolIcon = (name) => {
  return iconMap[name] || Wrench
}
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.tool-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.tool-icon-wrap {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-icon-wrap {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.tool-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.tool-desc {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-arrow {
  color: var(--text-primary);
  transform: translateX(2px);
}
</style>
