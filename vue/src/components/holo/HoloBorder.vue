<template>
  <div class="holo-border-container" :class="{ 'is-animating': anim }" :style="animStyle">

    <!-- 按层级从内到外渲染（先排好序） -->
    <template v-for="(layer, layerIndex) in sortedLayers" :key="'holo-layer-' + layerIndex">
      <!-- 边框 -->
      <div
        v-if="layer.borderWidth > 0"
        class="holo-line"
        :style="{
          inset: `${layer.inset}px`,
          borderWidth: `${layer.borderWidth}px`,
          opacity: layer.opacity
        }"
      ></div>

      <!-- L 型角标 -->
      <div
        v-for="pos in corners"
        :key="'corner-' + pos + '-' + layerIndex"
        class="corner"
        :class="['corner-' + pos]"
        :style="{ width: `${cornerSize}px`, height: `${cornerSize}px` }"
      >
        <svg class="corner-svg" viewBox="0 0 60 60">
          <path
            :d="`M ${layer.cornerOffset} 30 L ${layer.cornerOffset} ${layer.cornerOffset} L 30 ${layer.cornerOffset}`"
            fill="none"
            :stroke-width="layer.cornerStrokeWidth"
            stroke="var(--theme-color)"
            :opacity="layer.opacity"
            pathLength="100"
          />
        </svg>
      </div>
    </template>

    <!-- 装饰点（单独放最后） -->
    <div
      v-for="pos in corners"
      :key="'dot-' + pos"
      class="corner"
      :class="['corner-' + pos]"
      :style="{ width: `${cornerSize}px`, height: `${cornerSize}px`, pointerEvents: 'none' }"
    >
      <div class="corner-dot"></div>
    </div>

    <!-- 侧边缺口装饰 (受控渲染) -->
    <template v-if="showNotches">
      <div class="notch notch-left-1"></div>
      <div class="notch notch-left-2"></div>
      <div class="notch notch-right-1"></div>
      <div class="notch notch-right-2"></div>
      <div class="notch notch-top-1"></div>
      <div class="notch notch-top-2"></div>
      <div class="notch notch-bottom-1"></div>
      <div class="notch notch-bottom-2"></div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface HoloLayer {
  inset: number;        // 从边缘内偏移
  borderWidth: number;  // 边框宽度
  cornerOffset: number; // L 角从边缘偏移
  cornerStrokeWidth: number; // L 角线条宽度
  opacity: number;      // 透明度
}

interface Props {
  anim?: [number, number]; // [delay, duration]
  layers?: HoloLayer[];  // 统一的层级配置（边框+角标）
  corners?: Array<'tl' | 'tr' | 'bl' | 'br'>; // 要显示的边角
  cornerSize?: number;     // 边角 L 装饰的尺寸基准
  showNotches?: boolean;   // 是否显示中间的缺口刻度装饰
}

const props = withDefaults(defineProps<Props>(), {
  anim: undefined,
  // 默认统一层级配置（保持向后兼容）
  layers: () => [
    { inset: 0, borderWidth: 1, cornerOffset: 0, cornerStrokeWidth: 3, opacity: 0.7 },
    { inset: 0, borderWidth: 0, cornerOffset: 6, cornerStrokeWidth: 1.5, opacity: 0.35 }
  ],
  // 默认四个角都有
  corners: () => ['tl', 'tr', 'bl', 'br'],
  // 默认尺寸 60px
  cornerSize: 60,
  // 默认显示缺口
  showNotches: false
});

// 按 inset 从大到小排序（从内到外渲染）
const sortedLayers = computed(() => {
  return [...props.layers].sort((a, b) => b.inset - a.inset);
});

const animStyle = computed(() => {
  if (!props.anim) return {};
  return {
    '--line-del': `${props.anim[0]}s`,
    '--line-dur': `${props.anim[1]}s`,
  };
});
</script>

<style scoped>
.holo-border-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  /* 定义默认变量，消除 IDE 的“无法解析自定义属性”警告 */
  --line-del: 0s;
  --line-dur: 1s;
}

.holo-line {
  position: absolute;
  border: solid var(--theme-color);
  box-shadow: inset 0 0 8px var(--theme-color-glow), 0 0 8px var(--theme-color-glow);
}

.is-animating .holo-line {
  clip-path: inset(50%);
  opacity: 0;
  animation: expandBorder var(--line-dur) cubic-bezier(0.1, 0.8, 0.2, 1) var(--line-del) forwards;
}

.corner {
  position: absolute;
}

/* 利用外层 transform 旋转同一套 SVG */
.corner-tl { top: 0; left: 0; }
.corner-tr { top: 0; right: 0; transform: scaleX(-1); }
.corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
.corner-br { bottom: 0; right: 0; transform: scale(-1); }

.corner-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 3px var(--theme-color));
}

.is-animating .corner-svg path {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: drawSvgLine var(--line-dur) ease-out var(--line-del) forwards;
}

.corner-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--theme-color);
  box-shadow: 0 0 8px var(--theme-color-glow);
  opacity: 0;
  transform: scale(0);
}

/* 统一对齐在辅助 L 角内侧，使用百分比保证缩放 cornerSize 时比例正确 (原设 60px 下 6px 为 10%) */
.corner-tl .corner-dot, .corner-tr .corner-dot, .corner-bl .corner-dot, .corner-br .corner-dot {
  top: 10%; left: 10%;
}

.is-animating .corner-dot {
  animation: popDecor 0.3s ease-out calc(var(--line-del) + 0.3s) forwards;
}

.notch {
  position: absolute;
  background: var(--theme-color);
  box-shadow: 0 0 4px var(--theme-color-glow);
}

.notch-left-1 { left: 0; top: 30%; width: 6px; height: 2px; }
.notch-left-2 { left: 0; top: 70%; width: 6px; height: 2px; }
.notch-right-1 { right: 0; top: 30%; width: 6px; height: 2px; }
.notch-right-2 { right: 0; top: 70%; width: 6px; height: 2px; }
.notch-top-1 { top: 0; left: 30%; width: 2px; height: 6px; }
.notch-top-2 { top: 0; left: 70%; width: 2px; height: 6px; }
.notch-bottom-1 { bottom: 0; left: 30%; width: 2px; height: 6px; }
.notch-bottom-2 { bottom: 0; left: 70%; width: 2px; height: 6px; }

@keyframes expandBorder {
  0% { clip-path: inset(50%); opacity: 0; }
  5% { opacity: 1; }
  100% { clip-path: inset(0); opacity: 1; }
}

@keyframes drawSvgLine {
  to { stroke-dashoffset: 0; }
}

@keyframes popDecor {
  to { opacity: 1; transform: scale(1); }
}
</style>