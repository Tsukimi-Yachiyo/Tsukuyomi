<template>
  <canvas ref="canvasRef" class="ocean-waves" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { WaveLayer } from './waveTypes';

const props = withDefaults(defineProps<{
  layers?: WaveLayer[];
  width?: number;
  height?: number;
  /** 目标基准Y坐标 (画布高度占比) */
  baseYRatio?: number;
  /** 波浪上升动画起始位置 (画布高度占比，1.5 = 屏幕下方不可见) */
  startBaseYRatio?: number;
  /** 波浪上升动画速度 (每帧逼近目标的比率，0-1) */
  waveSpeed?: number;
  /** 海洋渐变色数组（从浅到深），不传则不绘制渐变 */
  gradientColors?: string[];
  /** 波浪填充深度 (px)，0=填满到底部 */
  fillDepth?: number;
  /** 仅绘制波浪线条，不填充区域 */
  strokeOnly?: boolean;
  /** strokeOnly 模式下线条颜色 */
  strokeColor?: string;
  /** strokeOnly 模式下线条宽度 */
  strokeWidth?: number;
}>(), {
  layers: () => [
    { color: '#0a1628', amplitude: 30, frequency: 0.008, speed: 0.02, offsetY: 0, opacity: 1, jitter: 0 },
    { color: '#0d2847', amplitude: 25, frequency: 0.012, speed: 0.015, offsetY: 20, opacity: 1, jitter: 0 },
    { color: '#134b6e', amplitude: 20, frequency: 0.018, speed: 0.025, offsetY: 40, opacity: 1, jitter: 0 },
    { color: '#1a7a8a', amplitude: 15, frequency: 0.025, speed: 0.01, offsetY: 55, opacity: 1, jitter: 0 },
    { color: '#2aa198', amplitude: 12, frequency: 0.03, speed: 0.02, offsetY: 70, opacity: 1, jitter: 0 },
  ],
  width: 0,
  height: 200,
  baseYRatio: 0.3,
  startBaseYRatio: 1.5,
  waveSpeed: 0.03,
  gradientColors: () => ['#0a2a4a', '#0d4b6e', '#1a7a8a'],
  fillDepth: 0,
  strokeOnly: false,
  strokeColor: '#4df0ff',
  strokeWidth: 2,
});

