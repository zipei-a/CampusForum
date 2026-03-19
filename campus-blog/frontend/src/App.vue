<template>
  <div class="app-shell min-h-screen bg-neutral-950 text-neutral-100">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(165,123,85,0.14),_transparent_34%),radial-gradient(circle_at_85%_15%,_rgba(58,130,104,0.14),_transparent_26%),linear-gradient(180deg,_rgba(10,10,10,0.2),_rgba(10,10,10,0.86))]"></div>
      <div class="noise-mask absolute inset-0 opacity-30"></div>
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </div>

    <header class="sticky top-0 z-50 border-b border-white/10 bg-[#111319]/92  supports-[backdrop-filter]:bg-[#111319]/88">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-20 items-center justify-between gap-4">
          <router-link to="/" class="group flex items-center gap-4 min-w-0">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.24)] transition-all group-hover:-translate-y-0.5 group-hover:bg-accent-500/15 group-hover:border-accent-300/40">
              <span class="font-display text-xl font-bold tracking-tight text-white">校</span>
            </div>
            <div class="min-w-0">
              <p class="text-[11px] uppercase tracking-[0.36em] text-white/45">Campus Editorial</p>
              <h1 class="truncate font-display text-2xl text-white">校园博客</h1>
            </div>
          </router-link>

          <nav class="hidden xl:flex items-center gap-7 text-sm text-white/65">
            <router-link to="/" class="nav-link">首页</router-link>
            <a href="#campus-highlights" class="nav-link">焦点</a>
            <a href="#story-stream" class="nav-link">故事流</a>
            <a href="#campus-radar" class="nav-link">校园雷达</a>
          </nav>

          <div class="hidden lg:flex flex-1 max-w-xl mx-6">
            <div class="relative w-full">
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="搜索校园故事、社团、作者、活动…"
                class="search-panel w-full rounded-full border border-white/10 bg-white/6 py-3 pl-12 pr-5 text-sm text-white placeholder:text-white/35 focus:border-accent-300/40 focus:bg-white/10 focus:outline-none"
              />
              <svg class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-4.35-4.35m1.6-5.15a7.75 7.75 0 11-15.5 0 7.75 7.75 0 0115.5 0z" />
              </svg>
            </div>
          </div>

          <div class="flex items-center gap-3 sm:gap-4">
            <template v-if="userStore.user">
              <router-link to="/write" class="hidden sm:inline-flex items-center gap-2 rounded-full border border-accent-300/25 bg-accent-500/15 px-5 py-2.5 text-sm font-semibold text-accent-50 transition-all hover:-translate-y-0.5 hover:bg-accent-500/25 hover:border-accent-200/40">
                <span class="text-base leading-none">+</span>
                发布文章
              </router-link>

              <div class="relative" ref="userMenuRef">
                <button @click="showUserMenu = !showUserMenu" class="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-left transition-all hover:bg-white/10">
                  <img
                    :src="userStore.user.avatar || `${gradientAvatar(userStore.user.username)}`"
                    class="h-9 w-9 rounded-full object-cover ring-2 ring-white/10 transition-all group-hover:ring-accent-200/40"
                  />
                  <div class="hidden md:block">
                    <p class="max-w-[120px] truncate text-sm font-semibold text-white">{{ userStore.user.username }}</p>
                    <p class="text-[11px] uppercase tracking-[0.18em] text-white/45">Creator</p>
                  </div>
                </button>

                <div v-if="showUserMenu" class="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#171a22] shadow-2xl shadow-black/50  animate-in">
                  <div class="border-b border-white/8 px-5 py-4">
                    <p class="font-semibold text-white">{{ userStore.user.username }}</p>
                    <p class="mt-1 truncate text-xs text-white/45">{{ userStore.user.email }}</p>
                  </div>
                  <router-link :to="`/user/${userStore.user.id}`" class="block px-5 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">
                    我的主页
                  </router-link>
                  <router-link to="/write" class="block px-5 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white sm:hidden">
                    发布文章
                  </router-link>
                  <button @click="handleLogout" class="block w-full px-5 py-3 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200">
                    退出登录
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <router-link to="/login" class="hidden sm:inline text-sm font-medium text-white/72 transition-colors hover:text-white">
                登录
              </router-link>
              <router-link to="/register" class="inline-flex items-center rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-all hover:-translate-y-0.5 hover:bg-accent-50">
                立即加入
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <router-view v-slot="{ Component }">
        <transition name="slide-up" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="relative z-10 mt-20 border-t border-white/8 bg-[#111319]/82 ">
      <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div class="max-w-xl">
            <p class="text-[11px] uppercase tracking-[0.34em] text-accent-200/65">Campus Journal</p>
            <h3 class="mt-3 font-display text-3xl text-white">一个真正像校园媒体中心的博客平台。</h3>
            <p class="mt-4 text-sm leading-7 text-white/55">
              不只是发文章，更是记录校园趋势、社团文化、个人表达与创作氛围的数字刊物。
            </p>
          </div>

          <div>
            <h4 class="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">探索</h4>
            <ul class="mt-4 space-y-3 text-sm text-white/58">
              <li><router-link to="/" class="footer-link">首页</router-link></li>
              <li><a href="#story-stream" class="footer-link">故事流</a></li>
              <li><a href="#campus-radar" class="footer-link">校园雷达</a></li>
              <li><router-link to="/write" class="footer-link">投稿入口</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">产品气质</h4>
            <ul class="mt-4 space-y-3 text-sm text-white/58">
              <li>媒体化信息架构</li>
              <li>杂志感视觉设计</li>
              <li>强调校园社交氛围</li>
              <li>支持创作者表达与沉淀</li>
            </ul>
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 校园博客 · Campus Stories, Refined.</p>
          <p>Vue 3 · Tailwind CSS · Designed for a premium campus publishing experience</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import { debounce } from './utils/debounce'
import { gradientAvatar } from './utils/avatar'

const router = useRouter()
const userStore = useUserStore()
const searchQuery = ref('')
const showUserMenu = ref(false)
const userMenuRef = ref(null)

const handleSearch = debounce(() => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/',
      query: {
        search: searchQuery.value
      }
    })
  }
}, 300)

const handleLogout = () => {
  userStore.logout()
  showUserMenu.value = false
  router.push('/')
}

const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  userStore.init()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>