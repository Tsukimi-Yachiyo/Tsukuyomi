<template>
  <div
    ref="scrollContainer"
    class="h-screen overflow-x-auto overflow-y-hidden bg-black relative"
    @wheel.prevent="onWheel"
  >
    <!-- Left fade -->
    <div class="fixed left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
    <!-- Right fade -->
    <div class="fixed right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

    <!-- Title -->
    <div class="fixed top-8 left-1/2 -translate-x-1/2 z-30 text-center">
      <h1 class="text-lg text-white/80 tracking-[6px] font-light">开发时间线</h1>
      <p class="text-[0.65rem] text-white/30 tracking-widest mt-1 uppercase">Development Timeline</p>
    </div>

    <!-- Scrollable inner container -->
    <div class="relative h-full" :style="{ width: `${totalWidth}px` }">
      <!-- SVG connecting line -->
      <TimelineLine :points="nodePositions" :width="totalWidth" :height="containerHeight" :future-index="futureStartIndex" />

      <!-- Timeline nodes -->
      <TimelineNode
        v-for="(event, index) in sortedEvents"
        :key="event.id"
        :x="nodePositions[index].x"
        :y="nodePositions[index].y"
        :center-y="centerY"
        :date="event.date"
        :title="event.title"
        :description="event.description"
        :image="event.image"
        :delay="index * 200"
        :future="event.future"
      />
    </div>

    <!-- Back button -->
    <button
      class="fixed top-6 left-6 z-30 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all"
      @click="goBack"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Server countdowns -->
    <div class="fixed top-6 right-6 z-30 flex flex-col gap-2.5 items-end">
      <div
        v-for="s in serverCountdowns"
        :key="s.name"
        class="flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-sm transition-all duration-300"
        :class="s.expired
          ? 'border-red-500/30 bg-red-500/[0.06]'
          : s.urgent
            ? 'border-amber-400/30 bg-amber-400/[0.06]'
            : 'border-white/15 bg-white/[0.04]'"
      >
        <span class="text-[0.7rem] tracking-wider" :class="s.expired ? 'text-red-400' : s.urgent ? 'text-amber-300' : 'text-white/60'">{{ s.name }}</span>
        <span class="text-sm font-mono tracking-wide" :class="s.expired ? 'text-red-400' : s.urgent ? 'text-amber-300' : 'text-white/90'">
          {{ s.expired ? '已到期' : s.text }}
        </span>
      </div>
    </div>

    <!-- Support button -->
    <button
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all duration-300 select-none"
      :class="supported
        ? 'bg-white/10 border-white/20 text-white/70'
        : 'bg-white/[0.04] border-white/10 text-white/40 hover:border-white/25 hover:text-white/60'"
      @click="onSupport"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      <span class="text-sm tracking-widest font-light">助力</span>
      <span class="text-xs font-mono tracking-wider opacity-60">{{ supportCount }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { timelineEvents } from '@/data/timeline'
import TimelineNode from '@/components/history/TimelineNode.vue'
import TimelineLine from '@/components/history/TimelineLine.vue'

const router = useRouter()
const scrollContainer = ref<HTMLElement>()

// Support counter
const API_BASE = 'http://localhost:3210'
const supportCount = ref(0)
const supported = ref(false)

async function fetchSupport() {
  try {
    const res = await fetch(`${API_BASE}/api/support`)
    const data = await res.json()
    supportCount.value = data.count
  } catch { /* server not running, ignore */ }
}

async function onSupport() {
  if (supported.value) return
  supported.value = true
  try {
    const res = await fetch(`${API_BASE}/api/support`, { method: 'POST' })
    const data = await res.json()
    supportCount.value = data.count
  } catch {
    supported.value = false
  }
}

// Server countdowns
// MC server: Apr 30 2026, 2-month expiry → Jun 30 2026
// Frontend server: Mar 26 2026, 1-year expiry → Mar 26 2027
// Backend server: Mar 31 2026, 1-year expiry → Mar 31 2027
const servers = [
  { name: 'MC 服务器', expiry: new Date('2026-06-30T00:00:00') },
  { name: '前端服务器', expiry: new Date('2027-03-26T00:00:00') },
  { name: '后端服务器', expiry: new Date('2027-03-31T00:00:00') },
]

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval>

const serverCountdowns = computed(() =>
  servers.map(s => {
    const diff = s.expiry.getTime() - now.value
    const expired = diff <= 0
    const urgent = !expired && diff < 30 * 24 * 60 * 60 * 1000 // < 30 days
    const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24))
    const hours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60))
    const text = `${days}天 ${String(hours).padStart(2, '0')}时 ${String(minutes).padStart(2, '0')}分`
    return { name: s.name, text, expired, urgent }
  })
)

// Constants
const MIN_SPACING = 550
const CONTENT_SCALE = 3
const PADDING = 400
const Y_OFFSETS = [-60, 50, -40, 70, -50, 40, -70, 60]

const containerHeight = computed(() => {
  if (!scrollContainer.value) return 800
  return scrollContainer.value.clientHeight
})

const centerY = computed(() => containerHeight.value / 2)

// Sort events by date
const sortedEvents = computed(() =>
  [...timelineEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
)

// Date range
const startDate = computed(() => new Date(sortedEvents.value[0]?.date ?? Date.now()).getTime())
const endDate = computed(() => new Date(sortedEvents.value[sortedEvents.value.length - 1]?.date ?? Date.now()).getTime())
const totalDays = computed(() => Math.max(1, (endDate.value - startDate.value) / (1000 * 60 * 60 * 24)))

// Dynamic total width
const contentWidth = computed(() => totalDays.value * CONTENT_SCALE)
const totalWidth = computed(() =>
  Math.max(timelineEvents.length * MIN_SPACING, contentWidth.value) + PADDING * 2
)

// Index where future events begin
const futureStartIndex = computed(() =>
  sortedEvents.value.findIndex(e => e.future === true)
)

// Node positions
const nodePositions = computed(() => {
  const daysSpan = totalDays.value
  const usableWidth = totalWidth.value - PADDING * 2

  return sortedEvents.value.map((event, index) => {
    const eventTime = new Date(event.date).getTime()
    const dayOffset = (eventTime - startDate.value) / (1000 * 60 * 60 * 24)
    const x = PADDING + (dayOffset / daysSpan) * usableWidth
    const y = centerY.value + Y_OFFSETS[index % Y_OFFSETS.length]
    return { x, y }
  })
})

// Scroll handling
function onWheel(e: WheelEvent) {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += e.deltaY
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft = 0
  }
  fetchSupport()
  timer = setInterval(() => { now.value = Date.now() }, 60_000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>
