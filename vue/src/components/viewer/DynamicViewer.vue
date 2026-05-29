<template>
  <div ref="containerRef" class="dynamic-viewer-container">
    <!-- 占位符 -->
    <div v-if="!shouldLoad" class="viewer-placeholder">
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

    <!-- HTML内容 -->
    <div v-else-if="contentType === 'html'" class="viewer-content" v-html="htmlContent" />

    <!-- Vue动态组件 -->
    <component v-else-if="contentType === 'vue' && dynamicComponent" :is="dynamicComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type Component } from 'vue';
import JSZip from 'jszip';

const props = defineProps<{
  url: string;
}>();

const containerRef = ref<HTMLDivElement>();
const loading = ref(true);
const error = ref('');
const shouldLoad = ref(false);
const htmlContent = ref('');
const contentType = ref<'html' | 'vue' | ''>('');
const dynamicComponent = ref<Component | null>(null);

let observer: IntersectionObserver | null = null;

const detectFileType = (url: string): 'html' | 'vue' | 'zip' => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.endsWith('.zip')) return 'zip';
  if (lowerUrl.endsWith('.vue')) return 'vue';
  return 'html';
};

const extractTemplateFromVueSFC = (sfcContent: string): string => {
  const templateMatch = sfcContent.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
  return templateMatch ? templateMatch[1].trim() : '<p class="text-white/50">无法提取Vue组件模板</p>';
};

const extractZipAndFindTarget = async (zipData: ArrayBuffer, url: string): Promise<{ content: string; type: 'html' | 'vue' }> => {
  const zip = await JSZip.loadAsync(zipData);

  const targetFileName = url.split('/').pop() || '';

  let targetFile: JSZip.JSZipObject | null = null;

  if (targetFileName) {
    targetFile = zip.file(`**/${targetFileName}`)?.[0] || null;
    if (!targetFile) {
      targetFile = zip.file(targetFileName)?.[0] || null;
    }
  }

  if (!targetFile) {
    const allFiles = Object.keys(zip.files);
    const htmlOrVueFiles = allFiles.filter(
      f => !zip.files[f].dir && (f.endsWith('.html') || f.endsWith('.htm') || f.endsWith('.vue'))
    );

    if (htmlOrVueFiles.length === 0) {
      throw new Error('压缩包中未找到HTML或Vue文件');
    }

    targetFile = zip.files[htmlOrVueFiles[0]];
  }

  let content = await targetFile.async('string');
  const isVueFile = targetFile.name.endsWith('.vue');
  
  if (isVueFile) {
    content = extractTemplateFromVueSFC(content);
  }

  return { content, type: isVueFile ? 'vue' : 'html' };
};

const loadHtml = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTML文件加载失败: ${response.status}`);
  }
  return await response.text();
};

const loadVueComponent = async (url: string): Promise<Component> => {
  try {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    const module = await import(/* @vite-ignore */ normalizedUrl);

    return module.default || module;
  } catch (e: any) {
    throw new Error(`Vue组件动态导入失败: ${e.message}`);
  }
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
      const response = await fetch(props.url);
      if (!response.ok) {
        throw new Error(`ZIP文件加载失败: ${response.status}`);
      }

      const zipData = await response.arrayBuffer();
      const { content, type } = await extractZipAndFindTarget(zipData, props.url);

      contentType.value = 'html';
      htmlContent.value = content;
    } else if (fileType === 'vue') {
      contentType.value = 'vue';
      dynamicComponent.value = await loadVueComponent(props.url);
    } else {
      contentType.value = 'html';
      htmlContent.value = await loadHtml(props.url);
    }
  } catch (e: any) {
    error.value = e.message || '内容加载失败';
    console.error('DynamicViewer加载错误:', e);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (!containerRef.value) return;

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
    {
      threshold: 0.1,
      rootMargin: '100px',
    }
  );

  observer.observe(containerRef.value);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

watch(() => props.url, () => {
  shouldLoad.value = false;
  htmlContent.value = '';
  dynamicComponent.value = null;
  contentType.value = '';
  loading.value = true;
  error.value = '';

  if (observer) {
    observer.disconnect();
  }

  if (containerRef.value) {
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
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );
    observer.observe(containerRef.value);
  }
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

.viewer-content {
  width: 100%;
  overflow: auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>