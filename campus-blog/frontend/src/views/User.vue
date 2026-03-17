<template>
  <div class="max-w-4xl mx-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="bg-white rounded-2xl overflow-hidden shadow-card">
        <div class="h-40 bg-stone-200"></div>
        <div class="px-8 pb-8">
          <div class="flex items-end -mt-10 mb-6">
            <div class="w-20 h-20 rounded-full bg-stone-200 border-4 border-white"></div>
            <div class="ml-4 mb-1 space-y-2">
              <div class="h-5 w-32 bg-stone-200 rounded"></div>
              <div class="h-3 w-48 bg-stone-200 rounded"></div>
            </div>
          </div>
          <div class="flex gap-8">
            <div v-for="i in 3" :key="i" class="h-10 w-16 bg-stone-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div v-else class="space-y-8">
      <div class="bg-white rounded-2xl overflow-hidden shadow-card">
        <!-- 横幅 -->
        <div class="relative h-44 bg-gradient-to-br from-accent-700 via-accent-600 to-stone-600 overflow-hidden">
          <div class="absolute inset-0">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
            <div class="absolute bottom-0 left-20 w-40 h-40 bg-black/10 rounded-full translate-y-1/2 blur-xl"></div>
          </div>
          <!-- 是自己则显示编辑按钮 -->
          <div v-if="isOwner" class="absolute top-4 right-4">
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs rounded-full transition">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              编辑资料
            </button>
          </div>
        </div>

        <div class="px-8 pb-8">
          <!-- 头像 + 基本信息 -->
          <div class="flex items-end justify-between -mt-10 mb-6">
            <div class="flex items-end gap-4">
              <img
                :src="user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`"
                class="w-20 h-20 rounded-full border-4 border-white bg-white object-cover shadow-md"
              />
              <div class="mb-1">
                <h1 class="text-xl font-bold text-stone-900 font-display">{{ user.username }}</h1>
                <p class="text-stone-500 text-sm mt-0.5">{{ user.bio || '这个人很懒，什么都没写…' }}</p>
              </div>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="flex gap-8">
            <div class="text-center">
              <p class="text-2xl font-bold text-stone-900 font-display">{{ stats.post_count || 0 }}</p>
              <p class="text-xs text-stone-400 mt-0.5">文章</p>
            </div>
            <div class="w-px bg-stone-100"></div>
            <div class="text-center">
              <p class="text-2xl font-bold text-stone-900 font-display">{{ formatNumber(stats.total_views) }}</p>
              <p class="text-xs text-stone-400 mt-0.5">阅读</p>
            </div>
            <div class="w-px bg-stone-100"></div>
            <div class="text-center">
              <p class="text-2xl font-bold text-stone-900 font-display">{{ formatNumber(stats.total_likes) }}</p>
              <p class="text-xs text-stone-400 mt-0.5">获赞</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 文章列表 -->
      <div>
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-lg font-bold text-stone-900">TA 的文章</h2>
          <span class="text-sm text-stone-400">共 {{ posts.length }} 篇</span>
        </div>

        <!-- 空状态 -->
        <div v-if="posts.length === 0" class="bg-white rounded-2xl shadow-card py-16 text-center">
          <div class="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="text-stone-400 text-sm">还没有发布文章</p>
          <router-link v-if="isOwner" to="/write" class="inline-block mt-4 px-5 py-2 bg-accent-700 text-white text-sm rounded-full hover:bg-accent-800 transition">
            写第一篇
          </router-link>
        </div>

        <!-- 文章卡片列表 -->
        <div v-else class="space-y-3">
          <router-link
            v-for="post in posts"
            :key="post.id"
            :to="`/post/${post.id}`"
            class="group flex gap-5 bg-white rounded-xl shadow-card p-5 hover:shadow-elegant transition-all duration-200"
          >
            <!-- 封面缩略图 -->
            <div v-if="post.cover_image" class="flex-shrink-0">
              <img :src="post.cover_image" class="w-24 h-20 object-cover rounded-lg" />
            </div>

            <!-- 文章信息 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <h3 class="font-semibold text-stone-900 group-hover:text-accent-700 transition-colors line-clamp-2 leading-snug">
                  {{ post.title }}
                </h3>
                <span v-if="post.category" class="flex-shrink-0 px-2 py-0.5 bg-accent-50 text-accent-700 rounded-full text-xs font-medium">
                  {{ post.category }}
                </span>
              </div>

              <p v-if="post.excerpt" class="text-sm text-stone-400 mt-1.5 line-clamp-1">{{ post.excerpt }}</p>

              <div class="flex items-center gap-4 mt-3 text-xs text-stone-400">
                <span>{{ formatDate(post.created_at) }}</span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ formatNumber(post.views) }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {{ post.likes }}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {{ post.comment_count }}
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/utils/api'

const route = useRoute()
const userStore = useUserStore()

const user = ref({})
const posts = ref([])
const stats = ref({})
const loading = ref(true)

const isOwner = computed(() => {
  return userStore.user && String(userStore.user.id) === String(route.params.id)
})

const fetchUser = async () => {
  try {
    const data = await api.get(`/users/${route.params.id}`)
    user.value = data
    posts.value = data.posts || []
    stats.value = data.stats || {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

onMounted(fetchUser)
</script>
