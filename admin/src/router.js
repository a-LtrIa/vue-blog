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
      },
      {
        path: 'tools',
        name: 'Tools',
        component: () => import('./views/Tools.vue')
      },
      {
        path: 'tools/new',
        name: 'ToolNew',
        component: () => import('./views/ToolEdit.vue')
      },
      {
        path: 'tools/:id/edit',
        name: 'ToolEdit',
        component: () => import('./views/ToolEdit.vue')
      },
      {
        path: 'resources',
        name: 'Resources',
        component: () => import('./views/Resources.vue')
      },
      {
        path: 'resources/new',
        name: 'ResourceNew',
        component: () => import('./views/ResourceEdit.vue')
      },
      {
        path: 'resources/:id/edit',
        name: 'ResourceEdit',
        component: () => import('./views/ResourceEdit.vue')
      },
      {
        path: 'announcements',
        name: 'Announcements',
        component: () => import('./views/Announcements.vue')
      },
      {
        path: 'announcements/new',
        name: 'AnnouncementNew',
        component: () => import('./views/AnnouncementEdit.vue')
      },
      {
        path: 'announcements/:id/edit',
        name: 'AnnouncementEdit',
        component: () => import('./views/AnnouncementEdit.vue')
      },
      {
        path: 'friend-links',
        name: 'FriendLinks',
        component: () => import('./views/FriendLinks.vue')
      },
      {
        path: 'friend-links/new',
        name: 'FriendLinkNew',
        component: () => import('./views/FriendLinkEdit.vue')
      },
      {
        path: 'friend-links/:id/edit',
        name: 'FriendLinkEdit',
        component: () => import('./views/FriendLinkEdit.vue')
      },
      {
        path: 'music',
        name: 'Music',
        component: () => import('./views/Music.vue')
      },
      {
        path: 'music/new',
        name: 'MusicNew',
        component: () => import('./views/MusicEdit.vue')
      },
      {
        path: 'music/:id/edit',
        name: 'MusicEdit',
        component: () => import('./views/MusicEdit.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
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
