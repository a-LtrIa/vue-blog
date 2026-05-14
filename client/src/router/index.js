import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ArticleRepo from '../views/ArticleRepo.vue'
import ToolsRepo from '../views/ToolsRepo.vue'
import ResourcesRepo from '../views/ResourcesRepo.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/articles',
    name: 'Articles',
    component: ArticleRepo
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolsRepo
  },
  {
    path: '/resources',
    name: 'Resources',
    component: ResourcesRepo
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
