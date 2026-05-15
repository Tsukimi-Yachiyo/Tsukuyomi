<template>
  <!-- 启动画面 -->
  <SplashScreen :progress="splashProgress" :is-hidden="isSplashHidden" />
  
  <!-- 主容器：控制整体渲染时机 -->
  <div v-show="isReadyToRender">
    <!-- 维护页面：后端不可用时显示 -->
    <MaintenancePage v-if="currentView === 'maintenance'" @retry="retryBackendCheck" />
    
    <!-- 正常流程：视频背景 + 登录/游戏界面 -->
    <template v-else>
      <!-- 视频背景容器 -->
      <div class="video-container">
        <video
          ref="videoRef"
          class="boot-video"
          :class="{ 'fade-in': isVideoVisible }"
          :src="currentVideoUrl"
          autoplay
          muted
          playsinline
          @ended="onVideoEnded"
        />
      </div>
      
      <!-- 登录面板容器 -->
      <div class="login-container">
        <LoginPanel v-if="currentView === 'login'" />
      </div>
      
      <!-- 游戏容器 -->
      <div class="game-container">
        <CocosContainer v-if="currentView === 'game'" />
      </div>
    </template>
  </div>
  <!-- 弹幕提示组件 -->
  <HoloDanmaku />
</template>

<script setup lang="ts">
// 导入 Vue 核心 API
import { reactive, computed, onMounted, ref, watch, onUnmounted } from 'vue';
// 导入子组件
import SplashScreen from '@/components/SplashScreen.vue';
import LoginPanel from '@/components/login/LoginPanel.vue';
import MaintenancePage from '@/page/MaintenancePage.vue';
import CocosContainer from '@/components/CocosContainer.vue';
import HoloDanmaku from '@/components/holo/HoloDanmaku.vue';
// 导入状态管理和服务
import { useStore } from '@/store/userStore';
import { preloadResources, checkBackendHealth } from '@/core/bootstrap';
import { socketService } from '@/api/socket';
// 导入视频资源
import loopVideo from '@/assets/video/start_video_loop.mp4';
import loadVideo from '@/assets/video/start_video_load.mp4';

/**
 * 启动阶段枚举
 * - idle: 初始状态
 * - checking-backend: 检测后端健康状态
 * - loading-resources: 加载基础资源
 * - ready: 准备就绪，可显示登录/游戏界面
 */
type BootPhase = 'idle' | 'checking-backend' | 'loading-resources' | 'ready';

/**
 * 当前视图类型
 * - maintenance: 维护页面
 * - login: 登录界面
 * - game: 游戏界面
 */
type ViewType = 'maintenance' | 'login' | 'game';

// 用户状态管理器
const userStore = useStore();
// 视频元素引用
const videoRef = ref<HTMLVideoElement | null>(null);

/**
 * 应用状态对象
 */
const state = reactive({
  phase: 'idle' as BootPhase,           // 当前启动阶段
  isBackendReady: false,                 // 后端是否可用
  isResourcesLoaded: false,              // 基础资源是否加载完成
  isLoginValidated: false,              // 登录会话是否已验证
  videoFinished: false,                // 视频是否播放完成
});

/**
 * UI 状态
 */
const isReadyToRender = ref(false);      // 是否可以渲染主界面
const isVideoVisible = ref(true);       // 视频是否可见（控制淡入效果）
const currentVideoIndex = ref(0);        // 当前播放的视频索引（0=循环视频，1=加载视频）
const shouldSwitchVideo = ref(false);    // 是否需要切换到加载视频
const splashProgress = ref(0);           // 启动画面进度
const isSplashHidden = ref(false);       // 启动画面是否隐藏

/**
 * 视频资源列表
 */
const videoUrls = [loopVideo, loadVideo];

/**
 * 当前视频 URL（计算属性）
 */
const currentVideoUrl = computed(() => videoUrls[currentVideoIndex.value]);

/**
 * 当前视图类型（计算属性）
 * 根据后端状态、启动阶段和登录状态决定显示哪个界面
 */
const currentView = computed<ViewType>(() => {
  if (!state.isBackendReady) return 'maintenance';
  if (state.phase === 'ready' && userStore.isLoggedIn) {
    return 'game';
  }
  return 'login';
});

