<template>
  <div
      class="relative flex overflow-hidden transition-all duration-300"
      :class="{ 'border-2 border-dashed border-(--editor-accent) bg-(--editor-accent)/5': isDragOver }"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @dragover.prevent
      @drop.prevent="onDrop"
  >
    <div
        v-if="isDragOver"
        class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
    >
      <div class="text-(--editor-accent) text-lg font-medium bg-(--editor-bg) px-6 py-3 rounded-xl shadow-lg border border-(--editor-accent)/30 backdrop-blur-sm">
        松开鼠标以导入本地文件
      </div>
    </div>

    <textarea
        ref="textareaRef"
        :value="content"
        class="w-full h-full px-6 py-4 bg-transparent text-(--editor-text) text-sm leading-relaxed resize-none focus:outline-none font-mono placeholder:text-(--editor-text) placeholder:opacity-30"
        placeholder="写点什么吧... 支持 Markdown，也可直接拖拽 HTML/MD/TXT 等本地文档到此处解析"
        spellcheck="true"
        @input="onInput"
        @keydown="onKeydown"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  content: string;
  mode: 'wysiwyg' | 'source';
}>();

const emit = defineEmits<{
  'update:content': [value: string];
  'file-drop': [file: File];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isDragOver = ref(false);
let dragCounter = 0;

function onInput(e: Event) {
  emit('update:content', (e.target as HTMLTextAreaElement).value);
}

function onKeydown(e: KeyboardEvent) {
  // 支持 Tab 键缩进
  if (e.key === 'Tab') {
    e.preventDefault();
    insertText('  ');
  }
}

// 核心升级：支持前缀和后缀，实现 Markdown 语法自动包裹
function insertText(prefix: string, suffix: string = '') {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentContent = props.content;
  const selectedText = currentContent.substring(start, end);

  // 拼接新内容：前文 + 语法前缀 + 选中的文字 + 语法后缀 + 后文
  const newContent = currentContent.substring(0, start) + prefix + selectedText + suffix + currentContent.substring(end);
  emit('update:content', newContent);

  // 智能恢复光标位置
  setTimeout(() => {
    textarea.focus();
    if (selectedText) {
      // 选中了文字：保持包裹后的文字整体被选中
      textarea.setSelectionRange(start, start + prefix.length + selectedText.length + suffix.length);
    } else {
      // 没选中文字：光标精准停留在前缀和后缀之间，方便小白直接打字
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }
  }, 0);
}

function onDragEnter(e: DragEvent) {
  dragCounter++;
  isDragOver.value = true;
}

function onDragLeave(e: DragEvent) {
  dragCounter--;
  if (dragCounter === 0) {
    isDragOver.value = false;
  }
}

function onDrop(e: DragEvent) {
  dragCounter = 0;
  isDragOver.value = false;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    emit('file-drop', files[0]);
  }
}

defineExpose({
  insertText
});
</script>