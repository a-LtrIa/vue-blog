<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>博客管理</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          📊 仪表盘
        </router-link>
        <router-link to="/posts" class="nav-item" :class="{ active: $route.path.startsWith('/posts') }">
          📝 文章管理
        </router-link>
        <router-link to="/categories" class="nav-item" :class="{ active: $route.path === '/categories' }">
          📁 分类管理
        </router-link>
        <router-link to="/tags" class="nav-item" :class="{ active: $route.path === '/tags' }">
          🏷️ 标签管理
        </router-link>
        <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
          ⚙️ 系统设置
        </router-link>
        <router-link to="/backgrounds" class="nav-item" :class="{ active: $route.path === '/backgrounds' }">
          🖼️ 背景图片
        </router-link>
        <router-link to="/tools" class="nav-item" :class="{ active: $route.path.startsWith('/tools') }">
          🛠️ 喵喵小工具
        </router-link>
        <router-link to="/resources" class="nav-item" :class="{ active: $route.path.startsWith('/resources') }">
          📦 资源分享
        </router-link>
        <router-link to="/announcements" class="nav-item" :class="{ active: $route.path.startsWith('/announcements') }">
          📢 网站公告
        </router-link>
      </nav>
      <div class="user-info">
        <span>{{ authStore.user?.username }}</span>
        <button @click="handleLogout">退出</button>
      </div>
    </aside>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
