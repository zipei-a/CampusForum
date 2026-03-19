<template>
  <!-- 草稿恢复提示 -->
  <Transition name="fade">
    <div v-if="draftRestorePrompt" class="fixed top-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-white/15 bg-neutral-900/95 px-5 py-3 shadow-xl backdrop-blur text-sm text-white/80">
      <span>📝 发现未保存草稿，是否恢复？</span>
      <button @click="restoreDraft" class="rounded-full bg-accent-500/20 px-3 py-1 text-accent-200 hover:bg-accent-500/30 transition">恢复</button>
      <button @click="discardDraft" class="rounded-full bg-white/8 px-3 py-1 text-white/50 hover:bg-white/12 transition">丢弃</button>
    </div>
  </Transition>

  <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section class="overflow-hidden rounded-[34px] border border-white/8 bg-white/[0.03] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <div class="border-b border-white/8 bg-[#111319]/82 px-6 py-4  sm:px-8">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-4">
              <router-link to="/" class="inline-flex items-center gap-2 text-sm text-white/42 transition hover:text-white/78">
                <span>←</span>
                返回首页
              </router-link>
              <div class="hidden h-4 w-px bg-white/10 sm:block"></div>
              <span class="text-sm text-white/58">{{ isEdit ? '正在编辑文章' : '新建一篇文章' }}</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-white/35">
              <span class="rounded-full border border-white/8 px-3 py-1">{{ wordCount }} 字</span>
              <span class="rounded-full border border-white/8 px-3 py-1">{{ estimatedMinutes }} 分钟阅读</span>
            </div>
          </div>
        </div>

        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mb-8">
            <div
              v-if="!form.cover_image"
              @click="triggerUpload"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="handleDrop"
              :class="[
                'group cursor-pointer rounded-[28px] border-2 border-dashed p-10 text-center transition-all duration-300',
                dragOver
                  ? 'border-accent-300 bg-accent-500/10'
                  : 'border-white/10 bg-neutral-950/35 hover:border-accent-200/35 hover:bg-[#111319]/82'
              ]"
            >
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl text-white/65 transition group-hover:bg-white/10">
                ⌁
              </div>
              <p class="mt-5 text-lg font-medium text-white">添加封面图</p>
              <p class="mt-2 text-sm text-white/38">拖放或点击上传 · JPG / PNG · 最大 5MB</p>
            </div>
            <div v-else class="group relative overflow-hidden rounded-[28px] border border-white/8">
              <img :src="form.cover_image" class="h-72 w-full object-cover" />
              <div class="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button type="button" @click="triggerUpload" class="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-50">更换图片</button>
                <button type="button" @click="form.cover_image = ''" class="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">移除</button>
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleUpload" />
          </div>

          <textarea
            v-model="form.title"
            placeholder="给这篇文章起一个像封面标题一样抓人的名字……"
            rows="2"
            @input="autoResizeTitle"
            ref="titleInput"
            class="w-full resize-none border-none bg-transparent font-display text-4xl leading-tight text-white placeholder:text-white/22 outline-none sm:text-5xl"
          ></textarea>

          <div class="mt-8 border-y border-white/8 py-5">
            <div class="flex flex-wrap gap-3">
              <button
                v-for="cat in categories"
                :key="cat.id"
                type="button"
                @click="form.category = form.category === cat.name ? '' : cat.name"
                :class="[
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all',
                  form.category === cat.name
                    ? 'border border-accent-200/35 bg-accent-500/20 text-white'
                    : 'border border-white/10 bg-white/5 text-white/52 hover:bg-white/10 hover:text-white'
                ]"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <div class="mt-8 relative">
            <textarea
              v-model="form.content"
              placeholder="开始写吧。\n\n把活动现场、社团故事、学习经验、校园观察，写成真正值得被阅读的内容。"
              ref="contentInput"
              @input="autoResizeContent"
              class="min-h-[460px] w-full resize-none border-none bg-transparent text-lg leading-[2] text-white/72 placeholder:text-white/22 outline-none"
            ></textarea>
            <div v-if="!form.content" class="pointer-events-none absolute bottom-4 right-0 text-xs uppercase tracking-[0.2em] text-white/16">
              Editorial Writing Mode
            </div>
          </div>
        </div>
      </section>

      <aside class="space-y-6">
        <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p class="eyebrow">Publishing Panel</p>
          <h2 class="section-title !text-2xl">发布控制台</h2>
          <div class="mt-6 space-y-4 text-sm text-white/55">
            <div class="meta-box"><span>标题状态</span><strong>{{ form.title ? '已填写' : '待补充' }}</strong></div>
            <div class="meta-box"><span>栏目</span><strong>{{ form.category || '未选择' }}</strong></div>
            <div class="meta-box"><span>字数</span><strong>{{ wordCount }}</strong></div>
            <div class="meta-box"><span>阅读时长</span><strong>{{ estimatedMinutes }} 分钟</strong></div>
          </div>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="submitting || !form.title || !form.content"
            class="mt-6 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-accent-50 disabled:opacity-40"
          >
            <span v-if="submitting">发布中…</span>
            <span v-else>{{ isEdit ? '保存修改' : '发布文章' }}</span>
          </button>
        </div>

        <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <p class="eyebrow">Writing Advice</p>
          <h2 class="section-title !text-2xl">编辑建议</h2>
          <ul class="mt-5 space-y-3 text-sm leading-7 text-white/48">
            <li>• 标题尽量有画面感，而不是流水账。</li>
            <li>• 开头第一段应该能立刻把读者拉进现场。</li>
            <li>• 分类让首页的信息结构更清晰。</li>
            <li>• 一张好的封面图会显著提升点击欲望。</li>
          </ul>
        </div>

        <div class="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
          <div class="h-2 overflow-hidden rounded-full bg-white/8">
            <div class="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-300 transition-all duration-300" :style="{ width: progressWidth }"></div>
          </div>
          <p class="mt-4 text-xs uppercase tracking-[0.18em] text-white/28">Writing progress</p>
          <p class="mt-2 text-sm text-white/46">当前完成度 {{ Math.round(parseFloat(progressWidth)) }}%，继续写，把它打磨成一篇真正拿得出手的作品。</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()

