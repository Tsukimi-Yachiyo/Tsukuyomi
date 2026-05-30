<template>
  <div
    class="absolute transition-all duration-500"
    :style="containerStyle"
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
      :class="cardClasses"
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
import { ref, computed, onMounted } from 'vue'

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

const containerStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  opacity: visible.value ? 1 : 0,
  transform: `translate(-50%, -50%) translateY(${visible.value ? 0 : 20}px)`,
}))

const cardClasses = computed(() => [
  hovered.value ? 'border-white/30 -translate-y-1' : '',
  cardAbove.value ? 'mb-6' : 'mt-6',
])

const formattedDate = computed(() => {
  const d = new Date(props.date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

onMounted(() => {
  setTimeout(() => { visible.value = true }, props.delay ?? 0)
})
</script>
