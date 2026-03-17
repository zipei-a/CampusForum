<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- 装饰背景卡片 -->
      <div class="relative">
        <!-- 叠层背景 -->
        <div class="absolute inset-0 bg-accent-700 rounded-3xl rotate-2 opacity-20"></div>
        <div class="absolute inset-0 bg-primary-600 rounded-3xl -rotate-1 opacity-15"></div>

        <!-- 主卡片 -->
        <div class="relative bg-white rounded-3xl shadow-elegant overflow-hidden">
          <!-- 顶部装饰条 -->
          <div class="h-1.5 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400"></div>

          <div class="px-10 py-10">
            <!-- Logo区 -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 shadow-elegant mb-4">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h1 class="font-display text-2xl font-bold text-neutral-900 tracking-tight">欢迎回来</h1>
              <p class="text-neutral-500 text-sm mt-1">登录你的校园博客账号</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-5">
              <!-- 用户名 -->
              <div class="group">
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">用户名 / 邮箱</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accent-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.username"
                    type="text"
                    placeholder="请输入用户名或邮箱"
                    class="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent focus:bg-white transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <!-- 密码 -->
              <div class="group">
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">密码</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accent-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码"
                    class="w-full pl-11 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent focus:bg-white transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 错误提示 -->
              <transition name="slide-up">
                <div v-if="error" class="flex items-center space-x-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ error }}</span>
                </div>
              </transition>

              <!-- 登录按钮 -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl font-semibold text-sm tracking-wide hover:from-accent-700 hover:to-accent-800 disabled:opacity-60 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span v-if="!loading">登录</span>
                <span v-else class="flex items-center justify-center space-x-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>登录中...</span>
                </span>
              </button>
            </form>

            <!-- 分隔线 -->
            <div class="flex items-center my-6">
              <div class="flex-1 h-px bg-neutral-200"></div>
              <span class="px-4 text-xs text-neutral-400">还没有账号？</span>
              <div class="flex-1 h-px bg-neutral-200"></div>
            </div>

            <router-link
              to="/register"
              class="block w-full py-3 text-center border-2 border-neutral-200 text-neutral-600 rounded-xl font-medium text-sm hover:border-accent-400 hover:text-accent-600 transition-all"
            >
              立即注册
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await api.post('/login', form.value)
    userStore.setUser(data.user, data.token)
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = e.error || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>
