# 项目历史时间线页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a horizontally-scrolling development timeline page with zigzagging nodes, minimalist black-and-white design, and staggered fade-in animations.

**Architecture:** Single page component (`HistoryPage.vue`) orchestrates layout and scrolling. `TimelineNode.vue` renders each event card with dot. `TimelineLine.vue` draws SVG polyline connecting nodes. Data lives in `src/data/timeline.ts`.

**Tech Stack:** Vue 3 Composition API, TypeScript, Tailwind CSS, SVG

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/data/timeline.ts` | Create | Timeline data interface + sample events |
| `src/components/history/TimelineNode.vue` | Create | Single node: dot + card with date/title/description/image |
| `src/components/history/TimelineLine.vue` | Create | SVG polyline overlay connecting all nodes |
| `src/page/HistoryPage.vue` | Create | Main page: layout, scroll, orchestration |
| `src/router/index.ts` | Modify | Add `/history` route |

---

### Task 1: Create timeline data file

**Files:**
- Create: `src/data/timeline.ts`

- [ ] **Step 1: Create the data file with interface and sample events**

```ts
// src/data/timeline.ts

export interface TimelineEvent {
  id: string
  date: string          // ISO date, e.g. '2025-03-15'
  title: string
  description: string
  image?: string        // optional image path
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'project-start',
    date: '2025-01-10',
    title: '项目启动',
    description: '月读工作室正式立项《超时空辉夜姬》，确定技术栈为 Vue 3 + Cocos Creator 3.8。',
  },
  {
    id: 'prototype',
    date: '2025-03-20',
    title: '原型完成',
    description: '完成核心玩法原型，实现基础的角色移动与场景交互。',
  },
  {
    id: 'multiplayer',
    date: '2025-06-05',
    title: '多人联机上线',
    description: 'WebSocket 多人联机模块上线，支持玩家实时互动。',
  },
  {
    id: 'ai-chat',
    date: '2025-09-12',
    title: 'AI 对话系统',
    description: '集成 Spring AI + LangGraph，NPC 智能对话功能上线。',
  },
  {
    id: 'public-test',
    date: '2026-01-15',
    title: '公开测试',
    description: '首次公开测试开启，邀请玩家进入赛博世界体验。',
  },
]
```

- [ ] **Step 2: Verify file compiles**

Run: `npx vue-tsc --noEmit src/data/timeline.ts 2>&1 || true`
Expected: No errors related to this file

- [ ] **Step 3: Commit**

```bash
git add src/data/timeline.ts
git commit -m "feat: add timeline data file with sample events"
```

---

### Task 2: Create TimelineNode component

**Files:**
- Create: `src/components/history/TimelineNode.vue`

- [ ] **Step 1: Create TimelineNode component**

```vue
<!-- src/components/history/TimelineNode.vue -->
<template>
  <div
    class="absolute transition-all duration-500"
    :style="{ left: `${x}px`, top: `${y}px`, opacity: visible ? 1 : 0, transform: `translate(-50%, -50%) translateY(${visible ? 0 : 20}px)` }"
    :class="[`delay-[${delay}ms]`]"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Dot -->
    <div
      class="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white transition-all duration-300 z-10"
      :class="hovered ? 'scale-150 shadow-[0_0_12px_rgba(255,255,255,0.6)]' : ''"
      :style="{ top: dotPosition }"
    />

    <!-- Card -->
    <div
      class="w-[260px] border border-white/10 rounded-lg p-4 backdrop-blur-sm bg-black/60 transition-all duration-300"
      :class="[
        hovered ? 'border-white/30 -translate-y-1' : '',
        cardAbove ? 'mb-6' : 'mt-6'
      ]"
      :style="{ position: 'relative', [cardAbove ? 'bottom' : 'top']: '16px' }"
    >
      <div class="text-[0.65rem] text-white/40 tracking-widest mb-1.5 font-mono">{{ formattedDate }}</div>
      <h3 class="text-sm text-white font-medium mb-2 tracking-wide">{{ title }}</h3>
      <p class="text-xs text-white/50 leading-relaxed m-0">{{ description }}</p>
      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="mt-3 w-full h-auto rounded border border-white/10 object-cover"
        loading="lazy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  x: number
  y: number
  centerY: number
  date: string
  title: string
  description: string
  image?: string
  delay?: number
}>()

