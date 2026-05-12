<template>
  <div id="app">
    <!-- Welcome Screen -->
    <transition name="page-transition">
      <Welcome 
        v-if="showWelcome"
        :background-image="bgImage"
        :site-name="settings.site_name"
        :avatar-url="settings.avatar_url"
        @scroll-down="handleScrollDown"
      />
    </transition>

    <!-- Main Content -->
    <transition name="content-transition">
      <div 
        v-if="!showWelcome"
        class="main-content"
      >
        <BlogContent 
          :settings="settings"
          :social-links="socialLinks"
          :categories="categories"
          :posts="posts"
          :tags="tags"
          @view-post="handleViewPost"
        />
      </div>
    </transition>

    <!-- Post Detail Modal -->
    <transition name="modal-transition">
      <PostDetail
        v-if="currentPost"
        :post="currentPost"
        @close="handleClosePost"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Welcome from './components/Welcome.vue'
import BlogContent from './components/BlogContent.vue'
import PostDetail from './components/PostDetail.vue'
import { settingsApi, categoriesApi, postsApi, tagsApi } from './api/index.js'

const bgImage = ref('')
const showWelcome = ref(true)
const currentPost = ref(null)

const settings = ref({
  site_name: 'ALT的博客',
  site_description: '',
  author_name: '',
  author_bio: '',
  background_url: '',
  avatar_url: ''
})

const socialLinks = ref([])
const categories = ref([])
const posts = ref([])
const tags = ref([])

const fetchData = async () => {
  try {
    const [settingsRes, socialRes, categoriesRes, postsRes, tagsRes] = await Promise.all([
      settingsApi.getAll(),
      settingsApi.getSocialLinks(),
      categoriesApi.getAll(),
      postsApi.getAll({ status: 'published', limit: 20 }),
      tagsApi.getAll()
    ])
    
    settings.value = { ...settings.value, ...settingsRes.data }
    socialLinks.value = socialRes.data
    categories.value = categoriesRes.data
    posts.value = postsRes.data.posts
    tags.value = tagsRes.data
    
    if (settings.value.background_url) {
      bgImage.value = settings.value.background_url
    }
  } catch (error) {
    console.error('数据加载失败', error)
  }
}

const fetchBackground = async () => {
  try {
    if (settings.value.background_url) {
      bgImage.value = settings.value.background_url
    }
  } catch (error) {
    console.error('背景图加载失败', error)
  }
}

const handleScrollDown = () => {
  showWelcome.value = false
}

const handleViewPost = (post) => {
  currentPost.value = post
  document.body.style.overflow = 'hidden'
}

const handleClosePost = () => {
  currentPost.value = null
  document.body.style.overflow = ''
}

onMounted(async () => {
  await fetchData()
  await fetchBackground()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.main-content {
  min-height: 100vh;
}

/* Page transition - Welcome to Main */
.page-transition-leave-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(0.95);
  filter: blur(10px);
}

.page-transition-enter-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(-50px) scale(0.95);
  filter: blur(10px);
}

/* Content transition */
.content-transition-enter-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
}

.content-transition-enter-from {
  opacity: 0;
  transform: translateY(50px);
}

.content-transition-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.content-transition-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Modal transition */
.modal-transition-enter-active,
.modal-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-transition-enter-from,
.modal-transition-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
