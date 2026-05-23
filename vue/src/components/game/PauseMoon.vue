<template>
  <!-- 暂停覆盖层 -->
  <Transition name="pause-overlay">
    <div
        v-if="paused"
        class="pause-moon-root"
        @click.self="unpause"
    >
      <!-- 月球主体：盒子背景完全透明，依赖内阴影构造动画 -->
      <div class="moon-container" :style="moonPos">
        <div class="moon-body" />
        <div class="moon-glow" />
      </div>

      <!-- 海洋波浪线条（与月亮变化同时进行） -->
      <div class="ocean-layer">
        <OceanWaves
            ref="wavesRef"
            :width="oceanWidth"
            :height="oceanHeight"
            :base-y-ratio="0.1"
            :start-base-y-ratio="1.5"
            :wave-speed="0.02"
            :layers="oceanLayers"
            stroke-only
            stroke-color="#ffffff"
            :stroke-width="2"
        />
      </div>

      <!-- 用户暂停区 -->
      <Transition name="panel-fade">
        <div v-if="showUserPanel" class="user-panel-wrapper">
          <UserInfoPause :isSelf="true" />
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- 悬停时的月牙预览（在按钮旁） -->
  <Transition name="crescent-appear">
    <div
        v-if="showCrescent"
        class="crescent-peek"
        :style="crescentPosition"
    />
  </Transition>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted, watch} from 'vue';
import OceanWaves from '@/components/ocean/OceanWaves.vue';
import type { WaveLayer } from '@/components/ocean/waveTypes';
import UserInfoPause from "@/components/game/UserInfoPause.vue";

const props = defineProps<{
  paused: boolean;
  hovered?: boolean;
  buttonRect?: DOMRect | null;
}>();

const emit = defineEmits<{
  (e: 'update:paused', value: boolean): void;
}>();

const wavesRef = ref<InstanceType<typeof OceanWaves>>();
const oceanWidth = ref(window.innerWidth);
const oceanHeight = ref(window.innerHeight);

const showUserPanel = ref(false);
let panelTimer: ReturnType<typeof setTimeout> | null = null;

// ========== 悬停月牙预览 ==========

const showCrescent = computed(() => props.hovered && !props.paused);

const crescentPosition = computed(() => {
  if (!props.buttonRect) return { top: '80px', right: '60px' };
  const r = props.buttonRect;
  return {
    top: `${r.top + r.height / 2 - 40}px`,  // 把 25 改为 40
    left: `${r.left + r.width / 2 - 40}px`, // 把 25 改为 40
  };
});

// ========== 月球位置 ==========

// 按钮中心坐标（px）
const btnCenterX = computed(() => props.buttonRect ? props.buttonRect.left + props.buttonRect.width / 2 : window.innerWidth - 60);
const btnCenterY = computed(() => props.buttonRect ? props.buttonRect.top + props.buttonRect.height / 2 : 60);

// 月球始终固定在按钮位置
const moonPos = computed<Record<string, string>>(() => ({
  top: `${btnCenterY.value}px`,
  left: `${btnCenterX.value}px`,
  transform: 'translate(-50%, -50%)',
}));

// ========== 海洋配置 ==========
const oceanLayers: WaveLayer[] = [
  { color: 'transparent', amplitude: 30, frequency: 0.008, speed: 0.02, offsetY: 0, opacity: 1, jitter: 0 },
  { color: 'transparent', amplitude: 25, frequency: 0.012, speed: 0.015, offsetY: 20, opacity: 0.7, jitter: 0 },
  { color: 'transparent', amplitude: 20, frequency: 0.018, speed: 0.025, offsetY: 40, opacity: 0.5, jitter: 0 },
];

function unpause() {
  emit('update:paused', false);
}

// ========== 捕获键盘事件 ==========
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    if (props.paused) {
      unpause();
    } else {
      emit('update:paused', true);
    }
  }
}

function onResize() {
  oceanWidth.value = window.innerWidth;
  oceanHeight.value = window.innerHeight;
}

onMounted(() => {
  // 采用捕获阶段执行，以保证拥有最高优先级
  window.addEventListener('keydown', onKeydown, true);
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown, true);
  window.removeEventListener('resize', onResize);
});

