<template>
  <div class="min-h-screen bg-linear-to-b from-[#0a1628] via-[#0d2847] to-[#134b6e] relative">
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
      />
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
    </div>

    <div v-if="!loading && post && oceanDone" class="fixed inset-0 z-20 pointer-events-none">
      <div
          class="absolute pointer-events-auto"
          :style="{ left: waveItems[0].x + 'px', top: waveItems[0].y + 'px' }"
      >
        <UserAvatar :user-id="post.posterId" size="lg" />
      </div>
      <button
          v-for="(action, index) in actions"
          :key="action.type"
          class="absolute w-11 h-11 rounded-full flex items-center justify-center bg-[#0c1e35]/80 border border-white/10 text-white/60 hover:bg-cyan-400/15 hover:border-cyan-400/40 hover:text-cyan-400 transition-all pointer-events-auto"
          :class="{ 'bg-cyan-400/15 border-cyan-400/40 text-cyan-400': interactions[action.type] }"
          :style="{ left: waveItems[index + 1].x + 'px', top: waveItems[index + 1].y + 'px' }"
          :title="action.label"
          @click="interact(action.type)"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle v-if="action.circle" :cx="action.circle.cx" :cy="action.circle.cy" :r="action.circle.r" />
          <path v-for="(p, i) in action.iconPaths" :key="i" :d="p" />
        </svg>
      </button>
    </div>

    <div ref="contentRef" class="fixed z-10 left-1/2 -translate-x-1/2 top-[25vh] bottom-0 w-full max-w-8xl overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none transition-opacity duration-700 px-8 pb-6"
         :class="oceanDone ? 'opacity-100' : 'opacity-0'">

      <div v-if="post" class="post-nav">
        <button ref="backRef" class="post-nav__back" @click="closePostView()">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>

        <h1 ref="titleRef" class="post-nav__title">{{ post.title }}</h1>

        <span ref="statsRef" class="post-nav__stats">点赞 {{ postStatus?.likeCount || 0 }} 收藏 {{ postStatus?.collectionCount || 0 }} 投币 {{ postStatus?.coinCount || 0 }} 阅读 {{ postStatus?.readingCount || 0 }}</span>

        <button ref="topRef" class="post-nav__top" @click="scrollToTop()" title="回到顶部">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>

      <article v-if="post" class="mx-6 bg-[#0c1e35]/90 border border-white/8 rounded-2xl overflow-hidden">

        <div class="p-8">
          <PostView
              :content="post.content"
              :files="post.files || []"
          />
        </div>
        <section class="p-8 border-t border-white/6">
          <h3 class="flex items-center gap-2 text-base font-semibold text-white/90 mb-5">
            <img :src="commentIcon" alt="评论" class="w-4 h-4" />
            评论 ({{ comments.length }})
          </h3>

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

          <div class="flex flex-col gap-3">
            <div v-for="comment in comments" :key="comment.userId" class="flex gap-3 p-4 bg-black/20 rounded-lg border border-white/5">
              <UserAvatar :user-id="comment.userId" :user-avatar="comment.userAvatar" :username="comment.userName" size="sm" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-2.5">
                    <span class="text-[13px] font-medium text-white/80">{{ comment.userName }}</span>
                    <span class="text-[11px] text-white/30">{{ formatTime() }}</span>
                  </div>
                  <OceanButton
                      v-if="comment.isSelf"
                      variant="danger"
                      size="sm"
                      @click="deleteComment(comment.commentId)">
                    删除
                  </OceanButton>
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

      <OceanState v-if="loading" type="loading" text="正在加载帖子..." size="lg" />
      <OceanState v-else-if="!post" type="error" text="帖子不存在或加载失败" size="lg">
        <OceanButton variant="ghost" size="sm" @click="router.back()">返回首页</OceanButton>
      </OceanState>
    </div>

    <LoginModal v-if="showLoginModal" @success="onLoginSuccess" />
  </div>
</template>

<script setup lang="ts">
import commentIcon from '@/assets/icons/comment.svg';
import {ref, reactive, onMounted, onUnmounted} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api } from '@/api';
import type {InteractionType, PostDetailDTO} from '@/api/types';
import { useFormatTime } from '@/composables/useFormatTime';
import { useAuthCheck } from '@/composables/useAuthCheck';

import OceanLoading from '@/components/ocean/OceanLoading.vue';
import OceanRipple from '@/components/ocean/OceanRipple.vue';
import OceanState from '@/components/ocean/OceanState.vue';
import OceanButton from '@/components/ocean/OceanButton.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import LoginModal from '@/components/login/LoginModal.vue';

