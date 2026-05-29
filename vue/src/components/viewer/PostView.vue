<template>
  <div class="post-view-root w-full h-full">
    <template v-for="(block, index) in parsedBlocks" :key="index">

      <MarkdownRenderer
          v-if="block.type === 'markdown'"
          :content="block.content"
      />

      <div v-else-if="block.type === 'media'" class="media-embed-block my-6 flex justify-center">
        <template v-if="block.file">

          <img
              v-if="isImage(block.filename)"
              :src="getFileUrl(block.file)"
              class="max-w-full rounded-xl shadow-lg border border-white/10"
              :alt="block.filename"
          />

          <video
              v-else-if="isVideo(block.filename)"
              :src="getFileUrl(block.file)"
              controls
              class="max-w-full w-full rounded-xl shadow-lg border border-white/10 bg-black/50"
          ></video>

          <audio
              v-else-if="isAudio(block.filename)"
              :src="getFileUrl(block.file)"
              controls
              class="w-full shadow-md rounded-full border border-white/10 bg-black/30"
          ></audio>

          <DynamicViewer
              v-else-if="isDynamic(block.filename)"
              :url="getFileUrl(block.file)"
              class="w-full border border-white/10 rounded-xl overflow-hidden shadow-lg bg-black/20"
          />

          <PdfViewer
              v-else-if="isPdf(block.filename)"
              :url="getFileUrl(block.file)"
              class="w-full h-150 border border-white/10 rounded-xl overflow-hidden shadow-lg"
          />

          <PptViewer
              v-else-if="isPpt(block.filename)"
              :url="getFileUrl(block.file)"
              class="w-full h-150 border border-white/10 rounded-xl overflow-hidden shadow-lg"
          />

          <div v-else class="flex items-center gap-4 p-4 border border-dashed border-cyan-400/40 rounded-xl bg-[#0c1e35]/50 w-full">
            <svg class="w-8 h-8 text-cyan-400 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <div class="flex flex-col flex-1">
              <span class="text-white/90 text-sm font-medium">{{ block.filename }}</span>
              <a :href="getFileUrl(block.file)" target="_blank" rel="noopener noreferrer" class="text-cyan-400 text-xs hover:underline mt-0.5">
                格式不支持直接预览，点击下载或打开
              </a>
            </div>
          </div>

        </template>

        <div v-else class="flex items-center gap-2 p-3 text-sm text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-lg w-full">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          找不到引用的附件: {{ block.filename }}
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue';

// 引入 viewer 目录下的所有组件（包括你原有的 MarkdownRenderer）
import MarkdownRenderer from '@/components/viewer/MarkdownRenderer.vue';
import DynamicViewer from '@/components/viewer/DynamicViewer.vue';
import PdfViewer from '@/components/viewer/PdfViewer.vue';
import PptViewer from '@/components/viewer/PptViewer.vue';

const props = defineProps<{
  content: string;
  files: any[];
}>();

// --- 内容切割核心逻辑 ---
const parsedBlocks = computed(() => {
  if (!props.content) return [];

  // 以 {{media:filename}} 为界切割整个文档字符串
  const splitRegex = /(\{\{media:[^}]+}})/g;
  const parts = props.content.split(splitRegex);

  return parts.map(part => {
    const match = part.match(/\{\{media:([^}]+)}}/);
    if (match) {
      const filename = match[1];
      const file = props.files?.find(f => f.name === filename || f.fileName === filename);
      return { type: 'media', filename, file };
    }
    return { type: 'markdown', content: part };
  }).filter(block => block.type === 'media' || (block.content && block.content.trim() !== ''));
});

// --- 文件类型推断与 URL 派发 ---
const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || '';

const isImage = (name: string) => ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(getExt(name));
const isVideo = (name: string) => ['mp4', 'webm', 'ogg', 'avi', 'wmv', 'mov'].includes(getExt(name));
const isAudio = (name: string) => ['mp3', 'wav', 'ogg', 'aac'].includes(getExt(name));
const isDynamic = (name: string) => ['html', 'htm', 'vue', 'zip'].includes(getExt(name));
const isPdf = (name: string) => getExt(name) === 'pdf';
const isPpt = (name: string) => ['ppt', 'pptx'].includes(getExt(name));

const objectUrlCache = new Map<File, string>();

const getFileUrl = (file: any): string => {
  if (!file) return '';
  if (file.url) return file.url;

  if (file instanceof File || file instanceof Blob) {
    if (!objectUrlCache.has(<File>file)) {
      objectUrlCache.set(<File>file, URL.createObjectURL(file));
    }
    return objectUrlCache.get(<File>file)!;
  }
  return '';
};

// --- 内存泄漏防护 ---
onUnmounted(() => {
  objectUrlCache.forEach(url => URL.revokeObjectURL(url));
  objectUrlCache.clear();
});
</script>

<style scoped>
.post-view-root {
  width: 100%;
  height: 100%;
}
</style>