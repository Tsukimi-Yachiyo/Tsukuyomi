<template>
  <div class="flex flex-col gap-4">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-4 py-2 bg-black/30 border border-white/10 rounded-lg">
      <div class="flex items-center gap-2">
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage <= 1"
          @click="prevPage"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span class="text-sm text-white/70">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="currentPage >= totalPages"
          @click="nextPage"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" @click="zoomOut">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M8 11h6" />
          </svg>
        </button>
        <span class="text-sm text-white/70 min-w-[40px] text-center">{{ Math.round(scale * 100) }}%</span>
        <button class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" @click="zoomIn">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        </button>
        <button class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors" @click="resetZoom">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18H3z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- PDF 渲染区域 -->
    <div
      ref="containerRef"
      class="relative overflow-auto border border-white/10 rounded-lg bg-black/20"
      :style="{ maxHeight: maxHeight + 'px' }"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-white/50">
        <svg class="w-10 h-10 mb-3 text-red-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
        </svg>
        <p class="text-sm">{{ error }}</p>
      </div>

      <!-- PDF 页面 -->
      <canvas
        v-else
        ref="canvasRef"
        class="mx-auto"
        :style="{ maxWidth: '100%' }"
      />
    </div>

    <!-- 页面跳转 -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
      <span class="text-sm text-white/50">跳转到</span>
      <input
        v-model="jumpPage"
        type="number"
        :min="1"
        :max="totalPages"
        class="w-16 px-2 py-1 bg-black/30 border border-white/10 rounded text-center text-white text-sm focus:outline-none focus:border-cyan-400/40"
        @keydown.enter="goToPage"
      />
      <button
        class="px-3 py-1 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
        @click="goToPage"
      >确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
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
const canvasRef = ref<HTMLCanvasElement>();

const loading = ref(true);
const error = ref('');
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(props.initialScale);
const jumpPage = ref(1);

let pdfDoc: any = null;

const getSource = () => {
  if (props.url) return props.url;
  if (props.filename) return `/pdf/${props.filename}`;
  return null;
};

const loadPdf = async () => {
  const source = getSource();
  if (!source) {
    error.value = '未指定 PDF 来源';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    pdfDoc = await pdfjsLib.getDocument(source).promise;
    totalPages.value = pdfDoc.numPages;
    currentPage.value = 1;
    await renderPage(1);
  } catch (e: any) {
    error.value = e.message || 'PDF 加载失败';
  } finally {
    loading.value = false;
  }
};

const renderPage = async (pageNum: number) => {
  if (!pdfDoc || !canvasRef.value) return;

  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: scale.value });
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d')!;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;
  } catch (e: any) {
    error.value = e.message || '页面渲染失败';
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    renderPage(currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    renderPage(currentPage.value);
  }
};

const goToPage = () => {
  const page = Number(jumpPage.value);
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    renderPage(page);
  }
};

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3);
  renderPage(currentPage.value);
};

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5);
  renderPage(currentPage.value);
};

const resetZoom = () => {
  scale.value = props.initialScale;
  renderPage(currentPage.value);
};

watch(() => props.url, loadPdf);
watch(() => props.filename, loadPdf);

onMounted(() => nextTick(loadPdf));
</script>
