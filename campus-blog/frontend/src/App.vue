<template>
  <div class="app-shell min-h-screen text-slate-800">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,170,197,0.26),_transparent_24%),radial-gradient(circle_at_85%_8%,_rgba(120,196,255,0.26),_transparent_24%),linear-gradient(180deg,_#fffaf7_0%,_#fefefe_42%,_#f6f7ff_100%)]"></div>
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
    </div>

    <header class="sticky top-0 z-50 border-b border-slate-200/70 bg-white/82 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-20 items-center justify-between gap-4">
          <router-link to="/" class="group flex min-w-0 items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-orange-300 to-sky-300 shadow-[0_14px_30px_rgba(255,141,177,0.35)] transition-all group-hover:-translate-y-0.5">
              <span class="font-display text-xl font-bold text-white">校</span>
            </div>
            <div class="min-w-0">
              <p class="text-[11px] uppercase tracking-[0.34em] text-slate-400">Campus Vibes</p>
              <h1 class="truncate font-display text-2xl text-slate-900">校园博客</h1>
            </div>
          </router-link>

          <nav class="hidden xl:flex items-center gap-7 text-sm text-slate-500">
            <router-link to="/" class="nav-link-light">首页</router-link>
            <a href="#campus-highlights" class="nav-link-light">热门</a>
            <a href="#story-stream" class="nav-link-light">动态</a>
            <a href="#campus-radar" class="nav-link-light">发现</a>
          </nav>

          <div class="hidden lg:flex flex-1 max-w-xl mx-6">
            <div class="relative w-full">
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="搜活动、社团、作者、八卦、攻略…"
                class="search-panel-light w-full rounded-full border border-slate-200 bg-white/90 py-3 pl-12 pr-5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-pink-300 focus:outline-none"
              />
              <svg class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-4.35-4.35m1.6-5.15a7.75 7.75 0 11-15.5 0 7.75 7.75 0 0115.5 0z" />
              </svg>
            </div>
          </div>

          <div class="flex items-center gap-3 sm:gap-4">
            <template v-if="userStore.user">
              <router-link to="/write" class="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-orange-300 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,163,190,0.35)] transition-all hover:-translate-y-0.5">
                <span class="text-base leading-none">+</span>
                发动态
              </router-link>

              <div class="relative" ref="userMenuRef">
                <button @click="showUserMenu = !showUserMenu" class="group flex items-center gap-3 rounded-full border border-slate-200 bg-white/85 px-2.5 py-2 text-left shadow-sm transition-all hover:bg-white">
                  <img
                    :src="userStore.user.avatar || `${gradientAvatar(userStore.user.username)}`"
                    class="h-9 w-9 rounded-full object-cover ring-2 ring-white transition-all"
                  />
                  <div class="hidden md:block">
                    <p class="max-w-[120px] truncate text-sm font-semibold text-slate-700">{{ userStore.user.username }}</p>
                    <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">在线</p>
                  </div>
                </button>

                <div v-if="showUserMenu" class="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 animate-in">
                  <div class="border-b border-slate-100 px-5 py-4">
                    <p class="font-semibold text-slate-800">{{ userStore.user.username }}</p>
                    <p class="mt-1 truncate text-xs text-slate-400">{{ userStore.user.email }}</p>
                  </div>
                  <router-link :to="`/user/${userStore.user.id}`" class="block px-5 py-3 text-sm text-slate-600 transition-colors hover:bg-pink-50 hover:text-slate-900">
                    我的主页
                  </router-link>
                  <router-link to="/write" class="block px-5 py-3 text-sm text-slate-600 transition-colors hover:bg-pink-50 hover:text-slate-900 sm:hidden">
                    发动态
                  </router-link>
                  <button @click="handleLogout" class="block w-full px-5 py-3 text-left text-sm text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
                    退出登录
                  </button>
                </div>
              </div>
            </template>

            <template v-else>
              <router-link to="/login" class="hidden sm:inline text-sm font-medium text-slate-500 transition-colors hover:text-slate-800">
                登录
              </router-link>
              <router-link to="/register" class="inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800">
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

    <footer class="relative z-10 mt-20 border-t border-slate-200 bg-white/70">
      <div class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div class="max-w-xl">
            <p class="text-[11px] uppercase tracking-[0.34em] text-pink-400">Campus Community</p>
            <h3 class="mt-3 font-display text-3xl text-slate-900">更年轻、更想逛下去的校园内容社区。</h3>
            <p class="mt-4 text-sm leading-7 text-slate-500">
              这里有校园日常、活动现场、社团故事、学习分享，也有更轻松的社交感和发现欲。
            </p>
          </div>

          <div>
            <h4 class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">探索</h4>
            <ul class="mt-4 space-y-3 text-sm text-slate-500">
              <li><router-link to="/" class="footer-link-light">首页</router-link></li>
              <li><a href="#story-stream" class="footer-link-light">动态流</a></li>
              <li><a href="#campus-radar" class="footer-link-light">发现页</a></li>
              <li><router-link to="/write" class="footer-link-light">发布入口</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">氛围</h4>
            <ul class="mt-4 space-y-3 text-sm text-slate-500">
              <li>更轻盈的视觉</li>
              <li>更年轻的色彩</li>
              <li>更强的社区感</li>
              <li>更想浏览的首页</li>
            </ul>
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 校园博客 · Campus Vibes.</p>
          <p>更像年轻人的校园内容社区，而不是一本严肃校刊</p>
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