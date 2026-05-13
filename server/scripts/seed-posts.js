import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '..', 'data', 'blog.db')
const db = new Database(dbPath)

// 测试文章数据
const testPosts = [
  {
    title: 'Vue 3 组合式 API 最佳实践',
    slug: 'vue3-composition-api-best-practices',
    content: `# Vue 3 组合式 API 最佳实践

Vue 3 的组合式 API 为开发者提供了更灵活的代码组织方式。本文将分享一些在实际项目中积累的最佳实践。

## 1. 使用 setup 语法糖

\`\`\`vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
</script>
\`\`\`

## 2. 逻辑复用 with Composables

将可复用的逻辑提取到 composable 函数中：

\`\`\`javascript
// useCounter.js
import { ref } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
\`\`\`

## 3. 性能优化技巧

- 使用 shallowRef 替代 ref 处理大型对象
- 合理使用 computed 缓存计算结果
- 使用 watchEffect 自动追踪依赖

## 总结

组合式 API 让 Vue 代码更加清晰和可维护，合理使用这些技巧可以显著提升开发体验。`,
    excerpt: '分享 Vue 3 组合式 API 在实际项目中的最佳实践，包括 setup 语法糖、composables 逻辑复用和性能优化技巧。',
    category_id: 1,
    tags: ['Vue', 'JavaScript'],
    view_count: 128
  },
  {
    title: 'TypeScript 高级类型体操',
    slug: 'typescript-advanced-types',
    content: `# TypeScript 高级类型体操

TypeScript 的类型系统非常强大，本文将探索一些高级类型技巧。

## 泛型基础

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg
}
\`\`\`

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}
\`\`\`

## 实用工具类型

- Partial<T>
- Required<T>
- Pick<T, K>
- Omit<T, K>

掌握这些类型技巧，可以让你的代码更加类型安全。`,
    excerpt: '深入探索 TypeScript 的高级类型系统，包括泛型、条件类型、映射类型和实用工具类型。',
    category_id: 1,
    tags: ['TypeScript', 'JavaScript'],
    view_count: 256
  },
  {
    title: 'CSS Grid 布局完全指南',
    slug: 'css-grid-complete-guide',
    content: `# CSS Grid 布局完全指南

CSS Grid 是现代网页布局的利器，本文将全面介绍 Grid 布局的使用方法。

## 基础概念

Grid 布局由容器和项目组成：

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`

## 常用属性

### 容器属性
- grid-template-columns
- grid-template-rows
- grid-gap
- justify-items
- align-items

### 项目属性
- grid-column
- grid-row
- justify-self
- align-self

## 实战案例

创建一个响应式卡片布局：

\`\`\`css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
\`\`\`

Grid 布局让复杂的页面布局变得简单直观。`,
    excerpt: '全面介绍 CSS Grid 布局的使用方法，包括基础概念、常用属性和实战案例。',
    category_id: 3,
    tags: ['CSS', '前端'],
    view_count: 189
  },
  {
    title: 'Vite 构建工具深度解析',
    slug: 'vite-build-tool-deep-dive',
    content: `# Vite 构建工具深度解析

Vite 是下一代前端构建工具，以其极速的冷启动和热更新著称。

## 为什么选 Vite？

### 传统构建工具的问题
- 冷启动慢
- 热更新慢
- 构建时间长

### Vite 的解决方案
- 原生 ESM
- 按需编译
- 预构建依赖

## 配置详解

\`\`\`javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
})
\`\`\`

## 插件开发

开发自定义 Vite 插件：

\`\`\`javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      // 转换逻辑
    }
  }
}
\`\`\`

Vite 正在改变前端开发的构建体验。`,
    excerpt: '深入解析 Vite 构建工具的原理、配置和插件开发，了解为什么 Vite 能成为下一代前端构建工具。',
    category_id: 1,
    tags: ['Vite', '前端工具'],
    view_count: 342
  },
  {
    title: '前端性能优化实战指南',
    slug: 'frontend-performance-optimization',
    content: `# 前端性能优化实战指南

性能优化是前端开发的重要课题，本文将分享实用的优化技巧。

## 加载优化

### 代码分割
\`\`\`javascript
// 路由懒加载
const Home = () => import('./views/Home.vue')
\`\`\`

### 图片优化
- 使用 WebP 格式
- 响应式图片
- 懒加载

## 渲染优化

### 减少重排重绘
- 使用 transform 替代 top/left
- 批量修改样式
- 使用 requestAnimationFrame

### 虚拟列表
处理大量数据时使用虚拟滚动：

\`\`\`vue
<RecycleScroller
  class="scroller"
  :items="items"
  :item-size="50"
>
  <template #default="{ item }">
    <div class="item">{{ item.name }}</div>
  </template>
</RecycleScroller>
\`\`\`

## 缓存策略

- HTTP 缓存
- Service Worker
- 本地存储

性能优化是一个持续的过程，需要不断监控和改进。`,
    excerpt: '分享前端性能优化的实战经验，包括加载优化、渲染优化和缓存策略。',
    category_id: 1,
    tags: ['性能优化', '前端'],
    view_count: 567
  },
  {
    title: 'React Hooks 设计模式',
    slug: 'react-hooks-design-patterns',
    content: `# React Hooks 设计模式

Hooks 让函数组件拥有了状态和能力，本文介绍常见的设计模式。

## 基础 Hooks

### useState
\`\`\`javascript
const [count, setCount] = useState(0)
\`\`\`

### useEffect
\`\`\`javascript
useEffect(() => {
  // 副作用逻辑
  return () => {
    // 清理逻辑
  }
}, [dependencies])
\`\`\`

## 自定义 Hooks

### useFetch
\`\`\`javascript
function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])
  
  return { data, loading }
}
\`\`\`

## 常见模式

- 容器/展示组件
- 高阶组件转 Hooks
- 状态提升

Hooks 让组件逻辑更加清晰和可复用。`,
    excerpt: '介绍 React Hooks 的常见设计模式，包括基础 Hooks 使用和自定义 Hooks 开发。',
    category_id: 1,
    tags: ['React', 'JavaScript'],
    view_count: 234
  },
  {
    title: 'Node.js 后端开发入门',
    slug: 'nodejs-backend-development',
    content: `# Node.js 后端开发入门

Node.js 让 JavaScript 可以运行在服务器端，本文介绍后端开发基础。

## Express 框架

### 基础路由
\`\`\`javascript
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(3000)
\`\`\`

### 中间件
\`\`\`javascript
// 日志中间件
app.use((req, res, next) => {
  console.log(\`\${req.method} \${req.path}\`)
  next()
})
\`\`\`

## 数据库操作

使用 SQLite：

\`\`\`javascript
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(':memory:')

db.run('CREATE TABLE users (id INT, name TEXT)')
db.run('INSERT INTO users VALUES (?, ?)', [1, 'Alice'])
\`\`\`

## RESTful API 设计

- GET /api/users - 获取用户列表
- GET /api/users/:id - 获取单个用户
- POST /api/users - 创建用户
- PUT /api/users/:id - 更新用户
- DELETE /api/users/:id - 删除用户

Node.js 是构建高性能后端服务的优秀选择。`,
    excerpt: 'Node.js 后端开发入门指南，介绍 Express 框架、数据库操作和 RESTful API 设计。',
    category_id: 2,
    tags: ['Node.js', '后端'],
    view_count: 178
  },
  {
    title: '设计系统构建实战',
    slug: 'design-system-building',
    content: `# 设计系统构建实战

设计系统是保证产品一致性的重要工具，本文介绍如何构建设计系统。

## 设计原则

### 一致性
- 统一的色彩体系
- 一致的字体规范
- 标准化的间距

### 可访问性
- 足够的对比度
- 键盘导航支持
- 屏幕阅读器友好

## 组件库开发

### 按钮组件
\`\`\`vue
<template>
  <button 
    :class="['btn', \`btn-\${variant}\`, \`btn-\${size}\`]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'medium' },
  disabled: Boolean
})
</script>
\`\`\`

## 文档维护

使用 Storybook 管理组件文档：

\`\`\`javascript
export default {
  title: 'Components/Button',
  component: Button
}

export const Primary = () => ({
  components: { Button },
  template: '<Button variant="primary">Primary</Button>'
})
\`\`\`

好的设计系统能显著提升团队协作效率。`,
    excerpt: '介绍如何构建设计系统，包括设计原则、组件库开发和文档维护。',
    category_id: 3,
    tags: ['设计', '前端'],
    view_count: 145
  },
  {
    title: '产品经理的思维方式',
    slug: 'product-manager-mindset',
    content: `# 产品经理的思维方式

产品经理需要具备独特的思维方式来解决问题和推动产品发展。

## 用户思维

### 用户研究
- 用户访谈
- 问卷调查
- 数据分析

### 用户画像
\`\`
姓名：小明
年龄：25岁
职业：前端工程师
痛点：学习效率低
需求：系统化的学习路径
\`\`

## 数据驱动

### 关键指标
- DAU/MAU
- 留存率
- 转化率
- NPS 评分

### A/B 测试
\`\`\`
假设：红色按钮比蓝色按钮点击率高
实验：50% 用户看到红色，50% 看到蓝色
结果：红色点击率 12%，蓝色 8%
结论：采用红色按钮
\`\`\`

## 优先级管理

使用 RICE 评分法：
- Reach（影响范围）
- Impact（影响程度）
- Confidence（信心度）
- Effort（工作量）

产品经理是连接用户、技术和业务的桥梁。`,
    excerpt: '分享产品经理的思维方式，包括用户思维、数据驱动和优先级管理方法。',
    category_id: 4,
    tags: ['产品'],
    view_count: 89
  },
  {
    title: '我的 2024 年度技术总结',
    slug: '2024-tech-summary',
    content: `# 我的 2024 年度技术总结

回顾这一年的技术成长，记录一些重要的收获和感悟。

## 技术栈演进

### 前端框架
- 深入学习了 Vue 3 组合式 API
- 尝试了 React Server Components
- 关注 Svelte 和 Solid.js

### 工具链
- 从 Webpack 迁移到 Vite
- 使用 pnpm 替代 npm
- 采用 TypeScript 严格模式

## 开源贡献

今年参与了几个开源项目：
- VueUse：贡献了 3 个 composables
- Vite 插件：开发了图片优化插件
- 技术博客：写了 20+ 篇文章

## 学习资源

### 推荐书籍
- 《Clean Code》
- 《Design Patterns》
- 《The Pragmatic Programmer》

### 优质课程
- Vue Mastery
- Frontend Masters
- Egghead.io

## 2025 目标

- 深入学习 WebAssembly
- 探索 AI 辅助编程
- 提升系统架构能力

持续学习是技术人的必修课。`,
    excerpt: '2024 年度技术总结，回顾技术栈演进、开源贡献和制定新一年的学习目标。',
    category_id: 6,
    tags: ['随笔', '年度总结'],
    view_count: 67
  }
]

