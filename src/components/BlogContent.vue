<template>
  <div class="blog-container">
    <div
      class="blog-drag-wrapper"
      :style="{
        transform: `translateY(${dragOffset.value}px)`,
        transition: isAnimating.value 
          ? 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
          : (isDragging.value ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)')
      }"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @mousemove="onMouseMove"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
      @touchcancel.passive="onTouchEnd"
      @touchmove.passive="onTouchMove"
    >
      <!-- 两栏布局 -->
      <div class="layout-wrapper">
        <aside class="sidebar">
          <!-- 块 1：个人资料 -->
          <div class="sidebar-block profile-block">
            <div class="avatar" @click="triggerReturnAnimation">
              <img src="../assets/avatar.jpg" alt="头像" />
            </div>
            <h2>ALT</h2>
            <p class="bio">前端工程师 | 热爱开源与设计</p>
          </div>

          <!-- 块 2：社交链接 -->
          <div class="sidebar-block">
            <h3>🔗 社交</h3>
            <ul class="links">
              <li><a href="mailto:example@example.com">📧 邮箱</a></li>
              <li><a href="https://github.com/yourname" target="_blank">🐙 GitHub</a></li>
              <li><a href="https://twitter.com/yourname" target="_blank">🐦 Twitter</a></li>
            </ul>
          </div>

          <!-- 块 3：标签云（示例） -->
          <div class="sidebar-block">
            <h3>🏷️ 标签</h3>
            <div class="tag-cloud">
              <span v-for="tag in ['Vue', 'TypeScript', 'CSS', 'Vite', '性能优化']" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <!-- 块 4：关于博客 -->
          <div class="sidebar-block">
            <h3>📖 关于</h3>
            <p>这是我的技术博客，记录学习与思考。欢迎交流！</p>
          </div>
        </aside>

        <!-- 右侧主内容区 -->
        <main class="main-content">
          <header>
            <h1>✨ 欢迎来到我的博客</h1>
            <p>记录技术、生活与思考</p>
          </header>

          <div class="posts">
            <article class="post" v-for="post in posts" :key="post.id">
              <h2>{{ post.title }}</h2>
              <time class="date">{{ post.date }}</time>
              <p>{{ post.excerpt }}</p>
              <a href="#" class="read-more">阅读全文 →</a>
            </article>
          </div>

          <footer>
            <p>© 2025 ALT的博客 | Made with ❤️</p>
          </footer>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['pull-to-welcome'])

// 拖拽状态
const isDragging = ref(false)
const isAnimating = ref(false)
const startY = ref(0)
const dragOffset = ref(0)
const THRESHOLD = 20

let wheelTimeout = null
const WHEEL_THRESHOLD = 50 // 提高阈值，避免误触

// 获取当前滚动位置（兼容性处理）
const getScrollTop = () => {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
}

const getClientY = (e) => {
  if (e.touches?.length) return e.touches[0].clientY
  return e.clientY
}

const startDrag = (e) => {
  if (getScrollTop() > 0) return // 不在顶部，不响应拖拽
  isDragging.value = true
  startY.value = getClientY(e)
}

const onDragMove = (e) => {
  if (!isDragging.value) return
  const dy = getClientY(e) - startY.value
  if (dy > 0) {
    dragOffset.value = dy * 0.7
  } else {
    dragOffset.value = 0
  }
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false

  if (dragOffset.value >= THRESHOLD) {
    triggerReturnAnimation()
  } else {
    dragOffset.value = 0
  }
}

const handleWheel = (e) => {
  // 只在页面顶部且向下滚动时响应（deltaY > 0 表示内容向上滚，即用户手指/滚轮向下）
  if (getScrollTop() > 0 || e.deltaY <= 0) return

  // 防抖：短时间内只响应一次
  if (wheelTimeout) return
  wheelTimeout = setTimeout(() => {
    wheelTimeout = null
  }, 100)

  // 累计向下滚动量
  accumulatedWheelDown.value += e.deltaY

  if (accumulatedWheelDown.value >= WHEEL_THRESHOLD) {
    accumulatedWheelDown.value = 0
    triggerReturnAnimation()
  }
}

const triggerReturnAnimation = () => {
  if (isAnimating.value) return

  isAnimating.value = true
  dragOffset.value = 100 // 轻微下滑表示“离开”

  setTimeout(() => {
    emit('pull-to-welcome')
    // 👇 关键：重置状态，允许多次触发
    isAnimating.value = false
    dragOffset.value = 0
  })
}

