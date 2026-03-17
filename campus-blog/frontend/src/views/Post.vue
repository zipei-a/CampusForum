<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
    </div>

    <template v-else-if="post">
      <!-- 文章头部 -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <!-- 封面图 -->
        <div v-if="post.cover_image" class="h-64 overflow-hidden">
          <LazyImage
            :src="post.cover_image"
            :alt="post.title"
            img-class="w-full h-full object-cover"
            aspect-ratio="16/9"
          />
        </div>

        <div class="p-8">
          <!-- 分类和时间 -->
          <div class="flex items-center text-sm text-gray-400 mb-4">
            <span class="bg-primary-50 text-primary-600 px-3 py-1 rounded-full">{{ post.category }}</span>
            <span class="mx-3">·</span>
            <span>{{ formatDate(post.created_at) }}</span>
            <span class="mx-3">·</span>
            <span>{{ post.views }} 次浏览</span>
          </div>

          <!-- 标题 -->
          <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>

          <!-- 作者信息 -->
          <div class="flex items-center justify-between mb-8 pb-8 border-b">
            <router-link :to="`/user/${post.author_id}`" class="flex items-center space-x-3 hover:opacity-80">
              <img
                :src="post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`"
                class="w-12 h-12 rounded-full"
                loading="lazy"
              />
              <div>
                <p class="font-medium text-gray-900">{{ post.author_name }}</p>
                <p class="text-sm text-gray-500">{{ post.author_bio || '这个人很懒，什么都没写' }}</p>
              </div>
            </router-link>

            <!-- 操作按钮 -->
            <div class="flex space-x-2">
              <!-- PDF 导出按钮 -->
              <button
                @click="exportPDF"
                class="px-4 py-2 text-gray-600 hover:text-primary-600 border rounded-lg flex items-center space-x-1"
                :disabled="exporting"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>{{ exporting ? '导出中...' : '导出PDF' }}</span>
              </button>

              <template v-if="isAuthor">
                <router-link :to="`/edit/${post.id}`" class="px-4 py-2 text-gray-600 hover:text-primary-600 border rounded-lg">
                  编辑
                </router-link>
                <button @click="handleDelete" class="px-4 py-2 text-red-500 hover:text-red-600 border rounded-lg">
                  删除
                </button>
              </template>
            </div>
          </div>

          <!-- 文章内容 -->
          <div class="prose-content" v-html="formatContent(post.content)"></div>

          <!-- 点赞和评论统计 -->
          <div class="flex items-center justify-between mt-8 pt-8 border-t">
            <button
              @click="handleLike"
              :class="[
                'flex items-center space-x-2 px-6 py-2 rounded-full transition-colors',
                liked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg class="w-5 h-5" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <span>{{ post.likes }} 人点赞</span>
            </button>
            <span class="text-gray-500">{{ comments.length }} 条评论</span>
          </div>
        </div>
      </div>

      <!-- 评论区 -->
      <div class="bg-white rounded-xl shadow-sm p-8">
        <h3 class="text-lg font-bold text-gray-900 mb-6">评论区</h3>

        <!-- 发表评论 -->
        <div v-if="userStore.user" class="mb-6">
          <div class="flex space-x-3">
            <img
              :src="userStore.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userStore.user.username}`"
              class="w-10 h-10 rounded-full"
            />
            <div class="flex-1">
              <textarea
                v-model="newComment"
                placeholder="写下你的评论..."
                class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="3"
              ></textarea>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || submitting"
                class="mt-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? '发送中...' : '发表评论' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <router-link to="/login" class="text-primary-600 hover:underline">登录</router-link>
          <span class="text-gray-500">后参与评论</span>
        </div>

        <!-- 评论列表 -->
        <div class="space-y-4">
          <div v-for="comment in comments" :key="comment.id" class="flex space-x-3">
            <img
              :src="comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`"
              class="w-10 h-10 rounded-full"
              loading="lazy"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <router-link :to="`/user/${comment.user_id}`" class="font-medium text-gray-900 hover:text-primary-600">
                  {{ comment.username }}
                </router-link>
                <span class="text-sm text-gray-400">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="text-gray-700 mt-1">{{ comment.content }}</p>
              <button
                v-if="userStore.user?.id === comment.user_id"
                @click="deleteComment(comment.id)"
                class="text-sm text-gray-400 hover:text-red-500 mt-1"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <div v-if="comments.length === 0" class="text-center text-gray-400 py-8">
          暂无评论，快来抢沙发吧~
        </div>
      </div>
    </template>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">文章不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'
import LazyImage from '@/components/LazyImage.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref(null)
const comments = ref([])
const loading = ref(true)
const liked = ref(false)
const newComment = ref('')
const submitting = ref(false)
const exporting = ref(false)

const isAuthor = computed(() => userStore.user?.id === post.value?.author_id)

const fetchPost = async () => {
  try {
    post.value = await api.get(`/posts/${route.params.id}`)
    if (userStore.user) {
      const likeStatus = await api.get(`/posts/${route.params.id}/liked`)
      liked.value = likeStatus.liked
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    comments.value = await api.get(`/posts/${route.params.id}/comments`)
  } catch (e) {
    console.error(e)
  }
}

const handleLike = async () => {
  if (!userStore.user) {
    router.push('/login')
    return
  }

  try {
    if (liked.value) {
      await api.delete(`/posts/${route.params.id}/like`)
      post.value.likes--
    } else {
      await api.post(`/posts/${route.params.id}/like`)
      post.value.likes++
    }
    liked.value = !liked.value
  } catch (e) {
    console.error(e)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  submitting.value = true
  try {
    await api.post(`/posts/${route.params.id}/comments`, { content: newComment.value })
    newComment.value = ''
    await fetchComments()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const deleteComment = async (id) => {
  if (!confirm('确定删除这条评论吗？')) return

  try {
    await api.delete(`/comments/${id}`)
    comments.value = comments.value.filter(c => c.id !== id)
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = async () => {
  if (!confirm('确定删除这篇文章吗？此操作不可恢复。')) return

  try {
    await api.delete(`/posts/${route.params.id}`)
    router.push('/')
  } catch (e) {
    console.error(e)
  }
}

const exportPDF = async () => {
  exporting.value = true
  try {
    // 直接打开 PDF 链接进行下载
    const url = `/api/posts/${route.params.id}/pdf`
    const link = document.createElement('a')
    link.href = url
    link.download = `${post.value.title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    console.error(e)
    alert('导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const formatContent = (content) => {
  if (!content) return ''
  return content
    .replace(/\n/g, '<br>')
    .replace(/#{1,6}\s(.+)/g, '<strong>$1</strong>')
}

onMounted(async () => {
  // 并行请求优化 - 同时获取文章和评论，避免瀑布流
  await Promise.all([fetchPost(), fetchComments()])
})
</script>
