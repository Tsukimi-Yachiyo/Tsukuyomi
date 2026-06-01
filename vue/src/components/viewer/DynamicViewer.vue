<template>
  <div ref="containerRef" :class="fullscreen ? 'w-full h-full' : 'dynamic-viewer-container'">
    <!-- 占位符 -->
    <div v-if="!shouldLoad && !fullscreen" class="viewer-placeholder">
      <div class="placeholder-spinner" />
      <span class="text-sm text-white/40">等待滚动加载...</span>
    </div>

    <!-- 加载中 -->
    <div v-else-if="loading" class="viewer-loading">
      <div class="loading-spinner" />
      <span class="text-sm text-white/60">加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="viewer-error">
      <svg class="w-10 h-10 mb-3 text-red-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
      <p class="text-sm text-white/70">{{ error }}</p>
    </div>

    <!-- iframe（HTML/ZIP 解压后的内容） -->
    <iframe
      v-else-if="iframeSrc"
      :src="iframeSrc"
      :class="fullscreen ? 'w-full h-full border-0' : 'viewer-iframe'"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      allow="fullscreen"
    />

    <!-- Vue动态组件 -->
    <component v-else-if="dynamicComponent" :is="dynamicComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type Component } from 'vue';

const props = withDefaults(defineProps<{
  url: string;
  fileName?: string;
  fullscreen?: boolean;
}>(), {
  fullscreen: false,
});

const containerRef = ref<HTMLDivElement>();
const loading = ref(true);
const error = ref('');
const shouldLoad = ref(false);
const iframeSrc = ref('');
const dynamicComponent = ref<Component | null>(null);

let observer: IntersectionObserver | null = null;

const detectFileType = (url: string): 'html' | 'vue' | 'zip' => {
  if (props.fileName) {
    const ext = props.fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'zip') return 'zip';
    if (ext === 'vue') return 'vue';
  }
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.zip')) return 'zip';
  if (lowerUrl.endsWith('.vue')) return 'vue';
  return 'html';
};

const loadContent = async () => {
  if (!props.url) {
    error.value = '未指定文件地址';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const fileType = detectFileType(props.url);

    if (fileType === 'zip') {
      // 调用后端解压服务（相对路径，由 Vite/Nginx 代理转发）
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: props.url }),
      });
      if (!res.ok) throw new Error(`解压服务错误: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      iframeSrc.value = data.url;
    } else if (fileType === 'vue') {
      const normalizedUrl = props.url.startsWith('/') ? props.url : `/${props.url}`;
      const module = await import(/* @vite-ignore */ normalizedUrl);
      dynamicComponent.value = module.default || module;
    } else {
      // 普通 HTML 直接用 iframe 加载
      iframeSrc.value = props.url;
    }
  } catch (e: any) {
    error.value = e.message || '内容加载失败';
    console.error('DynamicViewer加载错误:', e);
  } finally {
    loading.value = false;
  }
};

const setupObserver = () => {
  if (!containerRef.value) return;

  if (props.fullscreen) {
    shouldLoad.value = true;
    loadContent();
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !shouldLoad.value) {
        shouldLoad.value = true;
        loadContent();
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    },
    { threshold: 0.1, rootMargin: '100px' }
  );

  observer.observe(containerRef.value);
};

onMounted(() => setupObserver());

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

watch(() => props.url, () => {
  shouldLoad.value = false;
  iframeSrc.value = '';
  dynamicComponent.value = null;
  loading.value = true;
  error.value = '';

  if (observer) observer.disconnect();
  setupObserver();
});
</script>

<style scoped>
.dynamic-viewer-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.viewer-placeholder,
.viewer-loading,
.viewer-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 1rem;
}

.placeholder-spinner,
.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #22d3ee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner {
  border-top-color: #60a5fa;
}

.viewer-iframe {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
