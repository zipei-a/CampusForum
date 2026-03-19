<template>
  <div class="space-y-10 lg:space-y-14">
    <section class="grid gap-6 lg:grid-cols-[1.35fr_0.82fr] xl:gap-8">
      <div class="hero-panel-youth relative overflow-hidden rounded-[36px] border border-white/80 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.65),_transparent_25%),radial-gradient(circle_at_82%_18%,_rgba(255,198,216,0.55),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.92),_rgba(246,248,255,0.92))]"></div>
        <div class="absolute -right-10 top-8 h-44 w-44 rounded-full bg-pink-200/70 blur-xl"></div>
        <div class="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-sky-200/60 blur-xl"></div>

        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-slate-500 shadow-sm">
            <span class="h-2 w-2 rounded-full bg-pink-400"></span>
            Youth Campus Community
          </div>

          <h1 class="mt-6 max-w-3xl font-display text-4xl leading-[1.02] text-slate-900 sm:text-5xl lg:text-6xl">
            让校园博客变成一个
            <span class="text-gradient-youth">更年轻、更好逛</span>
            的内容社区
          </h1>

          <p class="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            少一点端着的“校刊感”，多一点年轻人的分享欲、表达欲和社交氛围。
            这里应该像你每天愿意刷一会儿的校园首页，而不是只用来交作业的网站。
          </p>

          <div class="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <router-link v-if="!userStore.user" to="/register" class="btn-hero-youth-primary">
              加入大家一起玩
            </router-link>
            <router-link v-else to="/write" class="btn-hero-youth-primary">
              发一条校园动态
            </router-link>
            <a href="#story-stream" class="btn-hero-youth-secondary">去逛内容流</a>
          </div>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div class="stat-card-youth">
              <p class="stat-value text-slate-900">{{ posts.length }}</p>
              <p class="stat-label text-slate-500">首页内容</p>
            </div>
            <div class="stat-card-youth">
              <p class="stat-value text-slate-900">{{ categories.length }}</p>
              <p class="stat-label text-slate-500">热门栏目</p>
            </div>
            <div class="stat-card-youth">
              <p class="stat-value text-slate-900">{{ totalPostCount }}</p>
              <p class="stat-label text-slate-500">社区动态</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="grid gap-6">
        <div class="panel-youth rounded-[30px] p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="eyebrow-light">Campus Radar</p>
              <h2 class="section-mini-title text-slate-900">今天校园在聊什么</h2>
            </div>
            <span class="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] text-rose-500">热聊</span>
          </div>

          <div class="mt-6 space-y-4">
            <div v-for="item in spotlightItems" :key="item.label" class="rounded-2xl bg-white p-4 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-slate-800">{{ item.label }}</p>
                  <p class="mt-1 text-xs leading-6 text-slate-500">{{ item.desc }}</p>
                </div>
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-youth rounded-[30px] p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="eyebrow-light">Hot Picks</p>
              <h2 class="section-mini-title text-slate-900">适合放大的内容</h2>
            </div>
            <span class="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] text-sky-500">社区向</span>
          </div>
          <ul class="mt-5 space-y-3">
            <li class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm text-sm text-slate-700">🎉 活动图集</li>
            <li class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm text-sm text-slate-700">📣 社团招新</li>
            <li class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm text-sm text-slate-700">🛏️ 宿舍日常</li>
            <li class="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm text-sm text-slate-700">🗺️ 校园攻略</li>
          </ul>
        </div>
      </aside>
    </section>

    <section id="campus-highlights" class="grid gap-6 xl:grid-cols-[1.42fr_1fr] xl:gap-8">
      <div class="panel-youth rounded-[32px] p-6 sm:p-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow-light">Featured Drop</p>
            <h2 class="section-title text-slate-900">今日焦点</h2>
          </div>
          <span class="rounded-full bg-pink-100 px-3 py-1 text-xs text-pink-500">正在推荐</span>
        </div>

        <div v-if="featuredPost" class="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <router-link :to="`/post/${featuredPost.id}`" class="overflow-hidden rounded-[28px] bg-white shadow-sm">
            <div v-if="featuredPost.cover_image" class="h-full min-h-[320px]">
              <LazyImage
                :src="featuredPost.cover_image"
                :alt="featuredPost.title"
                img-class="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                aspect-ratio="4/3"
              />
            </div>
            <div v-else class="flex h-full min-h-[320px] items-center justify-center bg-[linear-gradient(135deg,_rgba(255,191,211,0.65),_rgba(177,226,255,0.68))]">
              <span class="text-8xl">{{ getCategoryIcon(featuredPost.category) }}</span>
            </div>
          </router-link>

          <div class="flex flex-col justify-between rounded-[28px] bg-white p-6 sm:p-7 shadow-sm">
            <div>
              <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span class="rounded-full bg-gradient-to-r from-pink-100 to-orange-100 px-3 py-1 text-pink-600">{{ featuredPost.category }}</span>
                <span>{{ formatDate(featuredPost.created_at) }}</span>
                <span>{{ featuredPost.views }} 浏览</span>
              </div>
              <router-link :to="`/post/${featuredPost.id}`">
                <h3 class="mt-5 font-display text-3xl leading-tight text-slate-900 sm:text-[2.1rem]">{{ featuredPost.title }}</h3>
              </router-link>
              <p class="mt-5 text-sm leading-8 text-slate-600">
                {{ stripHtml(featuredPost.content, 180) }}
              </p>
            </div>

            <div class="mt-8 space-y-5">
              <router-link :to="`/user/${featuredPost.author_id}`" class="flex items-center gap-3 text-sm text-slate-600 transition hover:text-slate-900">
                <img
                  :src="featuredPost.author_avatar || `${gradientAvatar(featuredPost.author_name)}`"
                  class="h-11 w-11 rounded-full ring-2 ring-white"
                />
                <div>
                  <p class="font-semibold text-slate-800">{{ featuredPost.author_name }}</p>
                  <p class="text-xs text-slate-400">校园人气创作者</p>
                </div>
              </router-link>

              <div class="flex flex-wrap gap-3 text-xs text-slate-500">
                <span class="info-pill-light">❤️ {{ featuredPost.likes }} 点赞</span>
                <span class="info-pill-light">💬 {{ featuredPost.comment_count }} 评论</span>
                <span class="info-pill-light">🔥 今日推荐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-youth rounded-[32px] p-6 sm:p-8" id="campus-radar">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="eyebrow-light">Categories</p>
            <h2 class="section-title !text-2xl text-slate-900">逛你感兴趣的</h2>
          </div>
          <span class="text-xs text-slate-400">Explore</span>
        </div>

        <div class="mt-7 flex flex-wrap gap-3">
          <button
            @click="currentCategory = null"
            :class="['filter-chip-light', currentCategory === null ? 'filter-chip-light-active' : 'filter-chip-light-idle']"
          >全部</button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="currentCategory = cat.name"
            :class="['filter-chip-light', currentCategory === cat.name ? 'filter-chip-light-active' : 'filter-chip-light-idle']"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>

        <div class="mt-8 space-y-4">
          <div v-for="cat in categoryInsights" :key="cat.name" class="rounded-2xl bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-sky-100 text-xl">{{ cat.icon }}</div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">{{ cat.name }}</p>
                  <p class="text-xs text-slate-400">{{ cat.count }} 条内容 · {{ cat.label }}</p>
                </div>
              </div>
              <div class="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-gradient-to-r from-pink-400 to-sky-400" :style="{ width: `${cat.ratio}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="story-stream" class="panel-youth rounded-[32px] p-6 sm:p-8">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="eyebrow-light">Story Stream</p>
          <h2 class="section-title text-slate-900">校园动态流</h2>
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-400">
          <span class="rounded-full bg-white px-3 py-1 shadow-sm">共 {{ totalPostCount }} 条内容</span>
          <span class="rounded-full bg-white px-3 py-1 shadow-sm">第 {{ currentPage }} / {{ totalPages || 1 }} 页</span>
        </div>
      </div>

      <HomeSkeleton v-if="loading" class="mt-8" />

      <div v-else-if="posts.length === 0" class="mt-8 rounded-[26px] bg-white px-6 py-16 text-center shadow-sm">
        <div class="text-6xl">📭</div>
        <p class="mt-4 text-lg font-medium text-slate-700">这里暂时还没有内容</p>
        <p class="mt-2 text-sm text-slate-400">等第一批校园故事上线后，这里会热闹起来。</p>
      </div>

      <div v-else class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div class="grid gap-5 lg:grid-cols-2">
          <article
            v-for="(post, index) in regularPosts"
            :key="post.id"
            class="story-card-light animate-in"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <router-link :to="`/post/${post.id}`" class="block">
              <div v-if="post.cover_image" class="overflow-hidden rounded-[24px] bg-slate-100">
                <LazyImage
                  :src="post.cover_image"
                  :alt="post.title"
                  img-class="h-56 w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  aspect-ratio="16/10"
                />
              </div>
              <div v-else class="flex h-56 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,_rgba(255,196,211,0.68),_rgba(178,223,255,0.72))] text-7xl">
                {{ getCategoryIcon(post.category) }}
              </div>
            </router-link>

            <div class="mt-5">
              <div class="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-500">{{ post.category }}</span>
                <span>{{ formatDate(post.created_at) }}</span>
              </div>

              <router-link :to="`/post/${post.id}`">
                <h3 class="mt-4 line-clamp-2 font-display text-2xl leading-tight text-slate-900 transition-colors hover:text-pink-500">
                  {{ post.title }}
                </h3>
              </router-link>

              <p class="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
                {{ stripHtml(post.content, 138) }}
              </p>

              <div class="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <router-link :to="`/user/${post.author_id}`" class="flex min-w-0 items-center gap-3">
                  <img
                    :src="post.author_avatar || `${gradientAvatar(post.author_name)}`"
                    class="h-9 w-9 rounded-full ring-2 ring-white"
                  />
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-slate-700">{{ post.author_name }}</p>
                    <p class="text-xs text-slate-400">在分享校园生活</p>
                  </div>
                </router-link>

                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <span>{{ post.views }} 阅读</span>
                  <span>{{ post.likes }} ❤</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside class="space-y-5">
          <div class="rounded-[28px] bg-white p-6 shadow-sm">
            <p class="eyebrow-light">Top Authors</p>
            <h3 class="section-title !text-2xl text-slate-900">人气作者</h3>
            <div class="mt-6 space-y-4">
              <router-link
                v-for="author in topAuthors"
                :key="author.author_id"
                :to="`/user/${author.author_id}`"
                class="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-pink-50"
              >
                <img :src="author.author_avatar || `${gradientAvatar(author.author_name)}`" class="h-11 w-11 rounded-full ring-2 ring-white" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-800">{{ author.author_name }}</p>
                  <p class="text-xs text-slate-400">{{ author.posts }} 篇文章 · {{ author.totalViews }} 阅读</p>
                </div>
              </router-link>
            </div>
          </div>

          <div class="rounded-[28px] bg-white p-6 shadow-sm">
            <p class="eyebrow-light">Editor Picks</p>
            <h3 class="section-title !text-2xl text-slate-900">随手推荐</h3>
            <div class="mt-5 space-y-4">
              <router-link
                v-for="pick in editorPicks"
                :key="pick.id"
                :to="`/post/${pick.id}`"
                class="block rounded-2xl bg-slate-50 p-4 transition hover:bg-orange-50"
              >
                <p class="text-xs uppercase tracking-[0.16em] text-slate-400">{{ pick.category }}</p>
                <h4 class="mt-2 line-clamp-2 font-display text-xl text-slate-900">{{ pick.title }}</h4>
                <p class="mt-2 line-clamp-2 text-sm leading-7 text-slate-500">{{ stripHtml(pick.content, 72) }}</p>
              </router-link>
            </div>
          </div>
        </aside>
      </div>

      <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-3">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pager-btn-light">上一页</button>
        <div class="rounded-full bg-white px-5 py-2 text-sm text-slate-500 shadow-sm">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</div>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pager-btn-light">下一页</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'
