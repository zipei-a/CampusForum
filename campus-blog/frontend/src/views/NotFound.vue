<template>
  <div class="min-h-[70vh] flex items-center justify-center">
    <div class="text-center max-w-md mx-auto px-4">
      <!-- 装饰数字 -->
      <div class="relative mb-8">
        <div class="font-display text-[10rem] font-bold leading-none select-none">
          <span class="text-transparent bg-clip-text bg-gradient-to-br from-accent-200 to-accent-400">4</span>
          <span class="text-transparent bg-clip-text bg-gradient-to-br from-primary-300 to-primary-500">0</span>
          <span class="text-transparent bg-clip-text bg-gradient-to-br from-accent-200 to-accent-400">4</span>
        </div>
        <!-- 书本图标 -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-20 h-20 rounded-2xl bg-white shadow-elegant flex items-center justify-center">
            <svg class="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
        </div>
      </div>

      <h1 class="font-display text-2xl font-bold text-neutral-800 mb-3">页面走丢了</h1>
      <p class="text-neutral-500 mb-8 leading-relaxed">你找的这篇文章可能已被删除，或者链接有误。不如去首页看看其他精彩内容？</p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <router-link
          to="/"
          class="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-full font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>回到首页</span>
        </router-link>
        <button
          @click="$router.go(-1)"
          class="inline-flex items-center justify-center space-x-2 px-6 py-3 border-2 border-neutral-200 text-neutral-600 rounded-full font-medium text-sm hover:border-accent-400 hover:text-accent-600 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>返回上页</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404 page — no logic needed
</script>
