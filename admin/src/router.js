import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('./views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('./views/Dashboard.vue')
      },
      {
        path: 'posts',
        name: 'Posts',
        component: () => import('./views/Posts.vue')
      },
      {
        path: 'posts/new',
        name: 'PostNew',
        component: () => import('./views/PostEdit.vue')
      },
      {
        path: 'posts/:id/edit',
        name: 'PostEdit',
        component: () => import('./views/PostEdit.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('./views/Categories.vue')
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('./views/Tags.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('./views/Settings.vue')
      },
      {
        path: 'backgrounds',
        name: 'Backgrounds',
        component: () => import('./views/Backgrounds.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
