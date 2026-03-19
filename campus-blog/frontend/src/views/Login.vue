<template>
  <div class="mx-auto flex min-h-[78vh] max-w-6xl items-center px-4 py-10 sm:px-6">
    <div class="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
      <section class="hidden rounded-[34px] border border-white/8 bg-white/[0.03] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.26)] lg:flex lg:flex-col lg:justify-between">
        <div>
          <p class="eyebrow">Welcome Back</p>
          <h1 class="mt-4 font-display text-5xl leading-[1.05] text-white">
            回到你的
            <span class="text-gradient-gold">校园创作现场</span>
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-white/55">
            这里不是普通发帖页，而是一个更像校园媒体中心的内容平台。登录后，你可以继续写作、更新故事、维护你的个人栏目气质。
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="stat-card">
            <p class="stat-value">Brand</p>
            <p class="stat-label">媒体感</p>
          </div>
          <div class="stat-card">
            <p class="stat-value">Story</p>
            <p class="stat-label">内容流</p>
          </div>
          <div class="stat-card">
            <p class="stat-value">Voice</p>
            <p class="stat-label">个人表达</p>
          </div>
        </div>
      </section>

      <section class="rounded-[34px] border border-white/10 bg-[#111319] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)]  sm:p-8 lg:p-10">
        <div class="mx-auto max-w-md">
          <div class="mb-8">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg">
              <span class="font-display text-2xl">校</span>
            </div>
            <h2 class="mt-5 font-display text-4xl text-white">欢迎回来</h2>
            <p class="mt-2 text-sm leading-7 text-white/45">登录你的账号，继续经营这本属于你的校园刊物。</p>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">用户名 / 邮箱</label>
              <input
                v-model="form.username"
                type="text"
                placeholder="输入用户名或邮箱"
                class="auth-input"
                required
              />
            </div>

            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">密码</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="输入密码"
                  class="auth-input pr-14"
                  required
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35 transition hover:text-white/75">
                  {{ showPassword ? '隐藏' : '显示' }}
                </button>
              </div>
            </div>

            <div v-if="error" class="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {{ error }}
            </div>

            <button type="submit" :disabled="loading" class="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-accent-50 disabled:opacity-60">
              <span v-if="!loading">登录</span>
              <span v-else>登录中…</span>
            </button>
          </form>

          <div class="my-7 flex items-center gap-4 text-xs text-white/25">
            <div class="h-px flex-1 bg-white/10"></div>
            <span>新读者 / 新作者</span>
            <div class="h-px flex-1 bg-white/10"></div>
          </div>

          <router-link to="/register" class="flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white">
            创建新账号
          </router-link>
        </div>
      </section>
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