// 引入新组件替换原来的 MarkdownRenderer
import PostView from '@/components/viewer/PostView.vue';

const router = useRouter();
const { showLoginModal, checkAuth, onLoginSuccess } = useAuthCheck();
const route = useRoute();
const { formatRelativeTime: formatTime } = useFormatTime();

const loading = ref(true);
// 这里在联合类型中拓展了 files，以适应新的数据流向
const post = ref<(PostDetailDTO & { posterId: number; title: string, files?: any[] }) | null>(null);
const comments = ref<{commentId: number, userName: string, content: string, userId: number, userAvatar: string, isSelf: boolean}[]>([]);
const newComment = ref('');

const oceanLoadingRef = ref<InstanceType<typeof OceanLoading>>();
const oceanDone = ref(false);
const contentRef = ref<HTMLDivElement>();

// 控制栏动画 refs
const backRef = ref<HTMLButtonElement>();
const titleRef = ref<HTMLHeadingElement>();
const statsRef = ref<HTMLSpanElement>();
const topRef = ref<HTMLButtonElement>();

// 滚动驱动动画常量
const COMPACT_TOP_Y = 0          // 紧凑行 clamp 位置 = 标题栏中心 Y (top:56 + height:48/2)
const EXPANDED_BACK_Y = 0     // 返回按钮展开时的 top
const EXPANDED_TITLE_Y = 56   // 标题展开时的 top
const EXPANDED_STATS_Y = 116  // 统计展开时的 top
let scrollRafId = 0

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

const postId = Number(route.params.id);
if (!postId) {
  loading.value = false;
  router.push({ name: 'login' });
}

function closePostView() {
  window.close()
}

