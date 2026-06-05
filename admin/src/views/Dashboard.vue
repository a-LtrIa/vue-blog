<template>
  <div>
    <div class="page-header">
      <h1>仪表盘</h1>
      <router-link to="/posts/new" class="btn btn-primary">写文章</router-link>
    </div>

    <!-- 核心统计数据 -->
    <div class="stats-grid">
      <div class="stat-card">
        <h4>文章总数</h4>
        <div class="value">{{ stats.posts }}</div>
      </div>
      <div class="stat-card">
        <h4>已发布</h4>
        <div class="value stat-success">{{ stats.published }}</div>
      </div>
      <div class="stat-card">
        <h4>草稿</h4>
        <div class="value stat-warning">{{ stats.drafts }}</div>
      </div>
      <div class="stat-card">
        <h4>分类数</h4>
        <div class="value stat-primary">{{ stats.categories }}</div>
      </div>
      <div class="stat-card">
        <h4>总访问量</h4>
        <div class="value">{{ visitStats.total.toLocaleString() }}</div>
      </div>
      <div class="stat-card">
        <h4>文章总阅读</h4>
        <div class="value">{{ postViews.totalViews.toLocaleString() }}</div>
      </div>
    </div>

    <!-- 访客统计 -->
    <div class="card">
      <div class="card-header">
        <h3>📊 访客统计（近7天）</h3>
      </div>
      <div class="visits-chart">
        <div class="chart-bars">
          <div
            v-for="day in visitStats.daily"
            :key="day.date"
            class="chart-bar-group"
          >
            <div class="chart-bar-wrapper">
              <div
                class="chart-bar"
                :style="{ height: getBarHeight(day.count) + '%' }"
              ></div>
            </div>
            <div class="chart-label">{{ formatDayLabel(day.date) }}</div>
            <div class="chart-value">{{ day.count }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章阅读排行 & 小工具统计 -->
    <div class="dashboard-columns">
      <div class="card">
        <div class="card-header">
          <h3>🔥 文章阅读排行</h3>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>排名</th>
              <th>标题</th>
              <th>状态</th>
              <th>阅读量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(post, index) in postViews.topPosts" :key="post.id">
              <td>{{ index + 1 }}</td>
              <td class="title-cell">{{ post.title }}</td>
              <td>
                <span :class="['badge', post.status === 'published' ? 'badge-success' : 'badge-warning']">
                  {{ post.status === 'published' ? '已发布' : '草稿' }}
                </span>
              </td>
              <td>{{ post.view_count }}</td>
            </tr>
            <tr v-if="postViews.topPosts.length === 0">
              <td colspan="4" style="text-align: center;">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>🛠️ 小工具统计</h3>
        </div>
        <div class="tool-stats">
          <div class="tool-stat-overview">
            <div class="tool-stat-item">
              <span class="tool-stat-label">工具总数</span>
              <span class="tool-stat-number">{{ toolStats.totalTools }}</span>
            </div>
            <div class="tool-stat-item">
              <span class="tool-stat-label">已发布</span>
              <span class="tool-stat-number stat-success">{{ toolStats.publishedTools }}</span>
            </div>
          </div>
          <div class="tool-categories" v-if="toolStats.categoryStats.length > 0">
            <h4 class="tool-subtitle">分类分布</h4>
            <div class="category-tags">
              <span
                v-for="cat in toolStats.categoryStats"
                :key="cat.category"
                class="category-tag"
              >
                {{ cat.category }}
                <em>{{ cat.count }}</em>
              </span>
            </div>
          </div>
          <div v-else style="text-align: center; color: var(--color-ink-muted-48); padding: var(--spacing-lg);">
            暂无小工具数据
          </div>
        </div>
      </div>
    </div>

    <!-- 最新文章 -->
    <div class="card">
      <div class="card-header">
        <h3>📝 最新文章</h3>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>浏览</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in recentPosts" :key="post.id">
            <td>{{ post.title }}</td>
            <td>{{ post.category_name || '未分类' }}</td>
            <td>
              <span :class="['badge', post.status === 'published' ? 'badge-success' : 'badge-warning']">
                {{ post.status === 'published' ? '已发布' : '草稿' }}
              </span>
            </td>
            <td>{{ post.view_count }}</td>
            <td>{{ formatDate(post.created_at) }}</td>
          </tr>
          <tr v-if="recentPosts.length === 0">
            <td colspan="5" style="text-align: center;">暂无文章</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { postsApi, categoriesApi, visitsApi, postsStatsApi, toolsStatsApi } from '../api/modules.js'
import { parseDate } from '../utils/date.js'

const stats = ref({
  posts: 0,
  published: 0,
  drafts: 0,
  categories: 0
})

const recentPosts = ref([])
const visitStats = ref({ daily: [], total: 0 })
const postViews = ref({ totalViews: 0, topPosts: [] })
const toolStats = ref({ totalTools: 0, publishedTools: 0, categoryStats: [] })
let maxDailyCount = 0

const formatDate = (dateStr) => {
  return parseDate(dateStr).toLocaleDateString('zh-CN')
}

const formatDayLabel = (dateStr) => {
  const d = parseDate(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const getBarHeight = (count) => {
  if (maxDailyCount === 0) return 0
  return Math.max((count / maxDailyCount) * 100, 2)
}

onMounted(async () => {
  try {
    const [postsRes, categoriesRes, visitsRes, postViewsRes, toolsRes] = await Promise.all([
      postsApi.getAll({ limit: 5 }),
      categoriesApi.getAll(),
      visitsApi.getStats(),
      postsStatsApi.get(),
      toolsStatsApi.get()
    ])

    recentPosts.value = postsRes.data.posts
    stats.value = {
      posts: postsRes.data.pagination.total,
      published: postViewsRes.data.publishedPosts,
      drafts: postViewsRes.data.draftPosts,
      categories: categoriesRes.data.length
    }

    visitStats.value = visitsRes.data
    postViews.value = postViewsRes.data
    toolStats.value = toolsRes.data

    // 计算最大日访客数用于柱状图比例
    if (visitsRes.data.daily.length > 0) {
      maxDailyCount = Math.max(...visitsRes.data.daily.map(d => d.count), 1)
    }
  } catch (err) {
    console.error('加载数据失败', err)
  }
})
</script>

<style scoped>
/* 柱状图 */
.visits-chart {
  padding: var(--spacing-md) 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-md);
  height: 160px;
  padding: 0 var(--spacing-sm);
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  height: 100%;
}

.chart-bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chart-bar {
  width: 60%;
  max-width: 40px;
  background: linear-gradient(180deg, var(--color-primary), var(--color-primary-focus));
  border-radius: var(--rounded-xs) var(--rounded-xs) 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
  opacity: 0.85;
}

.chart-bar:hover {
  opacity: 1;
}

.chart-label {
  font-size: var(--font-size-fine-print);
  color: var(--color-ink-muted-48);
}

.chart-value {
  font-size: var(--font-size-fine-print);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink-muted-80);
}

/* 双列布局 */
.dashboard-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 小工具统计 */
.tool-stats {
  padding: var(--spacing-sm) 0;
}

.tool-stat-overview {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.tool-stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs);
}

.tool-stat-label {
  font-size: var(--font-size-caption);
  color: var(--color-ink-muted-48);
}

.tool-stat-number {
  font-family: var(--font-display);
  font-size: var(--font-size-lead);
  font-weight: var(--font-weight-semibold);
  color: var(--color-ink);
}

.tool-subtitle {
  font-size: var(--font-size-caption);
  color: var(--color-ink-muted-48);
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-weight-semibold);
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.category-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xxs);
  padding: var(--spacing-xxs) var(--spacing-sm);
  background-color: var(--color-canvas-parchment);
  border: 1px solid var(--color-divider-soft);
  border-radius: var(--rounded-pill);
  font-size: var(--font-size-caption);
  color: var(--color-ink-muted-80);
}

.category-tag em {
  font-style: normal;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

/* 覆盖全局 stat-success 样式作用域 */
:deep(.stat-success) {
  color: #27ae60;
}
</style>
