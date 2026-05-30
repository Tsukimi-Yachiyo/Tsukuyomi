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
      <TimelineLine :points="nodePositions" :width="totalWidth" :height="containerHeight" />

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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { timelineEvents } from '@/data/timeline'
import TimelineNode from '@/components/history/TimelineNode.vue'
import TimelineLine from '@/components/history/TimelineLine.vue'

const router = useRouter()
const scrollContainer = ref<HTMLElement>()

// Constants
const MIN_SPACING = 400
const CONTENT_SCALE = 3
const PADDING = 400
const Y_OFFSETS = [-80, 60, -40, 90, -60, 50, -100, 70]

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
})
</script>
