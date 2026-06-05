<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>博客管理</h2>
      </div>
      <nav class="sidebar-nav">
        <!-- 概览 -->
        <div class="nav-group">
          <div class="nav-group-title">概览</div>
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
            📊 仪表盘
          </router-link>
        </div>

        <!-- 博客内容 -->
        <div class="nav-group">
          <div class="nav-group-title">博客内容</div>
          <router-link to="/posts" class="nav-item" :class="{ active: $route.path.startsWith('/posts') }">
            📝 文章管理
          </router-link>
          <router-link to="/categories" class="nav-item" :class="{ active: $route.path === '/categories' }">
            📁 分类管理
          </router-link>
          <router-link to="/tags" class="nav-item" :class="{ active: $route.path === '/tags' }">
            🏷️ 标签管理
          </router-link>
        </div>

        <!-- 工具箱 -->
        <div class="nav-group">
          <div class="nav-group-title">工具箱</div>
          <router-link to="/tools" class="nav-item" :class="{ active: $route.path.startsWith('/tools') }">
            🛠️ 小工具
          </router-link>
          <router-link to="/resources" class="nav-item" :class="{ active: $route.path.startsWith('/resources') }">
            📦 资源分享
          </router-link>
          <router-link to="/music" class="nav-item" :class="{ active: $route.path.startsWith('/music') }">
            🎵 音乐管理
          </router-link>
        </div>

        <!-- 站点管理 -->
        <div class="nav-group">
          <div class="nav-group-title">站点管理</div>
          <router-link to="/announcements" class="nav-item" :class="{ active: $route.path.startsWith('/announcements') }">
            📢 网站公告
          </router-link>
          <router-link to="/friend-links" class="nav-item" :class="{ active: $route.path.startsWith('/friend-links') }">
            🔗 友情链接
          </router-link>
          <router-link to="/feedback" class="nav-item" :class="{ active: $route.path.startsWith('/feedback') }">
            💬 留言管理
          </router-link>
        </div>

        <!-- 系统管理 -->
        <div class="nav-group">
          <div class="nav-group-title">系统管理</div>
          <router-link to="/settings" class="nav-item" :class="{ active: $route.path === '/settings' }">
            ⚙️ 系统设置
          </router-link>
          <router-link to="/backgrounds" class="nav-item" :class="{ active: $route.path === '/backgrounds' }">
            🖼️ 背景图片
          </router-link>
        </div>
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
  router.push({ name: 'Login' })
}
</script>
