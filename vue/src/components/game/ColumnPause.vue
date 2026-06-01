<template>
  <div class="relative w-[90vw] max-w-300 h-full flex flex-col bg-transparent text-white font-(--font-cuxi) p-5 box-border">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-4 shrink-0 border-b border-white/20 pb-4">
      <div class="flex items-center gap-4">
        <h2 class="text-[22px] font-semibold m-0 text-white tracking-widest">星海专栏</h2>
        <span class="text-[12px] text-[rgba(77,240,255,0.8)] px-2 py-0.5 border border-[rgba(77,240,255,0.4)] rounded-full">
          深海秘境
        </span>
      </div>
      <div class="flex items-center gap-2 relative">
        <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索专栏..."
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

    <!-- 分类筛选 -->
    <div class="flex items-center gap-3 mb-4 shrink-0">
      <button
          v-for="tab in typeTabs"
          :key="tab.value"
          @click="selectType(tab.value)"
          class="px-4 py-1.5 rounded-full text-[12px] transition-all cursor-pointer border"
          :class="activeType === tab.value
            ? 'bg-[rgba(77,240,255,0.9)] text-black border-[rgba(77,240,255,0.9)] font-bold'
            : 'bg-black/30 text-white/70 border-white/20 hover:bg-black/50 hover:text-white'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 列表区域 -->
    <div
        ref="listContainerRef"
        class="flex-1 overflow-y-auto smooth-scroll custom-scrollbar min-h-0"
    >
      <!-- 专栏列表 -->
      <div class="flex flex-col gap-3 pb-4">
        <div
            v-for="(column, index) in columnList"
            :key="column.id ?? index"
            class="column-item group relative bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-black/50 hover:border-[rgba(77,240,255,0.3)] transition-all duration-300 cursor-pointer"
            @click="openColumn(column)"
        >
          <!-- 序号标记 -->
          <div class="absolute top-3 left-3 w-7 h-7 rounded-lg bg-[rgba(77,240,255,0.15)] flex items-center justify-center">
            <span class="text-[11px] text-[rgba(77,240,255,0.8)] font-bold">{{ index + 1 }}</span>
          </div>

          <div class="flex items-start gap-4 pl-10">
            <!-- 文件类型图标 -->
            <div class="w-20 h-20 rounded-lg bg-gradient-to-br from-[rgba(77,240,255,0.2)] to-[rgba(77,240,255,0.05)] shrink-0 flex items-center justify-center">
              <img :src="getFileIcon(column.essayUrl)" alt="" class="w-8 h-8 opacity-60" />
            </div>

            <!-- 内容区域 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-[15px] font-semibold text-white truncate m-0">{{ column.name || '未命名专栏' }}</h3>
                <span class="shrink-0 text-[10px] px-2 py-0.5 rounded-full border"
                      :class="getTypeClass(column.type)">
                  {{ getTypeLabel(column.type) }}
                </span>
              </div>
              <p class="text-[12px] text-white/50 m-0 line-clamp-2 leading-relaxed">
                {{ column.description || '暂无简介' }}
              </p>
              <div class="flex items-center gap-4 mt-2">
                <span v-if="column.essayUrl" class="text-[11px] text-white/40 flex items-center gap-1">
                  {{ getFileNameFromUrl(column.essayUrl) }}
                </span>
                <span v-if="column.createTime" class="text-[11px] text-white/40">
                  {{ formatDate(column.createTime) }}
                </span>
              </div>
            </div>

            <!-- 右侧箭头 -->
            <div class="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
              <img :src="enterIcon" class="w-5 h-5 opacity-60" />
            </div>
          </div>
        </div>

        <!-- 加载更多触发器 -->
        <div ref="loadMoreRef" class="flex items-center justify-center py-4">
          <div v-if="loading" class="w-6 h-6 border-2 border-transparent border-t-[rgba(77,240,255,0.8)] rounded-full animate-spin"></div>
          <span v-else-if="noMore && columnList.length > 0" class="text-[12px] text-white/30 tracking-widest">
            —— 已抵达深海尽头 ——
          </span>
          <span v-else-if="!loading && columnList.length === 0" class="text-[12px] text-white/30">
            暂无专栏内容
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import columnsIcon from '@/assets/icons/columns.svg'
import enterIcon from '@/assets/icons/enter.svg'

