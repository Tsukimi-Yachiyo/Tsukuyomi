<template>
  <canvas ref="canvasRef" class="ocean-fish" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  tailPhase: number;
  tailSpeed: number;
}

const props = withDefaults(defineProps<{
  /** 画布宽度，默认100% */
  width?: number;
  /** 画布高度，默认100% */
  height?: number;
  /** 鱼群密度 (数量) */
  count?: number;
  /** 颜色列表，随机分配 */
  colors?: string[];
  /** 鱼的大小范围 [min, max] */
  sizeRange?: [number, number];
  /** 速度范围 [min, max] */
  speedRange?: [number, number];
}>(), {
  width: 0,
  height: 0,
  count: 15,
  colors: () => ['#4fc3f7', '#29b6f6', '#03a9f4', '#0288d1', '#81d4fa', '#b3e5fc'],
  sizeRange: () => [8, 20],
  speedRange: () => [0.5, 2],
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number = 0;
let canvasWidth: number = 0;
let canvasHeight: number = 0;
const fishes: Fish[] = [];

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createFish(): Fish {
  const size = random(props.sizeRange[0], props.sizeRange[1]);
  const speed = random(props.speedRange[0], props.speedRange[1]);
  const direction = Math.random() > 0.5 ? 1 : -1;

  return {
    x: Math.random() * canvasWidth,
    y: random(size, canvasHeight - size),
    vx: speed * direction,
    vy: random(-0.3, 0.3),
    size,
    color: props.colors[Math.floor(Math.random() * props.colors.length)],
    tailPhase: Math.random() * Math.PI * 2,
    tailSpeed: random(0.1, 0.2),
  };
}

function drawFish(fish: Fish) {
  if (!ctx) return;

  const { x, y, size, color, tailPhase } = fish;
  const tailSwing = Math.sin(tailPhase) * size * 0.3;
  const facingRight = fish.vx > 0;

  ctx.save();
  ctx.translate(x, y);
  if (!facingRight) ctx.scale(-1, 1);

  // 鱼身
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.45, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // 鱼尾
  ctx.beginPath();
  ctx.moveTo(-size * 0.7, 0);
  ctx.quadraticCurveTo(-size * 1.1, tailSwing - size * 0.4, -size * 1.4, tailSwing);
  ctx.quadraticCurveTo(-size * 1.1, tailSwing + size * 0.4, -size * 0.7, 0);
  ctx.fillStyle = color;
  ctx.fill();

  // 鱼眼
  ctx.beginPath();
  ctx.arc(size * 0.4, -size * 0.1, size * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(size * 0.44, -size * 0.1, size * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();

  // 鱼鳍
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.35);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.8, -size * 0.2, -size * 0.6);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.35, 0, -size * 0.35);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function updateFish(fish: Fish) {
  fish.x += fish.vx;
  fish.y += fish.vy;
  fish.tailPhase += fish.tailSpeed;

  // 边界反弹
  if (fish.x < -fish.size * 2) fish.x = canvasWidth + fish.size * 2;
  if (fish.x > canvasWidth + fish.size * 2) fish.x = -fish.size * 2;

  if (fish.y < fish.size || fish.y > canvasHeight - fish.size) {
    fish.vy *= -1;
  }

  // 轻微的垂直漂移
  fish.vy += random(-0.02, 0.02);
  fish.vy = Math.max(-0.5, Math.min(0.5, fish.vy));
}

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

function initFishes() {
  fishes.length = 0;
  for (let i = 0; i < props.count; i++) {
    fishes.push(createFish());
  }
}

function animate() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (const fish of fishes) {
    updateFish(fish);
    drawFish(fish);
  }

  animationId = requestAnimationFrame(animate);
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  initFishes();
  animate();

  window.addEventListener('resize', resizeCanvas);
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeCanvas);
});

watch(() => props.width, resizeCanvas);
watch(() => props.height, resizeCanvas);
watch(() => props.count, initFishes);
</script>

<style scoped>
.ocean-fish {
  display: block;
}
</style>