import HomeSkeleton from '@/components/HomeSkeleton.vue'
import LazyImage from '@/components/LazyImage.vue'
import { gradientAvatar } from '@/utils/avatar'

const route = useRoute()
const userStore = useUserStore()

const posts = shallowRef([])
const categories = shallowRef([])
const loading = ref(true)
const currentCategory = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalPostCount = ref(0)
const limit = 10

const spotlightItems = computed(() => [
  {
    label: '今天最热栏目',
    desc: '按当前首页内容热度计算出的热门方向。',
    value: categoryInsights.value[0]?.name || '待生成'
  },
  {
    label: '推荐首页气质',
    desc: '轻快、好逛、有互动感，比传统校园官网更容易停留。',
    value: '年轻化'
  },
  {
    label: '适合放大的内容',
    desc: '活动图集、社团招新、宿舍日常、校园攻略都会更适合。',
    value: '社区向'
  }
])

const featuredPost = computed(() => posts.value[0] || null)
const regularPosts = computed(() => posts.value.slice(1))

const categoryInsights = computed(() => {
  const total = totalPostCount.value || posts.value.length || 1
  return categories.value.map((cat) => {
    const count = posts.value.filter((post) => post.category === cat.name).length
    return {
      ...cat,
      count,
      ratio: Math.max(12, Math.min(100, Math.round((count / total) * 100) || 12)),
      label: count === 0 ? '刚刚起步' : count >= 3 ? '大家都在看' : '有人在发'
    }
  }).sort((a, b) => b.count - a.count).slice(0, 4)
})

