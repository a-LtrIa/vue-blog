<template>
  <div class="tools-repo">
    <div class="repo-container">
      <header class="repo-header">
        <button class="back-home-btn" @click="$router.push('/')">
          <ArrowLeft :size="18" />
          <span>返回主页</span>
        </button>
        <div class="repo-title-area">
          <h1 class="repo-title">妙妙工具</h1>
          <p class="repo-subtitle">我做的实用小工具合集</p>
        </div>
      </header>

      <div class="tools-grid">
        <a
          v-for="(tool, index) in tools"
          :key="tool.id"
          :href="tool.link"
          target="_blank"
          rel="noopener noreferrer"
          class="tool-card"
          :class="{ 'animate-in': isAnimated }"
          :style="{ animationDelay: `${index * 0.06}s` }"
        >
          <div class="tool-icon-wrap">
            <component :is="getToolIcon(tool.icon)" :size="28" />
          </div>
          <div class="tool-info">
            <span class="tool-name">{{ tool.name }}</span>
            <span class="tool-desc">{{ tool.description }}</span>
          </div>
          <div class="tool-arrow">
            <ExternalLink :size="16" />
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, ExternalLink, Wrench, Palette, Code2, Image, Type, Calculator, QrCode, FileJson } from 'lucide-vue-next'
import { toolsApi } from '../api/index.js'

const tools = ref([])
const isAnimated = ref(false)

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

onMounted(() => {
  fetchTools()
  setTimeout(() => {
    isAnimated.value = true
  }, 100)
})
</script>

<style scoped>
.tools-repo {
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

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.3s ease;
  opacity: 0;
}

.tool-card.animate-in {
  animation: slideInUp 0.5s ease forwards;
}

.tool-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-3px);
}

.tool-icon-wrap {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-icon-wrap {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.tool-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tool-name {
  font-size: 17px;
  font-weight: 600;
}

.tool-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}

.tool-arrow {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-arrow {
  color: rgba(255, 255, 255, 0.7);
  transform: translateX(3px);
}
</style>
