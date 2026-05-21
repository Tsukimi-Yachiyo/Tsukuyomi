<template>
  <canvas ref="canvasRef" class="ocean-bubbles" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  wobblePhase: number;
  opacity: number;
  fadeRate: number;
}

const props = withDefaults(defineProps<{
  width?: number;
  height?: number;
  /** 气泡数量（密度） */
  count?: number;
  /** 上升速度范围 [min, max] (px/帧) */
  speedRange?: [number, number];
  /** 气泡半径范围 [min, max] (px) */
  sizeRange?: [number, number];
  /** 水平摆动幅度范围 [min, max] (px) */
  wobbleRange?: [number, number];
  /** 气泡颜色 */
  color?: string;
  /** 是否显示气泡高光 */
  highlight?: boolean;
  /** 气泡上限Y坐标（实时，到达此位置时气泡消失，通常为波浪表面y） */
  ceilingY?: number;
  /** 清除模式：停止生成新气泡，等待现有气泡消失 */
  clearing?: boolean;
}>(), {
  width: 0,
  height: 0,
  count: 30,
  speedRange: () => [0.3, 1.2],
  sizeRange: () => [2, 8],
  wobbleRange: () => [10, 40],
  color: 'rgba(255, 255, 255, 0.5)',
  highlight: true,
  ceilingY: 0,
  clearing: false,
});

const emit = defineEmits<{
  (e: 'bubbles:cleared'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number = 0;
let canvasWidth: number = 0;
let canvasHeight: number = 0;
const bubbles: Bubble[] = [];

function random(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createBubble(): Bubble {
  const radius = random(props.sizeRange[0], props.sizeRange[1]);
  const speed = random(props.speedRange[0], props.speedRange[1]);
  return {
    x: random(radius, canvasWidth - radius),
    y: canvasHeight + random(10, 80),
    radius,
    speed,
    wobbleAmp: random(props.wobbleRange[0], props.wobbleRange[1]),
    wobbleSpeed: random(0.01, 0.04),
    wobblePhase: Math.random() * Math.PI * 2,
    opacity: random(0.3, 0.8),
    fadeRate: random(0.002, 0.006),
  };
}

function initBubbles() {
  bubbles.length = 0;
  for (let i = 0; i < props.count; i++) {
    bubbles.push(createBubble());
  }
}

function drawBubble(b: Bubble) {
  if (!ctx) return;

  const wobbleX = Math.sin(b.wobblePhase) * b.wobbleAmp * 0.1;
  const bx = b.x + wobbleX;
  const by = b.y;

  ctx.beginPath();
  ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = props.color;
  ctx.globalAlpha = b.opacity;
  ctx.fill();

  if (props.highlight && b.radius > 3) {
    ctx.beginPath();
    ctx.arc(bx - b.radius * 0.3, by - b.radius * 0.3, b.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = b.opacity * 0.6;
    ctx.fill();
  }
}

function animate() {
  if (!ctx) return;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.y -= b.speed;
    b.wobblePhase += b.wobbleSpeed;
    b.opacity -= b.fadeRate;

    // 到达水面（ceilingY）时消失
    if (props.ceilingY && b.y <= props.ceilingY) {
      if (props.clearing) {
        bubbles.splice(i, 1);
      } else {
        bubbles[i] = createBubble();
      }
      continue;
    }

    if (b.opacity <= 0) {
      if (props.clearing) {
        bubbles.splice(i, 1);
      } else {
        bubbles[i] = createBubble();
      }
      continue;
    }

    drawBubble(b);
  }

  ctx.globalAlpha = 1;

  // 清除模式下，所有气泡消失后通知父组件
  if (props.clearing && bubbles.length === 0) {
    emit('bubbles:cleared');
    return;
  }

  animationId = requestAnimationFrame(animate);
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

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  initBubbles();
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
.ocean-bubbles {
  display: block;
  pointer-events: none;
}
</style>