const router = useRouter()

// ---------- 类型定义 ----------
interface ColumnItem {
  id: number
  name: string
  description: string
  type: string
  writer: number
  essayUrl: string
  createTime: string
}

// ---------- 分类配置 ----------
const typeTabs = [
  { label: '全部', value: '' },
  { label: '随笔', value: 'SIMPLE' },
  { label: '小说', value: 'NOVEL' },
  { label: '活动', value: 'ACTIVITY' },
]

// ---------- 状态 ----------
const keyword = ref('')
const activeType = ref('')
const columnList = ref<ColumnItem[]>([])
const pageNum = ref(1)
const pageSize = ref(15)
const loading = ref(false)
const noMore = ref(false)

const listContainerRef = ref<HTMLElement | null>(null)
const loadMoreRef = ref<HTMLElement | null>(null)

// ---------- 类型样式 ----------
const getTypeClass = (type: string) => {
  switch (type) {
    case 'SIMPLE': return 'bg-[rgba(77,240,255,0.1)] text-[rgba(77,240,255,0.8)] border-[rgba(77,240,255,0.3)]'
    case 'NOVEL': return 'bg-[rgba(255,180,77,0.1)] text-[rgba(255,180,77,0.8)] border-[rgba(255,180,77,0.3)]'
    case 'ACTIVITY': return 'bg-[rgba(200,77,255,0.1)] text-[rgba(200,77,255,0.8)] border-[rgba(200,77,255,0.3)]'
    default: return 'bg-white/10 text-white/60 border-white/20'
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'SIMPLE': return '随笔'
    case 'NOVEL': return '小说'
    case 'ACTIVITY': return '活动'
    default: return '未知'
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 从 URL 提取文件名
const getFileNameFromUrl = (url: string): string => {
  if (!url) return ''
  try {
    const params = new URLSearchParams(url.split('?')[1])
    return params.get('fileName') || url.split('/').pop() || ''
  } catch {
    return url.split('/').pop() || ''
  }
}

// 根据文件类型返回图标
const getFileIcon = (url: string): string => {
  const fileName = getFileNameFromUrl(url)
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  // PDF 和 PPT 用文档图标，其他用默认图标
  if (['pdf', 'ppt', 'pptx', 'doc', 'docx'].includes(ext)) {
    return columnsIcon // 可以替换为专门的文档图标
  }
  return columnsIcon
}

// ---------- 数据请求 ----------
const fetchColumns = async () => {
  if (loading.value || noMore.value) return
  loading.value = true
  try {
    const res = await api.column.search(keyword.value.trim(), pageNum.value, pageSize.value)
    if (!res || res.length === 0) {
      noMore.value = true
    } else {
      columnList.value.push(...res)
      pageNum.value++
      if (res.length < pageSize.value) noMore.value = true
    }
  } catch (error) {
    console.error('[ColumnPause] 获取专栏失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  columnList.value = []
  pageNum.value = 1
  noMore.value = false
  fetchColumns()
}

const selectType = (type: string) => {
  activeType.value = type
  handleSearch()
}

const openColumn = (column: ColumnItem) => {
  if (column.essayUrl) {
    // 有文件 URL 时在新窗口打开专栏查看页
    const routeData = router.resolve({
      name: 'ColumnView',
      query: {
        url: column.essayUrl,
        name: getFileNameFromUrl(column.essayUrl),
        title: column.name || ''
      }
    })
    window.open(routeData.href, '_blank')
  } else {
    console.log('[ColumnPause] 专栏无文件:', column.id, column.name)
  }
}

// ---------- 懒加载 ----------
let observer: IntersectionObserver | null = null

onMounted(() => {
  fetchColumns()

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchColumns()
    }
  }, {
    root: listContainerRef.value,
    rootMargin: '0px 0px 200px 0px',
    threshold: 0,
  })
  if (loadMoreRef.value) observer.observe(loadMoreRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.column-item {
  will-change: transform, border-color;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.smooth-scroll {
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(77, 240, 255, 0.15);
  border-radius: 3px;
  transition: background 0.3s;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(77, 240, 255, 0.4);
}
</style>
