<template>
  <div class="flex flex-col gap-3">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-4 py-2 bg-black/30 border border-white/10 rounded-lg">
      <div class="flex items-center gap-3">
        <span class="text-sm text-white/70">{{ loadedPages }} / {{ totalPages }} 页</span>
        <div v-if="loading" class="w-4 h-4 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>

      <div class="flex items-center gap-2">
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          @click="zoomOut"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="M8 11h6" />
          </svg>
        </button>
        <span class="text-sm text-white/70 min-w-[40px] text-center">{{ Math.round(scale * 100) }}%</span>
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          @click="zoomIn"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="M11 8v6M8 11h6" />
          </svg>
        </button>
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          @click="resetZoom"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="flex flex-col items-center justify-center py-20 text-white/50 border border-white/10 rounded-lg bg-black/20">
      <svg class="w-10 h-10 mb-3 text-red-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
      </svg>
      <p class="text-sm">{{ error }}</p>
    </div>

    <!-- PDF 页面容器：每页一个 canvas，纵向排列 -->
    <div v-if="!error" ref="containerRef" class="flex flex-col items-center gap-2 overflow-auto border border-white/10 rounded-lg bg-black/20" :style="{ maxHeight: maxHeight + 'px' }">
      <template v-for="(_, i) in totalPages" :key="i">
        <canvas
          :ref="(el) => setCanvasRef(i, el as HTMLCanvasElement)"
          class="max-w-full"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

const props = withDefaults(defineProps<{
  url?: string;
  filename?: string;
  maxHeight?: number;
  initialScale?: number;
}>(), {
  maxHeight: 600,
  initialScale: 1.5,
});

const containerRef = ref<HTMLDivElement>();
const loading = ref(true);
const error = ref('');
const totalPages = ref(0);
const scale = ref(props.initialScale);

const canvasRefs = ref<(HTMLCanvasElement | null)[]>([]);
const renderedPages = ref<boolean[]>([]);

let pdfDoc: any = null;
let observer: IntersectionObserver | null = null;
const pendingRender = new Set<number>();

const loadedPages = computed(() => renderedPages.value.filter(Boolean).length);

const setCanvasRef = (i: number, el: HTMLCanvasElement | null) => {
  canvasRefs.value[i] = el;
  if (!el || !observer) return;
  observer.observe(el);
};

const getSource = () => {
  if (props.url) return props.url;
  if (props.filename) return `/pdf/${props.filename}`;
  return null;
};

const renderPage = async (idx: number) => {
  if (!pdfDoc) return;
  const canvas = canvasRefs.value[idx];
  if (!canvas) return;
  if (pendingRender.has(idx)) return;
  pendingRender.add(idx);

  try {
    const page = await pdfDoc.getPage(idx + 1);
    const viewport = page.getViewport({ scale: scale.value });
    const ctx = canvas.getContext('2d')!;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    renderedPages.value[idx] = true;
  } catch (e: any) {
    console.error(`PDF 第 ${idx + 1} 页渲染失败:`, e);
  } finally {
    pendingRender.delete(idx);
  }
};

const setupObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const idx = canvasRefs.value.indexOf(entry.target as HTMLCanvasElement);
        if (idx !== -1 && !renderedPages.value[idx]) {
          renderPage(idx);
        }
      }
    },
    {
      root: containerRef.value,
      rootMargin: '300px 0px',
      threshold: 0,
    }
  );
  canvasRefs.value.forEach((el) => {
    if (el) observer!.observe(el);
  });
};

const loadPdf = async () => {
  const source = getSource();
  if (!source) {
    error.value = '未指定 PDF 来源';
    loading.value = false;
    return;
  }

  // 清理上一次
  observer?.disconnect();
  pendingRender.clear();
  pdfDoc?.destroy();
  pdfDoc = null;
  canvasRefs.value = [];
  renderedPages.value = [];

  loading.value = true;
  error.value = '';

  try {
    pdfDoc = await pdfjsLib.getDocument(source).promise;
    totalPages.value = pdfDoc.numPages;
    renderedPages.value = new Array(pdfDoc.numPages).fill(false);
    canvasRefs.value = new Array(pdfDoc.numPages).fill(null);

    loading.value = false;

    await nextTick();
    setupObserver();
  } catch (e: any) {
    console.error('PDF 加载失败:', e);
    error.value = e.message || 'PDF 加载失败';
    loading.value = false;
  }
};

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3);
  reRenderVisible();
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5);
  reRenderVisible();
};

const resetZoom = () => {
  scale.value = props.initialScale;
  reRenderVisible();
};

const reRenderVisible = () => {
  if (!pdfDoc) return;
  for (let i = 0; i < totalPages.value; i++) {
    if (renderedPages.value[i]) {
      renderedPages.value[i] = false;
      pendingRender.delete(i);
      renderPage(i);
    }
  }
};

watch(() => props.url, loadPdf);
watch(() => props.filename, loadPdf);

onMounted(() => nextTick(loadPdf));

onBeforeUnmount(() => {
  observer?.disconnect();
  pdfDoc?.destroy();
});
</script>
