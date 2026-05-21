<template>
  <div class="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2847] to-[#134b6e] relative">
    <!-- 背景海洋层 -->
    <div class="fixed inset-0 pointer-events-none">
      <OceanLoading
        ref="oceanLoadingRef"
        :loading="loading"
        :layers="waveLayers"
        :target-base-y-ratio="0.15"
        :start-base-y-ratio="1.5"
        :gradient-colors="['#003e63', '#00598e', '#0075a1']"
        :bubble-speed-range="[1.5, 4.0]"
        :fill-depth="80"
        @complete="onOceanComplete"
        @wave-y="onWaveY"
      />
      <!-- 水面涟漪 -->
      <OceanRipple
        v-if="oceanDone"
        color="rgba(77, 240, 255, 0.15)"
        :max-radius="120"
        :speed="1.2"
        :line-width="1.5"
        :auto-interval="4000"
        :fade-speed="0.012"
        :layers="3"
        :energy-decay="0.6"
        :layer-delay="10"
      />
      <!-- 深海鱼群 -->
      <OceanFish
        v-if="oceanDone"
        :count="12"
        :colors="['#0075a1', '#00598e', '#2aa198', '#4fc3f7', '#0288d1']"
        :size-range="[6, 16]"
        :speed-range="[0.3, 1.2]"
      />
    </div>

    <!-- 浮动操作区（海浪上方，右侧） -->
    <div
      v-if="!loading && post && oceanDone"
      class="fixed right-6 z-20 flex flex-col items-center gap-4 transition-all duration-500 animate-float"
      :style="{ top: floatingTop + 'px' }"
    >
      <UserAvatar :user-id="post.posterId" size="lg" />
      <div class="flex flex-col items-center gap-3 mt-2">
        <button
          v-for="action in actions"
          :key="action.type"
          class="w-11 h-11 rounded-full flex items-center justify-center bg-[#0c1e35]/80 border border-white/10 text-white/60 hover:bg-cyan-400/15 hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
          :class="{ 'bg-cyan-400/15 border-cyan-400/40 text-cyan-400': interactions[action.type] }"
          :title="action.label"
          @click="interact(action.type)"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle v-if="action.circle" :cx="action.circle.cx" :cy="action.circle.cy" :r="action.circle.r" />
            <path v-for="(p, i) in action.iconPaths" :key="i" :d="p" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 主内容（海浪下方，固定不动） -->
    <div ref="contentRef" class="fixed z-10 left-1/2 -translate-x-1/2 top-[15vh] bottom-0 w-full max-w-5xl overflow-y-auto scrollbar-hidden transition-opacity duration-700 px-8 pb-6" :class="oceanDone ? 'opacity-100' : 'opacity-0'">

      <!-- 粘性标题（滚动后吸顶） -->
      <div
        v-if="post && scrolled"
        class="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 rounded-b-2xl transition-all duration-300 -mx-8 bg-gradient-to-br from-cyan-700/25 to-cyan-800/15 border-b border-cyan-400/15 backdrop-blur-xl"
      >
        <button
          class="flex items-center justify-center w-9 h-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
          @click="router.back()"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-base font-semibold text-white/90 truncate">{{ post.title }}</span>
      </div>

      <!-- 顶部：返回 + 标题（未滚动时显示） -->
      <div v-if="post && !scrolled" class="mb-4">
        <button
          class="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-3"
          @click="router.back()"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>
        <h1 class="text-2xl font-semibold text-white leading-relaxed">{{ post.title }}</h1>
      </div>

      <!-- 帖子内容 -->
      <article v-if="post" class="mx-6 bg-[#0c1e35]/90 border border-white/[0.08] rounded-2xl overflow-hidden">
        <!-- 帖子正文 -->
        <div class="p-8">
          <MarkdownRenderer :content="post.content" />
        </div>

        <!-- 评论区 -->
        <section class="p-8 border-t border-white/[0.06]">
          <h3 class="flex items-center gap-2 text-base font-semibold text-white/90 mb-5">
            <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 2 0 0 1 2 2z" />
            </svg>
            评论 ({{ comments.length }})
          </h3>

          <!-- 发表评论 -->
          <div class="flex flex-col gap-2.5 mb-6">
            <textarea
              v-model="newComment"
              class="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white text-sm leading-relaxed resize-y focus:outline-none focus:border-cyan-400/40 placeholder-white/30"
              placeholder="写下你的评论..."
              rows="3"
            />
            <OceanButton
              variant="primary"
              size="sm"
              :disabled="!newComment.trim()"
              @click="addComment"
            >
              发表评论
            </OceanButton>
          </div>

          <!-- 评论列表 -->
          <div class="flex flex-col gap-3">
            <div v-for="comment in comments" :key="comment.id" class="flex gap-3 p-4 bg-black/20 rounded-lg border border-white/5">
              <UserAvatar :user-id="comment.userId" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2.5 mb-1.5">
                  <span class="text-[13px] font-medium text-white/80">用户 {{ comment.userId }}</span>
                  <span class="text-[11px] text-white/30">{{ formatTime() }}</span>
                </div>
                <p class="text-sm leading-relaxed text-white/70 m-0">{{ comment.content }}</p>
              </div>
            </div>

            <div v-if="comments.length === 0" class="text-center py-8 text-white/30 text-sm">
              还没有评论，快来发表第一条吧
            </div>
          </div>
        </section>
      </article>

      <!-- 加载状态 -->
      <OceanState v-if="loading" type="loading" text="正在加载帖子..." size="lg" />

      <!-- 错误状态 -->
      <OceanState v-else-if="!post" type="error" text="帖子不存在或加载失败" size="lg">
        <OceanButton variant="ghost" size="sm" @click="router.back()">返回首页</OceanButton>
      </OceanState>
    </div>

    <!-- 图片预览 -->
    <div
      v-if="previewUrl"
      class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
      @click="closePreview()"
    >
      <img :src="previewUrl" alt="预览" class="max-w-[90%] max-h-[90%] object-contain rounded-lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { api } from '@/api';
  import type { CommentResponse, InteractionType, PostDetailDTO } from '@/api/types';
  import { useFormatTime } from '@/composables/useFormatTime';
  import OceanLoading from '@/components/ocean/OceanLoading.vue';
  import OceanRipple from '@/components/ocean/OceanRipple.vue';
  import OceanFish from '@/components/ocean/OceanFish.vue';
  import OceanState from '@/components/ocean/OceanState.vue';
  import OceanButton from '@/components/ocean/OceanButton.vue';
  import MarkdownRenderer from '@/components/viewer/MarkdownRenderer.vue';
  import UserAvatar from '@/components/UserAvatar.vue';

  const router = useRouter();
  const route = useRoute();
  const { formatRelativeTime: formatTime } = useFormatTime();

  const loading = ref(true);
  const post = ref<(PostDetailDTO & { posterId: number; title: string }) | null>(null);
  const comments = ref<CommentResponse[]>([]);
  const newComment = ref('');
  const previewUrl = ref('');

  const oceanLoadingRef = ref<InstanceType<typeof OceanLoading>>();
  const oceanDone = ref(false);
  const floatingTop = ref(80);
  const contentRef = ref<HTMLDivElement>();
  const scrolled = ref(false);

  let waveRafId = 0;
  function onWaveY(y: number) {
    cancelAnimationFrame(waveRafId);
    waveRafId = requestAnimationFrame(() => {
      floatingTop.value = Math.max(20, y - 120);
    });
  }
  const waveLayers = [
    { color: '#0075a1', amplitude: 18, frequency: 0.012, speed: 0.015, offsetY: 0, opacity: 1, jitter: 0.3 },
    { color: '#00598e', amplitude: 14, frequency: 0.018, speed: 0.01, offsetY: 10, opacity: 1, jitter: 0.2 },
    { color: '#003e63', amplitude: 10, frequency: 0.018, speed: 0.005, offsetY: 20, opacity: 1, jitter: 0.2 },
  ];

  function onOceanComplete() {
    oceanDone.value = true;
  }

  const interactions = reactive<Record<InteractionType, boolean>>({
    LIKE: false,
    COLLECTION: false,
    COIN: false,
  });

  const actions: { type: InteractionType; label: string; iconPaths: string[]; circle?: { cx: number; cy: number; r: number } }[] = [
    {
      type: 'LIKE',
      label: '点赞',
      iconPaths: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'],
    },
    {
      type: 'COLLECTION',
      label: '收藏',
      iconPaths: ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'],
    },
    {
      type: 'COIN',
      label: '投币',
      iconPaths: ['M12 6v12', 'M8 10h8', 'M8 14h8'],
      circle: { cx: 12, cy: 12, r: 10 },
    },
  ];

  const loadPost = async () => {
    const postId = Number(route.params.id);
    if (!postId) {
      loading.value = false;
      return;
    }

    try {
      const encapsulated = await api.posting.getEncapsulate(postId);
      const detail = await api.posting.getDetail(postId);
      post.value = {
        ...detail,
        posterId: postId,
        title: encapsulated.title ?? '无标题'
      };
      comments.value = await api.comment.getList(postId);
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      loading.value = false;
    }
  };

  const interact = async (type: InteractionType) => {
    if (!post.value) return;
    try {
      await api.posting.interact({
        postingId: post.value.posterId,
        type,
        action: 'TOGGLE',
      });
      interactions[type] = !interactions[type];
    } catch (error) {
      console.error('互动失败:', error);
    }
  };

  const addComment = async () => {
    if (!post.value || !newComment.value.trim()) return;
    try {
      await api.comment.add({
        postingId: post.value.posterId,
        content: newComment.value,
      });
      newComment.value = '';
      comments.value = await api.comment.getList(post.value.posterId);
    } catch (error) {
      console.error('评论失败:', error);
    }
  };

  const previewImage = (url: string) => {
    previewUrl.value = url;
  };

  const closePreview = () => {
    previewUrl.value = '';
  };

  const onScroll = () => {
    scrolled.value = (contentRef.value?.scrollTop ?? 0) > 60;
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && previewUrl.value) closePreview();
  };

  onMounted(() => {
    loadPost();
    contentRef.value?.addEventListener('scroll', onScroll);
    window.addEventListener('keydown', onKeydown);
  });

  onUnmounted(() => {
    contentRef.value?.removeEventListener('scroll', onScroll);
    window.removeEventListener('keydown', onKeydown);
  });
  </script>

  <style scoped>
  @keyframes float {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  .scrollbar-hidden {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
  </style>
