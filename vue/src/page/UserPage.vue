<template>
  <div class="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#0a1628] to-[#0d1f3c] text-white [font-family:var(--font-cuxi)]">
    <div class="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(77,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(77,240,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]" />

    <div class="relative z-10 max-w-275 mx-auto px-6 py-10">
      <!-- 返回按钮 -->
      <button
        class="mb-6 flex items-center gap-2 text-[13px] text-white/40 hover:text-[rgba(77,240,255,0.8)] transition-colors cursor-pointer bg-transparent border-none"
        @click="goBack"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>

      <!-- 用户信息卡片 + 帖子流 -->
      <div class="rounded-2xl bg-white/2 border border-white/6 backdrop-blur-sm overflow-visible">
        <UserInfoPause :user-id="userId">
          <template #content>
            <!-- 帖子横向流式布局 -->
            <div v-if="loadingPosts" class="flex items-center justify-center h-full">
              <div class="w-5 h-5 border-2 border-transparent border-t-[rgba(77,240,255,0.8)] rounded-full animate-spin" />
            </div>

            <div v-else-if="posts.length === 0" class="flex items-center justify-center h-full">
              <span class="text-[12px] text-white/25">暂无发布内容</span>
            </div>

            <div
              v-else
              ref="scrollRef"
              class="flex gap-5 overflow-x-auto overflow-y-hidden items-start pl-7 pt-6 pb-2 smooth-scroll w-full"
              @wheel.prevent="onWheel"
            >
              <div
                v-for="post in posts"
                :key="post.postingId"
                class="shrink-0"
              >
                <OceanPostCard
                  :postId="post.postingId"
                  :title="post.title || '无名回声'"
                  :cover-image="post.coverImage ?? ''"
                  :author-id="post.posterId"
                />
              </div>
            </div>
          </template>
        </UserInfoPause>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { api } from '@/api'
import UserInfoPause from '@/components/game/UserInfoPause.vue'
import OceanPostCard from '@/components/ocean/OceanPostCard.vue'
import type { PostEncapsulateDTO } from '@/api/types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userId = ref<number>(Number(route.params.id))
const postIds = ref<number[]>([])
const posts = ref<PostEncapsulateDTO[]>([])
const loadingPosts = ref(false)
const scrollRef = ref<HTMLElement | null>(null)

function onWheel(e: WheelEvent) {
  if (scrollRef.value && e.deltaY !== 0) {
    scrollRef.value.scrollLeft += e.deltaY
  }
}

async function loadUserPosts() {
  loadingPosts.value = true
  try {
    postIds.value = await api.posting.getUserPosts(userId.value)
    const results: PostEncapsulateDTO[] = []
    for (const id of postIds.value) {
      try {
        const encapsulate = await api.posting.getEncapsulate(id)
        encapsulate.postingId = id
        results.push(encapsulate)
      } catch {
        // 跳过无法加载的帖子
      }
    }
    posts.value = results
  } catch (err) {
    console.error('[UserPage] 加载用户帖子失败:', err)
  } finally {
    loadingPosts.value = false
  }
}

function goBack() {
  try {
    window.close()
  } catch {
    alert('无法返回')
  }
}

onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.replace('/')
    return
  }
  loadUserPosts()
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    userId.value = Number(newId)
    posts.value = []
    postIds.value = []
    loadUserPosts()
  }
})
</script>

<style scoped>
:deep(.slot-container) {
  overflow: visible !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
}

.smooth-scroll::-webkit-scrollbar {
  height: 6px;
}
.smooth-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.smooth-scroll::-webkit-scrollbar-thumb {
  background: rgba(77, 240, 255, 0.15);
  border-radius: 3px;
}
.smooth-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 240, 255, 0.4);
}
</style>
