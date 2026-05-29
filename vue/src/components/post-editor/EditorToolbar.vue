<template>
  <div class="flex flex-col bg-(--editor-toolbar-bg) text-(--editor-text) border-b border-(--editor-border) transition-colors duration-300">
    <div class="flex flex-wrap items-center justify-between px-4 py-2 border-b border-(--editor-border)">

      <div class="flex items-center gap-1">
        <input
            ref="fileInput"
            type="file"
            accept=".md,.html,.htm,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.webm,.ogg,.mp3,.wav,.aac"
            class="hidden"
            @change="onFileSelect"
        />
        <button
            class="inline-flex items-center justify-center p-2 rounded-md transition-colors text-sm font-medium hover:bg-(--editor-hover-bg)"
            title="导入本地文件 (HTML/MD/TXT/多媒体)"
            @click="triggerFileInput"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
        </button>
        <button
            class="inline-flex items-center justify-center p-2 rounded-md transition-colors text-sm font-medium hover:bg-(--editor-hover-bg)"
            title="插入图片"
            @click="$emit('insert:image')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        </button>

        <div class="w-px h-5 bg-(--editor-border) mx-2"></div>

        <button class="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-(--editor-hover-bg) font-serif font-bold text-[15px]" title="加粗 (**文字**)" @click="$emit('format', '**', '**')">
          B
        </button>
        <button class="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-(--editor-hover-bg) font-serif italic text-[15px]" title="斜体 (*文字*)" @click="$emit('format', '*', '*')">
          I
        </button>
        <button class="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-(--editor-hover-bg) font-bold text-[14px]" title="标题 (# 文字)" @click="$emit('format', '\n### ', '\n')">
          H
        </button>
        <button class="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-(--editor-hover-bg) font-serif font-bold text-[18px]" title="引用 (> 文字)" @click="$emit('format', '\n> ', '\n')">
          ”
        </button>
        <button class="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-(--editor-hover-bg)" title="代码块" @click="$emit('format', '\n```\n', '\n```\n')">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        </button>
        <button class="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-(--editor-hover-bg)" title="无序列表 (- 文字)" @click="$emit('format', '\n- ', '')">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>

      <div class="flex items-center gap-1">
        <button
            class="inline-flex items-center justify-center p-2 rounded-md transition-colors text-sm font-medium hover:bg-(--editor-hover-bg)"
            :title="theme === 'dark' ? '切换亮色' : '切换暗色'"
            @click="$emit('toggle:theme')"
        >
          <svg v-if="theme === 'dark'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>

        <button
            class="inline-flex items-center justify-center p-2 rounded-md transition-colors text-sm font-medium"
            :class="{ 'bg-(--editor-accent) text-white': showPreview, 'text-(--editor-text) hover:bg-(--editor-hover-bg)': !showPreview }"
            title="开启/关闭双栏预览"
            @click="$emit('toggle:preview')"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>

        <div class="w-px h-5 bg-(--editor-border) mx-2"></div>

        <button class="px-5 py-1.5 text-sm font-medium rounded-lg bg-(--editor-accent) text-white hover:opacity-90 transition-opacity active:scale-95" @click="$emit('publish')">
          发布帖子
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  mode: 'wysiwyg' | 'source';
  theme: 'light' | 'dark';
  showPreview: boolean;
}>();

const emit = defineEmits<{
  'update:title': [value: string];
  'publish': [];
  'toggle:mode': [];
  'toggle:theme': [];
  'toggle:preview': [];
  'insert:image': [];
  'import:file': [file: File];
  'format': [prefix: string, suffix: string]; // 新增格式化事件
}>();

const fileInput = ref<HTMLInputElement>();

function triggerFileInput(): void {
  fileInput.value?.click();
}

function onFileSelect(e: Event): void {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    emit('import:file', file);
  }
  input.value = '';
}
</script>