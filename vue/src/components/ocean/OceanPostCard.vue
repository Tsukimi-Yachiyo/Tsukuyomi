<template>
  <div
      v-if="titlePosition"
      class="ocean-post group overflow-visible flex rounded-xl p-4 transition-all duration-300 w-fit max-w-full relative"
      :class="layoutClasses.container"
      @click="goToPost"
  >

    <div class="absolute top-0 left-0 z-10 rounded-full bg-white dark:bg-gray-800 p-0.5 shadow-lg"
         style="transform: translate(-20px, -20px)">
      <UserAvatar
          :userId="authorId"
          :clickable="false"
          size="lg"
      />
    </div>
    <h2
        class="post-title text-lg font-bold overflow-hidden leading-snug tracking-wide shrink-0"
        :class="layoutClasses.title"
    >
      {{ title.slice(0, 8) }}
    </h2>

    <div class="flex flex-col gap-3 flex-none" :class="layoutClasses.content">
      <div class="relative w-auto max-w-full h-40 rounded-lg overflow-hidden border-ocean bg-gray-100 dark:bg-gray-900">
          <img
            v-if="isLoading"
            :src="loadingPhoto"
            alt="加载中"
            class="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <!-- 加载完成后显示封面 -->
          <img
            :src="currentSrc"
            alt="封面"
            class="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
            @load="onCoverLoad"
            @error="onCoverError"
          />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick} from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import errorPhoto from '@/assets/ui_button/404.png';
import loadingPhoto from '@/assets/ui_button/loadCoverImage.png';

const emit = defineEmits<{
  (e: 'resize'): void;
}>();

const props = defineProps<{
  title: string;
  coverImage: string;
  postId: number | string;
  authorId: number;       // UserAvatar 强依赖项
}>();

// 定义方位
type Position = 'top' | 'bottom' | 'left' | 'right';
const titlePosition = ref<Position | null>(null);
const currentSrc = ref(props.coverImage || errorPhoto || '');
const isLoading = ref(true)

function goToPost() {
  window.open(`/#/post/${props.postId}`, '_blank');
}

function notifyResize() {
  nextTick(() => emit('resize'));
}

function onCoverLoad() {
  isLoading.value = false;
  notifyResize();
}
function onCoverError() {
  isLoading.value = false;
  notifyResize();
}

// 挂载时随机决定标题位置
onMounted(() => {
  const positions: Position[] = ['top', 'bottom', 'left', 'right'];
  titlePosition.value = positions[Math.floor(Math.random() * positions.length)];

  notifyResize();
});

// 根据随机位置，利用 Tailwind 的 Flexbox 和 order 属性重排版
const layoutClasses = computed(() => {
  switch (titlePosition.value) {
    case 'top':
      return {
        container: 'flex-col gap-4 h-[230px] items-start',
        title: 'order-1 text-left pl-7',
        content: 'order-2' };
    case 'bottom':
      return {
        container: 'flex-col gap-4 h-[230px] items-start',
        title: 'order-2 text-left mt-2',
        content: 'order-1' };
    case 'left':
      return {
        container: 'flex-row gap-2 h-[230px] items-start',
        title: 'order-1 w-8 flex items-center justify-center vertical-text ml-0 mt-7',
        content: 'order-2'
      };
    case 'right':
      return {
        container: 'flex-row gap-2 h-[230px] items-start',
        title: 'order-2 w-8 flex items-center justify-center vertical-text mr-0',
        content: 'order-1'
      };
    default:
      return { container: 'flex-col', title: '', content: '' };
  }
});

</script>

<style scoped>
/* 极简海洋风设计，完美融入项目原有的全局变量 */
.ocean-post {
  /* 使用 global.css 中定义的海洋蓝主题色变量 */
  border: 1.5px solid var(--theme-color);
  /* 用 RGB 变量实现极浅的半透明海洋蓝背景 */
  background-color: rgba(var(--theme-color-rgb), 0.03);
}

/* 鼠标悬停时的海洋荧光辉光效果 */
.ocean-post:hover {
  box-shadow: 0 0 15px var(--theme-color-glow);
}

.border-ocean {
  border: 1px solid rgba(var(--theme-color-rgb), 0.2);
}

.post-title {
  /* 使用 global.css 中的特色字体（如 Cuxi）增强 UI 设计感 */
  font-family: var(--font-cuxi, sans-serif),serif;
  color: #00838f; /* 深海洋青色 */
}

.vertical-text {
  writing-mode: vertical-rl;       /* 竖排，从右向左 */
  text-orientation: mixed;         /* 保持字符自然方向 */
  letter-spacing: 0.05em;          /* 微调字间距，让竖排更透气 */
  line-height: 1.6;
}

/* 兼容暗黑模式，暗黑模式下标题使用高亮荧光蓝 */
@media (prefers-color-scheme: dark) {
  .post-title {
    color: var(--theme-color);
  }
}
</style>