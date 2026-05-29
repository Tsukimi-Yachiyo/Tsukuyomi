# 帖子编辑页设计文档

> 创建时间: 2026-05-24
> 状态: 已批准，待实现

## 1. 需求概述

开发一个"帖子编辑页"前端界面，支持双模式编辑（所见即所得/源码）、文件导入、自动保存草稿、快捷键、导出发布等功能。采用简洁现代风格（类似 Notion/Typora），独立于项目现有的海洋主题。

## 2. 技术选型

- **框架**: Vue 3 Composition API + `<script setup lang="ts">`
- **Markdown 解析**: markdown-it（项目已有）
- **代码高亮**: highlight.js（项目已有）
- **样式**: Tailwind CSS v4（项目已有）
- **路由**: vue-router（项目已有），添加 `/post/new`、`/post/edit/:id`
- **状态管理**: 组件内部 ref/reactive（无需 Pinia）

## 3. 文件结构

```
src/
├── page/
│   └── PostEditorPage.vue          # 页面容器（路由入口）
├── components/
│   └── post-editor/
│       ├── PostEditor.vue          # 编辑器主容器（状态管理、子组件协调）
│       ├── EditorToolbar.vue       # 顶部工具栏
│       ├── EditorArea.vue          # 双模式编辑区域核心
│       ├── PreviewPanel.vue        # 可折叠预览面板
│       └── StatusBar.vue           # 底部状态栏
├── composables/
│   ├── useDraft.ts                 # 草稿自动保存/恢复逻辑
│   ├── useFileImport.ts            # 文件导入/拖拽处理
│   └── useExport.ts                # 导出为 MD/HTML 逻辑
└── router/
    └── index.ts                    # 修改：添加编辑器路由
```

## 4. 组件架构

### 4.1 PostEditorPage.vue
- 路由页面容器，包裹 PostEditor 组件
- 处理路由参数（判断是新建还是编辑模式）
- 应用全局主题样式

### 4.2 PostEditor.vue
- **核心状态**:
  - `title: ref<string>` - 帖子标题
  - `content: ref<string>` - 编辑器内容
  - `mode: ref<'wysiwyg'|'source'>` - 编辑模式
  - `theme: ref<'light'|'dark'>` - 主题
  - `isDirty: ref<boolean>` - 未保存标记
  - `showPreview: ref<boolean>` - 是否显示预览面板
  - `wordCount: computed<number>` - 字数统计
  - `draftStatus: ref<'saved'|'saving'|'unsaved'>` - 草稿状态

- **核心职责**:
  - 监听 `beforeunload` 事件（确认离开）
  - 注册全局快捷键（Ctrl+S、Ctrl+Shift+P）
  - 协调子组件间数据流

### 4.3 EditorToolbar.vue
- **Props**: `title`, `mode`, `theme`, `draftStatus`
- **Emits**: 
  - `update:title` - 标题更新
  - `publish` - 发布
  - `preview` - 预览
  - `export:md` - 导出 MD
  - `export:html` - 导出 HTML
  - `import` - 导入文件
  - `toggle:mode` - 切换模式
  - `toggle:theme` - 切换主题
  - `insert:image` - 插入图片

### 4.4 EditorArea.vue
- **Props**: `content`, `mode`
- **Emits**: `update:content`
- **功能**:
  - WYSIWYG: textarea + markdown-it 实时预览
  - 源码模式: textarea 显示原始代码
  - 拖拽文件导入高亮动效
  - 占位提示

### 4.5 PreviewPanel.vue
- **Props**: `content`
- **功能**: 使用 markdown-it 渲染预览，复用 `.markdown-body` 样式

### 4.6 StatusBar.vue
- **Props**: `wordCount`, `draftStatus`
- **功能**: 显示字数、草稿状态、导入提示

## 5. Composables 设计

### 5.1 useDraft.ts
```typescript
interface UseDraftOptions {
  saveInterval?: number;  // 默认 30000ms
  storageKey?: string;    // 默认 'post_editor_draft'
}

interface UseDraftReturn {
  content: Ref<string>;
  title: Ref<string>;
  draftStatus: Ref<'saved' | 'saving' | 'unsaved'>;
  saveDraft: () => void;
  loadDraft: () => boolean;  // 返回是否有草稿
  clearDraft: () => void;
  checkDraft: () => boolean;
  restorePrompt: Ref<boolean>;
}
```

### 5.2 useFileImport.ts
```typescript
interface UseFileImportReturn {
  isDragging: Ref<boolean>;
  handleFile: (file: File) => Promise<{ content: string; title?: string }>;
  handleDrop: (e: DragEvent) => Promise<void>;
}
```

### 5.3 useExport.ts
```typescript
interface UseExportOptions {
  title: string;
  content: string;
  mode: 'wysiwyg' | 'source';
}

interface UseExportReturn {
  exportAsMd: () => void;
  exportAsHtml: () => void;
  previewInNewTab: () => void;
}
```

## 6. 样式设计

### 6.1 主题变量
```css
/* 浅色主题（默认） */
--editor-bg: #ffffff;
--editor-text: #1a1a1a;
--editor-border: #e5e7eb;
--editor-toolbar-bg: #f9fafb;
--editor-statusbar-bg: #f3f4f6;
--editor-accent: #3b82f6;

/* 深色主题 */
--editor-bg: #1a1a1a;
--editor-text: #e5e7eb;
--editor-border: #374151;
--editor-toolbar-bg: #111827;
--editor-statusbar-bg: #1f2937;
--editor-accent: #60a5fa;
```

### 6.2 响应式断点
- 手机（< 640px）：单列，工具栏折叠
- 平板（640px - 1024px）：双列可切换
- 桌面（> 1024px）：编辑器 + 右侧预览面板

## 7. 快捷键

| 快捷键 | 行为 |
|--------|------|
| Ctrl/Cmd + S | 保存草稿 |
| Ctrl/Cmd + Shift + P | 切换预览/源码模式 |
| Ctrl/Cmd + B | 加粗选中文本 |
| Ctrl/Cmd + I | 斜体选中文本 |
| Ctrl/Cmd + K | 插入链接 |

## 8. 错误处理

- 文件类型不支持：提示 "不支持该文件类型，请选择 .md、.html 或 .txt 文件"
- 图片过大（> 5MB）：提示 "图片过大，请压缩后上传"
- 解析失败：提示 "文件解析失败，请检查文件编码是否为 UTF-8"
- 未保存离开：浏览器默认 confirm 对话框

## 9. 可访问性

- 所有按钮带 `aria-label`
- 编辑器区域带 `role="textbox"`
- 键盘导航支持（Tab 顺序）
- 对比度符合 WCAG 2.1 AA 标准
