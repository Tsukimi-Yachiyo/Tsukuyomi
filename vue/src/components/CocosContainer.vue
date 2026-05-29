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
  <GameUI
      :paused="isPaused"
      :chat-open="isChatOpen"
      @chat="onChatClick"
      @home="onHomeClick"
      @pause-hover="onPauseHover"
  />
  <!-- 键盘按键提示 -->
  <KeyboardHints :paused="isPaused" />
  <!-- 暂停动画 -->
  <PauseMoon
      v-model:paused="isPaused"
      :hovered="isPauseHovered"
      :button-rect="pauseBtnRect"
  >
    <template #message>
      <UserInfoPause />
    </template>
  </PauseMoon>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { sendToCocos, initCocosBridge, setCocosIframe } from '@/bridge/cocosBridge';
import { eventBus } from '@/utils/eventBus';
import { useUserStore } from '@/store/userStore';
import { addModal } from '@/store/modalStore';
import GameUI from '@/components/game/GameUI.vue';
import KeyboardHints from '@/components/game/KeyboardHints.vue';
import PauseMoon from '@/components/game/PauseMoon.vue';
import UserInfoPause from "@/components/game/UserInfoPause.vue";
import ChatDialog from '@/components/game/ChatDialog.vue';

const containerRef = ref<HTMLDivElement | null>(null);
const cocosIframe = ref<HTMLIFrameElement | null>(null);
const isLoading = ref(true);
const loadingText = ref('正在加载游戏资源...');
const cocosReady = ref(false);
const cleanupFn = ref<(() => void) | null>(null);
const initTimeoutRef = ref<number | null>(null);
const isPaused = ref(false);
const isPauseHovered = ref(false);
const pauseBtnRect = ref<DOMRect | null>(null);
const chatModalId = ref<string | null>(null);
const isChatOpen = ref(false);

const onChatClick = () => {
  if (chatModalId.value) return;
  chatModalId.value = addModal({
    type: 'function',
    component: ChatDialog,
    closable: true,
    onClosed: () => {
      chatModalId.value = null;
      isChatOpen.value = false;
    },
  });
  isChatOpen.value = true;
};

const onHomeClick = () => {
  isPaused.value = !isPaused.value;
  console.log('[CocosContainer] Pause toggled:', isPaused.value);
};

const onPauseHover = (hovering: boolean, rect: DOMRect | null) => {
  isPauseHovered.value = hovering;
  pauseBtnRect.value = rect;
};

const cocosUrl = '/cocos/index.html';
const INIT_TIMEOUT = 15000;

const completeInit = () => {
  if (!isLoading.value) return;
  cocosReady.value = true;
  isLoading.value = false;
  loadingText.value = '';
  console.log('[CocosContainer] Cocos initialization completed');
};

const onIframeLoad = async () => {
  console.log('[CocosContainer] Cocos iframe loaded');
  loadingText.value = '正在初始化引擎...';

  await nextTick();

  if (cocosIframe.value) {
    setCocosIframe(cocosIframe.value);

    // ✅ 向 iframe 注入拦截脚本
    try {
      const iframeDoc = cocosIframe.value.contentDocument;
      if (iframeDoc) {
        const script = iframeDoc.createElement('script');
        script.textContent = `
          (function() {
            // 保存原始 focus 以备后用（如果需要）
            const originalFocus = HTMLCanvasElement.prototype.focus;
            HTMLCanvasElement.prototype.focus = function() {
            };
          })();
        `;
        // 插入到 head 最前面，确保在 Cocos 引擎代码执行前
        const firstScript = iframeDoc.head?.querySelector('script');
        if (firstScript) {
          iframeDoc.head.insertBefore(script, firstScript);
        } else {
          iframeDoc.head?.appendChild(script);
        }
      }
    } catch (e) {
      console.warn('[CocosContainer] Failed to inject focus blocker', e);
    }
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
    if (useUserStore().isLoggedIn) {
      sendToCocos('login-success', {
        userId: useUserStore().userId || 1,
        token: useUserStore().token
      });
    }
  }
});

defineExpose({
  sendToCocos,
  isReady: cocosReady,
});
</script>