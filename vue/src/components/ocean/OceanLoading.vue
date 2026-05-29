<template>
  <div class="relative w-full h-full overflow-hidden pointer-events-none">
    <OceanWaves
      v-if="active"
      ref="wavesRef"
      class="absolute inset-0 z-1"
      :width="width"
      :height="height"
      :base-y-ratio="targetBaseYRatio"
      :start-base-y-ratio="startBaseYRatio"
      :wave-speed="waveSpeed"
      :layers="layers"
      :gradient-colors="gradientColors"
      :fill-depth="fillDepth"
      @wave:rested="onWaveRested"
    />
    <OceanBubbles
      v-if="showBubbles"
      class="absolute inset-0 z-2"
      :width="width"
      :height="height"
      :count="bubbleCount"
      :ceiling-y="ceilingY"
      :speed-range="bubbleSpeedRange"
      :size-range="bubbleSizeRange"
      :clearing="clearing"
      @bubbles:cleared="onBubblesCleared"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import OceanWaves from './OceanWaves.vue';
import OceanBubbles from './OceanBubbles.vue';
import type { WaveLayer } from './waveTypes';

const props = withDefaults(defineProps<{
  /** 是否正在加载 */
  loading: boolean;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 波浪层配置 */
  layers: WaveLayer[];
  /** 波浪目标位置 (画布高度占比) */
  targetBaseYRatio?: number;
  /** 波浪起始位置 (画布高度占比，>1 = 屏幕下方) */
  startBaseYRatio?: number;
  /** 波浪上升速度 (0-1，每帧逼近比率) */
  waveSpeed?: number;
  /** 气泡数量 */
  bubbleCount?: number;
  /** 气泡速度范围 */
  bubbleSpeedRange?: [number, number];
  /** 气泡大小范围 */
  bubbleSizeRange?: [number, number];
  /** 海洋渐变色数组（从浅到深） */
  gradientColors?: string[];
  /** 波浪填充深度 (px)，0=填满到底部 */
  fillDepth?: number;
  /** 波浪Y采样点的X比率 (0-1)，0=左边缘，0.5=中央(默认)，1=右边缘 */
  samplingXRatio?: number;
}>(), {
  width: 0,
  height: 0,
  targetBaseYRatio: 0.15,
  startBaseYRatio: 1.5,
  waveSpeed: 0.03,
  bubbleCount: 25,
  bubbleSpeedRange: () => [1.5, 4.0],
  bubbleSizeRange: () => [2, 7],
  gradientColors: () => ['#0a2a4a', '#0d4b6e', '#1a7a8a'],
  fillDepth: 0,
  samplingXRatio: 0.5,
});

const emit = defineEmits<{
  (e: 'complete'): void;
  (e: 'waveY', y: number): void;
}>();

const wavesRef = ref<InstanceType<typeof OceanWaves>>();
const active = ref(true);
const showBubbles = ref(true);
const clearing = ref(false);
const ceilingY = ref(0);

let waveRested = false;
let loadingDone = !props.loading;
let ceilingTimer = 0;

function startCeilingLoop() {
  const update = () => {
    if (wavesRef.value) {
      const samplingX = window.innerWidth * props.samplingXRatio;
      ceilingY.value = wavesRef.value.getWaveY(samplingX, 0);
      emit('waveY', ceilingY.value);
    }
    ceilingTimer = requestAnimationFrame(update);
  };
  ceilingTimer = requestAnimationFrame(update);
}

function tryClear() {
  if (waveRested && loadingDone) {
    cancelAnimationFrame(ceilingTimer);
    clearing.value = true;
  }
}

function onWaveRested() {
  waveRested = true;
  tryClear();
}

function onBubblesCleared() {
  showBubbles.value = false;
  emit('complete');
}

onMounted(() => {
  startCeilingLoop();
  // 如果初始就是 false，标记完成
  if (!props.loading) {
    loadingDone = true;
  }
});

watch(() => props.loading, (val) => {
  if (!val) {
    loadingDone = true;
    tryClear();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(ceilingTimer);
});

function getWaveYAtX(x: number): number {
  return wavesRef.value?.getWaveY(x, 0) ?? 0;
}

defineExpose({ getWaveYAtX });
</script>