const topAuthors = computed(() => {
  const map = new Map()
  posts.value.forEach((post) => {
    if (!map.has(post.author_id)) {
      map.set(post.author_id, {
        author_id: post.author_id,
        author_name: post.author_name,
        author_avatar: post.author_avatar,
        posts: 0,
        totalViews: 0
      })
    }
    const item = map.get(post.author_id)
    item.posts += 1
    item.totalViews += post.views || 0
  })
  return Array.from(map.values()).sort((a, b) => (b.posts + b.totalViews) - (a.posts + a.totalViews)).slice(0, 4)
})

const editorPicks = computed(() => {
  return [...posts.value]
    .sort((a, b) => ((b.likes || 0) + (b.comment_count || 0) * 2 + (b.views || 0) * 0.05) - ((a.likes || 0) + (a.comment_count || 0) * 2 + (a.views || 0) * 0.05))
    .slice(0, 3)
})

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
    posts.value = data.posts || []
    totalPostCount.value = data.total || 0
    totalPages.value = Math.max(1, Math.ceil((data.total || 0) / limit))
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
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const stripHtml = (html, length = 120) => {
  return html?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, length) || ''
}

watch([currentCategory, currentPage], ([, newPage], [, oldPage]) => {
  fetchPosts()
  if (newPage !== oldPage) {
    document.getElementById('story-stream')?.scrollIntoView({ behavior: 'smooth' })
  }
})
watch(() => route.query.search, () => {
  currentPage.value = 1
  fetchPosts()
})

onMounted(async () => {
  document.title = '校园博客 - 首页'
  await Promise.all([fetchCategories(), fetchPosts()])
})
</script>