const emit = defineEmits<{
  (e: 'wave:rested'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number = 0;
let phase: number = 0;
let canvasWidth: number = 0;
let canvasHeight: number = 0;

// 当前基准Y坐标（动画过程中实时变化）
let currentBaseYRatio = props.startBaseYRatio;
let isRested = false;

function waveY(x: number, layer: WaveLayer, jitterOffset: number): number {
  const { amplitude, frequency, speed } = layer;
  const t = phase * speed;
  const fx = frequency * x;

  let y = 0;
  y += amplitude * Math.sin(fx + t + jitterOffset);
  y += amplitude * 0.5 * Math.sin(2 * fx + 1.5 * t);
  y += amplitude * 0.3 * Math.sin(3 * fx + 2 * t);
  y += amplitude * 0.1 * Math.sin(2 * (fx + t));

  return y;
}

function getJitterOffset(layerIndex: number, x: number): number {
  const jitterAmp = props.layers[layerIndex]?.jitter ?? 0;
  if (!jitterAmp) return 0;
  const t = phase * 0.003;
  const nx = x * 0.003 + layerIndex * 17;
  return (Math.sin(nx + t) * 0.6 + Math.sin(nx * 2.3 + t * 0.7) * 0.4) * jitterAmp;
}

/**
 * 获取指定x处某层波浪的实时y坐标
 * 动画过程中会随 currentBaseYRatio 变化
 */
function getWaveY(x: number, layerIndex: number = 0): number {
  const layer = props.layers[layerIndex] || props.layers[0];
  const baseY = canvasHeight * currentBaseYRatio + layer.offsetY;
  return baseY + waveY(x, layer, getJitterOffset(layerIndex, x));
}

defineExpose({ getWaveY });

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const parent = canvas.parentElement;
  canvasWidth = props.width || parent?.clientWidth || window.innerWidth;
  canvasHeight = props.height || parent?.clientHeight || window.innerHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
}

function getWavePoints(layer: WaveLayer, layerIndex: number): { x: number; y: number }[] {
  const baseY = canvasHeight * currentBaseYRatio + layer.offsetY;
  const step = 2;
  const points: { x: number; y: number }[] = [];
  for (let x = 0; x <= canvasWidth; x += step) {
    const jo = getJitterOffset(layerIndex, x);
    points.push({ x, y: baseY + waveY(x, layer, jo) });
  }
  return points;
}

function drawWaveStroke(layer: WaveLayer, layerIndex: number) {
  if (!ctx) return;
  const points = getWavePoints(layer, layerIndex);

  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[i + 1];
    if (next) {
      const midX = (p.x + next.x) / 2;
      const midY = (p.y + next.y) / 2;
      ctx.quadraticCurveTo(p.x, p.y, midX, midY);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = props.strokeColor;
  ctx.lineWidth = props.strokeWidth;
  ctx.stroke();
}

function drawWave(layer: WaveLayer, layerIndex: number, fillBottom: number) {
  if (!ctx) return;
  const points = getWavePoints(layer, layerIndex);

  ctx.beginPath();
  ctx.moveTo(0, fillBottom);

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const next = points[i + 1];
    if (next) {
      const midX = (p.x + next.x) / 2;
      const midY = (p.y + next.y) / 2;
      ctx.quadraticCurveTo(p.x, p.y, midX, midY);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  ctx.lineTo(canvasWidth, fillBottom);
  ctx.closePath();

  ctx.globalAlpha = layer.opacity;
  ctx.fillStyle = layer.color;
  ctx.fill();
}

function drawOceanGradient(gradientTop: number) {
  if (!ctx || !props.gradientColors.length) return;

  const gradient = ctx.createLinearGradient(0, gradientTop, 0, canvasHeight);
  const colors = props.gradientColors;
  for (let i = 0; i < colors.length; i++) {
    gradient.addColorStop(i / (colors.length - 1), colors[colors.length - 1 - i]);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradientTop, canvasWidth, canvasHeight - gradientTop);
}

function animate() {
  if (!ctx) return;

  // 波浪上升动画：缓动逼近目标 baseYRatio
  if (!isRested) {
    const diff = currentBaseYRatio - props.baseYRatio;
    if (Math.abs(diff) < 0.001) {
      currentBaseYRatio = props.baseYRatio;
      isRested = true;
      emit('wave:rested');
    } else {
      currentBaseYRatio -= diff * props.waveSpeed;
    }
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (props.strokeOnly) {
    // 仅绘制波浪线条
    for (let i = props.layers.length - 1; i >= 0; i--) {
      drawWaveStroke(props.layers[i], i);
    }
  } else {
    // 计算统一的填充底部（基于最浅层 layer 0）
    const shallowest = props.layers[0];
    const shallowBaseY = canvasHeight * currentBaseYRatio + (shallowest?.offsetY ?? 0);
    const maxWaveH = (shallowest?.amplitude ?? 0) * 1.9;
    const fillBottom = props.fillDepth > 0
      ? shallowBaseY + maxWaveH + props.fillDepth
      : canvasHeight;

    // 从后往前画各层波浪（覆盖渐变顶部）
    for (let i = props.layers.length - 1; i >= 0; i--) {
      drawWave(props.layers[i], i, fillBottom);
    }
    // 画海洋渐变背景（从波浪填充底部开始）
    drawOceanGradient(fillBottom - 2);
  }

  phase++;
  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  animate();

  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeCanvas);
});

watch(() => props.width, resizeCanvas);
watch(() => props.height, resizeCanvas);
</script>

<style scoped>
.ocean-waves {
  display: block;
}
</style>
