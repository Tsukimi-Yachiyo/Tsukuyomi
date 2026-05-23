<template>
  <!-- 启动画面 -->
  <SplashScreen :progress="splashProgress" :is-hidden="isSplashHidden" />

  <!-- 主容器：控制整体渲染时机 -->
  <div v-show="isReadyToRender">
    <!-- 视频背景容器 -->
    <div class="fixed inset-0 z-10 overflow-hidden pointer-events-none">
      <video
        ref="videoRef"
        class="w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out"
        :class="{ 'opacity-100': isVideoVisible }"
        :src="currentVideoUrl"
        autoplay
        muted
        playsinline
        @ended="onVideoEnded"
      />

      <div class="absolute top-8 right-8 w-10 h-10 pointer-events-auto" v-if=userStore.isLoggedIn>
        <KeyHint hint-key="ESC">
          <button
              class="skip-btn"
              @click.stop="finishLoadVideo"
          >
            <img v-if="skipIcon" :src="skipIcon" alt="跳过" class="w-10 h-10" />
            <span v-else class="text-white text-sm">跳过</span>
          </button>
        </KeyHint>
      </div>
    </div>

    <div
      class="fixed inset-0 pointer-events-auto"
      :class="gameContainerZClass"
    >
      <CocosContainer />
    </div>
  </div>

  <!-- 弹幕提示组件 -->
  <HoloDanmaku />

  <!-- 登录弹窗 (资源加载完成后，未登录时显示，覆盖所有内容) -->
  <LoginModal
    v-if="showLoginModal && isResourcesLoaded"
    @success="onLoginSuccess"
  />
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch, onUnmounted } from 'vue';
import SplashScreen from '@/components/SplashScreen.vue';
import CocosContainer from '@/components/CocosContainer.vue';
import HoloDanmaku from '@/components/holo/HoloDanmaku.vue';
import LoginModal from '@/components/login/LoginModal.vue';
import { useUserStore } from '@/store/userStore';
import { useAuthCheck } from '@/composables/useAuthCheck';
import { preloadResources } from '@/core/bootstrap';
import { socketService } from '@/api/socket';
import loopVideo from '@/assets/video/start_video_loop.mp4';
import loadVideo from '@/assets/video/start_video_load.mp4';
import KeyHint from "@/components/game/KeyHint.vue";
import skipIcon from "@/assets/icons/skip.svg";

type BootPhase = 'idle' | 'loading-resources' | 'ready';

const userStore = useUserStore();
const { showLoginModal, checkAuth, onLoginSuccess } = useAuthCheck();
const videoRef = ref<HTMLVideoElement | null>(null);
const isResourcesLoaded = ref(false);

const state = reactive({
  phase: 'idle' as BootPhase,
  isResourcesLoaded: false,
  isLoginValidated: false,
  videoFinished: false,
});

const isReadyToRender = ref(false);
const isVideoVisible = ref(true);
const currentVideoIndex = ref(0);
const shouldSwitchVideo = ref(false);
const splashProgress = ref(0);
const isSplashHidden = ref(false);
const gameContainerZClass = ref('z-0');

const videoUrls = [loopVideo, loadVideo];
const currentVideoUrl = computed(() => videoUrls[currentVideoIndex.value]);

// 统一处理 loadVideo 播放结束（自然结束或跳过）
const finishLoadVideo = () => {
  if (gameContainerZClass.value === 'z-50') return; // 防止重复执行
  isVideoVisible.value = false;
  setTimeout(() => {
    if (videoRef.value) {
      videoRef.value.pause();
    }
    gameContainerZClass.value = 'z-50';
  }, 500);
};

const runBootSequence = async () => {
  state.phase = 'loading-resources';
  splashProgress.value = 30;

  await preloadResources();
  state.isResourcesLoaded = true;
  isResourcesLoaded.value = true;
  splashProgress.value = 80;

  state.phase = 'ready';
  splashProgress.value = 100;

  setTimeout(() => {
    isSplashHidden.value = true;
    isReadyToRender.value = true;
    checkAuth();
  }, 500);

  if (userStore.isLoggedIn) {
    await completeBootSequence();
    shouldSwitchVideo.value = true;
  }
};

const onVideoEnded = async () => {
  if (currentVideoIndex.value === 0) {
    if (shouldSwitchVideo.value) {
      await switchToLoadVideo();
    } else {
      videoRef.value!.loop = true;
      videoRef.value!.play();
    }
  } else if (currentVideoIndex.value === 1) {
    finishLoadVideo(); // 使用统一结束函数
  }
};

const switchToLoadVideo = async () => {
  currentVideoIndex.value = 1;
  shouldSwitchVideo.value = false;
  if (videoRef.value) {
    videoRef.value.loop = false;
  }
};

const completeBootSequence = async () => {
  if (userStore.isLoggedIn) {
    await socketService.connect();
  }
};

// 监听 Esc 键跳过 loadVideo 动画
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    console.log('Escape');
    // 仅在 loadVideo 播放且未结束时跳过
    if (currentVideoIndex.value === 1 && isVideoVisible.value) {
      console.log('跳过 loadVideo 动画');
      finishLoadVideo();
    }
  }
};

watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn && state.phase === 'ready') {
    const isValid = await userStore.validateAndRestoreSession();
    if (isValid) {
      await completeBootSequence();
      state.isLoginValidated = true;
      shouldSwitchVideo.value = true;

      if (videoRef.value && currentVideoIndex.value === 0) {
        videoRef.value.loop = false;
      }
    }
  }
});

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  runBootSequence();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.src = '';
  }
});
</script>