const form = ref({
  title: '',
  content: '',
  category: '',
  cover_image: ''
})
const categories = ref([])
const isEdit = ref(false)
const submitting = ref(false)
const fileInput = ref(null)
const titleInput = ref(null)
const contentInput = ref(null)
const dragOver = ref(false)

const wordCount = computed(() => {
  return (form.value.title + form.value.content).replace(/\s/g, '').length
})

const estimatedMinutes = computed(() => {
  return Math.max(1, Math.ceil(wordCount.value / 350))
})

const progressWidth = computed(() => {
  const total = wordCount.value
  const pct = Math.min((total / 1200) * 100, 100)
  return pct + '%'
})

const autoResizeTitle = () => {
  if (titleInput.value) {
    titleInput.value.style.height = 'auto'
    titleInput.value.style.height = titleInput.value.scrollHeight + 'px'
  }
}

const autoResizeContent = () => {
  if (contentInput.value) {
    contentInput.value.style.height = 'auto'
    contentInput.value.style.height = contentInput.value.scrollHeight + 'px'
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await api.get('/categories')
  } catch (e) {
    console.error(e)
  }
}

const fetchPost = async () => {
  if (!route.params.id) return
  isEdit.value = true
  try {
    const post = await api.get(`/posts/${route.params.id}`)
    form.value = {
      title: post.title,
      content: post.content,
      category: post.category,
      cover_image: post.cover_image || ''
    }
    await nextTick()
    autoResizeTitle()
    autoResizeContent()
  } catch (e) {
    router.push('/')
  }
}

const triggerUpload = () => fileInput.value?.click()

const handleUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  await uploadFile(file)
}

const handleDrop = async (e) => {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (!file || !file.type.startsWith('image/')) return
  await uploadFile(file)
}

const uploadFile = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    alert('图片不能超过 5MB')
    return
  }
  const formData = new FormData()
  formData.append('cover', file)
  try {
    const res = await api.post('/posts/upload', formData)
    form.value.cover_image = res.url
  } catch (e) {
    alert('上传失败，请重试')
  }
}

// 草稿自动保存
const DRAFT_KEY = 'campus_blog_draft'
const draftRestorePrompt = ref(false)
let draftTimer = null

const saveDraft = () => {
  if (isEdit.value) return
  const draft = {
    title: form.value.title,
    content: form.value.content,
    category: form.value.category,
    savedAt: Date.now()
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

const restoreDraft = () => {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return
  const draft = JSON.parse(raw)
  form.value.title = draft.title || ''
  form.value.content = draft.content || ''
  form.value.category = draft.category || ''
  draftRestorePrompt.value = false
  nextTick(() => { autoResizeTitle(); autoResizeContent() })
}

const discardDraft = () => {
  localStorage.removeItem(DRAFT_KEY)
  draftRestorePrompt.value = false
}

const handleSubmit = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await api.put(`/posts/${route.params.id}`, form.value)
      router.push(`/post/${route.params.id}`)
    } else {
      const res = await api.post('/posts', form.value)
      localStorage.removeItem(DRAFT_KEY)
      router.push(`/post/${res.id}`)
    }
  } catch (e) {
    alert('发布失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchPost()])
  if (!route.params.id) {
    // 检查是否有草稿
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      const draft = JSON.parse(raw)
      if (draft.title || draft.content) {
        draftRestorePrompt.value = true
      }
    }
    // 启动自动保存
    draftTimer = setInterval(saveDraft, 30000)
    await nextTick()
    titleInput.value?.focus()
  }
})

onUnmounted(() => {
  if (draftTimer) clearInterval(draftTimer)
})
</script>