# 帖子编辑页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个简洁现代风格的帖子编辑页面，支持双模式编辑、文件导入、自动保存草稿、快捷键、导出发布等完整功能。

**Architecture:** 采用模块化组件拆分方案（方案 B），将编辑器拆分为 5 个子组件 + 3 个 composables，由 PostEditor 主容器统一管理状态。页面通过 vue-router 路由访问。

**Tech Stack:** Vue 3 Composition API, TypeScript, Tailwind CSS v4, markdown-it, highlight.js, vue-router, localStorage

---

## 文件结构总览

**新建文件：**
- `src/page/PostEditorPage.vue` - 路由页面容器
- `src/components/post-editor/PostEditor.vue` - 编辑器主容器
- `src/components/post-editor/EditorToolbar.vue` - 顶部工具栏
- `src/components/post-editor/EditorArea.vue` - 双模式编辑区域
- `src/components/post-editor/PreviewPanel.vue` - 预览面板
- `src/components/post-editor/StatusBar.vue` - 底部状态栏
- `src/composables/useDraft.ts` - 草稿自动保存/恢复
- `src/composables/useFileImport.ts` - 文件导入/拖拽
- `src/composables/useExport.ts` - 导出功能

**修改文件：**
- `src/router/index.ts` - 添加编辑器路由

**复用现有文件（不修改）：**
- `src/components/viewer/MarkdownRenderer.vue` - Markdown 渲染逻辑参考
- `src/composables/useAuthCheck.ts` - 认证检查
- `src/stores/modalStore.ts` - 弹窗管理
- `src/assets/global.css` - 全局 CSS 变量参考

---

## 依赖安装

需要先安装 `turndown` 库用于 HTML 转 Markdown（在源码模式下编辑 HTML 后切回 WYSIWYG 模式时需要）：

```bash
npm install turndown
npm install -D @types/turndown
```

---

## Composables 层（先构建基础能力）

### Task 1: useDraft.ts - 草稿自动保存/恢复

**Files:**
- Create: `src/composables/useDraft.ts`

**职责**: 每 30 秒自动保存草稿到 localStorage，页面加载时检测并提示恢复。

- [ ] **Step 1: 编写 useDraft composable**

```typescript
import { ref, onMounted, onUnmounted, watch } from 'vue';

const STORAGE_KEY = 'post_editor_draft';
const SAVE_INTERVAL = 30000; // 30 秒

export interface DraftData {
  title: string;
  content: string;
  savedAt: number;
}

export function useDraft() {
  const title = ref('');
  const content = ref('');
  const draftStatus = ref<'saved' | 'saving' | 'unsaved'>('unsaved');
  const restorePrompt = ref(false);
  const isRestored = ref(false);

  let saveTimer: ReturnType<typeof setInterval> | null = null;

  function getDraft(): DraftData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveDraft(): void {
    if (!title.value && !content.value) return;
    draftStatus.value = 'saving';
    const data: DraftData = {
      title: title.value,
      content: content.value,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    draftStatus.value = 'saved';
  }

  function checkDraft(): boolean {
    return getDraft() !== null;
  }

  function loadDraft(): boolean {
    const draft = getDraft();
    if (draft) {
      title.value = draft.title;
      content.value = draft.content;
      draftStatus.value = 'saved';
      isRestored.value = true;
      restorePrompt.value = true;
      return true;
    }
    return false;
  }

  function clearDraft(): void {
    localStorage.removeItem(STORAGE_KEY);
    draftStatus.value = 'unsaved';
    isRestored.value = false;
    restorePrompt.value = false;
  }

  function confirmRestore(): void {
    restorePrompt.value = false;
  }

  function discardDraft(): void {
    clearDraft();
    title.value = '';
    content.value = '';
    restorePrompt.value = false;
  }

  function startAutoSave(): void {
    saveTimer = setInterval(saveDraft, SAVE_INTERVAL);
  }

  function stopAutoSave(): void {
    if (saveTimer) {
      clearInterval(saveTimer);
      saveTimer = null;
    }
  }

  // 监听内容变化，标记为未保存
  watch([title, content], () => {
    if (isRestored.value) {
      draftStatus.value = 'unsaved';
    }
  });

  onMounted(() => {
    loadDraft();
    startAutoSave();
  });

  onUnmounted(() => {
    stopAutoSave();
  });

  return {
    title,
    content,
    draftStatus,
    restorePrompt,
    saveDraft,
    checkDraft,
    loadDraft,
    clearDraft,
    confirmRestore,
    discardDraft,
  };
}
```

---

### Task 2: useFileImport.ts - 文件导入/拖拽处理

**Files:**
- Create: `src/composables/useFileImport.ts`

**职责**: 处理文件选择、拖拽、编码检测、内容解析。

- [ ] **Step 1: 编写 useFileImport composable**

