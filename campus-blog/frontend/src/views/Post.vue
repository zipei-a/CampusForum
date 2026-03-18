<template>
  <div class="mx-auto max-w-6xl">
    <div v-if="loading" class="py-24 text-center">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/12 border-t-accent-300"></div>
      <p class="mt-4 text-sm text-white/45">正在加载文章内容…</p>
    </div>

    <template v-else-if="post">
      <section class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article class="overflow-hidden rounded-[32px] border border-white/8 bg-white/[0.03] shadow-[0_24px_100px_rgba(0,0,0,0.3)]">
          <div class="relative overflow-hidden border-b border-white/8">
            <div v-if="post.cover_image" class="h-[320px] sm:h-[420px]">
              <LazyImage
                :src="post.cover_image"
                :alt="post.title"
                img-class="h-full w-full object-cover"
                aspect-ratio="16/8"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/15 to-transparent"></div>
            </div>
            <div v-else class="flex h-[320px] items-center justify-center bg-[linear-gradient(135deg,_rgba(168,115,85,0.22),_rgba(58,130,104,0.18))] text-8xl">
              {{ categoryIcon }}
            </div>

            <div class="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <div class="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/55">
                <span class="rounded-full border border-white/14 bg-white/8 px-3 py-1">{{ post.category }}</span>
                <span>{{ formatDate(post.created_at) }}</span>
                <span>{{ post.views }} 次浏览</span>
              </div>
              <h1 class="mt-5 max-w-4xl font-display text-4xl leading-tight text-white sm:text-5xl">
                {{ post.title }}
              </h1>
            </div>
          </div>

          <div class="grid gap-8 p-6 sm:p-8 lg:grid-cols-[120px_minmax(0,1fr)] lg:p-10">
            <div class="hidden lg:block">
              <div class="sticky top-28 space-y-4 text-center">
                <div class="rounded-2xl border border-white/8 bg-neutral-950/45 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-white/32">Likes</p>
                  <p class="mt-2 font-display text-3xl text-white">{{ post.likes }}</p>
                </div>
                <div class="rounded-2xl border border-white/8 bg-neutral-950/45 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-white/32">Comments</p>
                  <p class="mt-2 font-display text-3xl text-white">{{ comments.length }}</p>
                </div>
              </div>
            </div>

            <div>
              <div class="flex flex-col gap-5 border-b border-white/8 pb-8 sm:flex-row sm:items-center sm:justify-between">
                <router-link :to="`/user/${post.author_id}`" class="flex items-center gap-4">
                  <img
                    :src="post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`"
                    class="h-14 w-14 rounded-full ring-2 ring-white/10"
                    loading="lazy"
                  />
                  <div>
                    <p class="text-sm uppercase tracking-[0.22em] text-white/35">By Author</p>
                    <p class="mt-1 text-lg font-semibold text-white">{{ post.author_name }}</p>
                    <p class="text-sm text-white/40">{{ post.author_bio || '记录校园生活的创作者' }}</p>
                  </div>
                </router-link>

                <div class="flex flex-wrap gap-3">
                  <button
                    @click="exportPDF"
                    class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                    :disabled="exporting"
                  >
                    <span>⇩</span>
                    {{ exporting ? '导出中…' : '导出 PDF' }}
                  </button>
                  <template v-if="isAuthor">
                    <router-link :to="`/edit/${post.id}`" class="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/72 transition hover:bg-white/[0.08] hover:text-white">
                      编辑文章
                    </router-link>
                    <button @click="handleDelete" class="inline-flex items-center rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-sm text-red-200 transition hover:bg-red-400/15">
                      删除
                    </button>
                  </template>
                </div>
              </div>

              <div class="prose-content prose-invert mt-8" v-html="formatContent(post.content)"></div>

              <div class="mt-10 grid gap-4 rounded-[26px] border border-white/8 bg-neutral-950/35 p-5 sm:grid-cols-3">
                <div>
                  <p class="text-[11px] uppercase tracking-[0.2em] text-white/32">阅读体验</p>
                  <p class="mt-2 text-sm leading-7 text-white/58">大字号标题、舒展行距、深色沉浸式阅读环境。</p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-[0.2em] text-white/32">内容结构</p>
                  <p class="mt-2 text-sm leading-7 text-white/58">更贴近成熟媒体站点的长文呈现方式。</p>
                </div>
                <div>
                  <p class="text-[11px] uppercase tracking-[0.2em] text-white/32">分发能力</p>
                  <p class="mt-2 text-sm leading-7 text-white/58">支持点赞、评论与 PDF 导出，适合传播沉淀。</p>
                </div>
              </div>

              <div class="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
                <button
                  @click="handleLike"
                  :class="[
                    'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all',
                    liked
                      ? 'bg-red-500/15 text-red-200 border border-red-300/20'
                      : 'bg-white/[0.04] text-white/72 border border-white/10 hover:bg-white/[0.08]'
                  ]"
                >
                  <span>{{ liked ? '♥' : '♡' }}</span>
                  <span>{{ liked ? '已点赞' : '为这篇文章点赞' }}</span>
                </button>

                <div class="flex items-center gap-3 text-sm text-white/40">
                  <span>{{ post.likes }} 人点赞</span>
                  <span>·</span>
                  <span>{{ comments.length }} 条评论</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside class="space-y-6">
          <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
            <p class="eyebrow">Reading Meta</p>
            <h2 class="section-title !text-2xl">文章侧栏</h2>
            <div class="mt-6 space-y-4 text-sm text-white/55">
              <div class="meta-box">
                <span>栏目</span>
                <strong>{{ post.category }}</strong>
              </div>
              <div class="meta-box">
                <span>发布时间</span>
                <strong>{{ formatDate(post.created_at) }}</strong>
              </div>
              <div class="meta-box">
                <span>浏览量</span>
                <strong>{{ post.views }}</strong>
              </div>
              <div class="meta-box">
                <span>互动度</span>
                <strong>{{ post.likes + comments.length }}</strong>
              </div>
            </div>
          </div>

          <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
            <p class="eyebrow">Discussion</p>
            <h2 class="section-title !text-2xl">评论区</h2>

            <div v-if="userStore.user" class="mt-6">
              <textarea
                v-model="newComment"
                placeholder="写下你的看法、共鸣或者补充…"
                class="min-h-[120px] w-full rounded-3xl border border-white/10 bg-neutral-950/55 px-5 py-4 text-sm leading-7 text-white placeholder:text-white/25 focus:border-accent-300/35 focus:outline-none"
              ></textarea>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || submitting"
                class="mt-4 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-accent-50 disabled:opacity-50"
              >
                {{ submitting ? '发送中…' : '发表评论' }}
              </button>
            </div>

            <div v-else class="mt-6 rounded-3xl border border-white/8 bg-neutral-950/45 p-5 text-sm text-white/48">
              <router-link to="/login" class="font-semibold text-accent-100 hover:text-white">登录</router-link>
              后就可以参与评论、留下你的校园观点。
            </div>

            <div class="mt-8 space-y-5">
              <div v-for="comment in comments" :key="comment.id" class="rounded-3xl border border-white/8 bg-neutral-950/35 p-5">
                <div class="flex gap-4">
                  <img
                    :src="comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`"
                    class="h-10 w-10 rounded-full ring-2 ring-white/10"
                    loading="lazy"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2 text-sm">
                      <router-link :to="`/user/${comment.user_id}`" class="font-semibold text-white hover:text-accent-100">
                        {{ comment.username }}
                      </router-link>
                      <span class="text-xs text-white/30">{{ formatDate(comment.created_at) }}</span>
                    </div>
                    <p class="mt-2 text-sm leading-7 text-white/58">{{ comment.content }}</p>
                    <button
                      v-if="userStore.user?.id === comment.user_id"
                      @click="deleteComment(comment.id)"
                      class="mt-3 text-xs text-white/30 transition hover:text-red-200"
                    >
                      删除评论
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="comments.length === 0" class="mt-6 rounded-3xl border border-dashed border-white/10 px-6 py-10 text-center text-sm text-white/32">
              还没有评论，做第一个留下足迹的人。
            </div>
          </div>
        </aside>
      </section>
    </template>

    <div v-else class="py-24 text-center text-white/45">
      文章不存在。
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
const categoryIcon = computed(() => {
  const name = post.value?.category || ''
  const map = {
    学习: '📚',
    生活: '🌿',
    活动: '🎉',
    社团: '🎭',
    心情: '✨',
    技术: '💻'
  }
  return map[name] || '📝'
})

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

  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

onMounted(async () => {
  await Promise.all([fetchPost(), fetchComments()])
})
</script>