const hovered = ref(false)
const visible = ref(false)

const cardAbove = computed(() => props.y < props.centerY)
const dotPosition = computed(() => cardAbove.value ? '100%' : '-8px')

const formattedDate = computed(() => {
  const d = new Date(props.date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

// Trigger fade-in after mount
import { onMounted } from 'vue'
onMounted(() => {
  setTimeout(() => { visible.value = true }, props.delay ?? 0)
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/history/TimelineNode.vue
git commit -m "feat: add TimelineNode component with fade-in animation"
```

---

### Task 3: Create TimelineLine component

**Files:**
- Create: `src/components/history/TimelineLine.vue`

- [ ] **Step 1: Create TimelineLine SVG component**

```vue
<!-- src/components/history/TimelineLine.vue -->
<template>
  <svg
    class="absolute inset-0 w-full h-full pointer-events-none"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline
      :points="pointsString"
      fill="none"
      stroke="rgba(255,255,255,0.15)"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  points: Array<{ x: number; y: number }>
  width: number
  height: number
}>()

const pointsString = computed(() =>
  props.points.map(p => `${p.x},${p.y}`).join(' ')
)
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/history/TimelineLine.vue
git commit -m "feat: add TimelineLine SVG polyline component"
```

---

### Task 4: Create HistoryPage main component

**Files:**
- Create: `src/page/HistoryPage.vue`

- [ ] **Step 1: Create the main page component**

```vue
<!-- src/page/HistoryPage.vue -->
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
        v-for="(event, index) in events"
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

const events = timelineEvents

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

// Date range
const sortedEvents = computed(() =>
  [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
)

const startDate = computed(() => new Date(sortedEvents.value[0]?.date ?? Date.now()).getTime())
const endDate = computed(() => new Date(sortedEvents.value[sortedEvents.value.length - 1]?.date ?? Date.now()).getTime())
const totalDays = computed(() => Math.max(1, (endDate.value - startDate.value) / (1000 * 60 * 60 * 24)))

// Dynamic total width
const contentWidth = computed(() => totalDays.value * CONTENT_SCALE)
const totalWidth = computed(() =>
  Math.max(events.length * MIN_SPACING, contentWidth.value) + PADDING * 2
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

// Scroll to start on mount
onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft = 0
  }
})
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/page/HistoryPage.vue
git commit -m "feat: add HistoryPage with horizontal scroll and zigzag layout"
```

---

### Task 5: Register route

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: Add the /history route**

Add the following route object before the closing `]` of the `routes` array in `src/router/index.ts`:

```ts
    {
      path: '/history',
      name: 'History',
      component: () => import('@/page/HistoryPage.vue'),
    },
```

- [ ] **Step 2: Verify dev server starts without errors**

Run: `npm run dev` (or equivalent) and navigate to `/#/history`
Expected: Page loads with black background, title visible, nodes appear with fade-in

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts
git commit -m "feat: register /history route for timeline page"
```

---

### Task 6: Polish and verify

- [ ] **Step 1: Test horizontal scrolling**

Open `/#/history` in browser. Use mouse wheel — page should scroll horizontally. Verify left/right fade masks are visible.

- [ ] **Step 2: Test node hover interaction**

Hover over each timeline node. Dot should scale up with glow. Card border should brighten and card should lift slightly.

- [ ] **Step 3: Test staggered fade-in**

Refresh the page. Nodes should appear one by one from left to right with ~200ms delay between each.

- [ ] **Step 4: Test back button**

Click the back arrow in top-left. Should navigate back to previous page.

- [ ] **Step 5: Fix any visual issues found during testing**

Adjust spacing, colors, or animations as needed. Common fixes:
- If nodes overlap: increase `MIN_SPACING`
- If zigzag is too extreme: adjust `Y_OFFSETS` values
- If cards clip edges: increase `PADDING`

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: polish history timeline page"
```
