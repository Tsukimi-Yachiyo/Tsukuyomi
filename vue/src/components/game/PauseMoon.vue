<template>
  <Transition name="pause-overlay">
    <div
        v-if="paused"
        class="fixed inset-0 z-280 bg-black/45 backdrop-blur-[2px] pointer-events-auto"
        @click.self="unpause"
    >
      <div
          ref="live2dContainerRef"
          v-show="live2dVisible"
          class="fixed -bottom-25 left-0 w-120 h-160 z-295 overflow-hidden live2d-container"
          :style="{
          transform: `translate(${containerPos.x}px, ${containerPos.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
          }"
          @mousedown="onMouseDown"
          @mouseenter="onContainerEnter"
          @mouseleave="onContainerLeave">
        <canvas
            ref="live2dCanvasRef"
            class="w-full h-full block bg-transparent"
        />
        <Transition name="btn-fade">
          <button
              v-if="showCloseBtn"
              class="live2d-close-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white text-lg hover:bg-red-500 transition-colors cursor-pointer z-10"
              @click.stop="closeLive2D"
              title="关闭模型"
          >
            ✕
          </button>
        </Transition>
      </div>

      <div class="fixed z-285 pointer-events-none" :style="moonPos">
        <!-- 月亮主体 -->
        <div class="moon-body relative w-20 h-20 rounded-full bg-transparent shadow-[inset_-80px_-80px_0_0_#fff] transition-shadow duration-800 ease-[cubic-bezier(0.23,1,0.32,1)]" />
        <!-- 月亮光晕 -->
        <div class="moon-glow absolute -inset-6.25 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25)_0%,transparent_60%)] transition-all duration-800 ease-in-out" />

        <div class="absolute right-full top-1/2 -translate-y-1/2 mr-4 pointer-events-auto z-290 flex flex-row gap-10">
          <!-- 用户按钮 -->
          <button
              class="w-15 h-15 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              :class="activeTab === 'user' ? 'bg-[rgba(77,240,255,0.9)]' : 'bg-black/40 hover:bg-black/60'"
              @click="switchTab('user')"
              title="用户"
          >
            <img :src="userTabIcon" alt="用户" class="w-10 h-10" />
          </button>

          <!-- 帖子按钮 -->
          <button
              class="w-15 h-15 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              :class="activeTab === 'post' ? 'bg-[rgba(77,240,255,0.9)]' : 'bg-black/40 hover:bg-black/60'"
              @click="switchTab('post')"
              title="帖子"
          >
            <img :src="postTabIcon" alt="帖子" class="w-10 h-10" />
          </button>

          <!-- 退出按钮 -->
          <button
              class="w-15 h-15 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              @click="logout"
              title="退出"
          >
            <img :src="logoutIcon" alt="退出" class="w-10 h-10" />
          </button>

          <!-- 设置按钮 -->
          <button
              class="w-15 h-15 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
              :class="activeTab === 'setting' ? 'bg-[rgba(77,240,255,0.9)]' : 'bg-black/40 hover:bg-black/60'"
              @click="switchTab('setting')"
              title="设置"
          >
            <img :src="settingIcon" alt="设置" class="w-10 h-10" />
          </button>
        </div>
      </div>

      <div class="ocean-layer fixed inset-0 z-283 pointer-events-none transition-all duration-800 ease-[cubic-bezier(0.23,1,0.32,1)]">
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

      <Transition name="panel-fade">
        <div v-if="showUserPanel" class="fixed top-32 left-1/2 -translate-x-1/2 z-290 pointer-events-auto">
          <div class="flex flex-col items-center justify-center min-h-50">
            <Transition name="tab-content" mode="out-in">
              <UserInfoPause v-if="activeTab === 'user'" key="user" />
              <PostDisplayPause v-else-if="activeTab === 'post'" key="post" />
              <SettingsPanel v-else-if="activeTab === 'setting'" key="setting" />
            </Transition>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <Transition name="crescent-appear">
    <div
        v-if="showCrescent"
        class="fixed w-20 h-20 rounded-full bg-transparent pointer-events-none z-286"
        style="box-shadow: inset -25px -25px 0 0 #fff;"
        :style="crescentPosition"
    />
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import OceanWaves from '@/components/ocean/OceanWaves.vue';
import type { WaveLayer } from '@/components/ocean/waveTypes';
import UserInfoPause from "@/components/game/UserInfoPause.vue";
import PostDisplayPause from "@/components/game/PostDisplayPause.vue";
import SettingsPanel from "@/components/game/SettingsPanel.vue";
import userTabIcon from "@/assets/icons/user-tab.svg";
import postTabIcon from "@/assets/icons/post-tab.svg";
import logoutIcon from "@/assets/icons/logout.svg";
import settingIcon from "@/assets/icons/setting.svg";
import { CubismFramework, Option, LogLevel } from '@live2d-framework/live2dcubismframework';
import { LAppSubdelegate } from '@/live2d/lappsubdelegate';
import { LAppPal } from '@/live2d/lapppal';
import { LAppModel } from '@/live2d/lappmodel';
import router from "@/router";
import {useUserStore} from "@/store/userStore";

// --- Props & Emits ---
const props = defineProps<{ paused: boolean; hovered?: boolean; buttonRect?: DOMRect | null; }>();
const emit = defineEmits<{ (e: 'update:paused', value: boolean): void; }>();

// --- Refs ---
const wavesRef = ref<InstanceType<typeof OceanWaves>>();
const oceanWidth = ref(window.innerWidth);
const oceanHeight = ref(window.innerHeight);
const showUserPanel = ref(false);
const activeTab = ref<'user' | 'post' | 'setting'>('user');
const live2dVisible = ref(true);
let panelTimer: ReturnType<typeof setTimeout> | null = null;

// Live2D Refs
const live2dContainerRef = ref<HTMLElement | null>(null);
const live2dCanvasRef = ref<HTMLCanvasElement | null>(null);
let live2dSubdelegate: LAppSubdelegate | null = null;
let live2dModel: LAppModel | null = null;
let live2dAnimationId: number | null = null;
let isLive2DInitialized = false;

// ==========================================
// 核心：基于时间轴的动画引擎 (分离位移与动作)
// ==========================================
const animationState = {
  playing: false,
  startTime: 0,
};

// 缓动函数
function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3); }
// 定义你的时间轴剧本（触发器模式）
const timelineSteps = [
  // 0秒：从左侧 -400px 入场，耗时 1.0 秒
  { type: 'move', start: 0.0, duration: 1.0, sx: -400, ex: 0, sy: 0, ey: 0 },

  // 1秒：触发表情和动作 (不直接改参数，而是调用官方API)
  { type: 'trigger', start: 1.0, fired: false, action: () => {
      if (!live2dModel) return;
      // 调用你本地的 smiling.exp3.json 表情
      live2dModel.setExpression('smiling');

      // 注意：这里的 'Greeting' 需要对应你 model3.json 里面的动作组名称。
      // 如果你的打招呼动作在 'TapBody' 组里，就改成 'TapBody'
      live2dModel.startRandomMotion('Greeting', 3);
    }},

  // 3.5秒：恢复平稳站立
  { type: 'trigger', start: 3.5, fired: false, action: () => {
      if (!live2dModel) return;
      // 恢复普通表情
      live2dModel.setExpression('normal');
      // 强制切回待机动作
      live2dModel.startRandomMotion('Idle', 1);
    }}
];

// 执行时间轴更新
function updateCustomTimeline() {
  if (!animationState.playing) return;

  const elapsed = (performance.now() - animationState.startTime) / 1000;

  let currentX = -400; // 默认停在左外侧
  let currentY = 0;

  for (const step of timelineSteps) {
    // 1. 处理位移和跳跃
    if (step.type === 'move') {
      if (elapsed >= step.start) {
        let progress = Math.min((elapsed - step.start) / step.duration, 1.0);
        if (step.type === 'move') {
          const t = easeOutCubic(progress);
          currentX = step.sx + (step.ex - step.sx) * t;
          currentY = step.sy + (step.ey - step.sy) * t;
        }
      }
    }

    // 2. 处理一次性触发的表情/动作事件
    if (step.type === 'trigger' && !step.fired && elapsed >= step.start) {
      step.fired = true;
      step.action();
    }
  }

  // 物理位移由外层 DOM 容器负责，绝不干扰 Live2D 内部逻辑
  if (live2dContainerRef.value) {
    containerPos.value = { x: currentX, y: -currentY };
  }

  // 动画结束清理
  if (elapsed >= 4.0) {
    animationState.playing = false;
  }
}

function playSequence() {
  animationState.startTime = performance.now();
  animationState.playing = true;

  // 重置事件触发锁，保证每次打开面板都会执行打招呼
  timelineSteps.forEach(step => { if (step.type === 'trigger') step.fired = false; });

  if (live2dContainerRef.value) {
    containerPos.value = { x: -400, y: 0 };
  }
}

// ==========================================
// 基础 Live2D 生命周期
// ==========================================
let isCubismInitialized = false;
function initCubismFramework(): boolean {
  if (isCubismInitialized) return true;
  try {
    const option = new Option();
    option.logFunction = (msg: string) => console.log('[Live2D]', msg);
    option.loggingLevel = LogLevel.LogLevel_Off;
    CubismFramework.startUp(option);
    CubismFramework.initialize();
    isCubismInitialized = true;
    return true;
  } catch (e) {
    return false;
  }
}

function setupCanvasSize() {
  if (!live2dCanvasRef.value) return;
  const canvas = live2dCanvasRef.value;
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
}

function startRenderLoop() {
  const render = () => {
    if (!isLive2DInitialized || !live2dSubdelegate) return;

    LAppPal.updateTime();
    live2dSubdelegate.update();

    updateCustomTimeline();

    live2dAnimationId = requestAnimationFrame(render);
  };
  render();
}

function stopRenderLoop() {
  if (live2dAnimationId) {
    cancelAnimationFrame(live2dAnimationId);
    live2dAnimationId = null;
  }
}

async function initLive2D() {
  await nextTick();
  if (!live2dCanvasRef.value) return;

  setupCanvasSize();
  if (!initCubismFramework()) return;

  LAppPal.updateTime();
  live2dSubdelegate = new LAppSubdelegate();

  if (live2dSubdelegate.initialize(live2dCanvasRef.value)) {
    isLive2DInitialized = true;
    const models = live2dSubdelegate.getLive2DManager()._models;
    if (models.getSize() > 0) {
      live2dModel = models.at(0);
    }
    if (live2dContainerRef.value) {
      containerPos.value = { x: -400, y: 0 };
    }
    startRenderLoop();
  }
}

function cleanupLive2D() {
  stopRenderLoop();
  isLive2DInitialized = false;
  animationState.playing = false;
  if (live2dSubdelegate) {
    live2dSubdelegate.release();
    live2dSubdelegate = null;
  }
  live2dModel = null;
}

// ==========================================
// UI 计算与其他逻辑
// ==========================================
const showCrescent = computed(() => props.hovered && !props.paused);
const crescentPosition = computed(() => {
  if (!props.buttonRect) return { top: '80px', right: '60px' };
  const r = props.buttonRect;
  return { top: `${r.top + r.height / 2 - 40}px`, left: `${r.left + r.width / 2 - 40}px` };
});
const btnCenterX = computed(() => props.buttonRect ? props.buttonRect.left + props.buttonRect.width / 2 : window.innerWidth - 60);
const btnCenterY = computed(() => props.buttonRect ? props.buttonRect.top + props.buttonRect.height / 2 : 60);
const moonPos = computed<Record<string, string>>(() => ({
  top: `${btnCenterY.value}px`,
  left: `${btnCenterX.value}px`,
  transform: 'translate(-50%, -50%)',
}));
const oceanLayers: WaveLayer[] = [
  { color: 'transparent', amplitude: 30, frequency: 0.008, speed: 0.02, offsetY: 0, opacity: 1, jitter: 0 },
  { color: 'transparent', amplitude: 25, frequency: 0.012, speed: 0.015, offsetY: 20, opacity: 0.7, jitter: 0 },
  { color: 'transparent', amplitude: 20, frequency: 0.018, speed: 0.025, offsetY: 40, opacity: 0.5, jitter: 0 },
];

function unpause() { emit('update:paused', false); }
function switchTab(tab: 'user' | 'post' | 'setting') { activeTab.value = tab; }
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    props.paused ? unpause() : emit('update:paused', true);
  }
}
function onResize() {
  oceanWidth.value = window.innerWidth;
  oceanHeight.value = window.innerHeight;
  if (live2dCanvasRef.value) setupCanvasSize();
}

const isHovering = ref(false);
// 拖动相关状态
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const containerPos = ref({ x: 0, y: 0 });   // 当前 translate 值

// 容器初始位置 (对应你的 fixed: bottom-[-25] left-0)
// 如果你的底部定位是用 bottom: -25px，建议改成基于 top/left 计算，这里为了简单直接用 translate 增量
// 注意：你的容器使用了 -bottom-25 和 left-0，直接用 translate 从当前位置平移即可

function onMouseDown(e: MouseEvent) {
  // 避免拖动关闭按钮时触发
  if ((e.target as HTMLElement).closest('.live2d-close-btn')) return;

  isDragging.value = true;
  dragStart.value = {
    x: e.clientX - containerPos.value.x,
    y: e.clientY - containerPos.value.y
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const newX = e.clientX - dragStart.value.x;
  const newY = e.clientY - dragStart.value.y;

  // 可选：限制在屏幕内
  const maxX = window.innerWidth - 480;  // 根据容器宽度调整
  const maxY = window.innerHeight - 640; // 根据容器高度调整
  containerPos.value = {
    x: Math.min(Math.max(newX, 0), maxX),
    y: Math.min(Math.max(newY, 0), maxY)
  };
}

function onMouseUp() {
  isDragging.value = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

// 记得在组件卸载时清理事件
onUnmounted(() => {
  // 原有清理...
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});
const showCloseBtn = computed(() => isHovering.value && !isDragging.value); // 拖动时隐藏按钮

function onContainerEnter() {
  isHovering.value = true;
}

function onContainerLeave() {
  isHovering.value = false;
}

function closeLive2D() {
  live2dVisible.value = false;
  // 根据需要也可以直接清理资源
  cleanupLive2D();
}

function logout() {
  useUserStore().logout();
  router.push('/');
  window.location.reload();
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('resize', onResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('resize', onResize);
  cleanupLive2D();
  if (panelTimer) clearTimeout(panelTimer);
});

watch(
    () => props.paused,
    async (paused) => {
      if (panelTimer) { clearTimeout(panelTimer); panelTimer = null; }

      if (paused) {
        containerPos.value = { x: -400, y: 0 };
        live2dVisible.value = true;
        await nextTick();
        if (!isLive2DInitialized) await initLive2D();
        activeTab.value = 'user';

        panelTimer = setTimeout(() => {
          showUserPanel.value = true;
          playSequence();
        }, 800);
      } else {
        cleanupLive2D();
        showUserPanel.value = false;
        activeTab.value = 'user';
      }
    },
    { immediate: true }
);
</script>

<style scoped>
/* * 仅保留 Vue <Transition> 触发时的特殊状态样式
 * 这些包含复杂的父子选择器组合，使用原版 CSS 控制更加清晰
 */

/* 月亮缩小效果 */
.pause-overlay-enter-from .moon-body,
.pause-overlay-leave-to .moon-body {
  box-shadow: inset -25px -25px 0 0 #fff;
}

/* 月亮光晕淡出缩小 */
.pause-overlay-enter-from .moon-glow,
.pause-overlay-leave-to .moon-glow {
  transform: scale(1.3);
  opacity: 0;
}

/* 海浪下沉淡出 */
.pause-overlay-enter-from .ocean-layer,
.pause-overlay-leave-to .ocean-layer {
  opacity: 0;
  transform: translateY(30px);
}

/* 暂停层整体淡入淡出 */
.pause-overlay-enter-active,
.pause-overlay-leave-active {
  transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.pause-overlay-enter-from,
.pause-overlay-leave-to {
  opacity: 0;
}

.btn-fade-enter-active,
.btn-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.btn-fade-enter-from,
.btn-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 新月图标动画 */
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

/* 面板浮现动画 */
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

.tab-content-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.tab-content-leave-active {
  transition: opacity 0.2s ease;
}
.tab-content-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.tab-content-leave-to {
  opacity: 0;
}
</style>