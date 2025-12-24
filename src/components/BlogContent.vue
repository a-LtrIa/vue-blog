<template>
  <div class="blog-container">
    <header>
      <h1>✨ 欢迎来到我的博客</h1>
      <p>记录技术、生活与思考</p>
    </header>

    <main>
      <article class="post" v-for="post in posts" :key="post.id">
        <h2>{{ post.title }}</h2>
        <time class="date">{{ post.date }}</time>
        <p>{{ post.excerpt }}</p>
        <a href="#" class="read-more">阅读全文 →</a>
      </article>
    </main>

    <footer>
      <p>© 2025 小明的博客 | Made with ❤️</p>
    </footer>
  </div>
</template>

<script setup>
const posts = [
  {
    id: 1,
    title: 'Vue 3 响应式原理深入解析',
    date: '2025-12-20',
    excerpt: '从 Proxy 到 effect，带你彻底理解 Vue 3 的响应式系统核心机制。'
  },
  {
    id: 2,
    title: '如何设计一个优雅的个人博客？',
    date: '2025-12-15',
    excerpt: '从 UI/UX 到性能优化，分享我打造这个博客的全过程。'
  },
  {
    id: 3,
    title: '使用 Vite 快速搭建前端项目',
    date: '2025-12-10',
    excerpt: 'Vite 为何比 Webpack 更快？实战演示零配置开发体验。'
  }
]
</script>

<style scoped>
.blog-container {
  padding: 50px 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.92);
  min-height: 100vh;
  box-shadow: 0 0 30px rgba(0,0,0,0.1);
}

header {
  text-align: center;
  margin-bottom: 40px;
}

header h1 {
  font-size: 2.2rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.post {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.post:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.post h2 {
  font-size: 1.6rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.date {
  display: block;
  color: #95a5a6;
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.post p {
  line-height: 1.7;
  color: #34495e;
  margin-bottom: 15px;
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
  margin-top: 40px;
  color: #95a5a6;
  font-size: 0.95rem;
}
</style>