watch(
    () => props.paused,
    (paused) => {
      // 清除任何等待中的定时器
      if (panelTimer) {
        clearTimeout(panelTimer);
        panelTimer = null;
      }
      if (paused) {
        // 延迟 800ms（与月亮、海洋动画时长一致）后显示面板
        panelTimer = setTimeout(() => {
          showUserPanel.value = true;
        }, 800);
      } else {
        // 暂停关闭时立即隐藏面板
        showUserPanel.value = false;
      }
    },
    { immediate: true }
);

// 组件卸载时清理定时器
onUnmounted(() => {
  if (panelTimer) clearTimeout(panelTimer);
});
</script>

<style scoped>
/* ========== 覆盖层 ========== */
.pause-moon-root {
  position: fixed;
  inset: 0;
  z-index: 280;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  pointer-events: auto;
}

/* 结合根节点的动画带动所有子组件的动画同时进出 */
.pause-overlay-enter-active,
.pause-overlay-leave-active {
  transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.pause-overlay-enter-from,
.pause-overlay-leave-to {
  opacity: 0;
}

/* ========== 悬停月牙预览 ========== */
.crescent-peek {
  position: fixed;
  width: 80px;       /* 改为 80px */
  height: 80px;      /* 改为 80px */
  border-radius: 50%;
  background: transparent;
  box-shadow: inset -25px -25px 0 0 #fff; /* 改为与动画起点一致的 -25px */
  pointer-events: none;
  z-index: 286;
}

.crescent-appear-enter-active {
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
.crescent-appear-leave-active {
  transition: all 0.2s ease-in;
}
.crescent-appear-enter-from {
  opacity: 0;
  transform: scale(0.3) rotate(-20deg);
}
.crescent-appear-leave-to {
  opacity: 0;
  transform: scale(0.6);
}

/* ========== 月球容器与本体 ========== */
.moon-container {
  position: fixed;
  z-index: 285;
  pointer-events: none;
}

.moon-body {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: transparent; /* 背景完全透明 */
  /* 稳定态为满月，通过 80px 的内阴影填满整个圆形 */
  box-shadow: inset -80px -80px 0 0 #fff;
  transition: box-shadow 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 动画：由月牙逐渐变成满月 (或者退出时由满月变回月牙) */
.pause-overlay-enter-from .moon-body,
.pause-overlay-leave-to .moon-body {
  box-shadow: inset -25px -25px 0 0 #fff; /* 起始和结束状态为右下角的月牙 */
}

/* 月球发光 */
.moon-glow {
  position: absolute;
  inset: -25px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
  transition: transform 0.8s ease, opacity 0.8s ease;
}

/* 刚出现或即将消失时的发光效果 */
.pause-overlay-enter-from .moon-glow,
.pause-overlay-leave-to .moon-glow {
  transform: scale(1.3);
  opacity: 0;
}

/* ========== 海洋层 ========== */
.ocean-layer {
  position: fixed;
  inset: 0;
  z-index: 283;
  pointer-events: none;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 海洋配合根元素淡入淡出及轻微位移 */
.pause-overlay-enter-from .ocean-layer,
.pause-overlay-leave-to .ocean-layer {
  opacity: 0;
  transform: translateY(30px);
}

.user-panel-wrapper {
  position: fixed;
  top: 200px;
  left: 100px;
  width: 1000px;
  height: 200px;
  z-index: 290; /* 确保在最上层 */
  pointer-events: auto;
}

/* ========== 用户消息区 ========== */
.user-message-area {
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: min(600px, 80vw);
  min-height: 120px;
  z-index: 290;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  transition-delay: 0.1s; /* 消息区稍微延迟出现显得更自然 */
}

.pause-overlay-enter-from .user-message-area,
.pause-overlay-leave-to .user-message-area {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}
   /* ========== 用户面板淡入动画 ========== */
 .panel-fade-enter-active {
   transition: opacity 0.4s ease, transform 0.4s ease;
 }
.panel-fade-leave-active {
  transition: opacity 0.2s ease;
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.panel-fade-leave-to {
  opacity: 0;
}
</style>