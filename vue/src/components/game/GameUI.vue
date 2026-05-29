<template>
  <div v-if="isVisible" class="pointer-events-none fixed inset-0 z-[150]">
    <!-- 顶部状态栏：从右到左排列 -->
    <header class="absolute right-0 top-0 flex flex-row-reverse items-center gap-2 px-5 py-3">
      <KeyHint hint-key="ESC">
        <button
            ref="pauseBtnRef"
            class="ui-home-btn"
            :class="{ 'opacity-0 scale-90 pointer-events-none !pointer-events-none': paused }"
            @mousedown.capture.stop
            @touchstart.capture.stop
            @click.capture.stop="$emit('home')"
            @mouseenter="onPauseHover(true)"
            @mouseleave="onPauseHover(false)"
        >
          <span class="ui-home-circle"></span>
          <img :src="homeIcon" alt="Home" class="relative h-[60px] w-[60px] object-contain transition-all duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]" />
        </button>
      </KeyHint>
      <slot name="top-bar"></slot>
    </header>

    <!-- 左下角聊天按钮 -->
    <div class="absolute bottom-14 left-5">
      <KeyHint hint-key="T">
        <button
            class="pointer-events-auto flex h-[42px] w-[42px] items-center justify-center rounded-full border-none bg-white/12 text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] backdrop-blur transition-all duration-200 ease-in hover:-translate-y-[1px] hover:bg-white/22 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:translate-y-0 active:bg-white/15"
            :class="{ 'opacity-0 scale-90 pointer-events-none !pointer-events-none': paused }"
            @mousedown.capture.stop
            @touchstart.capture.stop
            @click.capture.stop="$emit('chat')"
        >
          <img :src="chatIcon" alt="Chat" class="h-6 w-6 object-contain" />
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
  chatOpen?: boolean;
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
  if (props.chatOpen) return;
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
.ui-home-btn {
  position: relative;
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
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
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

.ui-home-btn:hover .ui-home-circle {
  background: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 0 20px rgba(255, 255, 255, 0.25),
    0 0 40px rgba(255, 255, 255, 0.1);
}

.ui-home-btn:hover img {
  transform: scale(1.08);
}

.ui-home-btn:active .ui-home-circle {
  transform: translate(-50%, -50%) scale(0.95);
  background: rgba(255, 255, 255, 0.12);
}
</style>