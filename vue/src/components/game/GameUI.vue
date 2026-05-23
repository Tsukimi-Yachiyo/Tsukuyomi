<template>
  <div v-if="isVisible" class="game-ui-root">
    <!-- 顶部状态栏：从右到左排列 -->
    <header class="ui-top-bar">
      <KeyHint hint-key="ESC">
        <button
            ref="pauseBtnRef"
            class="ui-home-btn"
            :class="{ 'ui-btn-hidden': paused }"
            @mousedown.capture.stop
            @touchstart.capture.stop
            @click.capture.stop="$emit('home')"
            @mouseenter="onPauseHover(true)"
            @mouseleave="onPauseHover(false)"
        >
          <span class="ui-home-circle"></span>
          <img :src="homeIcon" alt="Home" class="ui-home-icon" />
        </button>
      </KeyHint>
      <slot name="top-bar"></slot>
    </header>

    <!-- 左下角聊天按钮 -->
    <div class="ui-chat-anchor">
      <KeyHint hint-key="T">
        <button
            class="ui-chat-btn"
            :class="{ 'ui-btn-hidden': paused }"
            @mousedown.capture.stop
            @touchstart.capture.stop
            @click.capture.stop="$emit('chat')"
        >
          <img :src="chatIcon" alt="Chat" class="w-6 h-6 object-contain" />
        </button>
      </KeyHint>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/utils/eventBus';
import KeyHint from '@/components/game/KeyHint.vue';
import homeIcon from '@/assets/ui_button/home.png';
import chatIcon from '@/assets/icons/chat.svg';

const props = defineProps<{
  paused?: boolean;
}>();

const emit = defineEmits<{
  (e: 'chat'): void;
  (e: 'home'): void;
  (e: 'pause-hover', hovering: boolean, rect: DOMRect | null): void;
}>();

const isVisible = ref(false);
const pauseBtnRef = ref<HTMLButtonElement | null>(null);

const onEngineReady = () => {
  isVisible.value = true;
};

const onPauseHover = (hovering: boolean) => {
  const rect = hovering ? pauseBtnRef.value?.getBoundingClientRect() ?? null : null;
  emit('pause-hover', hovering, rect);
};

// 使用事件捕获机制 (capture: true) 以确保键盘事件高于其他组件/iframe的优先级
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 't' || e.key === 'T') {
    e.stopPropagation();
    e.preventDefault();
    emit('chat');
  }
};

onMounted(() => {
  eventBus.on('cocos:engine-ready', onEngineReady);
  // 第三个参数设置为 true 开启捕获阶段监听
  window.addEventListener('keydown', onKeydown, true);
});

onUnmounted(() => {
  eventBus.off('cocos:engine-ready', onEngineReady);
  window.removeEventListener('keydown', onKeydown, true);
});
</script>

<style scoped>
.game-ui-root {
  position: fixed;
  inset: 0;
  /* 让根容器鼠标穿透，底层游戏才能正常响应鼠标，内部元素通过继承获得 none */
  pointer-events: none;
  z-index: 150;
}

/* ===== 顶部状态栏 ===== */
.ui-top-bar {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
}

/* ===== 顶部 Home 按钮 ===== */
.ui-home-btn {
  position: relative;
  /* 核心交互元素拿回指针事件的控制权 */
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.ui-home-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.ui-home-icon {
  position: relative;
  width: 60px;
  height: 60px;
  object-fit: contain;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.ui-home-btn:hover .ui-home-circle {
  background: rgba(255, 255, 255, 0.18);
  box-shadow:
      0 0 20px rgba(255, 255, 255, 0.25),
      0 0 40px rgba(255, 255, 255, 0.1);
}

.ui-home-btn:hover .ui-home-icon {
  transform: scale(1.08);
}

.ui-home-btn:active .ui-home-circle {
  transform: translate(-50%, -50%) scale(0.95);
  background: rgba(255, 255, 255, 0.12);
}

/* ===== 左下角聊天按钮 ===== */
.ui-chat-anchor {
  position: absolute;
  left: 20px;
  bottom: 56px;
}

.ui-chat-btn {
  /* 核心交互元素拿回指针事件的控制权 */
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ui-chat-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ui-chat-btn:active {
  transform: translateY(0);
  background: rgba(255, 255, 255, 0.15);
}

/* 暂停时隐藏按钮 */
.ui-btn-hidden {
  opacity: 0;
  /* 加上 !important 防止被组件本身的 auto 覆盖，避免被隐形点击 */
  pointer-events: none !important;
  transform: scale(0.8);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
</style>