// 事件绑定
const onMouseDown = (e) => startDrag(e)
const onMouseMove = (e) => onDragMove(e)
const onMouseUp = () => endDrag()
const onTouchStart = (e) => startDrag(e)
const onTouchMove = (e) => onDragMove(e)
const onTouchEnd = () => endDrag()

// 滚轮累计值（使用普通变量即可，无需 ref）
let accumulatedWheelDown = 0

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: true })
})

onUnmounted(() => {
  if (wheelTimeout) clearTimeout(wheelTimeout)
  window.removeEventListener('wheel', handleWheel)
})

// 模拟文章数据
const posts = [
  { id: 1, title: 'Vue 3 响应式原理深入解析', date: '2025-12-20', excerpt: '从 Proxy 到 effect...' },
  { id: 2, title: '如何设计一个优雅的个人博客？', date: '2025-12-15', excerpt: '从 UI/UX 到性能优化...' },
  { id: 3, title: '使用 Vite 快速搭建前端项目', date: '2025-12-10', excerpt: 'Vite 为何比 Webpack 更快？...' },
  { id: 4, title: 'CSS 动画进阶技巧', date: '2025-12-05', excerpt: '掌握 cubic-bezier、transform...' },
  { id: 5, title: 'TypeScript 工程实践指南', date: '2025-11-28', excerpt: '从类型守卫到泛型约束...' },
  { id: 6, title: '前端性能优化 10 大策略', date: '2025-11-20', excerpt: '从懒加载到代码分割...' }
]
</script>

<style scoped>
/* 整体容器：限制最大宽度，水平居中 */
.blog-container {
  padding: 30px 20px;
  max-width: 1200px; /* 足够容纳两栏 */
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

/* 新增：确保拖拽区域覆盖全屏高度 */
.blog-drag-wrapper {
  min-height: 100vh;
}

/* 两栏布局 */
.layout-wrapper {
  display: flex;
  gap: 40px;
}

/* 侧边栏整体 */
.sidebar {
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  gap: 20px; /* 块之间的间距 */
  padding: 20px 0; /* 内部上下留白 */
}

/* 所有 sidebar block 的通用样式 */
.sidebar-block {
  background-color: #f9f9fb;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 特别针对“个人资料”块：让所有内容（包括头像）居中 */
.profile-block {
  align-items: center; /* ← 关键：让子元素水平居中 */
  text-align: center;  /* ← 让 h2、p 文字也居中（可选但推荐） */
}

/* 头像样式 */
/* 头像默认状态 */
.avatar img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
  transition: transform 0.5s ease; /* 平滑过渡 */
}

/* 悬浮时旋转 */
.avatar:hover img {
  transform: rotate(360deg);
}

.sidebar-block h2,
.sidebar-block h3 {
  text-align: center;
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.sidebar-block h3 {
  font-size: 1rem;
  color: #34495e;
}

.sidebar-block .bio {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* 链接列表 */
.sidebar-block .links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-block .links a {
  text-decoration: none;
  color: #3498db;
  font-weight: 500;
  transition: color 0.2s;
  text-align: center;
}

.sidebar-block .links a:hover {
  color: #2980b9;
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.tag {
  background-color: #eef5ff;
  color: #3498db;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  white-space: nowrap;
}

/* 主内容区 */
.main-content {
  flex: 1;
  min-width: 0; /* 防止 flex 子项溢出 */
}

.main-content header {
  text-align: left;
  margin-bottom: 30px;
}

.main-content header h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.main-content header p {
  color: #7f8c8d;
  font-size: 1.05rem;
}

.posts {
  margin-bottom: 40px;
}

.post {
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.post:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.post h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.date {
  display: block;
  color: #95a5a6;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.post p {
  line-height: 1.7;
  color: #34495e;
  margin-bottom: 12px;
}

.read-more {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.read-more:hover {
  color: #2980b9;
}

footer {
  text-align: center;
  margin-top: 30px;
  color: #95a5a6;
  font-size: 0.95rem;
}

/* 响应式：小屏时堆叠 */
@media (max-width: 768px) {
  .layout-wrapper {
    flex-direction: column;
    gap: 30px;
  }

  .sidebar {
    flex: 0 0 auto;
    width: 100%;
  }
}
</style>