// 插入文章
const insertPost = db.prepare(`
  INSERT INTO posts (title, slug, content, excerpt, category_id, status, view_count, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 'published', ?, datetime('now', '-' || ? || ' days'), datetime('now', '-' || ? || ' days'))
`)

const insertPostTag = db.prepare(`
  INSERT OR IGNORE INTO post_tags (post_id, tag_id)
  VALUES (?, (SELECT id FROM tags WHERE name = ?))
`)

console.log('开始插入测试文章...')

testPosts.forEach((post, index) => {
  try {
    // 插入文章，创建时间分散在不同日期
    const daysAgo = index * 3
    const result = insertPost.run(
      post.title,
      post.slug,
      post.content,
      post.excerpt,
      post.category_id,
      post.view_count,
      daysAgo,
      daysAgo
    )
    
    const postId = result.lastInsertRowid
    
    // 插入标签关联
    post.tags.forEach(tagName => {
      insertPostTag.run(postId, tagName)
    })
    
    console.log(`✓ 插入文章: ${post.title}`)
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log(`⚠ 文章已存在: ${post.title}`)
    } else {
      console.error(`✗ 插入失败: ${post.title}`, error.message)
    }
  }
})

console.log('\n测试文章插入完成！')
console.log(`共插入 ${testPosts.length} 篇文章`)

db.close()
