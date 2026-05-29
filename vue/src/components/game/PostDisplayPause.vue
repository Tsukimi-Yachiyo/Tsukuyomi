<template>
  <div class="relative w-[90vw] max-w-300 h-full flex flex-col bg-transparent text-white font-(--font-cuxi) p-5 box-border">
    <!-- 头部搜索栏（保持不变） -->
    <div class="flex items-center justify-between mb-4 shrink-0 border-b border-white/20 pb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-[22px] font-semibold m-0 text-white tracking-widest">星海拾遗</h2>
        <span v-show="!keyword" class="text-[12px] text-[rgba(77,240,255,0.8)] px-2 py-0.5 border border-[rgba(77,240,255,0.4)] rounded-full">
          漂流热门
        </span>
      </div>
      <div class="flex items-center gap-2 relative">
        <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索海域漂流瓶..."
            class="w-64 bg-black/40 border border-white/30 text-white rounded-full px-4 py-1.5 outline-none focus:border-[rgba(77,240,255,0.8)] transition-all text-[13px]"
        />
        <button
            @click="handleSearch"
            class="absolute right-1 top-1 bottom-1 bg-[rgba(77,240,255,0.8)] text-black px-4 rounded-full text-[13px] font-bold hover:bg-[rgba(77,240,255,1)] transition-colors cursor-pointer"
        >
          探索
        </button>
      </div>
    </div>

    <!-- 滚动区域 -->
    <div
        class="flex-1 overflow-x-auto overflow-hidden smooth-scroll custom-scrollbar pb-2 min-h-0"
        ref="scrollContainerRef"
    >
      <div
          class="masonry-container relative"
          :style="{ height: containerHeight + 'px', width: totalWidth + 'px' }"
      >
        <!-- 卡片列表，先隐藏用于测量尺寸 -->
        <div
            v-for="(post, index) in postList"
            :key="post.postingId"
            :ref="el => setCardRef(el, index)"
            class="card-wrapper absolute"
            :style="getCardStyle(index)"
        >
          <OceanPostCard
              :postId="post.postingId"
              :title="post.title || '无名回声'"
              :coverImage="post.coverImage ?? ''"
              :authorId="post.posterId"
              @resize="handleCardResize"
          />
        </div>

        <!-- 加载触发器（最右侧） -->
        <div
            ref="loadMoreRef"
            class="load-more-trigger absolute flex flex-col items-center justify-center"
            :style="loaderStyle"
        >
          <div v-if="loading" class="w-6 h-6 border-2 border-transparent border-t-[rgba(77,240,255,0.8)] rounded-full animate-spin"></div>
          <span v-else-if="noMore" class="vertical-text text-[12px] text-white/40 tracking-[0.2em] font-light">
            已抵达海域尽头
          </span>
        </div>
      </div>
    </div>
    <div class="absolute bottom-10 right-4">
      <button
          @click="edit"
          class="w-12 h-12 bg-[rgba(77,240,255,0.8)] rounded-full flex items-center justify-center hover:bg-[rgba(77,240,255,1)] transition-colors cursor-pointer focus:outline-none"
      >
        <img src="@/assets/icons/new.svg" class="w-5 h-5"  alt="编辑"/>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { api } from '@/api'
import OceanPostCard from '@/components/ocean/OceanPostCard.vue'
import type { PostEncapsulateDTO } from '@/api/types'
import type { CSSProperties } from 'vue'

// ---------- 搜索 / 分页 ----------
const keyword = ref('')
const postList = ref<PostEncapsulateDTO[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const noMore = ref(false)

// ---------- 布局相关 (核心重构) ----------
const scrollContainerRef = ref<HTMLElement | null>(null)
const loadMoreRef = ref<HTMLElement | null>(null)

const containerHeight = ref(600)
const gap = 24
const totalWidth = ref(0)

const defaultCardWidth = 260
const defaultCardHeight = 220

const rows = reactive<number[][]>([])
const rowWidths = reactive<number[]>([])
const rowMaxHeights = reactive<number[]>([])

const cardSizes = reactive<{ width: number; height: number }[]>([])
interface CardPosition { left: number; top: number; visible: boolean }
const positions = reactive<CardPosition[]>([])

const cardRefs = new Map<number, HTMLElement>()
const setCardRef = (el: any, index: number) => {
  if (el) cardRefs.set(index, el)
  else cardRefs.delete(index)
}

// ================= 核心排版逻辑 =================

const initializeRows = () => {
  if (containerHeight.value <= 0) return
  let n = Math.floor((containerHeight.value + gap) / (defaultCardHeight + gap))
  n = Math.max(1, n)
  rows.length = 0
  rowWidths.length = 0
  rowMaxHeights.length = 0
  for (let i = 0; i < n; i++) {
    rows.push([])
    rowWidths.push(0)
    rowMaxHeights.push(0)
  }
}

const distributePosts = (startIndex: number = 0) => {
  if (rows.length === 0) initializeRows()
  for (let i = startIndex; i < postList.value.length; i++) {
    if (!cardSizes[i]) cardSizes[i] = { width: defaultCardWidth, height: defaultCardHeight }
    if (!positions[i]) positions.push({ left: 0, top: 0, visible: false })

    let minWidth = Infinity
    let targetRow = 0
    for (let r = 0; r < rows.length; r++) {
      let currentWidth = 0
      for (let idx of rows[r]) {
        currentWidth += cardSizes[idx].width + gap
      }
      if (currentWidth < minWidth) {
        minWidth = currentWidth
        targetRow = r
      }
    }
    rows[targetRow].push(i)
  }
}

const measureCards = () => {
  postList.value.forEach((_, i) => {
    const el = cardRefs.get(i)
    if (el) {
      const dom = el.firstElementChild as HTMLElement
      if (dom && dom.offsetWidth) {
        cardSizes[i] = { width: dom.offsetWidth, height: dom.offsetHeight }
      }
    }
  })
}

const balanceRows = () => {
  if (rows.length <= 1) return
  let maxW = -1, minW = Infinity
  let maxR = -1, minR = -1
  for (let r = 0; r < rows.length; r++) {
    if (rowWidths[r] > maxW) { maxW = rowWidths[r]; maxR = r }
    if (rowWidths[r] < minW) { minW = rowWidths[r]; minR = r }
  }
  if (maxW - minW > defaultCardWidth * 2 && rows[maxR].length > 1) {
    const popIdx = rows[maxR].pop()
    if (popIdx !== undefined) rows[minR].push(popIdx)
  }
}

const layoutCards = () => {
  if (rows.length === 0) return
  let maxTotalWidth = 0
  let currentY = 24
  for (let r = 0; r < rows.length; r++) {
    let currentX = 0
    let maxH = 0
    for (let idx of rows[r]) {
      if (cardSizes[idx].height > maxH) maxH = cardSizes[idx].height
    }
    rowMaxHeights[r] = maxH
    for (let idx of rows[r]) {
      const size = cardSizes[idx]
      positions[idx] = { left: currentX, top: currentY, visible: true }
      currentX += size.width + gap
    }
    rowWidths[r] = currentX
    if (currentX > maxTotalWidth) maxTotalWidth = currentX
    currentY += maxH + gap
  }
  totalWidth.value = maxTotalWidth
  containerHeight.value = currentY - gap + 16
}

let resizeTimer: ReturnType<typeof setTimeout>
const handleCardResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    measureCards()
    layoutCards()
    balanceRows()
    layoutCards()
  }, 80)
}

