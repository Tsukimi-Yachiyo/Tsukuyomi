<template>
  <div class="cocos-container" ref="containerRef">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <span class="loading-text">{{ loadingText }}</span>
      </div>
    </div>
    <iframe 
      ref="cocosIframe"
      :src="cocosUrl"
      class="cocos-iframe"
      @load="onIframeLoad"
      sandbox="allow-scripts allow-same-origin allow-pointer-lock"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { sendToCocos, initCocosBridge, setCocosIframe } from '@/bridge/cocosBridge';
import { eventBus } from '@/utils/eventBus';
import { useStore } from '@/store/userStore';

const containerRef = ref<HTMLDivElement | null>(null);
const cocosIframe = ref<HTMLIFrameElement | null>(null);
const isLoading = ref(true);
const loadingText = ref('正在加载游戏资源...');
const cocosReady = ref(false);
const cleanupFn = ref<(() => void) | null>(null);
const initTimeoutRef = ref<number | null>(null);

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
        userId: useStore().userId || 1, // 确保 userId 是数字或有默认值
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

<style scoped>
.cocos-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0a0a0f;
}

.cocos-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid rgba(100, 108, 255, 0.2);
  border-top-color: #646cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #94a3b8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>