function scrollToTop() {
  contentRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const waveItems = ref<{ x: number; y: number }[]>([
  { x: 0, y: 80 }, { x: 0, y: 80 }, { x: 0, y: 80 }, { x: 0, y: 80 },
]);
let waveRafId = 0;
function updateWaveItems() {
  const w = window.innerWidth;
  const positions = [0.70, 0.77, 0.84, 0.91];

  for (let i = 0; i < 3; i++) {
    const x = w * positions[i];
    waveItems.value[i + 1].x = x - 22;
    waveItems.value[i + 1].y = (oceanLoadingRef.value?.getWaveYAtX(x) ?? 0) - 20;
  }
  const avatarX = w * positions[3];
  waveItems.value[0].x = avatarX - 22;
  waveItems.value[0].y = (oceanLoadingRef.value?.getWaveYAtX(avatarX) ?? 0) - 20;
  waveRafId = requestAnimationFrame(updateWaveItems);
}

const waveLayers = [
  { color: '#0075a1', amplitude: 18, frequency: 0.012, speed: 0.015, offsetY: 0, opacity: 1, jitter: 0.3 },
  { color: '#00598e', amplitude: 14, frequency: 0.018, speed: 0.01, offsetY: 10, opacity: 1, jitter: 0.2 },
  { color: '#003e63', amplitude: 10, frequency: 0.018, speed: 0.005, offsetY: 20, opacity: 1, jitter: 0.2 },
];

function onOceanComplete() {
  oceanDone.value = true;
}

const postStatus = ref<{
  liked: boolean;
  collected: boolean;
  coined: number;
  likeCount: number;
  collectionCount: number;
  coinCount: number;
  readingCount: number;
} | null>(null);

const interactions = reactive<Record<InteractionType, boolean>>({
  LIKE: postStatus.value?.liked ?? false,
  COLLECTION: postStatus.value?.collected ?? false,
  COIN: postStatus.value?.coined !== 0,
});

const actions: { type: InteractionType; label: string; iconPaths: string[]; circle?: { cx: number; cy: number; r: number } }[] = [
  { type: 'LIKE', label: '点赞', iconPaths: ['M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'] },
  { type: 'COLLECTION', label: '收藏', iconPaths: ['M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'] },
  { type: 'COIN', label: '投币', iconPaths: ['M12 6v12', 'M8 10h8', 'M8 14h8'], circle: { cx: 12, cy: 12, r: 10 } },
];

const loadPost = async () => {

  try {
    const [encapsulated, detail, stats] = await Promise.all([
      api.posting.getEncapsulate(postId),
      api.posting.getDetail(postId),
      api.posting.getStats(postId),
    ]);

    post.value = {
      ...detail,
      posterId: encapsulated.posterId,
      title: encapsulated.title ?? '无标题',
      // 【关键点】这里为了安全起见容错。你需要确保 API 返回的数据中有 files 这个数组
      files: (detail as any).files || []
    };

    await loadComments();

    postStatus.value = stats;
    interactions.LIKE = stats.liked ?? false;
    interactions.COLLECTION = stats.collected ?? false;
    interactions.COIN = stats.coined !== 0;
  } catch (error) {
    console.error('加载帖子失败:', error);
  } finally {
    loading.value = false;
  }
};

const interact = async (type: InteractionType) => {
  if (!post.value) return;
  try {
    await api.posting.interact({ postingId: postId, type, action: 'TOGGLE' });
    interactions[type] = !interactions[type];
  } catch (error) {
    console.error('互动失败:', error);
  }
};

const addComment = async () => {
  if (!post.value || !newComment.value.trim()) return;
  try {
    await api.comment.add({ postingId: postId, content: newComment.value });
    newComment.value = '';
    await loadComments();
  } catch (error) {
    console.error('评论失败:', error);
  }
};

function onScroll() {
  if (scrollRafId) return
  scrollRafId = requestAnimationFrame(updateControlPositions)
}

function updateControlPositions() {
  scrollRafId = 0
  const st = contentRef.value?.scrollTop ?? 0

  // 1. 返回按钮：原本就在 0，不需要任何 Y 轴位移，稳如泰山
  if (backRef.value) {
    backRef.value.style.transform = `translateY(0px)`
  }

  // 2. 标题：CSS 初始在 56px，滚动时向上滑动 56px（最终停在 0px）
  if (titleRef.value) {
    const t = clamp(st / 60, 0, 1)
    titleRef.value.style.transform = `translateY(${lerp(0, COMPACT_TOP_Y - EXPANDED_TITLE_Y, t)}px)`
    titleRef.value.style.left = lerp(0, 90, t) + 'px'
    titleRef.value.style.right = lerp(0, 56, t) + 'px'
  }

  // 3. 统计信息：保持向上滚动并提前渐隐
  if (statsRef.value) {
    statsRef.value.style.transform = `translateY(${-st}px)`
    statsRef.value.style.opacity = String(clamp((30 - st) / 30, 0, 1))
    statsRef.value.style.pointerEvents = st > 15 ? 'none' : 'auto'
  }

  // 4. 回到顶部按钮：只处理缩放和透明度，位置由 CSS 决定
  if (topRef.value) {
    const t = clamp(st / 60, 0, 1)
    topRef.value.style.opacity = String(t)
    topRef.value.style.transform = `scale(${lerp(0.3, 1, t)})`
  }
}

async function loadComments() {
  const commentsList = await api.comment.getList(postId);
  comments.value = [];
  for (const comment of commentsList) {
    const userDetail = await api.user.getDetail("POSTER",comment.userId);
    comments.value.push({
      commentId: comment.id,
      userName: userDetail.userName,
      content: comment.content,
      userId: comment.userId,
      userAvatar: userDetail.userAvatar,
      isSelf: comment.isSelf,
    });
  }
}

async function deleteComment(commentId: number) {
  await api.comment.delete(commentId);
  await loadComments();
}

onMounted(() => {
  if (!checkAuth()) return;
  loadPost();
  contentRef.value?.addEventListener('scroll', onScroll, { passive: true });
  waveRafId = requestAnimationFrame(updateWaveItems);
});

onUnmounted(() => {
  cancelAnimationFrame(waveRafId);
  cancelAnimationFrame(scrollRafId);
  contentRef.value?.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.post-nav {
  position: sticky;
  top: 0;
  height: 160px;
  margin-bottom: 16px;
  z-index: 10;
}

.post-nav__back,
.post-nav__title,
.post-nav__stats,
.post-nav__top {
  position: absolute;
  will-change: transform, opacity, left, right;
}

.post-nav__back,
.post-nav__title,
.post-nav__top {
  box-sizing: border-box;
  height: 48px;
}

.post-nav__back {
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.25s ease-out, color 0.2s, background 0.2s;
}
.post-nav__back:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.8);
}

.post-nav__title {
  left: 0;
  top: 56px;
  right: 0;
  margin: 0;
  padding: 0 16px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  line-height: 48px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: transform 0.25s ease-out, left 0.25s ease-out, right 0.25s ease-out;
}

.post-nav__stats {
  left: 0;
  top: 116px;
  font-size: 14px;
  color: rgba(107, 114, 128, 1);
  transition: transform 0.25s ease-out, opacity 0.25s ease;
}

.post-nav__top {
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.3s ease,
              color 0.2s, background 0.2s;
}
.post-nav__top:hover {
  color: rgb(103, 232, 249);
  background: rgba(0, 0, 0, 0.8);
}
.post-nav__top:active {
  transform: scale(0.88);
}
</style>