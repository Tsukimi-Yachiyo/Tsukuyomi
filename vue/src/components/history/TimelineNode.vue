<template>
  <div
    class="absolute transition-all duration-500"
    :style="containerStyle"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Dot -->
    <div
      class="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-300 z-10"
      :class="dotClasses"
      :style="{ top: dotPosition }"
    />

    <!-- Card -->
    <div
      class="w-[260px] border rounded-lg p-4 backdrop-blur-sm transition-all duration-300"
      :class="cardClasses"
    >
      <div v-if="!future" class="text-[0.65rem] text-white/40 tracking-widest mb-1.5 font-mono">{{ formattedDate }}</div>
      <h3 :class="future ? 'text-white/40' : 'text-white'" class="text-sm font-medium mb-2 tracking-wide">{{ title }}</h3>
      <p :class="future ? 'text-white/25' : 'text-white/50'" class="text-xs leading-relaxed m-0">{{ description }}</p>
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
  future?: boolean
}>()

const hovered = ref(false)
const visible = ref(false)

const cardAbove = computed(() => props.y < props.centerY)

const dotPosition = computed(() => cardAbove.value ? '100%' : '-8px')

const containerStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  opacity: visible.value ? (props.future ? 0.4 : 1) : 0,
  transform: `translate(-50%, -50%) translateY(${visible.value ? 0 : 20}px)`,
}))

const dotClasses = computed(() => {
  if (props.future) return 'bg-white/25'
  return hovered.value
    ? 'bg-white scale-150 shadow-[0_0_12px_rgba(255,255,255,0.6)]'
    : 'bg-white'
})

const cardClasses = computed(() => [
  props.future
    ? 'border-white/[0.06] bg-black/40'
    : 'border-white/10 bg-black/60',
  hovered.value && !props.future ? 'border-white/30 -translate-y-1' : '',
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
