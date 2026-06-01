<template>
  <!-- 启动画面 -->
  <SplashScreen :progress="splashProgress" :is-hidden="isSplashHidden" />

  <!-- 主容器：控制整体渲染时机 -->
  <div v-show="isReadyToRender">
    <!-- 视频背景容器 -->
    <div class="fixed inset-0 z-10 overflow-hidden pointer-events-none bg-black">
      <video
        ref="videoRef"
        class="w-full h-full object-cover opacity-0 transition-opacity duration-500 ease-in-out"
        :class="{ 'opacity-100': isVideoVisible }"
        :src="currentVideoUrl"
        autoplay
        muted
        playsinline
        @canplay="onVideoCanPlay"
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

  <!-- 活动弹窗 -->
  <Transition name="activity-fade">
    <div
      v-if="showActivityPopup && activityCoverUrl"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="closeActivityPopup"
    >
      <div class="relative animate-bounce-in">
        <img
          :src="activityCoverUrl"
          :alt="activityName"
          class="max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl object-contain cursor-pointer"
          @click="openActivity"
        />
        <button
          class="absolute -top-3 -right-3 w-10 h-10 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold transition-colors shadow-lg"
          @click="closeActivityPopup"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>

  <!-- 弹幕提示组件 -->
  <HoloDanmaku />

  <!-- 登录弹窗 (资源加载完成后，未登录时显示，覆盖所有内容) -->
  <LoginModal
    v-if="showLoginModal && isResourcesLoaded"
    @success="onLoginSuccess"
  />
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch, onUnmounted, nextTick } from 'vue';
import SplashScreen from '@/components/SplashScreen.vue';
import CocosContainer from '@/components/CocosContainer.vue';
import HoloDanmaku from '@/components/holo/HoloDanmaku.vue';
import LoginModal from '@/components/login/LoginModal.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/userStore';
import { useAuthCheck } from '@/composables/useAuthCheck';
import { preloadResources } from '@/core/bootstrap';
import { socketService } from '@/api/socket';
import { api } from '@/api';
import loopVideo from '@/assets/video/start_video_loop.mp4';
import loadVideo from '@/assets/video/start_video_load.mp4';
import KeyHint from "@/components/game/KeyHint.vue";
import skipIcon from "@/assets/icons/skip.svg";

type BootPhase = 'idle' | 'loading-resources' | 'ready';

const router = useRouter();
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
const isVideoVisible = ref(false);
const currentVideoIndex = ref(0);
const shouldSwitchVideo = ref(false);
const splashProgress = ref(0);
const isSplashHidden = ref(false);
const gameContainerZClass = ref('z-0');

// 活动弹窗
const showActivityPopup = ref(false);
const activityCoverUrl = ref('');
const activityName = ref('');
const activityEssayUrl = ref('');

const fetchActivity = async () => {
  try {
    const list = await api.column.getActivity(1);
    if (!list?.length) return;
    const activity = list[0];
    activityName.value = activity.name;
    activityEssayUrl.value = activity.fileUrl || '';
    const blob = await api.file.downloadPublic(`${activity.name}.png`, 'public');
    activityCoverUrl.value = URL.createObjectURL(blob);
    showActivityPopup.value = true;
  } catch (e) {
    console.warn('获取活动失败:', e);
  }
};

const getFileNameFromUrl = (url: string): string => {
  if (!url) return ''
  try {
    const params = new URLSearchParams(url.split('?')[1])
    return params.get('fileName') || url.split('/').pop() || ''
  } catch {
    return url.split('/').pop() || ''
  }
}

const openActivity = () => {
  if (!activityEssayUrl.value) return;
  const routeData = router.resolve({
    name: 'ColumnView',
    query: {
      url: activityEssayUrl.value,
      name: getFileNameFromUrl(activityEssayUrl.value),
      title: activityName.value || ''
    }
  });
  window.open(routeData.href, '_blank');
  closeActivityPopup();
};

const closeActivityPopup = () => {
  showActivityPopup.value = false;
  if (activityCoverUrl.value) {
    URL.revokeObjectURL(activityCoverUrl.value);
    activityCoverUrl.value = '';
  }
};

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

  await preloadResources((loaded, total) => {
    // 进度从 30% 平滑推进到 80%
    const ratio = total > 0 ? loaded / total : 1;
    splashProgress.value = 30 + Math.round(ratio * 50);
  });
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

const onVideoCanPlay = () => {
  isVideoVisible.value = true;
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
  // 先隐藏视频，等新视频加载好再通过 onVideoCanPlay 显示
  isVideoVisible.value = false;
  await nextTick();
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
  fetchActivity();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  socketService.disconnect();
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.src = '';
  }
  if (activityCoverUrl.value) URL.revokeObjectURL(activityCoverUrl.value);
});
</script>

<style scoped>
.activity-fade-enter-active {
  transition: opacity 0.3s ease;
}
.activity-fade-leave-active {
  transition: opacity 0.2s ease;
}
.activity-fade-enter-from,
.activity-fade-leave-to {
  opacity: 0;
}

@keyframes bounce-in {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-bounce-in {
  animation: bounce-in 0.4s ease-out;
}
</style>
