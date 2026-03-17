<template>
  <div class="min-h-screen bg-stone-50">
    <!-- 顶部工具栏 -->
    <div class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div class="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <!-- 左侧：返回 + 状态 -->
        <div class="flex items-center gap-4">
          <router-link to="/" class="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-sm">返回</span>
          </router-link>
          <div class="h-4 w-px bg-stone-200"></div>
          <span class="text-sm font-medium text-stone-700">{{ isEdit ? '编辑文章' : '新文章' }}</span>
        </div>
        <!-- 右侧：字数 + 发布 -->
        <div class="flex items-center gap-4">
          <span class="text-sm text-stone-400">{{ wordCount }} 字</span>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="submitting || !form.title || !form.content"
            class="px-5 py-2 bg-accent-700 text-white rounded-full text-sm font-medium hover:bg-accent-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <span v-if="submitting" class="flex items-center gap-2">
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              发布中...
            </span>
            <span v-else>{{ isEdit ? '保存修改' : '发布文章' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="max-w-3xl mx-auto px-6 py-12">
      <!-- 封面图区域 -->
      <div class="mb-8">
        <div
          v-if="!form.cover_image"
          @click="triggerUpload"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="handleDrop"
          :class="[
            'group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
            dragOver
              ? 'border-accent-500 bg-accent-50'
              : 'border-stone-300 hover:border-accent-400 hover:bg-stone-100/50'
          ]"
        >
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-accent-100 flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-stone-400 group-hover:text-accent-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.583-4.583a.5.5 0 01.707 0L16 16m-2-2l1.583-1.583a.5.5 0 01.707 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">添加封面图片</p>
              <p class="text-xs text-stone-400 mt-1">拖放或点击上传 · JPG/PNG · 最大 5MB</p>
            </div>
          </div>
        </div>
        <div v-else class="relative group rounded-2xl overflow-hidden">
          <img :src="form.cover_image" class="w-full h-56 object-cover" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" @click="triggerUpload" class="px-4 py-2 bg-white text-stone-800 rounded-full text-sm font-medium hover:bg-stone-100 transition">
              更换图片
            </button>
            <button type="button" @click="form.cover_image = ''" class="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition">
              移除
            </button>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleUpload" />
      </div>

      <!-- 标题 -->
      <textarea
        v-model="form.title"
        placeholder="文章标题……"
        rows="2"
        @input="autoResizeTitle"
        ref="titleInput"
        class="w-full text-3xl md:text-4xl font-display font-bold text-stone-900 placeholder-stone-300 bg-transparent border-none outline-none resize-none leading-tight mb-6"
      ></textarea>

      <!-- 分类选择 -->
      <div class="flex flex-wrap gap-2 mb-8 pb-6 border-b border-stone-200">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          @click="form.category = form.category === cat.name ? '' : cat.name"
          :class="[
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
            form.category === cat.name
              ? 'bg-accent-700 text-white shadow-sm'
              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
          ]"
        >
          {{ cat.icon }} {{ cat.name }}
        </button>
      </div>

      <!-- 正文 -->
      <div class="relative">
        <textarea
          v-model="form.content"
          placeholder="开始写作……\n\n分享你的故事、想法、经历……"
          ref="contentInput"
          @input="autoResizeContent"
          class="w-full text-stone-700 placeholder-stone-300 bg-transparent border-none outline-none resize-none leading-relaxed text-lg font-body min-h-[400px]"
          style="line-height: 1.9"
        ></textarea>
        <!-- 空状态提示 -->
        <div v-if="!form.content" class="absolute bottom-4 right-0 text-xs text-stone-300 pointer-events-none">
          Markdown 支持即将到来
        </div>
      </div>
    </div>

    <!-- 底部进度条 -->
    <div class="fixed bottom-0 left-0 right-0 h-0.5 bg-stone-200">
      <div
        class="h-full bg-accent-600 transition-all duration-300"
        :style="{ width: progressWidth }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
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

// 字数统计
const wordCount = computed(() => {
  return (form.value.title + form.value.content).replace(/\s/g, '').length
})

// 底部进度条：以600字为满
const progressWidth = computed(() => {
  const total = wordCount.value
  const pct = Math.min((total / 600) * 100, 100)
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
  // 新文章时自动聚焦标题
  if (!route.params.id) {
    await nextTick()
    titleInput.value?.focus()
  }
})
</script>
