<template>
  <div class="space-y-10 lg:space-y-14">
    <section class="grid gap-6 lg:grid-cols-[1.35fr_0.8fr] xl:gap-8">
      <div class="hero-panel relative overflow-hidden rounded-[32px] border border-white/10 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(58,130,104,0.22),_transparent_25%),linear-gradient(135deg,_rgba(39,31,26,0.96),_rgba(14,14,14,0.88))]"></div>
        <div class="absolute -right-10 top-8 h-52 w-52 rounded-full bg-accent-300/10 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-300/10 blur-2xl"></div>

        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/60">
            <span class="h-2 w-2 rounded-full bg-accent-300"></span>
            Editorial Campus Platform
          </div>

          <h1 class="mt-6 max-w-3xl font-display text-4xl leading-[1.02] text-white sm:text-5xl lg:text-6xl">
            把校园博客，做成一份真正有质感的
            <span class="text-gradient-gold">数字校刊</span>
          </h1>

          <p class="mt-6 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
            参考成熟内容社区与高校媒体站的信息组织方式，我们把这个项目改造成更像
            “校园媒体中心 + 学生创作者社区” 的形态：有焦点区、有栏目流、有热门作者，也有更强的阅读氛围。
          </p>

          <div class="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <router-link v-if="!userStore.user" to="/register" class="btn-hero-primary">
              加入创作者社区
            </router-link>
            <router-link v-else to="/write" class="btn-hero-primary">
              去发布我的故事
            </router-link>
            <a href="#story-stream" class="btn-hero-secondary">查看内容流</a>
          </div>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div class="stat-card">
              <p class="stat-value">{{ posts.length }}</p>
              <p class="stat-label">精选文章</p>
            </div>
            <div class="stat-card">
              <p class="stat-value">{{ categories.length }}</p>
              <p class="stat-label">校园栏目</p>
            </div>
            <div class="stat-card">
              <p class="stat-value">{{ totalPostCount }}</p>
              <p class="stat-label">内容总量</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="grid gap-6">
        <div class="panel-glass rounded-[28px] p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="eyebrow">Campus Radar</p>
              <h2 class="section-mini-title">内容趋势雷达</h2>
            </div>
            <span class="text-xs text-white/35">Live</span>
          </div>

          <div class="mt-6 space-y-4">
            <div v-for="item in spotlightItems" :key="item.label" class="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-white">{{ item.label }}</p>
                  <p class="mt-1 text-xs leading-6 text-white/45">{{ item.desc }}</p>
                </div>
                <span class="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-accent-100/80">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-glass rounded-[28px] p-6">
          <p class="eyebrow">Editor’s Note</p>
          <h2 class="section-mini-title">适合校园站点的成熟方向</h2>
          <ul class="mt-5 space-y-4 text-sm leading-7 text-white/58">
            <li>• 头部区域必须承担品牌识别、价值表达与行动转化。</li>
            <li>• 首页不能只是文章列表，要有“焦点内容 + 流式内容 + 栏目入口”。</li>
            <li>• 学生内容平台要同时服务“阅读者”和“投稿者”。</li>
            <li>• 视觉上要像成熟内容品牌，而不是通用后台模板。</li>
          </ul>
        </div>
      </aside>
    </section>

    <section id="campus-highlights" class="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:gap-8">
      <div class="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Featured Story</p>
            <h2 class="section-title">校园焦点故事</h2>
            <p class="mt-2 max-w-2xl text-sm leading-7 text-white/50">
              参考成熟高校新闻站的做法：首页必须给一条视觉主故事，让访客第一眼就感到“这里有内容值得点进去”。
            </p>
          </div>
          <span class="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">精选主编推荐</span>
        </div>

        <div v-if="featuredPost" class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <router-link :to="`/post/${featuredPost.id}`" class="overflow-hidden rounded-[26px] border border-white/8 bg-neutral-900/80">
            <div v-if="featuredPost.cover_image" class="h-full min-h-[320px]">
              <LazyImage
                :src="featuredPost.cover_image"
                :alt="featuredPost.title"
                img-class="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                aspect-ratio="4/3"
              />
            </div>
            <div v-else class="flex h-full min-h-[320px] items-center justify-center bg-[linear-gradient(135deg,_rgba(168,115,85,0.24),_rgba(58,130,104,0.16))]">
              <span class="text-8xl">{{ getCategoryIcon(featuredPost.category) }}</span>
            </div>
          </router-link>

          <div class="flex flex-col justify-between rounded-[26px] border border-white/8 bg-white/[0.03] p-6 sm:p-7">
            <div>
              <div class="flex flex-wrap items-center gap-3 text-xs text-white/45">
                <span class="rounded-full border border-accent-300/20 bg-accent-500/10 px-3 py-1 text-accent-100">{{ featuredPost.category }}</span>
                <span>{{ formatDate(featuredPost.created_at) }}</span>
                <span>{{ featuredPost.views }} 浏览</span>
              </div>
              <router-link :to="`/post/${featuredPost.id}`">
                <h3 class="mt-5 font-display text-3xl leading-tight text-white sm:text-[2.1rem]">{{ featuredPost.title }}</h3>
              </router-link>
              <p class="mt-5 text-sm leading-8 text-white/58">
                {{ stripHtml(featuredPost.content, 180) }}
              </p>
            </div>

            <div class="mt-8 space-y-5">
              <router-link :to="`/user/${featuredPost.author_id}`" class="flex items-center gap-3 text-sm text-white/65 transition hover:text-white">
                <img
                  :src="featuredPost.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${featuredPost.author_name}`"
                  class="h-11 w-11 rounded-full ring-2 ring-white/10"
                />
                <div>
                  <p class="font-semibold text-white">{{ featuredPost.author_name }}</p>
                  <p class="text-xs text-white/40">校园主笔 / 内容创作者</p>
                </div>
              </router-link>

              <div class="flex flex-wrap gap-3 text-xs text-white/45">
                <span class="info-pill">❤️ {{ featuredPost.likes }} 点赞</span>
                <span class="info-pill">💬 {{ featuredPost.comment_count }} 评论</span>
                <span class="info-pill">📚 深度阅读</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 sm:p-8" id="campus-radar">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="eyebrow">Trending Sections</p>
            <h2 class="section-title !text-2xl">栏目入口</h2>
          </div>
          <span class="text-xs text-white/35">Curated</span>
        </div>

        <div class="mt-7 flex flex-wrap gap-3">
          <button
            @click="currentCategory = null"
            :class="[
              'filter-chip',
              currentCategory === null ? 'filter-chip-active' : 'filter-chip-idle'
            ]"
          >
            全部栏目
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            @click="currentCategory = cat.name"
            :class="[
              'filter-chip',
              currentCategory === cat.name ? 'filter-chip-active' : 'filter-chip-idle'
            ]"
          >
            <span>{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>

        <div class="mt-8 space-y-4">
          <div v-for="cat in categoryInsights" :key="cat.name" class="rounded-2xl border border-white/6 bg-neutral-950/40 p-4">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-xl">{{ cat.icon }}</div>
                <div>
                  <p class="text-sm font-semibold text-white">{{ cat.name }}</p>
                  <p class="text-xs text-white/40">{{ cat.count }} 篇内容 · {{ cat.label }}</p>
                </div>
              </div>
              <div class="h-2 w-20 overflow-hidden rounded-full bg-white/8">
                <div class="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-400" :style="{ width: `${cat.ratio}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="story-stream" class="rounded-[30px] border border-white/8 bg-white/[0.03] p-6 sm:p-8">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="eyebrow">Story Stream</p>
          <h2 class="section-title">校园内容流</h2>
          <p class="mt-2 max-w-3xl text-sm leading-7 text-white/50">
            这里借鉴成熟内容站的“编辑精选 + 瀑布内容流”思路，让首页既保留氛围感，也具备实用的浏览效率。
          </p>
        </div>
          <div class="flex items-center gap-3 text-xs text-white/40">
            <span class="rounded-full border border-white/8 px-3 py-1">共 {{ totalPostCount }} 篇内容</span>
            <span class="rounded-full border border-white/8 px-3 py-1">第 {{ currentPage }} / {{ totalPages || 1 }} 页</span>
          </div>
      </div>

      <HomeSkeleton v-if="loading" class="mt-8" />

      <div v-else-if="posts.length === 0" class="mt-8 rounded-[26px] border border-white/8 bg-neutral-950/40 px-6 py-16 text-center">
        <div class="text-6xl">📭</div>
        <p class="mt-4 text-lg font-medium text-white">这里暂时还没有内容</p>
        <p class="mt-2 text-sm text-white/40">等第一批校园故事上线后，这里会变得很热闹。</p>
      </div>

      <div v-else class="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="(post, index) in regularPosts"
          :key="post.id"
          class="story-card animate-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <router-link :to="`/post/${post.id}`" class="block">
            <div v-if="post.cover_image" class="overflow-hidden rounded-[24px] border border-white/8 bg-neutral-900/80">
              <LazyImage
                :src="post.cover_image"
                :alt="post.title"
                img-class="h-56 w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                aspect-ratio="16/10"
              />
            </div>
            <div v-else class="flex h-56 items-center justify-center rounded-[24px] border border-white/8 bg-[linear-gradient(135deg,_rgba(58,130,104,0.16),_rgba(168,115,85,0.16))] text-7xl">
              {{ getCategoryIcon(post.category) }}
            </div>
          </router-link>

          <div class="mt-5">
            <div class="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/35">
              <span class="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-white/55">{{ post.category }}</span>
              <span>{{ formatDate(post.created_at) }}</span>
            </div>

            <router-link :to="`/post/${post.id}`">
              <h3 class="mt-4 line-clamp-2 font-display text-2xl leading-tight text-white transition-colors hover:text-accent-100">
                {{ post.title }}
              </h3>
            </router-link>

            <p class="mt-4 line-clamp-3 text-sm leading-7 text-white/52">
              {{ stripHtml(post.content, 138) }}
            </p>

            <div class="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
              <router-link :to="`/user/${post.author_id}`" class="flex min-w-0 items-center gap-3">
                <img
                  :src="post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`"
                  class="h-9 w-9 rounded-full ring-2 ring-white/10"
                />
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-white/78">{{ post.author_name }}</p>
                  <p class="text-xs text-white/32">学生作者</p>
                </div>
              </router-link>

              <div class="flex items-center gap-3 text-xs text-white/36">
                <span>{{ post.views }} 阅读</span>
                <span>{{ post.likes }} ❤</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-if="totalPages > 1" class="mt-10 flex items-center justify-center gap-3">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="pager-btn"
        >上一页</button>
        <div class="rounded-full border border-white/8 bg-white/[0.03] px-5 py-2 text-sm text-white/58">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </div>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="pager-btn"
        >下一页</button>
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
    label: '本周最活跃栏目',
    desc: '根据当前文章分类分布形成的首页栏目建议。',
    value: categoryInsights.value[0]?.name || '待生成'
  },
  {
    label: '内容形态建议',
    desc: '校园站需要同时兼顾信息密度和青春氛围。',
    value: '媒体化'
  },
  {
    label: '推荐首页策略',
    desc: '焦点故事 + 分类入口 + 内容流，是更成熟的组合。',
    value: '精选流'
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
      label: count === 0 ? '等待内容补位' : count >= 3 ? '热度较高' : '持续更新中'
    }
  }).sort((a, b) => b.count - a.count).slice(0, 4)
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

  if (days === 0) return '今天发布'
  if (days === 1) return '昨天发布'
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const stripHtml = (html, length = 120) => {
  return html?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, length) || ''
}

watch([currentCategory, currentPage], fetchPosts)
watch(() => route.query.search, () => {
  currentPage.value = 1
  fetchPosts()
})

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchPosts()])
})
</script>