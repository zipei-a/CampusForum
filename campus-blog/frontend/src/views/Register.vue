<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-md">
      <div class="relative">
        <div class="absolute inset-0 bg-primary-600 rounded-3xl rotate-2 opacity-20"></div>
        <div class="absolute inset-0 bg-accent-700 rounded-3xl -rotate-1 opacity-15"></div>

        <div class="relative bg-white rounded-3xl shadow-elegant overflow-hidden">
          <div class="h-1.5 bg-gradient-to-r from-accent-500 via-primary-500 to-accent-400"></div>

          <div class="px-10 py-10">
            <!-- Logo区 -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-elegant mb-4">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>
              <h1 class="font-display text-2xl font-bold text-neutral-900 tracking-tight">加入校园博客</h1>
              <p class="text-neutral-500 text-sm mt-1">创建你的账号，开始记录故事</p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-5">
              <!-- 用户名 -->
              <div class="group">
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">用户名</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.username"
                    type="text"
                    placeholder="英文字母或数字，3-20位"
                    class="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <!-- 邮箱 -->
              <div class="group">
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">邮箱</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="your@email.com"
                    class="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <!-- 密码 -->
              <div class="group">
                <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">密码</label>
                <div class="relative">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-600 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="至少6位，建议包含字母和数字"
                    class="w-full pl-11 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition-all text-sm"
                    required
                    minlength="6"
                  />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
                    <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  </button>
                </div>
                <!-- 密码强度条 -->
                <div class="mt-2 flex gap-1">
                  <div v-for="i in 4" :key="i"
                    class="h-1 flex-1 rounded-full transition-all duration-300"
                    :class="passwordStrength >= i ? strengthColor : 'bg-neutral-200'"
                  ></div>
                </div>
                <p class="text-xs text-neutral-400 mt-1">{{ strengthLabel }}</p>
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

              <!-- 注册按钮 -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold text-sm tracking-wide hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span v-if="!loading">创建账号</span>
                <span v-else class="flex items-center justify-center space-x-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>注册中...</span>
                </span>
              </button>
            </form>

            <div class="flex items-center my-6">
              <div class="flex-1 h-px bg-neutral-200"></div>
              <span class="px-4 text-xs text-neutral-400">已有账号？</span>
              <div class="flex-1 h-px bg-neutral-200"></div>
            </div>

            <router-link
              to="/login"
              class="block w-full py-3 text-center border-2 border-neutral-200 text-neutral-600 rounded-xl font-medium text-sm hover:border-primary-400 hover:text-primary-600 transition-all"
            >
              立即登录
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const passwordStrength = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Za-z]/.test(p) && /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  return colors[passwordStrength.value - 1] || 'bg-red-400'
})

const strengthLabel = computed(() => {
  const labels = ['', '弱', '一般', '较强', '强']
  return form.value.password ? `密码强度：${labels[passwordStrength.value]}` : ''
})

const handleRegister = async () => {
  if (form.value.password.length < 6) {
    error.value = '密码至少6位'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await api.post('/register', form.value)
    userStore.setUser(data.user, data.token)
    router.push('/')
  } catch (e) {
    error.value = e.error || '注册失败，请稍后再试'
  } finally {
    loading.value = false
  }
}
</script>
