<template>
  <div class="mx-auto flex min-h-[78vh] max-w-6xl items-center px-4 py-10 sm:px-6">
    <div class="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
      <section class="rounded-[34px] border border-white/10 bg-[#111319] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)]  sm:p-8 lg:p-10">
        <div class="mx-auto max-w-md">
          <div class="mb-8">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg">
              <span class="font-display text-2xl">新</span>
            </div>
            <h2 class="mt-5 font-display text-4xl text-white">加入校园博客</h2>
            <p class="mt-2 text-sm leading-7 text-white/45">创建你的作者身份，把校园生活写成值得被阅读的内容。</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">用户名</label>
              <input v-model="form.username" type="text" placeholder="3-20 位，推荐简洁好记" class="auth-input" required />
            </div>

            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">邮箱</label>
              <input v-model="form.email" type="email" placeholder="your@email.com" class="auth-input" required />
            </div>

            <div>
              <label class="mb-2 block text-xs uppercase tracking-[0.22em] text-white/35">密码</label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="至少 6 位，建议包含字母和数字"
                  class="auth-input pr-14"
                  required
                  minlength="6"
                />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/35 transition hover:text-white/75">
                  {{ showPassword ? '隐藏' : '显示' }}
                </button>
              </div>
              <div class="mt-3 flex gap-2">
                <div v-for="i in 4" :key="i" class="h-1.5 flex-1 rounded-full transition-all duration-300" :class="passwordStrength >= i ? strengthColor : 'bg-white/10'"></div>
              </div>
              <p class="mt-2 text-xs text-white/35">{{ strengthLabel }}</p>
            </div>

            <div v-if="error" class="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {{ error }}
            </div>

            <button type="submit" :disabled="loading" class="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-accent-50 disabled:opacity-60">
              <span v-if="!loading">创建账号</span>
              <span v-else>注册中…</span>
            </button>
          </form>

          <div class="my-7 flex items-center gap-4 text-xs text-white/25">
            <div class="h-px flex-1 bg-white/10"></div>
            <span>已经有账号</span>
            <div class="h-px flex-1 bg-white/10"></div>
          </div>

          <router-link to="/login" class="flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white">
            去登录
          </router-link>
        </div>
      </section>

      <section class="hidden rounded-[34px] border border-white/8 bg-white/[0.03] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.26)] lg:flex lg:flex-col lg:justify-between">
        <div>
          <p class="eyebrow">Become a Creator</p>
          <h1 class="mt-4 font-display text-5xl leading-[1.05] text-white">
            让你的名字，出现在
            <span class="text-gradient-gold">校园内容版面</span>
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-white/55">
            这套设计的目标不是“注册一个普通博客账号”，而是建立一个具备作者感、栏目感与持续表达能力的个人入口。
          </p>
        </div>

        <div class="space-y-4">
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p class="text-sm font-semibold text-white">你的个人主页会像一个作者专栏</p>
            <p class="mt-2 text-sm leading-7 text-white/45">展示文章、阅读量、被喜欢的数据与整体内容气质。</p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p class="text-sm font-semibold text-white">写作页会更像真正的内容编辑器</p>
            <p class="mt-2 text-sm leading-7 text-white/45">适合发活动报道、社团故事、学习经验和个人表达。</p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p class="text-sm font-semibold text-white">首页会把你的文章当作品，而不是帖子</p>
            <p class="mt-2 text-sm leading-7 text-white/45">这就是成熟内容站与普通博客模板最大的差别。</p>
          </div>
        </div>
      </section>
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
  return form.value.password ? `密码强度：${labels[passwordStrength.value]}` : '建议使用更强的密码'
})

const handleRegister = async () => {
  if (form.value.password.length < 6) {
    error.value = '密码至少 6 位'
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