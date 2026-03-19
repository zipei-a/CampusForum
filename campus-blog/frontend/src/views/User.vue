<template>
  <div class="mx-auto max-w-6xl space-y-8">
    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="rounded-[32px] border border-white/8 bg-white/[0.03] overflow-hidden">
        <div class="h-56 bg-white/5"></div>
        <div class="px-8 pb-8">
          <div class="-mt-12 flex items-end gap-4">
            <div class="h-24 w-24 rounded-full bg-white/10 ring-4 ring-neutral-950"></div>
            <div class="space-y-3 pb-2">
              <div class="h-6 w-40 rounded bg-white/10"></div>
              <div class="h-4 w-64 rounded bg-white/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <section class="overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.03] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
        <div class="relative h-56 overflow-hidden bg-[linear-gradient(135deg,_rgba(168,115,85,0.3),_rgba(58,130,104,0.22),_rgba(20,20,20,0.82))]">
          <div class="absolute inset-0">
            <div class="absolute -right-16 top-0 h-64 w-64 rounded-full bg-white/10 blur-xl"></div>
            <div class="absolute left-10 bottom-0 h-44 w-44 rounded-full bg-black/10 blur-xl"></div>
          </div>
          <div class="absolute right-6 top-6" v-if="isOwner">
            <button class="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/15 hover:text-white">
              编辑资料（预留）
            </button>
          </div>
        </div>

        <div class="px-6 pb-8 sm:px-8 lg:px-10">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="flex flex-col gap-5 sm:flex-row sm:items-end -mt-14">
              <img
                :src="user.avatar || `${gradientAvatar(user.username)}`"
                class="h-24 w-24 rounded-full border-4 border-neutral-950 bg-neutral-900 object-cover shadow-xl"
              />
              <div class="pb-2">
                <p class="text-[11px] uppercase tracking-[0.24em] text-white/35">Author Profile</p>
                <h1 class="mt-2 font-display text-4xl text-white">{{ user.username }}</h1>
                <p class="mt-2 max-w-2xl text-sm leading-7 text-white/50">{{ user.bio || '这个人暂时还没写简介，但已经开始建立自己的校园内容版面。' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 lg:min-w-[360px]">
              <div class="profile-stat">
                <p class="profile-stat-value">{{ stats.post_count || 0 }}</p>
                <p class="profile-stat-label">文章</p>
              </div>
              <div class="profile-stat">
                <p class="profile-stat-value">{{ formatNumber(stats.total_views) }}</p>
                <p class="profile-stat-label">阅读</p>
              </div>
              <div class="profile-stat">
                <p class="profile-stat-value">{{ formatNumber(stats.total_likes) }}</p>
                <p class="profile-stat-label">获赞</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-8 xl:grid-cols-[1fr_300px]">
        <div class="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="eyebrow">Author Archive</p>
              <h2 class="section-title !text-3xl">TA 的文章</h2>
            </div>
            <span class="rounded-full border border-white/8 px-3 py-1 text-xs text-white/40">共 {{ posts.length }} 篇</span>
          </div>

          <div v-if="posts.length === 0" class="mt-8 rounded-[26px] border border-dashed border-white/10 px-6 py-16 text-center">
            <p class="text-lg text-white/55">还没有发布文章</p>
            <router-link v-if="isOwner" to="/write" class="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-accent-50">
              写第一篇
            </router-link>
          </div>

          <div v-else class="mt-8 space-y-4">
            <router-link
              v-for="post in posts"
              :key="post.id"
              :to="`/post/${post.id}`"
              class="group flex flex-col gap-5 rounded-[26px] border border-white/8 bg-neutral-950/35 p-5 transition hover:bg-[#111319]/82 lg:flex-row"
            >
              <div v-if="post.cover_image" class="h-40 overflow-hidden rounded-[22px] lg:h-28 lg:w-44 lg:flex-shrink-0">
                <img :src="post.cover_image" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div v-else class="flex h-40 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,_rgba(58,130,104,0.18),_rgba(168,115,85,0.18))] text-5xl lg:h-28 lg:w-44 lg:flex-shrink-0">
                {{ getCategoryIcon(post.category) }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/32">
                  <span class="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-white/52">{{ post.category || '未分类' }}</span>
                  <span>{{ formatDate(post.created_at) }}</span>
                </div>
                <h3 class="mt-3 line-clamp-2 font-display text-2xl leading-tight text-white group-hover:text-accent-100">
                  {{ post.title }}
                </h3>
                <p class="mt-3 line-clamp-2 text-sm leading-7 text-white/45">{{ excerpt(post) }}</p>
                <div class="mt-4 flex flex-wrap gap-4 text-xs text-white/34">
                  <span>{{ formatNumber(post.views) }} 阅读</span>
                  <span>{{ post.likes || 0 }} 喜欢</span>
                  <span>{{ post.comment_count || 0 }} 评论</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
            <p class="eyebrow">Author Notes</p>
            <h2 class="section-title !text-2xl">作者画像</h2>
            <div class="mt-6 space-y-4 text-sm text-white/52">
              <div class="meta-box"><span>内容数量</span><strong>{{ stats.post_count || 0 }}</strong></div>
              <div class="meta-box"><span>总阅读量</span><strong>{{ formatNumber(stats.total_views) }}</strong></div>
              <div class="meta-box"><span>总获赞</span><strong>{{ formatNumber(stats.total_likes) }}</strong></div>
              <div class="meta-box"><span>页面身份</span><strong>{{ isOwner ? '本人主页' : '作者主页' }}</strong></div>
            </div>
          </div>

          <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
            <p class="eyebrow">Editorial Tip</p>
            <h2 class="section-title !text-2xl">为什么这样改</h2>
            <p class="mt-4 text-sm leading-7 text-white/48">
              成熟内容网站的个人主页，通常不是“头像 + 列表”这么简单，而要有作者感、专栏感和明确的数据气质。这个版本就是往那个方向推的。
            </p>
          </div>
        </aside>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/utils/api'
import { gradientAvatar } from '@/utils/avatar'

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

const getCategoryIcon = (name) => {
  const map = {
    学习: '📚',
    生活: '🌿',
    活动: '🎉',
    社团: '🎭',
    心情: '✨',
    技术: '💻'
  }
  return map[name] || '📝'
}

const excerpt = (post) => {
  return post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 96) || '这篇文章正在等待你点开阅读。'
}

onMounted(fetchUser)
</script>