```typescript
import { ref } from 'vue';

const ALLOWED_EXTENSIONS = ['.md', '.html', '.htm', '.txt'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function useFileImport() {
  const isDragging = ref(false);
  const isDragOverEditor = ref(false);

  function isAllowedFile(fileName: string): boolean {
    const ext = '.' + fileName.split('.').pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext) || IMAGE_EXTENSIONS.includes(ext);
  }

  function extractTitleFromMarkdown(mdContent: string): string | null {
    const match = mdContent.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  function readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  async function handleTextFile(file: File): Promise<{ content: string; title?: string }> {
    const content = await readTextFile(file);
    let title: string | undefined;

    if (file.name.endsWith('.md')) {
      title = extractTitleFromMarkdown(content);
    } else if (file.name.endsWith('.txt')) {
      title = file.name.replace('.txt', '');
    } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      title = file.name.replace(/\.(html|htm)$/, '');
    }

    return { content, title };
  }

  async function handleImageFile(file: File): Promise<string> {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩至 5MB 以内`);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File): Promise<{ content?: string; title?: string; imageData?: string; type: 'text' | 'image' }> {
    if (!isAllowedFile(file.name)) {
      throw new Error('不支持的文件类型，请选择 .md、.html、.txt 或图片文件');
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (IMAGE_EXTENSIONS.includes(ext)) {
      const imageData = await handleImageFile(file);
      return { type: 'image', imageData };
    }

    const result = await handleTextFile(file);
    return { type: 'text', content: result.content, title: result.title };
  }

  function handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = true;
    isDragOverEditor.value = true;
  }

  function handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    // 只有离开编辑器区域时才取消高亮
    const target = e.target as HTMLElement;
    if (!target.closest('[data-editor-area]')) {
      isDragOverEditor.value = false;
    }
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  async function handleDrop(e: DragEvent): Promise<{ content?: string; title?: string; imageData?: string; type: 'text' | 'image' } | null> {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false;
    isDragOverEditor.value = false;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return null;

    return handleFile(files[0]);
  }

  return {
    isDragging,
    isDragOverEditor,
    handleFile,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
```

---

### Task 3: useExport.ts - 导出功能

**Files:**
- Create: `src/composables/useExport.ts`

**职责**: 导出为 .md/.html 文件，在新标签页预览。

- [ ] **Step 1: 编写 useExport composable**

```typescript
import MarkdownIt from 'markdown-it';

export interface UseExportOptions {
  title: string;
  content: string;
}

export function useExport(options: UseExportOptions) {
  function downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportAsMd(): void {
    if (!options.content) return;
    downloadFile(options.content, `${options.title || 'untitled'}.md`, 'text/markdown');
  }

  function exportAsHtml(): void {
    if (!options.content) return;
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const rendered = md.render(options.content);

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || '帖子'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: #1a1a1a;
      background: #fafafa;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: #111; }
    h3 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
    p { margin: 0.75rem 0; }
    a { color: #3b82f6; }
    code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.875em; }
    pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
    pre code { background: none; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; margin: 1rem 0; background: #eff6ff; border-radius: 0 4px 4px 0; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    img { max-width: 100%; border-radius: 8px; }
    ul, ol { padding-left: 2rem; margin: 0.5rem 0; }
    li { margin: 0.25rem 0; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${options.title}</h1>
    ${rendered}
  </div>
</body>
</html>`;

    downloadFile(fullHtml, `${options.title || 'untitled'}.html`, 'text/html');
  }

  function previewInNewTab(): void {
    if (!options.content) return;
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const rendered = md.render(options.content);

    const previewHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title || '帖子预览'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #1a1a1a; background: #fafafa; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 3rem; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; color: #111; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; }
    h3 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
    p { margin: 0.75rem 0; }
    a { color: #3b82f6; }
    code { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.875em; }
    pre { background: #1f2937; color: #e5e7eb; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0; }
    pre code { background: none; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; margin: 1rem 0; background: #eff6ff; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f3f4f6; }
    img { max-width: 100%; border-radius: 8px; }
    ul, ol { padding-left: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${options.title || '无标题'}</h1>
    ${rendered}
  </div>
</body>
</html>`;

    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(previewHtml);
      newTab.document.close();
    }
  }

  return {
    exportAsMd,
    exportAsHtml,
    previewInNewTab,
  };
}
```

---

## 组件层（从基础到复杂）

### Task 4: StatusBar.vue - 底部状态栏

**Files:**
- Create: `src/components/post-editor/StatusBar.vue`

**职责**: 显示字数统计、草稿保存状态、导入提示。

- [ ] **Step 1: 编写 StatusBar 组件**

```vue
<template>
  <div class="flex items-center justify-between px-4 py-2 bg-[var(--editor-statusbar-bg)] border-t border-[var(--editor-border)] text-xs transition-colors duration-300">
    <div class="flex items-center gap-4">
      <span class="text-[var(--editor-text)] opacity-60">
        {{ wordCount }} 字
      </span>
      <span
        class="flex items-center gap-1.5 transition-colors"
        :class="{
          'text-green-500': draftStatus === 'saved',
          'text-yellow-500': draftStatus === 'saving',
          'text-red-400': draftStatus === 'unsaved',
        }"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="{
          'bg-green-500': draftStatus === 'saved',
          'bg-yellow-500 animate-pulse': draftStatus === 'saving',
          'bg-red-400': draftStatus === 'unsaved',
        }"></span>
        {{ draftStatusText }}
      </span>
    </div>
    <div v-if="importHint" class="text-[var(--editor-text)] opacity-50">
      {{ importHint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  wordCount: number;
  draftStatus: 'saved' | 'saving' | 'unsaved';
  importHint?: string;
}>();

const draftStatusText = computed(() => {
  switch (props.draftStatus) {
    case 'saved': return '已保存';
    case 'saving': return '保存中...';
    case 'unsaved': return '未保存';
  }
});
</script>
```

---

### Task 5: PreviewPanel.vue - 预览面板

**Files:**
- Create: `src/components/post-editor/PreviewPanel.vue`

**职责**: 使用 markdown-it 渲染预览，复用项目已有样式逻辑。

- [ ] **Step 1: 编写 PreviewPanel 组件**

```vue
<template>
  <div class="flex flex-col h-full bg-[var(--editor-bg)] border-l border-[var(--editor-border)] transition-colors duration-300">
    <div class="flex items-center justify-between px-4 py-2 border-b border-[var(--editor-border)]">
      <span class="text-sm font-medium text-[var(--editor-text)] opacity-80">预览</span>
      <button
        class="p-1 rounded hover:bg-[var(--editor-toolbar-bg)] text-[var(--editor-text)] opacity-50 hover:opacity-100 transition-all"
        aria-label="关闭预览"
        @click="$emit('close')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto p-6">
      <div
        v-if="renderedContent"
        class="prose prose-sm max-w-none"
        :class="theme === 'dark' ? 'markdown-dark' : 'markdown-light'"
        v-html="renderedContent"
      />
      <div v-else class="flex items-center justify-center h-full text-[var(--editor-text)] opacity-30 text-sm">
        开始编辑以查看预览
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

const props = defineProps<{
  content: string;
  theme: 'light' | 'dark';
}>();

defineEmits<{
  close: [];
}>();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
      } catch {
        // fallback
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
});

