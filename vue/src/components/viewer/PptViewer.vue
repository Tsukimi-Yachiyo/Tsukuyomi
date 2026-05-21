<template>
  <div class="flex flex-col gap-4">
    <!-- 工具栏 -->
    <div class="flex items-center justify-between px-4 py-2 bg-black/30 border border-white/10 rounded-lg">
      <div class="flex items-center gap-2">
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="currentSlide <= 1"
          @click="prevSlide"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span class="text-sm text-white/70">{{ currentSlide }} / {{ totalSlides }}</span>
        <button
          class="p-1.5 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          :disabled="currentSlide >= totalSlides"
          @click="nextSlide"
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

    <!-- PPT 渲染区域 -->
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

      <!-- 幻灯片渲染 -->
      <div v-else class="flex justify-center p-4">
        <div
          ref="slideRef"
          class="bg-white rounded shadow-lg overflow-hidden"
          :style="{
            width: slideWidth + 'px',
            height: slideHeight + 'px',
            transform: `scale(${scale})`,
            transformOrigin: 'top center'
          }"
        />
      </div>
    </div>

    <!-- 页面跳转 -->
    <div v-if="totalSlides > 1" class="flex items-center justify-center gap-2">
      <span class="text-sm text-white/50">跳转到</span>
      <input
        v-model="jumpSlide"
        type="number"
        :min="1"
        :max="totalSlides"
        class="w-16 px-2 py-1 bg-black/30 border border-white/10 rounded text-center text-white text-sm focus:outline-none focus:border-cyan-400/40"
        @keydown.enter="goToSlide"
      />
      <button
        class="px-3 py-1 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
        @click="goToSlide"
      >确定</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import JSZip from 'jszip';

const props = withDefaults(defineProps<{
  url?: string;
  filename?: string;
  maxHeight?: number;
  initialScale?: number;
}>(), {
  maxHeight: 600,
  initialScale: 1,
});

const containerRef = ref<HTMLDivElement>();
const slideRef = ref<HTMLDivElement>();

const loading = ref(true);
const error = ref('');
const currentSlide = ref(1);
const totalSlides = ref(0);
const scale = ref(props.initialScale);
const jumpSlide = ref(1);
const slideWidth = ref(960);
const slideHeight = ref(540);

let slides: string[] = [];

const getSource = () => {
  if (props.url) return props.url;
  if (props.filename) return `/ppt/${props.filename}`;
  return null;
};

function renderSlideAsHtml(xml: string, mediaMap?: Map<string, string>): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const htmlParts: string[] = [];
  htmlParts.push('<div style="width:100%;height:100%;position:relative;overflow:hidden;font-family:Arial,sans-serif;">');

  const spTree = doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/presentationml/2006/main', 'spTree')[0];
  const container = spTree || doc.documentElement;

  // 形状文本
  const allSp = container.getElementsByTagNameNS('http://schemas.openxmlformats.org/presentationml/2006/main', 'sp');
  for (let i = 0; i < allSp.length; i++) {
    const sp = allSp[i];
    const xfrm = sp.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'xfrm')[0];
    let left = 0, top = 0, w = 0, h = 0;

    if (xfrm) {
      const off = xfrm.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'off')[0];
      const ext = xfrm.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'ext')[0];
      if (off) {
        left = parseInt(off.getAttribute('x') || '0') / 914400 * 96;
        top = parseInt(off.getAttribute('y') || '0') / 914400 * 96;
      }
      if (ext) {
        w = parseInt(ext.getAttribute('cx') || '0') / 914400 * 96;
        h = parseInt(ext.getAttribute('cy') || '0') / 914400 * 96;
      }
    }

    const textBody = sp.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'txBody')[0];
    if (textBody) {
      const paragraphs = textBody.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'p');
      let textHtml = '';

      for (let j = 0; j < paragraphs.length; j++) {
        const runs = paragraphs[j].getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'r');
        let paraText = '';

        for (let k = 0; k < runs.length; k++) {
          const t = runs[k].getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 't')[0];
          if (t?.textContent) {
            const rpr = runs[k].getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'rPr')[0];
            const fontSize = rpr?.getAttribute('sz') ? parseInt(rpr.getAttribute('sz')!) / 100 : 18;
            const bold = rpr?.getAttribute('b') === '1';
            const colorEl = rpr?.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'srgbClr')[0];
            const color = colorEl?.getAttribute('val') || '000000';

            let style = `font-size:${fontSize}pt;color:#${color};`;
            if (bold) style += 'font-weight:bold;';
            paraText += `<span style="${style}">${t.textContent}</span>`;
          }
        }

        if (paraText) textHtml += `<p style="margin:2px 0;">${paraText}</p>`;
      }

      if (textHtml) {
        htmlParts.push(`<div style="position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;display:flex;align-items:center;">${textHtml}</div>`);
      }
    }
  }

  // 图片
  const allPic = container.getElementsByTagNameNS('http://schemas.openxmlformats.org/presentationml/2006/main', 'pic');
  for (let i = 0; i < allPic.length; i++) {
    const pic = allPic[i];
    const blip = pic.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'blip')[0];
    const embed = blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');

    if (embed && mediaMap?.has(embed)) {
      const xfrm = pic.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'xfrm')[0];
      let left = 0, top = 0, w = 0, h = 0;

      if (xfrm) {
        const off = xfrm.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'off')[0];
        const ext = xfrm.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'ext')[0];
        if (off) {
          left = parseInt(off.getAttribute('x') || '0') / 914400 * 96;
          top = parseInt(off.getAttribute('y') || '0') / 914400 * 96;
        }
        if (ext) {
          w = parseInt(ext.getAttribute('cx') || '0') / 914400 * 96;
          h = parseInt(ext.getAttribute('cy') || '0') / 914400 * 96;
        }
      }

      htmlParts.push(`<img src="${mediaMap.get(embed)}" style="position:absolute;left:${left}px;top:${top}px;width:${w}px;height:${h}px;object-fit:contain;" />`);
    }
  }

  if (htmlParts.length === 1) {
    htmlParts.push('<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">此幻灯片无可渲染内容</div>');
  }

  htmlParts.push('</div>');
  return htmlParts.join('');
}

