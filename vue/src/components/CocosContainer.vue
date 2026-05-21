<template>
  <div class="relative w-full h-screen overflow-hidden bg-[#0a0a0f]" ref="containerRef">
    <div v-if="isLoading" class="absolute inset-0 bg-linear-to-br from-[#0a0a0f] to-[#1a1a2e] flex items-center justify-center z-100">
      <div class="flex flex-col items-center gap-6">
        <div class="w-16 h-16 border-4 border-indigo-500/20 border-t-[#646cff] rounded-full animate-spin"></div>
        <span class="text-base text-slate-400 font-sans">{{ loadingText }}</span>
      </div>
    </div>
    <iframe
      ref="cocosIframe"
      :src="cocosUrl"
      class="absolute inset-0 w-full h-full border-none block"
      @load="onIframeLoad"
      sandbox="allow-scripts allow-same-origin allow-pointer-lock"
    ></iframe>
  </div>
  <!-- 游戏 2D UI 层 -->
  <GameUI @chat="onChatClick" @home="onHomeClick" />
  <!-- 键盘按键提示 -->
  <KeyboardHints />
  <!-- 暂停面板 -->
  <PausePanel :visible="isPauseVisible" @close="isPauseVisible = false" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { sendToCocos, initCocosBridge, setCocosIframe } from '@/bridge/cocosBridge';
import { eventBus } from '@/utils/eventBus';
import { useStore } from '@/store/userStore';
import GameUI from '@/components/game/GameUI.vue';
import KeyboardHints from '@/components/game/KeyboardHints.vue';
import PausePanel from '@/components/game/PausePanel.vue';

const containerRef = ref<HTMLDivElement | null>(null);
const cocosIframe = ref<HTMLIFrameElement | null>(null);
const isLoading = ref(true);
const loadingText = ref('正在加载游戏资源...');
const cocosReady = ref(false);
const cleanupFn = ref<(() => void) | null>(null);
const initTimeoutRef = ref<number | null>(null);
const handleIframeFocus = () => focusCocosCanvas();
const isPauseVisible = ref(false);

const onChatClick = () => {
  // TODO: 打开聊天面板
  console.log('[CocosContainer] Chat button clicked');
};

const onHomeClick = () => {
  isPauseVisible.value = !isPauseVisible.value;
  console.log('[CocosContainer] Pause panel toggled:', isPauseVisible.value);
};

const cocosUrl = '/cocos/index.html';
const INIT_TIMEOUT = 15000;

const focusCocosCanvas = () => {
  if (!cocosIframe.value) return;
  try {
    const canvas = cocosIframe.value.contentWindow?.document.getElementById('GameCanvas');
    if (canvas) {
      (canvas as HTMLElement).focus();
    } else {
      cocosIframe.value.focus();
    }
  } catch {
    cocosIframe.value.focus();
  }
};

const completeInit = () => {
  if (!isLoading.value) return;
  cocosReady.value = true;
  isLoading.value = false;
  loadingText.value = '';
  // 引擎就绪后聚焦 canvas，确保 Cocos input 系统能接收键盘事件
  nextTick(focusCocosCanvas);
  console.log('[CocosContainer] Cocos initialization completed');
};

const onIframeLoad = async () => {
  console.log('[CocosContainer] Cocos iframe loaded');
  loadingText.value = '正在初始化引擎...';
  
  await nextTick();
  
  if (cocosIframe.value) {
    setCocosIframe(cocosIframe.value);
    // 监听 iframe 获得焦点事件，确保 canvas 始终能接收键盘输入
    cocosIframe.value.addEventListener('focus', handleIframeFocus);
    focusCocosCanvas();
    console.log('[CocosContainer] iframe registered to bridge');
  }
  
  initTimeoutRef.value = window.setTimeout(() => {
    console.warn('[CocosContainer] Engine ready timeout, proceeding anyway');
    completeInit();
  }, INIT_TIMEOUT);
};

const setupMessageBridge = (): (() => void) => {
  const cleanup = initCocosBridge();
  
  const handleEngineReady = () => {
    if (initTimeoutRef.value) {
      clearTimeout(initTimeoutRef.value);
      initTimeoutRef.value = null;
    }
    completeInit();
  };
  
  eventBus.on('cocos:engine-ready', handleEngineReady);
  
  return () => {
    cleanup();
    eventBus.off('cocos:engine-ready', handleEngineReady);
  };
};

const init = () => {
  cleanupFn.value = setupMessageBridge();
};

const destroyCocos = () => {
  if (initTimeoutRef.value) {
    clearTimeout(initTimeoutRef.value);
    initTimeoutRef.value = null;
  }

  if (cocosIframe.value) {
    cocosIframe.value.removeEventListener('focus', handleIframeFocus);
  }

  setCocosIframe(null);

  if (cleanupFn.value) {
    cleanupFn.value();
    cleanupFn.value = null;
  }

  if (cocosIframe.value) {
    cocosIframe.value.src = '';
  }
};

onMounted(() => {
  console.log('[CocosContainer] Mounted, starting initialization');
  init();
});

onUnmounted(() => {
  console.log('[CocosContainer] Unmounted, cleaning up');
  destroyCocos();
});

watch(cocosReady, (ready) => {
  if (ready) {
    console.log('[CocosContainer] Sending login status to Cocos');
    if (useStore().isLoggedIn) {
      sendToCocos('login-success', {
        userId: useStore().userId || 1,
        token: useStore().token
      });
    }
  }
});

defineExpose({
  sendToCocos,
  isReady: cocosReady,
});
</script>