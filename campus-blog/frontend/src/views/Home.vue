<template>
  <div class="space-y-10">
    <!-- Hero 区域 - 杂志风格 -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800 p-10 text-white shadow-elegant">
      <!-- 装饰背景 -->
      <div class="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>

      <div class="relative z-10">
        <div class="flex items-center space-x-3 mb-4">
          <div class="h-1 w-12 bg-white/60 rounded-full"></div>
          <span class="text-white/80 text-sm font-medium tracking-wide">CAMPUS BLOG</span>
        </div>

        <h1 class="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          欢迎来到校园博客
        </h1>

        <p class="text-white/85 text-lg mb-8 max-w-xl font-body">
          分享你的校园生活，记录美好时光。在这里发现同龄人的故事，表达你的独特视角。
        </p>

        <div class="flex flex-wrap gap-4">
          <router-link
            v-if="!userStore.user"
            to="/register"
            class="inline-flex items-center px-6 py-3 bg-white text-accent-700 rounded-full font-semibold hover:bg-accent-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            立即加入
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </router-link>

          <a
            href="#posts"
            class="inline-flex items-center px-6 py-3 bg-white/10 text-white border-2 border-white/30 rounded-full font-semibold hover:bg-white/20 transition-all"
          >
            浏览文章
          </a>
        </div>
      </div>
    </div>

    <!-- 分类标签 - 优雅风格 -->
    <div class="flex flex-wrap gap-3" id="posts">
      <button
        @click="currentCategory = null"
        :class="[
          'px-5 py-2.5 rounded-full text-sm font-semibold transition-all',
          currentCategory === null
            ? 'bg-accent-500 text-white shadow-md'
            : 'bg-white text-neutral-600 hover:bg-accent-50 hover:text-accent-600 border border-neutral-200'
        ]"
      >
        全部
      </button>

      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="currentCategory = cat.name"
        :class="[
          'px-5 py-2.5 rounded-full text-sm font-semibold transition-all',
          currentCategory === cat.name
            ? 'bg-accent-500 text-white shadow-md'
            : 'bg-white text-neutral-600 hover:bg-accent-50 hover:text-accent-600 border border-neutral-200'
        ]"
      >
        <span class="mr-1.5">{{ cat.icon }}</span>
        {{ cat.name }}
      </button>
    </div>

    <!-- 文章列表 - 使用骨架屏优化加载体验 -->
    <HomeSkeleton v-if="loading" />

    <div v-else-if="posts.length === 0" class="text-center py-16 bg-white rounded-2xl shadow-soft">
      <div class="text-6xl mb-4">📭</div>
      <p class="text-neutral-500 text-lg font-medium">暂无文章</p>
      <p class="text-neutral-400 text-sm mt-2">快来发表第一篇文章吧！</p>
    </div>

    <div v-else class="grid md:grid-cols-2 gap-7">
      <article
        v-for="(post, index) in posts"
        :key="post.id"
        class="card-elegant group animate-in"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <router-link :to="`/post/${post.id}`">
          <!-- 封面图区域 - 使用懒加载 -->
          <div v-if="post.cover_image" class="h-52 overflow-hidden bg-neutral-100">
            <LazyImage
              :src="post.cover_image"
              :alt="post.title"
              img-class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              aspect-ratio="16/9"
            />
          </div>

          <!-- 默认封面 -->
          <div v-else class="h-52 bg-gradient-to-br from-accent-100 via-accent-50 to-primary-100 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-transparent to-black/5"></div>
            <span class="text-7xl relative z-10 group-hover:scale-110 transition-transform duration-300">
              {{ getCategoryIcon(post.category) }}
            </span>
          </div>
        </router-link>

        <div class="p-6">
          <!-- 元信息 -->
          <div class="flex items-center text-xs text-neutral-500 mb-3">
            <span :class="['tag', currentCategory === post.category ? 'tag-accent' : 'tag-neutral']">
              {{ post.category }}
            </span>
            <span class="mx-2 text-neutral-300">·</span>
            <span class="font-medium">{{ formatDate(post.created_at) }}</span>
          </div>

          <!-- 标题 -->
          <router-link :to="`/post/${post.id}`" class="block group-hover:link">
            <h2 class="font-display text-xl font-semibold text-neutral-900 group-hover:text-accent-600 transition-colors leading-tight line-clamp-2">
              {{ post.title }}
            </h2>
          </router-link>

          <!-- 摘要 -->
          <p class="text-neutral-600 text-sm mt-3 leading-relaxed line-clamp-2">
            {{ stripHtml(post.content) }}
          </p>

          <!-- 底部信息 -->
          <div class="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
            <!-- 作者 -->
            <router-link :to="`/user/${post.author_id}`" class="flex items-center space-x-2 group-hover:text-accent-600 transition-colors">
              <img
                :src="post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`"
                class="w-7 h-7 rounded-full ring-2 ring-accent-100"
                loading="lazy"
              />
              <span class="text-sm font-medium text-neutral-700">{{ post.author_name }}</span>
            </router-link>

            <!-- 统计 -->
            <div class="flex items-center space-x-4 text-xs text-neutral-400">
              <span class="flex items-center space-x-1.5 hover:text-neutral-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <span>{{ post.views }}</span>
              </span>

              <span class="flex items-center space-x-1.5 hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span>{{ post.likes }}</span>
              </span>

              <span class="flex items-center space-x-1.5 hover:text-neutral-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span>{{ post.comment_count }}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-3 pt-6">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="px-5 py-2.5 rounded-full bg-white border-2 border-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent-300 hover:text-accent-600 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <span class="px-6 py-2.5 rounded-full bg-accent-50 text-accent-700 font-semibold">
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="px-5 py-2.5 rounded-full bg-white border-2 border-neutral-200 text-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent-300 hover:text-accent-600 transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'
import HomeSkeleton from '@/components/HomeSkeleton.vue'
import LazyImage from '@/components/LazyImage.vue'

const route = useRoute()
const userStore = useUserStore()

// 使用 shallowRef 优化大数据（性能优化）
const posts = shallowRef([])
const categories = shallowRef([])
const loading = ref(true)
const currentCategory = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 10

const fetchCategories = async () => {
  try {
    categories.value = await api.get('/categories')
  } catch (e) {
    console.error(e)
  }
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const params = { page: currentPage.value, limit }
    if (currentCategory.value) params.category = currentCategory.value
    if (route.query.search) params.search = route.query.search

    const data = await api.get('/posts', { params })
    posts.value = data.posts
    totalPages.value = Math.ceil(data.total / limit)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const getCategoryIcon = (name) => {
  const cat = categories.value.find(c => c.name === name)
  return cat?.icon || '📝'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const stripHtml = (html) => {
  return html?.replace(/<[^>]+>/g, '').substring(0, 120) || ''
}

watch([currentCategory, currentPage], fetchPosts)
watch(() => route.query.search, fetchPosts)

onMounted(async () => {
  // 并行请求优化 - 同时获取分类和文章，避免瀑布流
  await Promise.all([fetchCategories(), fetchPosts()])
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.group-hover\:link:hover {
  text-decoration: underline;
}
</style>
