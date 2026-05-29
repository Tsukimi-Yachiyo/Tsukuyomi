<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch {
        // fallback
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

md.renderer.rules.media_placeholder = function(tokens: any[], idx: number) {
  return tokens[idx].content
}

function renderMediaTags(text: string): string {
  return text.replace(/\{\{media:([^}]+)\}\}/g, (_match, fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const mediaSrc = `/file/public?fileName=${encodeURIComponent(fileName)}`

    if (['mp4', 'webm', 'ogg'].includes(ext)) {
      return `<video controls preload="metadata" class="max-w-full rounded-lg"><source src="${mediaSrc}" type="video/${ext}">您的浏览器不支持视频播放</video>`
    }
    if (['mp3', 'wav', 'aac'].includes(ext)) {
      return `<audio controls preload="metadata" class="w-full"><source src="${mediaSrc}" type="audio/${ext}">您的浏览器不支持音频播放</audio>`
    }
    return `<img src="${mediaSrc}" alt="${fileName}" class="max-w-full rounded-lg" loading="lazy" />`
  })
}

const rendered = computed(() => {
  const html = md.render(props.content)
  return renderMediaTags(html)
})
</script>

<template>
  <div class="markdown-body" v-html="rendered" />
</template>

<style>
@import 'highlight.js/styles/github-dark.css';

.markdown-body {
  color: #e5e7eb;
  line-height: 1.8;
  word-break: break-word;
  display: flow-root;
  /* 🌟 核心修复：为整个 Markdown 容器提供统一的左右留白 */
  padding: 0 1.5rem;
}

.markdown-body h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
  margin-top: 3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #374151;
  /* 已移除 padding-left */
}

.markdown-body h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin-top: 2.25rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid #374151;
  /* 已移除 padding-left */
}

.markdown-body h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  /* 已移除 padding-left */
}

.markdown-body h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-top: 1rem;
  margin-bottom: 0.375rem;
  /* 已移除 padding-left */
}

.markdown-body p {
  margin: 0.75rem 0;
  /* 已移除 padding-left */
}

.markdown-body a {
  color: #60a5fa;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body code {
  background: #1e1e2e;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.875em;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
}

.markdown-body pre.hljs {
  background: #111827;
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
  /* 已移除 margin-left */
}

.markdown-body pre.hljs code {
  background: none;
  padding: 0;
  font-size: 0.85em;
}

.markdown-body blockquote {
  border-left: 4px solid #60a5fa;
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background: rgba(96, 165, 250, 0.05);
  border-radius: 0 4px 4px 0;
  /* 已移除 margin-left */
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2rem; /* 仅保留列表项的缩进 */
  margin: 0.5rem 0;
}

.markdown-body li {
  margin: 0.25rem 0;
}

.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
  /* 已移除 margin-left */
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #374151;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-body th {
  background: #1f2937;
  font-weight: 600;
}

.markdown-body tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
}

.markdown-body hr {
  border: none;
  border-top: 1px solid #374151;
  margin-left: 0;
  margin-right: 0;
  /* 已移除 margin-left */
}
</style>
