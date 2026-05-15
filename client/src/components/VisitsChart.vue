<template>
  <div class="visits-card">
    <div class="card-header">
      <h3 class="card-title">
        <TrendingUp class="title-icon" :size="16" />
        访问统计
      </h3>
      <span class="header-total">{{ totalVisits.toLocaleString() }}</span>
    </div>

    <div class="chart-container" v-if="dailyData.length">
      <svg
        class="chart-svg"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(200, 200, 210, 0.3)" />
            <stop offset="100%" stop-color="rgba(200, 200, 210, 0.02)" />
          </linearGradient>
        </defs>

        <!-- 横向网格线 -->
        <line
          v-for="(y, i) in gridYLines"
          :key="'h' + i"
          :x1="paddingLeft"
          :y1="y"
          :x2="svgWidth - paddingRight"
          :y2="y"
          stroke="rgba(255, 255, 255, 0.06)"
          stroke-width="1"
        />

        <!-- 纵向网格线 -->
        <line
          v-for="(point, i) in dataPoints"
          :key="'v' + i"
          :x1="point.x"
          :y1="paddingTop"
          :x2="point.x"
          :y2="svgHeight - paddingBottom"
          stroke="rgba(255, 255, 255, 0.06)"
          stroke-width="1"
        />

        <!-- Y轴标签 -->
        <text
          v-for="(label, i) in yAxisLabels"
          :key="'yl' + i"
          :x="paddingLeft - 6"
          :y="label.y + 4"
          text-anchor="end"
          fill="rgba(255, 255, 255, 0.35)"
          font-size="10"
        >{{ label.text }}</text>

        <!-- X轴标签 -->
        <text
          v-for="(d, i) in dailyData"
          :key="'xl' + i"
          :x="dataPoints[i].x"
          :y="svgHeight - 4"
          text-anchor="middle"
          fill="rgba(255, 255, 255, 0.35)"
          font-size="10"
        >{{ formatLabel(d.date) }}</text>

        <polygon
          v-if="areaPoints"
          :points="areaPoints"
          fill="url(#lineGradient)"
        />

        <polyline
          :points="linePoints"
          fill="none"
          stroke="rgba(200, 200, 210, 0.7)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <circle
          v-for="(point, i) in dataPoints"
          :key="i"
          :cx="point.x"
          :cy="point.y"
          r="3.5"
          fill="rgba(200, 200, 210, 0.9)"
          stroke="rgba(255, 255, 255, 0.3)"
          stroke-width="1.5"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { parseDate } from '../utils/date.js'
import { ref, computed, onMounted } from 'vue'
import { TrendingUp } from 'lucide-vue-next'
import { visitsApi } from '../api/index.js'

const dailyData = ref([])
const totalVisits = ref(0)

const svgWidth = 280
const svgHeight = 130
const paddingLeft = 30
const paddingRight = 8
const paddingTop = 8
const paddingBottom = 20

const chartMaxVal = computed(() => {
  if (!dailyData.value.length) return 1
  const max = Math.max(...dailyData.value.map(d => d.count), 1)
  const ceil = Math.ceil(max / 5) * 5
  return ceil || max || 1
})

const gridYLines = computed(() => {
  const lines = []
  const chartH = svgHeight - paddingTop - paddingBottom
  for (let i = 0; i <= 3; i++) {
    lines.push(paddingTop + (chartH / 3) * i)
  }
  return lines
})

const yAxisLabels = computed(() => {
  const max = chartMaxVal.value
  const chartH = svgHeight - paddingTop - paddingBottom
  return [
    { text: max, y: paddingTop },
    { text: Math.round(max * 2 / 3), y: paddingTop + chartH / 3 },
    { text: Math.round(max / 3), y: paddingTop + (chartH / 3) * 2 },
    { text: '0', y: svgHeight - paddingBottom }
  ]
})

const dataPoints = computed(() => {
  if (!dailyData.value.length) return []
  const maxVal = chartMaxVal.value
  const chartW = svgWidth - paddingLeft - paddingRight
  const chartH = svgHeight - paddingTop - paddingBottom
  const stepX = chartW / (dailyData.value.length - 1 || 1)

  return dailyData.value.map((d, i) => ({
    x: paddingLeft + i * stepX,
    y: svgHeight - paddingBottom - (d.count / maxVal) * chartH
  }))
})

const linePoints = computed(() => {
  return dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

const areaPoints = computed(() => {
  if (!dataPoints.value.length) return ''
  const pts = dataPoints.value.map(p => `${p.x},${p.y}`).join(' ')
  const last = dataPoints.value[dataPoints.value.length - 1]
  const first = dataPoints.value[0]
  const bottomY = svgHeight - paddingBottom
  return `${first.x},${bottomY} ${pts} ${last.x},${bottomY}`
})

const formatLabel = (dateStr) => {
  const d = parseDate(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

onMounted(async () => {
  try {
    await visitsApi.record()
    const res = await visitsApi.getStats()
    dailyData.value = res.data.daily
    totalVisits.value = res.data.total
  } catch (error) {
    console.error('加载访问统计失败', error)
  }
})
</script>

<style scoped>
.visits-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.visits-card:hover {
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

.header-total {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.chart-container {
  position: relative;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
