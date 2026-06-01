<template>
  <div class="min-h-screen bg-[#0a0a0a] relative">
    <!-- 文件内容直接全屏展示 -->
    <div v-if="fileUrl" class="w-full h-full min-h-screen">
      <!-- PDF 文件 -->
      <PdfViewer
          v-if="isPdf(fileName)"
          :url="fileUrl"
          class="w-full h-screen"
      />

      <!-- PPT 文件 -->
      <PptViewer
          v-else-if="isPpt(fileName)"
          :url="fileUrl"
          class="w-full h-screen"
      />

      <!-- HTML 文件 - 使用 iframe 全屏加载 -->
      <iframe
          v-else-if="isHtml(fileName)"
          :src="fileUrl"
          class="w-full h-screen border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allow="fullscreen"
      />

      <!-- ZIP 文件 - 使用 DynamicViewer 解析 -->
      <DynamicViewer
          v-else-if="isZip(fileName)"
          :url="fileUrl"
          :file-name="fileName"
          fullscreen
          class="w-full h-screen"
      />

      <!-- 图片文件 -->
      <img
          v-else-if="isImage(fileName)"
          :src="fileUrl"
          :alt="name"
          class="w-full h-full object-contain"
      />

      <!-- 视频文件 -->
      <video
          v-else-if="isVideo(fileName)"
          :src="fileUrl"
          controls
          autoplay
          class="w-full h-full"
      ></video>

      <!-- 其他文件类型 - 提供下载链接 -->
      <div v-else class="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div class="flex flex-col items-center gap-6 p-8 border border-white/10 rounded-2xl bg-black/30 backdrop-blur-sm max-w-md">
          <svg class="w-16 h-16 text-[rgba(77,240,255,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <div class="text-center">
            <h2 class="text-xl text-white/90 font-semibold mb-2">{{ name || '未命名专栏' }}</h2>
            <p class="text-sm text-white/40">{{ fileName }}</p>
          </div>
          <a
              :href="fileUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-6 py-2.5 bg-[rgba(77,240,255,0.9)] text-black rounded-full text-sm font-bold hover:bg-[rgba(77,240,255,1)] transition-colors"
          >
            下载文件
          </a>
        </div>
      </div>
    </div>

    <!-- 无文件 URL 状态 -->
    <div v-else class="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div class="flex flex-col items-center gap-4 text-center">
        <svg class="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-white/30 text-sm">暂无内容</p>
        <button
            @click="closeView"
            class="px-4 py-2 text-sm text-white/60 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
        >
          返回
        </button>
      </div>
    </div>

    <!-- 关闭按钮（固定在左上角） -->
    <button
        @click="closeView"
        class="fixed top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import PdfViewer from '@/components/viewer/PdfViewer.vue'
import PptViewer from '@/components/viewer/PptViewer.vue'
import DynamicViewer from '@/components/viewer/DynamicViewer.vue'

const router = useRouter()
const route = useRoute()

// 从查询参数获取文件信息
const fileUrl = computed(() => route.query.url as string || '')
const fileName = computed(() => route.query.name as string || '')
const name = computed(() => route.query.title as string || '')

// 文件类型判断
const getExt = (name?: string) => name?.split('.').pop()?.toLowerCase() || ''

const isImage = (name?: string) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(getExt(name))
const isVideo = (name?: string) => ['mp4', 'webm', 'ogg', 'avi', 'wmv', 'mov'].includes(getExt(name))
const isPdf = (name?: string) => getExt(name) === 'pdf'
const isPpt = (name?: string) => ['ppt', 'pptx'].includes(getExt(name))
const isHtml = (name?: string) => ['html', 'htm'].includes(getExt(name))
const isZip = (name?: string) => getExt(name) === 'zip'

// 关闭视图
const closeView = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    window.close()
  }
}
</script>