/**
 * 启动序列主控函数
 * 执行后端检测 → 资源加载 → 进入就绪状态
 */
const runBootSequence = async () => {
  // 阶段1：检测后端健康状态
  state.phase = 'checking-backend';
  splashProgress.value = 10;
  
  const healthy = await checkBackendHealth();
  state.isBackendReady = healthy;

  // 后端不可用，显示维护页面
  if (!healthy) {
    isReadyToRender.value = true;
    isSplashHidden.value = true;
    return;
  }

  // 阶段2：加载基础资源
  state.phase = 'loading-resources';
  splashProgress.value = 30;
  
  await preloadResources();
  state.isResourcesLoaded = true;
  splashProgress.value = 80;

  // 阶段3：进入就绪状态
  state.phase = 'ready';
  splashProgress.value = 100;
  
  setTimeout(() => {
    isSplashHidden.value = true;
    isReadyToRender.value = true;
  }, 500);

  // 如果已有登录状态，静默验证会话
  if (userStore.isLoggedIn) {
    state.isLoginValidated = await userStore.validateAndRestoreSession();
    if (state.isLoginValidated) {
      shouldSwitchVideo.value = true;
    }
  }
};

/**
 * 视频播放结束回调
 * 根据当前视频和登录状态决定下一步操作
 */
const onVideoEnded = async () => {
  // 循环视频播放结束
  if (currentVideoIndex.value === 0) {
    if (shouldSwitchVideo.value) {
      // 登录成功，切换到加载视频
      await switchToLoadVideo();
    } else {
      // 未登录，继续循环播放
      videoRef.value!.loop = true;
      videoRef.value!.play();
    }
  } 
  // 加载视频播放结束（最后一个视频）
  else if (currentVideoIndex.value === 1) {
    // 视频淡出效果
    isVideoVisible.value = false;
    
    // 等待淡出动画完成后显示游戏界面
    setTimeout(() => {
      if (videoRef.value) {
        videoRef.value.pause();
      }
      // 提升游戏容器层级，完成弹出效果
      const gameContainer = document.querySelector('.game-container') as HTMLElement;
      if (gameContainer) {
        gameContainer.style.zIndex = '100';
      }
    }, 500);
  }
};

/**
 * 切换到加载视频
 * 执行视频切换动画并开始加载游戏资源
 */
const switchToLoadVideo = async () => {
  
  // 更新视频索引和状态
  currentVideoIndex.value = 1;
  shouldSwitchVideo.value = false;
  
  // 加载新视频
  if (videoRef.value) {
    videoRef.value.loop = false;
  }
};
/**
 * 完成启动流程
 * 隐藏视频并进入游戏界面
 */
const completeBootSequence = async () => {
  
  // 建立 Socket 连接
  if (userStore.isLoggedIn) {
    await socketService.connect();
  }
};

/**
 * 监听登录状态变化
 * 登录成功后触发视频切换流程
 */
watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn && state.phase === 'ready') {
    const isValid = await userStore.validateAndRestoreSession();
    await completeBootSequence();
    if (isValid) {
      state.isLoginValidated = true;
      shouldSwitchVideo.value = true;
      
      // 如果当前在循环视频，停止循环等待切换
      if (videoRef.value && currentVideoIndex.value === 0) {
        videoRef.value.loop = false;
      }
    }
  }
});

/**
 * 重试后端检测
 * 供维护页面调用
 */
const retryBackendCheck = () => {
  runBootSequence();
};

/**
 * 组件挂载时启动初始化流程
 */
onMounted(() => {
  runBootSequence();
});

/**
 * 组件卸载时清理视频资源
 */
onUnmounted(() => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.src = '';
  }
});
</script>

<style scoped>
/**
 * 视频容器样式
 * 作为背景层，不接收点击事件
 */
.video-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

/**
 * 视频元素样式
 */
.boot-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.boot-video.fade-in {
  opacity: 1;
}

/**
 * 登录容器样式
 * 居中显示登录面板
 */
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/**
 * 游戏容器样式
 */
.game-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
  pointer-events: auto;
}
</style>
