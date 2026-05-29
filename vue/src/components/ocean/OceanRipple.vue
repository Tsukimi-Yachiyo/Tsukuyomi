<template>
  <canvas ref="canvasRef" class="block cursor-pointer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
  lineWidth: number;
}

const props = withDefaults(defineProps<{
  /** 画布宽度，默认100% */
  width?: number;
  /** 画布高度，默认100% */
  height?: number;
  /** 波纹颜色 */
  color?: string;
  /** 波纹最大半径 (px) */
  maxRadius?: number;
  /** 波纹扩散速度 (px/帧) */
  speed?: number;
  /** 波纹线宽 */
  lineWidth?: number;
  /** 自动生成波纹的间隔 (ms)，0表示不自动生成 */
  autoInterval?: number;
  /** 波纹淡出速度 */
  fadeSpeed?: number;
  /** 波纹层数 */
  layers?: number;
  /** 每层能量递减系数 (0-1) */
  energyDecay?: number;
  /** 每层延迟 (帧数) */
  layerDelay?: number;
}>(), {
  width: 0,
  height: 0,
  color: 'rgba(255, 255, 255, 0.6)',
  maxRadius: 150,
  speed: 2,
  lineWidth: 2,
  autoInterval: 2000,
  fadeSpeed: 0.015,
  layers: 3,
  energyDecay: 0.7,
  layerDelay: 8,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number = 0;
let canvasWidth: number = 0;
let canvasHeight: number = 0;
const ripples: Ripple[] = [];
let autoTimer: number = 0;

/**
 * 在指定位置添加多层波纹
 * @param x - 中心点x坐标
 * @param y - 中心点y坐标
 * @param options - 可选配置
 */
function addRipple(x: number, y: number, options?: {
  maxRadius?: number;
  speed?: number;
  layers?: number;
  energyDecay?: number;
  layerDelay?: number;
}) {
  const layers = options?.layers ?? props.layers;
  const decay = options?.energyDecay ?? props.energyDecay;
  const delay = options?.layerDelay ?? props.layerDelay;
  const baseMaxRadius = options?.maxRadius ?? props.maxRadius;
  const baseSpeed = options?.speed ?? props.speed;

  for (let i = 0; i < layers; i++) {
    // 每层能量递减
    const layerEnergy = Math.pow(decay, i);
    const layerMaxRadius = baseMaxRadius * layerEnergy;
    const layerSpeed = baseSpeed * (0.8 + 0.2 * layerEnergy);
    const layerLineWidth = props.lineWidth * (0.6 + 0.4 * layerEnergy);

    // 延迟添加后续层
    setTimeout(() => {
      ripples.push({
        x,
        y,
        radius: 0,
        maxRadius: layerMaxRadius,
        opacity: 1,
        speed: layerSpeed,
        lineWidth: layerLineWidth,
      });
    }, i * delay * 16); // 约16ms每帧
  }
}

/** 暴露给父组件的方法 */
defineExpose({ addRipple });

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

function drawRipple(ripple: Ripple) {
  if (!ctx) return;

  ctx.beginPath();
  ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
  ctx.strokeStyle = props.color;
  ctx.lineWidth = ripple.lineWidth;
  ctx.globalAlpha = ripple.opacity;
  ctx.stroke();
}

function animate() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.radius += r.speed;
    r.opacity -= props.fadeSpeed;

    if (r.opacity <= 0 || r.radius >= r.maxRadius) {
      ripples.splice(i, 1);
      continue;
    }

    drawRipple(r);
  }

  ctx.globalAlpha = 1;
  animationId = requestAnimationFrame(animate);
}

function startAutoRipple() {
  if (props.autoInterval <= 0) return;

  autoTimer = window.setInterval(() => {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    addRipple(x, y);
  }, props.autoInterval);
}

function handleClick(e: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect();
  if (!rect) return;
  addRipple(e.clientX - rect.left, e.clientY - rect.top);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  animate();
  startAutoRipple();

  canvas.addEventListener('click', handleClick);
  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  clearInterval(autoTimer);
  canvasRef.value?.removeEventListener('click', handleClick);
  window.removeEventListener('resize', resizeCanvas);
});

watch(() => props.width, resizeCanvas);
watch(() => props.height, resizeCanvas);
watch(() => props.autoInterval, (val) => {
  clearInterval(autoTimer);
  if (val > 0) startAutoRipple();
});
</script>