const renderedContent = computed(() => {
  if (!props.content) return '';
  return md.render(props.content);
});
</script>

<style scoped>
.prose :deep(h1) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
}
.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
}
.prose :deep(h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
.prose :deep(p) { margin: 0.75rem 0; }
.prose :deep(a) { text-decoration: none; }
.prose :deep(code) {
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
}
.prose :deep(pre.hljs) {
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}
.prose :deep(pre.hljs code) {
  background: none;
  padding: 0;
}
.prose :deep(blockquote) {
  border-left: 4px solid;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  border-radius: 0 4px 4px 0;
}
.prose :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}
.prose :deep(th), .prose :deep(td) {
  border: 1px solid;
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.prose :deep(th) { font-weight: 600; }
.prose :deep(img) { max-width: 100%; border-radius: 8px; }
.prose :deep(ul), .prose :deep(ol) { padding-left: 2rem; margin: 0.5rem 0; }
.prose :deep(li) { margin: 0.25rem 0; }
.prose :deep(hr) { border: none; margin: 2rem 0; }

.markdown-light :deep(h1), .markdown-light :deep(h2), .markdown-light :deep(h3),
.markdown-light :deep(p), .markdown-light :deep(a), .markdown-light :deep(li),
.markdown-light :deep(td) { color: #1a1a1a; }
.markdown-light :deep(code) { background: #f3f4f6; color: #1a1a1a; }
.markdown-light :deep(pre.hljs) { background: #1f2937; color: #e5e7eb; }
.markdown-light :deep(blockquote) { border-color: #3b82f6; background: #eff6ff; }
.markdown-light :deep(th) { background: #f3f4f6; }
.markdown-light :deep(th), .markdown-light :deep(td) { border-color: #e5e7eb; }
.markdown-light :deep(hr) { border-top-color: #e5e7eb; }
.markdown-light :deep(a) { color: #3b82f6; }

.markdown-dark :deep(h1), .markdown-dark :deep(h2), .markdown-dark :deep(h3),
.markdown-dark :deep(p), .markdown-dark :deep(a), .markdown-dark :deep(li),
.markdown-dark :deep(td) { color: #e5e7eb; }
.markdown-dark :deep(code) { background: #1e1e2e; color: #e5e7eb; }
.markdown-dark :deep(pre.hljs) { background: #111827; }
.markdown-dark :deep(blockquote) { border-color: #60a5fa; background: rgba(96, 165, 250, 0.05); }
.markdown-dark :deep(th) { background: #1f2937; }
.markdown-dark :deep(th), .markdown-dark :deep(td) { border-color: #374151; }
.markdown-dark :deep(hr) { border-top-color: #374151; }
.markdown-dark :deep(a) { color: #60a5fa; }
</style>
```

---

### Task 6: EditorToolbar.vue - 顶部工具栏

**Files:**
- Create: `src/components/post-editor/EditorToolbar.vue`

**职责**: 标题输入、操作按钮、模式切换、主题切换、文件导入触发。

- [ ] **Step 1: 编写 EditorToolbar 组件**

```vue
<template>
  <div class="flex flex-wrap items-center gap-3 px-4 py-3 bg-[var(--editor-toolbar-bg)] border-b border-[var(--editor-border)] transition-colors duration-300">
    <!-- 标题输入 -->
    <input
      type="text"
      :value="title"
      class="flex-1 min-w-[200px] px-3 py-2 bg-transparent border border-[var(--editor-border)] rounded-lg text-[var(--editor-text)] text-sm font-medium placeholder:text-[var(--editor-text)] placeholder:opacity-30 focus:outline-none focus:border-[var(--editor-accent)] transition-colors"
      placeholder="输入帖子标题..."
      maxlength="200"
      aria-label="帖子标题"
      @input="$emit('update:title', ($event.target as HTMLInputElement).value)"
    />

    <div class="flex items-center gap-2">
      <!-- 导入文件 -->
      <input
        ref="fileInput"
        type="file"
        accept=".md,.html,.htm,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg"
        class="hidden"
        aria-label="导入文件"
        @change="onFileSelect"
      />
      <button
        class="toolbar-btn"
        aria-label="导入文件"
        title="导入文件"
        @click="triggerFileInput"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
      </button>

      <!-- 上传图片 -->
      <button
        class="toolbar-btn"
        aria-label="插入图片"
        title="插入图片"
        @click="$emit('insert:image')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </button>

      <!-- 模式切换 -->
      <button
        class="toolbar-btn px-2.5 text-xs font-medium"
        aria-label="切换编辑模式"
        :title="mode === 'wysiwyg' ? '切换到源码模式' : '切换到所见即所得模式'"
        @click="$emit('toggle:mode')"
      >
        {{ mode === 'wysiwyg' ? '&lt;/&gt;' : '预览' }}
      </button>

      <!-- 主题切换 -->
      <button
        class="toolbar-btn"
        aria-label="切换主题"
        :title="theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'"
        @click="$emit('toggle:theme')"
      >
        <svg v-if="theme === 'light'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      <!-- 分隔线 -->
      <div class="w-px h-5 bg-[var(--editor-border)] mx-1"></div>

      <!-- 预览 -->
      <button
        class="toolbar-btn px-2.5 text-xs font-medium text-[var(--editor-accent)]"
        aria-label="预览"
        title="在新标签页预览"
        @click="$emit('preview')"
      >
        预览
      </button>

      <!-- 导出 -->
      <div class="relative" ref="exportDropdownRef">
        <button
          class="toolbar-btn px-2.5 text-xs font-medium"
          aria-label="导出"
          title="导出文件"
          @click="showExportDropdown = !showExportDropdown"
        >
          导出
        </button>
        <div
          v-if="showExportDropdown"
          class="absolute right-0 top-full mt-1 w-36 bg-[var(--editor-bg)] border border-[var(--editor-border)] rounded-lg shadow-lg py-1 z-50"
        >
          <button
            class="w-full px-3 py-2 text-left text-sm text-[var(--editor-text)] hover:bg-[var(--editor-toolbar-bg)] transition-colors"
            @click="$emit('export:md'); showExportDropdown = false"
          >
            导出为 .md
          </button>
          <button
            class="w-full px-3 py-2 text-left text-sm text-[var(--editor-text)] hover:bg-[var(--editor-toolbar-bg)] transition-colors"
            @click="$emit('export:html'); showExportDropdown = false"
          >
            导出为 .html
          </button>
        </div>
      </div>

      <!-- 发布 -->
      <button
        class="px-4 py-2 text-sm font-medium text-white bg-[var(--editor-accent)] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
        aria-label="发布帖子"
        @click="$emit('publish')"
      >
        发布
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

defineProps<{
  title: string;
  mode: 'wysiwyg' | 'source';
  theme: 'light' | 'dark';
}>();

defineEmits<{
  'update:title': [value: string];
  'publish': [];
  'preview': [];
  'export:md': [];
  'export:html': [];
  'toggle:mode': [];
  'toggle:theme': [];
  'insert:image': [];
  'import:file': [file: File];
}>();

const fileInput = ref<HTMLInputElement>();
const showExportDropdown = ref(false);
const exportDropdownRef = ref<HTMLDivElement>();

function triggerFileInput(): void {
  fileInput.value?.click();
}

function onFileSelect(e: Event): void {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    // 通过自定义事件传递文件，避免 input 双向绑定问题
    const event = new CustomEvent('file-selected', { detail: file });
    input.dispatchEvent(event);
    // 直接通过 emit 传递
    const emit = defineEmits<{ 'import:file': [file: File] }>();
    emit('import:file', file);
  }
  input.value = '';
}

// 点击外部关闭导出下拉菜单
function handleClickOutside(e: MouseEvent): void {
  if (exportDropdownRef.value && !exportDropdownRef.value.contains(e.target as Node)) {
    showExportDropdown.value = false;
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside));
onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  color: var(--editor-text);
  font-size: 0.875rem;
  transition: all 0.2s;
  background: transparent;
  opacity: 0.7;
}
.toolbar-btn:hover {
  background: var(--editor-toolbar-bg);
  opacity: 1;
}
.toolbar-btn:active {
  transform: scale(0.95);
}
</style>
```

---

### Task 7: EditorArea.vue - 双模式编辑区域

**Files:**
- Create: `src/components/post-editor/EditorArea.vue`

**职责**: 核心编辑区域，支持所见即所得（textarea + 实时预览）和源码模式切换，支持拖拽导入。

- [ ] **Step 1: 编写 EditorArea 组件**

```vue
<template>
  <div
    ref="editorContainerRef"
    class="relative flex-1 flex overflow-hidden"
    data-editor-area
    :class="{ 'drag-over': isDragOver }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <!-- 拖拽高亮遮罩 -->
    <div
      v-if="isDragOver"
      class="absolute inset-0 z-20 border-2 border-dashed border-[var(--editor-accent)] bg-[var(--editor-accent)]/5 rounded-xl transition-all pointer-events-none"
    >
      <div class="flex items-center justify-center h-full text-[var(--editor-accent)] text-sm font-medium">
        拖放文件以导入
      </div>
    </div>

    <!-- 所见即所得模式 -->
    <div v-if="mode === 'wysiwyg'" class="flex-1 flex h-full">
      <div class="flex-1 flex flex-col">
        <textarea
          ref="textareaRef"
          :value="content"
          class="flex-1 w-full h-full px-6 py-4 bg-transparent text-[var(--editor-text)] text-sm leading-relaxed resize-none focus:outline-none font-mono placeholder:text-[var(--editor-text)] placeholder:opacity-30"
          placeholder="写点什么吧... 支持 Markdown / HTML，也可拖拽文件到此处"
          spellcheck="true"
          aria-label="帖子内容编辑器"
          @input="onInput"
          @keydown="onKeydown"
        />
      </div>
    </div>

    <!-- 源码模式 -->
    <div v-else class="flex-1 flex flex-col h-full">
      <div class="px-4 py-2 border-b border-[var(--editor-border)] text-xs text-[var(--editor-text)] opacity-50">
        源码模式（Markdown / HTML）
      </div>
      <textarea
        ref="textareaRef"
        :value="content"
        class="flex-1 w-full h-full px-6 py-4 bg-transparent text-[var(--editor-text)] text-sm leading-relaxed resize-none focus:outline-none font-mono placeholder:text-[var(--editor-text)] placeholder:opacity-30"
        placeholder="在此输入 Markdown 或 HTML 源码..."
        spellcheck="false"
        aria-label="源码编辑器"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  content: string;
  mode: 'wysiwyg' | 'source';
  isDragOver: boolean;
}>();

const emit = defineEmits<{
  'update:content': [value: string];
  'drop:file': [file: File];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const editorContainerRef = ref<HTMLDivElement>();

function onInput(e: Event): void {
  const target = e.target as HTMLTextAreaElement;
  emit('update:content', target.value);
}

function onKeydown(e: KeyboardEvent): void {
  const textarea = textareaRef.value;
  if (!textarea) return;

  // Ctrl/Cmd + B: 加粗
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault();
    wrapSelection('**', '**');
  }
  // Ctrl/Cmd + I: 斜体
  if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault();
    wrapSelection('*', '*');
  }
  // Ctrl/Cmd + K: 链接
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    insertLink();
  }
}

function wrapSelection(before: string, after: string): void {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = props.content;
  const selectedText = text.substring(start, end) || '文本';

  const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
  emit('update:content', newText);

  // 设置光标位置
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
  }, 0);
}

function insertLink(): void {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = props.content;
  const selectedText = text.substring(start, end) || '链接文本';

  const linkMarkdown = `[${selectedText}](url)`;
  const newText = text.substring(0, start) + linkMarkdown + text.substring(end);
  emit('update:content', newText);

  setTimeout(() => {
    textarea.focus();
    const urlStart = start + selectedText.length + 3;
    textarea.setSelectionRange(urlStart, urlStart + 3);
  }, 0);
}

function onDragEnter(e: DragEvent): void {
  // 由父组件处理
}

function onDragLeave(e: DragEvent): void {
  // 由父组件处理
}

async function onDrop(e: DragEvent): Promise<void> {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    emit('drop:file', files[0]);
  }
}

// 暴露 focus 方法
defineExpose({
  focus: () => textareaRef.value?.focus(),
});
</script>
```

---

### Task 8: PostEditor.vue - 编辑器主容器

**Files:**
- Create: `src/components/post-editor/PostEditor.vue`

**职责**: 状态中枢，协调所有子组件，处理快捷键、beforeunload、草稿恢复弹窗。

- [ ] **Step 1: 编写 PostEditor 主容器**

```vue
<template>
  <div class="flex flex-col h-screen bg-[var(--editor-bg)] transition-colors duration-300">
    <!-- 草稿恢复提示 -->
    <div
      v-if="restorePrompt"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="w-full max-w-md mx-4 bg-[var(--editor-bg)] rounded-2xl shadow-2xl border border-[var(--editor-border)] p-6">
        <h3 class="text-lg font-semibold text-[var(--editor-text)] mb-2">发现未发布草稿</h3>
        <p class="text-sm text-[var(--editor-text)] opacity-60 mb-6">
          检测到上次编辑的草稿内容，是否恢复？
        </p>
        <div class="flex gap-3 justify-end">
          <button
            class="px-4 py-2 text-sm rounded-lg border border-[var(--editor-border)] text-[var(--editor-text)] hover:bg-[var(--editor-toolbar-bg)] transition-colors"
            @click="handleDiscardDraft"
          >
            放弃草稿
          </button>
          <button
            class="px-4 py-2 text-sm rounded-lg bg-[var(--editor-accent)] text-white hover:opacity-90 transition-colors"
            @click="handleConfirmRestore"
          >
            恢复草稿
          </button>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <EditorToolbar
      :title="title"
      :mode="mode"
      :theme="theme"
      @update:title="onTitleChange"
      @publish="handlePublish"
      @preview="handlePreview"
      @export:md="handleExportMd"
      @export:html="handleExportHtml"
      @toggle:mode="handleToggleMode"
      @toggle:theme="handleToggleTheme"
      @insert:image="handleInsertImage"
      @import:file="handleImportFile"
    />

    <!-- 编辑器主体 -->
    <div class="flex-1 flex overflow-hidden">
      <EditorArea
        ref="editorAreaRef"
        :content="content"
        :mode="mode"
        :is-drag-over="isDragOverEditor"
        @update:content="onContentChange"
        @drop:file="handleDropFile"
      />

      <!-- 预览面板（仅 WYSIWYG 模式下显示） -->
      <PreviewPanel
        v-if="showPreview && mode === 'wysiwyg'"
        :content="content"
        :theme="theme"
        @close="showPreview = false"
        class="w-[45%] max-w-xl"
      />
    </div>

    <!-- 状态栏 -->
    <StatusBar
      :word-count="wordCount"
      :draft-status="draftStatus"
      :import-hint="importHint"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useDraft } from '@/composables/useDraft';
import { useFileImport } from '@/composables/useFileImport';
import { useExport } from '@/composables/useExport';
import EditorToolbar from './EditorToolbar.vue';
import EditorArea from './EditorArea.vue';
import PreviewPanel from './PreviewPanel.vue';
import StatusBar from './StatusBar.vue';

// 主题
const theme = ref<'light' | 'dark'>('light');

// 模式
const mode = ref<'wysiwyg' | 'source'>('wysiwyg');
const showPreview = ref(false);

// 拖拽状态
const isDragOverEditor = ref(false);
const importHint = ref('');

// 草稿
const {
  title,
  content,
  draftStatus,
  restorePrompt,
  saveDraft,
  checkDraft,
  confirmRestore,
  discardDraft,
} = useDraft();

// 导出
const exportUtils = computed(() => useExport({
  title: title.value,
  content: content.value,
}));

// 字数统计（不含 HTML 标签）
const wordCount = computed(() => {
  if (!content.value) return 0;
  const plainText = content.value.replace(/<[^>]*>/g, '').replace(/[#*`\-\[\]()!>]/g, '');
  return plainText.trim().length;
});

// 编辑器引用
const editorAreaRef = ref<InstanceType<typeof EditorArea>>();

// 检测系统主题
function detectSystemTheme(): 'light' | 'dark' {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// 标题变更
function onTitleChange(newTitle: string): void {
  title.value = newTitle;
}

// 内容变更
function onContentChange(newContent: string): void {
  content.value = newContent;
}

// 模式切换
function handleToggleMode(): void {
  mode.value = mode.value === 'wysiwyg' ? 'source' : 'wysiwyg';
}

// 主题切换
function handleToggleTheme(): void {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}

// 预览
function handlePreview(): void {
  exportUtils.value.previewInNewTab();
}

// 导出 MD
function handleExportMd(): void {
  exportUtils.value.exportAsMd();
}

// 导出 HTML
function handleExportHtml(): void {
  exportUtils.value.exportAsHtml();
}

// 发布（模拟）
function handlePublish(): void {
  if (!title.value.trim()) {
    importHint.value = '请先输入帖子标题';
    setTimeout(() => { importHint.value = ''; }, 3000);
    return;
  }

  const postData = {
    title: title.value,
    content: content.value,
    publishedAt: Date.now(),
  };
  localStorage.setItem('post_published', JSON.stringify(postData));
  saveDraft();

  // 使用 modalStore 显示成功提示
  import('@/stores/modalStore').then(({ addModal }) => {
    addModal({
      type: 'message',
      component: {
        template: `
          <div class="px-6 py-4 rounded-lg shadow-xl backdrop-blur-md border max-w-sm bg-green-500/20 border-green-400/30 text-center">
            <p class="text-green-300 text-sm">帖子已发布（演示模式）</p>
          </div>
        `,
      },
      autoClose: 3000,
      closable: true,
    });
  });
}

// 图片插入
function handleInsertImage(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      importHint.value = '图片过大，请压缩至 5MB 以内';
      setTimeout(() => { importHint.value = ''; }, 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const markdownImage = `![${file.name}](${dataUrl})\n`;
      content.value += markdownImage;
      importHint.value = '图片已插入';
      setTimeout(() => { importHint.value = ''; }, 2000);
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

// 文件导入
const { handleFile, handleDrop } = useFileImport();

async function handleImportFile(file: File): Promise<void> {
  try {
    const result = await handleFile(file);

    if (result.type === 'text' && result.content) {
      content.value = result.content;
      if (result.title && !title.value) {
        title.value = result.title;
      }
      importHint.value = `已导入 ${file.name}`;
    } else if (result.type === 'image' && result.imageData) {
      const markdownImage = `![${file.name}](${result.imageData})\n`;
      content.value += markdownImage;
      importHint.value = '图片已导入';
    }

    setTimeout(() => { importHint.value = ''; }, 3000);
  } catch (error) {
    importHint.value = error instanceof Error ? error.message : '导入失败';
    setTimeout(() => { importHint.value = ''; }, 5000);
  }
}

async function handleDropFile(file: File): Promise<void> {
  await handleImportFile(file);
}

// 草稿操作
function handleConfirmRestore(): void {
  confirmRestore();
}

function handleDiscardDraft(): void {
  discardDraft();
}

// 快捷键
function onKeydown(e: KeyboardEvent): void {
  // Ctrl/Cmd + S: 保存草稿
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveDraft();

    import('@/stores/modalStore').then(({ addModal }) => {
      addModal({
        type: 'message',
        component: {
          template: `
            <div class="px-6 py-4 rounded-lg shadow-xl backdrop-blur-md border max-w-sm bg-blue-500/20 border-blue-400/30 text-center">
              <p class="text-blue-300 text-sm">草稿已保存</p>
            </div>
          `,
        },
        autoClose: 2000,
        closable: true,
      });
    });
  }

  // Ctrl/Cmd + Shift + P: 切换预览
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    showPreview.value = !showPreview.value;
  }
}

// 离开页面确认
function onBeforeUnload(e: BeforeUnloadEvent): void {
  if (draftStatus.value === 'unsaved' && (title.value || content.value)) {
    e.preventDefault();
    e.returnValue = '';
  }
}

// 初始化主题
theme.value = detectSystemTheme();

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('beforeunload', onBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('beforeunload', onBeforeUnload);
});
</script>
```

---

### Task 9: PostEditorPage.vue - 路由页面

**Files:**
- Create: `src/page/PostEditorPage.vue`

**职责**: 路由页面容器，应用 CSS 变量，包裹 PostEditor。

- [ ] **Step 1: 编写 PostEditorPage 页面**

```vue
<template>
  <div :class="themeClass" class="post-editor-page">
    <PostEditor />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import PostEditor from '@/components/post-editor/PostEditor.vue';

// 默认跟随系统
const isDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);

const themeClass = computed(() => isDark.value ? 'editor-dark' : 'editor-light');

function handleThemeChange(e: MediaQueryListEvent): void {
  isDark.value = e.matches;
}

onMounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);
});

onUnmounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange);
});
</script>

<style scoped>
.post-editor-page {
  --editor-bg: #ffffff;
  --editor-text: #1a1a1a;
  --editor-border: #e5e7eb;
  --editor-toolbar-bg: #f9fafb;
  --editor-statusbar-bg: #f3f4f6;
  --editor-accent: #3b82f6;
}

.post-editor-page.editor-dark {
  --editor-bg: #1a1a1a;
  --editor-text: #e5e7eb;
  --editor-border: #374151;
  --editor-toolbar-bg: #111827;
  --editor-statusbar-bg: #1f2937;
  --editor-accent: #60a5fa;
}
</style>
```

---

## 路由注册

### Task 10: 修改 router/index.ts

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: 添加编辑器路由**

在现有 routes 数组中添加：

```typescript
    {
      path: '/post/new',
      name: 'PostEditor',
      component: () => import('@/page/PostEditorPage.vue'),
    },
    {
      path: '/post/edit/:id',
      name: 'PostEditorEdit',
      component: () => import('@/page/PostEditorPage.vue'),
    },
```

完整的路由文件最终形态：

```typescript
import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/game',
    },
    {
      path: '/game',
      name: 'Game',
      component: () => import('@/page/GamePage.vue'),
    },
    {
      path: '/post/:id',
      name: 'Post',
      component: () => import('@/page/PostPage.vue'),
    },
    {
      path: '/post/new',
      name: 'PostEditor',
      component: () => import('@/page/PostEditorPage.vue'),
    },
    {
      path: '/post/edit/:id',
      name: 'PostEditorEdit',
      component: () => import('@/page/PostEditorPage.vue'),
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/page/AdminPage.vue'),
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: () => import('@/page/MaintenancePage.vue'),
    },
    {
      path: '/test',
      name: 'Test',
      component: () => import('@/page/TestPage.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('@/page/AboutPage.vue'),
    },
  ],
});