const loadPpt = async () => {
  const source = getSource();
  if (!source) {
    error.value = '未指定 PPT 来源';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error('文件加载失败');

    const zip = await JSZip.loadAsync(await response.arrayBuffer());

    const slideFiles = Object.keys(zip.files)
      .filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)![1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)![1]);
        return numA - numB;
      });

    if (slideFiles.length === 0) throw new Error('未找到幻灯片');

    totalSlides.value = slideFiles.length;
    slides = [];

    // 加载媒体
    const mediaMap = new Map<string, string>();
    for (const f of Object.keys(zip.files).filter(k => k.startsWith('ppt/media/'))) {
      const blob = await zip.files[f].async('blob');
      mediaMap.set(f.split('/').pop()!, URL.createObjectURL(blob));
    }

    // 解析每张幻灯片
    for (const slideFile of slideFiles) {
      const xml = await zip.files[slideFile].async('string');
      const relsFile = slideFile.replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
      const slideMediaMap = new Map<string, string>();

      if (zip.files[relsFile]) {
        const relsXml = await zip.files[relsFile].async('string');
        const relsDoc = new DOMParser().parseFromString(relsXml, 'application/xml');

        for (const rel of Array.from(relsDoc.getElementsByTagName('Relationship'))) {
          const target = rel.getAttribute('Target') || '';
          const id = rel.getAttribute('Id') || '';
          if (target.startsWith('../media/')) {
            const name = target.replace('../media/', '');
            if (mediaMap.has(name)) slideMediaMap.set(id, mediaMap.get(name)!);
          }
        }
      }

      slides.push(renderSlideAsHtml(xml, slideMediaMap));
    }

    currentSlide.value = 1;
    await renderSlide(1);
  } catch (e: any) {
    error.value = e.message || 'PPT 加载失败';
  } finally {
    loading.value = false;
  }
};

const renderSlide = async (num: number) => {
  if (!slideRef.value || num < 1 || num > slides.length) return;
  slideRef.value.innerHTML = slides[num - 1];
};

const prevSlide = () => {
  if (currentSlide.value > 1) {
    currentSlide.value--;
    renderSlide(currentSlide.value);
  }
};

const nextSlide = () => {
  if (currentSlide.value < totalSlides.value) {
    currentSlide.value++;
    renderSlide(currentSlide.value);
  }
};

const goToSlide = () => {
  const s = Number(jumpSlide.value);
  if (s >= 1 && s <= totalSlides.value) {
    currentSlide.value = s;
    renderSlide(s);
  }
};

const zoomIn = () => { scale.value = Math.min(scale.value + 0.25, 3); };
const zoomOut = () => { scale.value = Math.max(scale.value - 0.25, 0.5); };
const resetZoom = () => { scale.value = props.initialScale; };

watch(() => props.url, loadPpt);
watch(() => props.filename, loadPpt);

onMounted(() => nextTick(loadPpt));
</script>