const getCardStyle = (index: number): CSSProperties => {
  if (index >= positions.length || !positions[index]?.visible) {
    return { visibility: 'hidden', position: 'absolute', left: '0', top: '0' }
  }
  const { left, top } = positions[index]
  return {
    position: 'absolute',
    left: left + 24 + 'px',
    top: top + 'px',
    visibility: 'visible',
    transition: 'left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  }
}

const loaderStyle = computed(() => ({
  left: totalWidth.value + 'px',
  top: (containerHeight.value - 40) / 2 + 'px',
}))

// ---------- 数据请求 ----------
const fetchPosts = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await api.posting.search(keyword.value.trim(), pageNum.value, pageSize.value)
    if (!res || res.length === 0) {
      noMore.value = true
    } else {
      const startIndex = postList.value.length
      postList.value.push(...res)
      pageNum.value++
      distributePosts(startIndex)
      layoutCards()
      if (res.length < pageSize.value) noMore.value = true
    }
  } catch (error) {
    console.error('[PostDisplay] 获取失败:', error)
  } finally {
    loading.value = false
    await nextTick()
    measureCards()
    layoutCards()
  }
}

const handleSearch = () => {
  postList.value = []
  pageNum.value = 1
  noMore.value = false
  cardSizes.length = 0
  positions.length = 0
  cardRefs.clear()
  initializeRows()
  fetchPosts()
}

// ---------- 容器监测 & 鼠标滚轮逻辑 ----------
const updateContainerHeight = () => {
  if (scrollContainerRef.value) {
    const h = scrollContainerRef.value.clientHeight
    if (h > 0 && Math.abs(h - containerHeight.value) > 10) {
      containerHeight.value = h
      initializeRows()
      distributePosts(0)
      nextTick(() => handleCardResize())
    }
  }
}

// [新增] 鼠标滚轮处理函数
const handleWheel = (e: WheelEvent) => {
  if (!scrollContainerRef.value) return
  // 如果有垂直滚动量
  if (e.deltaY !== 0) {
    // 阻止浏览器默认的向下/向上滚动
    e.preventDefault()
    // 将垂直滚动量叠加到水平滚动条上
    scrollContainerRef.value.scrollLeft += e.deltaY
  }
}

const edit = () => {
  window.open(`/#/post/new`, '_blank');
}

// ---------- 懒加载 & 生命周期 ----------
let observer: IntersectionObserver | null = null
onMounted(() => {
  updateContainerHeight()
  window.addEventListener('resize', updateContainerHeight)

  // [新增] 挂载时监听滚轮事件。务必设置 passive: false 允许 preventDefault
  if (scrollContainerRef.value) {
    scrollContainerRef.value.addEventListener('wheel', handleWheel, { passive: false })
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchPosts()
    }
  }, {
    root: scrollContainerRef.value,
    rootMargin: '0px 250px 0px 0px',
    threshold: 0,
  })
  if (loadMoreRef.value) observer.observe(loadMoreRef.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)

  // [新增] 卸载时移除滚轮监听
  if (scrollContainerRef.value) {
    scrollContainerRef.value.removeEventListener('wheel', handleWheel)
  }

  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* 容器基础 */
.masonry-container {
  min-width: 200px;
}

/* 卡片包装器 */
.card-wrapper {
  will-change: left, top;
}

/* 加载触发器 */
.load-more-trigger {
  width: 80px;
  height: 40px;
}

/* 竖排文字 */
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
}

/* 自定义横向滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(77, 240, 255, 0.15);
  border-radius: 4px;
  transition: background 0.3s;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 240, 255, 0.4);
}
</style>