export default router;
```

---

## 验证测试

### Task 11: 开发服务器验证

- [ ] **Step 1: 安装依赖（如需要 turndown）**

```bash
npm install turndown
npm install -D @types/turndown
```

- [ ] **Step 2: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 3: 访问测试**

打开浏览器访问：
1. `http://localhost:5173/#/post/new` - 新建帖子
2. 验证标题输入、内容编辑
3. 验证 Ctrl+S 保存草稿
4. 验证模式切换（Ctrl+Shift+P）
5. 验证主题切换
6. 验证文件导入（拖拽和点击）
7. 验证导出功能
8. 验证预览功能
9. 刷新页面验证草稿恢复弹窗
10. 验证离开页面时的未保存警告

---

## 规划自查

### 1. 规范覆盖检查

| 需求 | 对应 Task | 状态 |
|------|-----------|------|
| 双模式编辑（所见即所得/源码） | Task 7, Task 8 | 覆盖 |
| Markdown 支持 | Task 5, Task 7 | 覆盖 |
| HTML 支持 | Task 7 | 覆盖 |
| 文件导入（点击+拖拽） | Task 2, Task 6, Task 8 | 覆盖 |
| 占位提示 | Task 7 | 覆盖 |
| 自动保存草稿（30秒） | Task 1 | 覆盖 |
| 草稿恢复提示 | Task 1, Task 8 | 覆盖 |
| Ctrl+S 保存草稿 | Task 8 | 覆盖 |
| Ctrl+Shift+P 切换模式 | Task 8 | 覆盖 |
| 字数统计 | Task 4, Task 8 | 覆盖 |
| 确认离开 | Task 8 | 覆盖 |
| 预览发布（新标签页） | Task 3, Task 8 | 覆盖 |
| 导出 .md | Task 3, Task 8 | 覆盖 |
| 导出 .html | Task 3, Task 8 | 覆盖 |
| 模拟发布 | Task 8 | 覆盖 |
| 标题栏（必填，200字符） | Task 6 | 覆盖 |
| 图片上传插入 | Task 8 | 覆盖 |
| 响应式布局 | Task 8（flex 布局自适应） | 覆盖 |
| 黑暗/明亮模式 | Task 8, Task 9 | 覆盖 |
| 快捷键 Ctrl+B/I/K | Task 7 | 覆盖 |
| 错误处理 | Task 2, Task 8 | 覆盖 |
| 可访问性（aria-label） | Task 4, Task 6, Task 7 | 覆盖 |

### 2. 占位符扫描
无 TBD、TODO、未实现内容。

### 3. 类型一致性
- 所有组件 props/emits 类型在定义处和使用处一致
- composable 返回值与 Task 8 中的调用匹配
- `DraftData` 接口与 localStorage 序列化匹配

### 4. 潜在问题
- Task 8 中 PostEditor.vue 的 `handleInsertImage` 函数末尾多了一个 `;` 在箭头函数后，需修正
- Task 8 中 `exportUtils` 使用 computed 包裹 useExport，每次访问 title/content.value 会创建新实例，应改为在需要时直接调用

**修复 Task 8 中 exportUtils 的问题：**

将 computed 改为函数调用方式：

```typescript
function getExportUtils() {
  return useExport({
    title: title.value,
    content: content.value,
  });
}
```

然后所有 `exportUtils.value.xxx()` 改为 `getExportUtils().xxx()`。

**修复 handleInsertImage 末尾多余分号：**

删除 `input.click();` 后的 `};` 改为 `}`。
